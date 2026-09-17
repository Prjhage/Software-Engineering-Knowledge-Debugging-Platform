"""
Pydantic schemas for chat requests and responses.
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SourceChunk(BaseModel):
    file: str
    source_type: str  # code | documentation | github_issue | pull_request | commit
    snippet: str
    score: Optional[float] = None
    module: Optional[str] = None
    language: Optional[str] = None
    section: Optional[str] = None
    issue_number: Optional[int] = None
    reason: Optional[str] = None


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[str] = Field(default=None)
    mode: Literal["chat", "debug", "explain"] = "chat"

    def get_or_create_session_id(self) -> str:
        return self.session_id or str(uuid.uuid4())


class ChatResponse(BaseModel):
    session_id: str
    answer: str
    confidence: Literal["high", "medium", "low"] = "medium"
    sources: list[SourceChunk] = []
    inference: bool = False  # True if answer contains AI inference beyond retrieved evidence
    mode: str = "chat"
