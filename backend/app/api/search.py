"""
Search API — direct search across the knowledge base.
"""
import logging
from fastapi import APIRouter
from ..schemas.retrieval import SearchRequest
from ..rag.hybrid_search import get_hybrid_searcher
from ..rag.reranker import rerank
from ..rag.context_builder import documents_to_source_chunks

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/search", tags=["Search"])


@router.post("")
async def search(request: SearchRequest):
    """
    Direct hybrid search across the Grandel knowledge base.
    Returns matching chunks with source metadata.
    """
    searcher = get_hybrid_searcher()
    docs = searcher.search(
        query=request.query,
        top_k=request.top_k * 2,
        source_types=request.source_types,
    )
    reranked = rerank(request.query, docs, top_k=request.top_k)
    sources = documents_to_source_chunks(reranked)
    return {
        "query": request.query,
        "results": [s.model_dump() for s in sources],
        "total": len(sources),
    }
