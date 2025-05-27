import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from backend import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_mongodb_indexes():
    """
    Create MongoDB indexes for core functionality.
    """
    try:
        mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
        mongodb = mongodb_client[settings.MONGODB_DB_NAME]

        chats_collection = mongodb["chats"]
        users_collection = mongodb["users"]

        # 1. Compound index for leaderboard aggregation pipeline
        await chats_collection.create_index(
            [
                ("username", 1),  # Filter by username existence
                ("progress_percent", 1),  # Filter by completion (100%)
                ("score", -1),  # Sort by score descending
            ],
            name="leaderboard_compound_idx",
        )

        # 2. Session ID index for chat retrieval
        await chats_collection.create_index(
            [("session_id", 1)], name="session_id_idx", unique=True
        )

        # 3. User email index for authentication
        await users_collection.create_index(
            [("email", 1)], name="email_idx", unique=True
        )

        await display_index_info(chats_collection)
        await display_index_info(users_collection)

    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        raise
    finally:
        mongodb_client.close()


async def display_index_info(collection):
    indexes = await collection.list_indexes().to_list(length=None)
    for idx in indexes:
        print(f"{idx['name']}: {idx.get('key', {})}")


async def drop_all_indexes():
    """
    Drop all custom indexes (useful for development/testing).
    WARNING: This will drop all indexes except _id!
    """
    try:
        mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
        mongodb = mongodb_client[settings.MONGODB_DB_NAME]

        collections = ["chats", "users", "stories"]

        for collection_name in collections:
            collection = mongodb[collection_name]
            await collection.drop_indexes()

    except Exception as e:
        logger.error(f"Error dropping indexes: {e}")
        raise
    finally:
        mongodb_client.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--drop":
        asyncio.run(drop_all_indexes())
    else:
        asyncio.run(create_mongodb_indexes())
