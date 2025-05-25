from fastapi import APIRouter, Depends

from backend.schemas.conversations import UserMessage
from backend.dependencies import get_interaction_repository
from backend.repositories.interaction_repository import InteractionRepository

router = APIRouter(prefix="/conversation", tags=["conversation"])


@router.post("/get_session_id")
async def get_session_id_by_story(
    story_id: str,
    interaction_repo: InteractionRepository = Depends(get_interaction_repository),
):
    return await interaction_repo.create_conversation_from_story_id(story_id)


@router.post("/send_user_message")
async def send_user_message_and_update_db(
    user_message: UserMessage,
    interaction_repo: InteractionRepository = Depends(get_interaction_repository),
):
    return await interaction_repo.send_message_to_model(
        session_id=user_message.session_id, message=user_message.message
    )


@router.get("/get_chat_by_session/{session_id}")
async def get_chat_by_session(
    session_id: str,
    interaction_repo: InteractionRepository = Depends(get_interaction_repository),
):
    return await interaction_repo.get_chat_by_session(session_id)


@router.post("/delete_chat_by_session/{session_id}")
async def delete_chat_by_session(
    session_id: str,
    interaction_repo: InteractionRepository = Depends(get_interaction_repository),
):
    return await interaction_repo.reset_chat_by_session_id(session_id)
