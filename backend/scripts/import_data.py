import sys
import json
import asyncio
import logging
from pathlib import Path
from backend import settings
from backend.schemas.story import Story
from motor.motor_asyncio import AsyncIOMotorClient
from backend.repositories.story_repository import StoryRepository

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def import_data():
    try:
        mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
        mongodb = mongodb_client[settings.MONGODB_DB_NAME]
        story_repo = StoryRepository(mongodb)

        with open(Path(__file__).parent / "puzzles.json", "r") as file_:
            data = json.load(file_)

        if isinstance(data, dict):
            data = [data]

        inserted_count = 0
        for story in data:
            story_obj = Story(**story)  # Convert to Pydantic model
            result = await story_repo.create_story(story_obj)
            if result:
                inserted_count += 1

        logger.info(f"Inserted {inserted_count} stories into 'lateral.stories'")

    except Exception as e:
        logger.error(f"Error importing data: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(import_data())
