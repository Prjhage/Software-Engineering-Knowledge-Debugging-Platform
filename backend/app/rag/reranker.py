"""
Reranker — uses a cross-encoder model to rerank hybrid search results
by computing a relevance score for each (query, document) pair.
"""
import logging
from langchain_core.documents import Document

logger = logging.getLogger(__name__)

_reranker = None


def _get_reranker():
    global _reranker
    if _reranker is None:
        try:
            from sentence_transformers import CrossEncoder
            _reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            logger.info("Cross-encoder reranker loaded.")
        except Exception as e:
            logger.warning(f"Reranker not available: {e}. Falling back to original order.")
    return _reranker


def rerank(query: str, documents: list[Document], top_k: int = 5) -> list[Document]:
    """
    Rerank documents by relevance to the query using a cross-encoder.
    Returns top_k most relevant documents.
    """
    if not documents:
        return []

    reranker = _get_reranker()

    if reranker is None:
        # Fallback: return original order
        return documents[:top_k]

    try:
        pairs = [(query, doc.page_content[:512]) for doc in documents]
        scores = reranker.predict(pairs)
        scored = sorted(zip(documents, scores), key=lambda x: x[1], reverse=True)
        reranked = []
        for doc, score in scored[:top_k]:
            doc.metadata["rerank_score"] = float(score)
            reranked.append(doc)
        logger.debug(f"Reranked {len(documents)} → {len(reranked)} docs.")
        return reranked
    except Exception as e:
        logger.error(f"Reranking failed: {e}. Returning original order.")
        return documents[:top_k]
