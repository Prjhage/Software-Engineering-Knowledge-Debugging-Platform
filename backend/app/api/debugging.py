"""
Debugging API — submit errors for AI investigation.
"""
import logging
from fastapi import APIRouter
from ..schemas.debugging import DebugRequest, DebugResponse
from ..services.debugging_service import DebuggingService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/debug", tags=["Debugging"])

_debug_service: DebuggingService | None = None


def get_debug_service() -> DebuggingService:
    global _debug_service
    if _debug_service is None:
        _debug_service = DebuggingService()
    return _debug_service


@router.post("", response_model=DebugResponse)
async def debug_error(request: DebugRequest):
    """
    Submit an error for AI-powered investigation.
    Returns possible causes, evidence, and recommended investigation steps.
    """
    service = get_debug_service()
    return service.investigate(request)
