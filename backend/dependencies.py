from contextlib import asynccontextmanager
from typing import AsyncIterator, Optional

from fastapi import Depends, Request

from backend.repositories.story_repository import StoryRepository
from backend.repositories.interaction_repository import InteractionRepository
from backend.repositories.user_repository import UserRepository
from backend.schemas.users import User
from backend.services.user_service import UserService
from backend.settings import security


async def get_story_repository() -> AsyncIterator[StoryRepository]:
    from backend.main import app

    yield StoryRepository(app.mongodb)


async def get_interaction_repository() -> AsyncIterator[InteractionRepository]:
    from backend.main import app

    yield InteractionRepository(app.mongodb)


@asynccontextmanager
async def user_repository_factory() -> AsyncIterator[UserRepository]:
    from backend.main import app

    yield UserRepository(app.mongodb)


async def get_user_repository() -> AsyncIterator[UserRepository]:
    async with user_repository_factory() as user_repository:
        yield user_repository


async def get_user_service() -> AsyncIterator[UserService]:
    async with user_repository_factory() as user_repository:
        yield UserService(repository=user_repository, security=security)


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
