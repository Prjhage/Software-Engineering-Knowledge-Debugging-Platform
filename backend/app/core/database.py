from motor.motor_asyncio import AsyncIOMotorClient
from .config import get_settings
import logging

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        settings = get_settings()
        _client = AsyncIOMotorClient(settings.mongodb_uri)
        logger.info("MongoDB client created.")
    return _client


def get_database():
    settings = get_settings()
    return get_client()[settings.mongodb_db_name]


def get_chats_collection():
    return get_database()["chats"]


def get_messages_collection():
    return get_database()["messages"]


def get_ingestion_collection():
    return get_database()["ingestion_runs"]


async def close_connection():
    global _client
    if _client:
        _client.close()
        _client = None
        logger.info("MongoDB connection closed.")
