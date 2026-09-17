"""
Vector Store — ChromaDB wrapper using LangChain's Chroma integration.
"""
import logging
from functools import lru_cache
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from ..core.config import get_settings

logger = logging.getLogger(__name__)

_vector_store: Chroma | None = None


def get_vector_store(embeddings: GoogleGenerativeAIEmbeddings | None = None) -> Chroma:
    """
    Returns (or creates) the singleton ChromaDB vector store.
    Pass `embeddings` the first time to initialize; subsequent calls use cached instance.
    """
    global _vector_store
    if _vector_store is None:
        from ..rag.embeddings import get_embedding_function
        settings = get_settings()
        emb = embeddings or get_embedding_function()

        logger.info(f"Initializing ChromaDB at {settings.chroma_path}")
        _vector_store = Chroma(
            collection_name=settings.chroma_collection_name,
            embedding_function=emb,
            persist_directory=str(settings.chroma_path),
        )
        logger.info("ChromaDB initialized.")
    return _vector_store


def reset_vector_store():
    """Delete and recreate the collection (use before re-ingestion)."""
    global _vector_store
    if _vector_store is not None:
        _vector_store.delete_collection()
        _vector_store = None
        logger.info("ChromaDB collection deleted.")


def get_collection_stats() -> dict:
    """Return basic collection stats."""
    vs = get_vector_store()
    try:
        count = vs._collection.count()
        return {"total_documents": count, "collection_name": vs._collection.name}
    except Exception as e:
        logger.warning(f"Could not get collection stats: {e}")
        return {"total_documents": 0, "collection_name": "unknown"}
