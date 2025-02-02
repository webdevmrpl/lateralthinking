import logging

from backend.schemas.story import Story
from backend.mongo_client import MongoMotorClient

logger = logging.getLogger(__name__)


class StoryRepository:
    def __init__(self, db):
        self.client = MongoMotorClient(db, "stories")

    async def create_story(self, story: Story):
        if old_story := await self.get_story({"title": story.title}):
            return old_story

        if story.id:
            return await self.client.put_item(story.model_dump())

        return await self.client.put_item(story.model_dump(exclude={"id"}))

    async def get_story(self, query):
        res = await self.client.get_item(query)
        logger.info(f"Got story: {res}")
        return res

    async def update_story(self, query: dict, update):
        return await self.client.update_item(query, update)

    async def delete_story(self, query):
        return await self.client.delete_item(query)

    async def get_all_stories(self) -> list[Story]:
        return [Story.model_validate(story) async for story in await self.client.scan()]
