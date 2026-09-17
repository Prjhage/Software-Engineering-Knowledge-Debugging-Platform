"""
Repository API — trigger ingestion and check knowledge base status.
"""
import asyncio
import logging
from fastapi import APIRouter, BackgroundTasks
from ..rag.vector_store import get_collection_stats, reset_vector_store
from ..rag.hybrid_search import get_hybrid_searcher

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/repository", tags=["Repository"])

_ingestion_status = {
    "status": "idle",  # idle | running | completed | failed
    "summary": None,
    "error": None,
}


def _run_ingestion(use_cache: bool):
    """Background task to run the ingestion pipeline."""
    global _ingestion_status
    _ingestion_status["status"] = "running"
    _ingestion_status["error"] = None
    try:
        from ..ingestion.pipeline import IngestionPipeline
        pipeline = IngestionPipeline(use_cache=use_cache)
        summary = pipeline.run()
        _ingestion_status["status"] = "completed"
        _ingestion_status["summary"] = summary
        # Invalidate BM25 cache after re-ingestion
        get_hybrid_searcher().invalidate_bm25_cache()
    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        _ingestion_status["status"] = "failed"
        _ingestion_status["error"] = str(e)


@router.post("/ingest")
async def trigger_ingestion(
    background_tasks: BackgroundTasks,
    use_cache: bool = True,
    reset: bool = False,
):
    """
    Trigger repository ingestion in the background.
    - use_cache: use previously fetched GitHub data if available
    - reset: delete existing ChromaDB collection before re-ingesting
    """
    if _ingestion_status["status"] == "running":
        return {"message": "Ingestion already running.", "status": "running"}

    if reset:
        reset_vector_store()

    background_tasks.add_task(_run_ingestion, use_cache)
    return {
        "message": "Ingestion started in the background.",
        "status": "running",
    }


@router.get("/status")
async def get_repository_status():
    """Get knowledge base status: ingestion state + ChromaDB stats."""
    chroma_stats = get_collection_stats()
    return {
        "ingestion": _ingestion_status,
        "knowledge_base": chroma_stats,
        "repository": "Prjhage/Grandel",
    }
