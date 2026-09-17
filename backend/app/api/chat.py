"""
Chat API — main chat endpoint with RAG Q&A and conversation memory.
"""
import uuid
import logging
from fastapi import APIRouter
from ..schemas.chat import ChatRequest, ChatResponse
from ..services.answer_service import AnswerService
from ..memory.conversation_memory import (
    save_message, get_history, clear_session, save_chat_metadata
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])

_answer_service: AnswerService | None = None


def get_answer_service() -> AnswerService:
    global _answer_service
    if _answer_service is None:
        _answer_service = AnswerService()
    return _answer_service


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint.
    Accepts a developer question, retrieves relevant Grandel repository context,
    and returns a grounded AI response with source citations.
    """
    session_id = request.get_or_create_session_id()
    service = get_answer_service()

    # Load conversation history from MongoDB
    history = await get_history(session_id, limit=6)

    # Save user message
    await save_message(session_id, "user", request.message)
    await save_chat_metadata(session_id, request.message)

    # Get AI response
    response = service.answer(
        query=request.message,
        session_id=session_id,
        history=history,
        mode=request.mode,
    )

    # Save AI response to history
    await save_message(session_id, "assistant", response.answer)

    return response


@router.get("/sessions/{session_id}")
async def get_session_history(session_id: str):
    """Retrieve conversation history for a session."""
    history = await get_history(session_id, limit=50)
    return {"session_id": session_id, "messages": history}


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Clear all messages for a session."""
    await clear_session(session_id)
    return {"message": f"Session {session_id} cleared.", "session_id": session_id}
