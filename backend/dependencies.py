from contextlib import asynccontextmanager
from typing import AsyncIterator

from backend.repositories.story_repository import StoryRepository
from backend.repositories.interaction_repository import InteractionRepository
from backend.repositories.user_repository import UserRepository
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
