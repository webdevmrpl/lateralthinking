import logging
from fastapi import APIRouter, Depends

from backend.schemas.story import Story
from backend.dependencies import get_story_repository
from backend.repositories.story_repository import StoryRepository

router = APIRouter(prefix="/stories", tags=["stories"])
logger = logging.getLogger(__name__)


@router.get("/")
async def get_all_stories(story_repo: StoryRepository = Depends(get_story_repository)):
    return await story_repo.get_all_stories()


@router.post("/", response_model=Story)
async def create_story(
    story: Story,
    story_repo: StoryRepository = Depends(get_story_repository),
):
    logger.info(f"Creating story: {story}")
    await story_repo.create_story(story)
    return story


@router.get("/{story_id}", response_model=Story)
async def get_story(
    story_id: str,
    story_repo: StoryRepository = Depends(get_story_repository),
):
    story = await story_repo.get_story({"_id": story_id})

    return Story.model_validate(story)
