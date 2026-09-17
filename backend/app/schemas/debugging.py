"""
Pydantic schemas for debugging investigations.
"""
from pydantic import BaseModel, Field
from typing import Optional
from .chat import SourceChunk


class DebugRequest(BaseModel):
    error_message: str = Field(..., min_length=1, max_length=2000)
    endpoint: Optional[str] = None
    expected_behavior: Optional[str] = None
    actual_behavior: Optional[str] = None
    session_id: Optional[str] = None


class PossibleCause(BaseModel):
    cause: str
    evidence: list[str]  # file names or descriptions
    confidence: str = "medium"


class DebugResponse(BaseModel):
    session_id: str
    summary: str
    possible_causes: list[PossibleCause]
    recommended_investigation: list[str]
    sources: list[SourceChunk] = []
    inference_note: str = ""
