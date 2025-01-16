import logging
from bson import ObjectId
from fastapi import APIRouter


from backend.repositories.story_repository import StoryRepository
from backend.schemas.story import Story

router = APIRouter(prefix="/stories", tags=["stories"])
logger = logging.getLogger(__name__)


async def get_story_repository() -> StoryRepository:
    from backend.main import app

    return StoryRepository(app.mongodb)


@router.get("/")
async def get_all_stories():
    repo = await get_story_repository()
    return await repo.get_all_stories()


@router.post("/", response_model=Story)
async def create_story(story: Story):
    logger.info(f"Creating story: {story}")
    repo = await get_story_repository()
    await repo.create_story(story)
    return story


@router.get("/{story_id}", response_model=Story)
async def get_story(story_id: str):
    repo = await get_story_repository()
    story = await repo.get_story({"_id": story_id})

    return Story.model_validate(story)
