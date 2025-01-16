import logging

from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient

from backend import settings
from backend.routers.stories import router as stories_router
from backend.routers.conversations import router as conversations_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
    app.mongodb = app.mongodb_client[settings.MONGODB_DB_NAME]
    logger.info(f"Connected to MongoDB: {app.mongodb}")

    yield

    app.mongodb_client.close()


app = FastAPI(lifespan=lifespan)
app.include_router(stories_router)
app.include_router(conversations_router)
