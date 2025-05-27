import asyncio
from typing import Optional
from authx import TokenPayload
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import APIRouter, Depends, HTTPException, Response, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend import settings
from backend.settings import security
from backend.dependencies import get_user_service
from backend.services.user_service import UserService
from backend.repositories.user_repository import UserRepository
from backend.schemas.users import UserCreate, UserLogin, UserUpdate, User

router = APIRouter(prefix="/users", tags=["Users"])

security_scheme = HTTPBearer(auto_error=False)


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_create: UserCreate, user_service: UserService = Depends(get_user_service)
):
    """
    Endpoint for user registration.
    """
    try:
        return await user_service.create_user(user_create)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=dict, status_code=status.HTTP_200_OK)
async def login_user(
    response: Response,
    user_login_request: UserLogin,
    user_service: UserService = Depends(get_user_service),
):
    """
    Endpoint for user login.
    """
    try:
        access_token, refresh_token = await user_service.authenticate_user(
            email=user_login_request.email, password=user_login_request.password
        )
        security.set_access_cookies(token=access_token, response=response)
        security.set_refresh_cookies(token=refresh_token, response=response)
        return {
            "access_token": access_token,
            "token_type": "Bearer",
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


async def get_current_user_optional(
    request: Request, user_service: UserService = Depends(get_user_service)
) -> Optional[User]:
    """
    Get current user if authenticated, otherwise return None.
    This allows endpoints to be accessible to both authenticated and unauthenticated users.
    """
    try:
        token_getter = security.get_token_from_request(optional=True)
        token = await token_getter(request)
        if token is None:
            return None

        payload = security.verify_token(token)
        user = await user_service.get_user(payload.sub)
        return user

    except Exception:
        return None


@router.get(
    "/me",
    openapi_extra={"security": [{"BearerAuth": []}, {}]},
)
async def get_current_user(
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Retrieve the current authenticated user's profile if logged in,
    otherwise return a message indicating the user is not authenticated.
    This endpoint is public but provides different responses based on authentication status.
    """
    if current_user:
        return current_user
    else:
        return {"message": "Not authenticated", "user": None}


@router.put(
    "/{email}",
    response_model=User,
    dependencies=[Depends(security.access_token_required)],
)
async def update_user(
    email: str,
    user_update: UserUpdate,
    user_service: UserService = Depends(get_user_service),
):
    """
    Update a user's information (admin access only).
    """
    try:
        return await user_service.update_user(email, user_update)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete(
    "/{email}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_user(
    email: str,
    user_service: UserService = Depends(get_user_service),
):
    """
    Delete a user by email (admin access only).
    """
    try:
        await user_service.delete_user(email)
        return {"detail": "User deleted"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/refresh")
async def get_new_access_token(
    response: Response,
    refresh: TokenPayload = Depends(security.refresh_token_required),
    user_service=Depends(get_user_service),
):
    user = await user_service.get_user(refresh.sub)
    access_token = security.create_access_token(uid=user.email)
    security.set_access_cookies(token=access_token, response=response)
    return {"access_token": access_token}


@security.set_subject_getter
def get_user_from_uuid(uuid: str):
    """
    Synchronous function to get user for authx callback.
    This function manually creates database connection since dependency injection is not available.
    """
    try:

        async def get_user_async():
            mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
            mongodb = mongodb_client[settings.MONGODB_DB_NAME]
            user_repo = UserRepository(mongodb)

            try:
                user = await user_repo.get_user(email=uuid)
                return user
            finally:
                mongodb_client.close()

        user = asyncio.run(get_user_async())
        return user

    except Exception as e:
        print(f"Error getting user {uuid}: {e}")
        return None
