"""
Conversation Memory — MongoDB-backed chat history.
Stores and retrieves conversation messages per session.
"""
import logging
from datetime import datetime
from ..core.database import get_messages_collection, get_chats_collection

logger = logging.getLogger(__name__)


async def save_message(session_id: str, role: str, content: str):
    """Save a single message to MongoDB."""
    col = get_messages_collection()
    await col.insert_one({
        "session_id": session_id,
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow(),
    })


async def get_history(session_id: str, limit: int = 10) -> list[dict]:
    """Retrieve the last N messages for a session."""
    col = get_messages_collection()
    cursor = col.find(
        {"session_id": session_id},
        sort=[("timestamp", 1)],
    ).limit(limit * 2)  # fetch more, trim later

    messages = await cursor.to_list(length=None)
    # Return last `limit` messages
    result = [{"role": m["role"], "content": m["content"]} for m in messages]
    return result[-limit:]


async def clear_session(session_id: str):
    """Delete all messages for a session."""
    col = get_messages_collection()
    await col.delete_many({"session_id": session_id})
    logger.info(f"Session {session_id} cleared.")


async def save_chat_metadata(session_id: str, first_message: str):
    """Save or update chat session metadata."""
    col = get_chats_collection()
    await col.update_one(
        {"session_id": session_id},
        {
            "$setOnInsert": {
                "session_id": session_id,
                "first_message": first_message[:100],
                "created_at": datetime.utcnow(),
            },
            "$set": {"updated_at": datetime.utcnow()},
        },
        upsert=True,
    )
