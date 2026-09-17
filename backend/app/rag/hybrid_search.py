"""
Hybrid Search — combines ChromaDB semantic search with BM25 keyword search
using Reciprocal Rank Fusion (RRF) for result combination.
"""
import logging
from rank_bm25 import BM25Okapi
from langchain_core.documents import Document
from .vector_store import get_vector_store

logger = logging.getLogger(__name__)

RRF_K = 60  # constant in RRF formula


def _rrf_score(rank: int, k: int = RRF_K) -> float:
    """Reciprocal Rank Fusion score for a given rank position."""
    return 1.0 / (k + rank)


class HybridSearcher:
    """
    Combines semantic (vector) and keyword (BM25) search using RRF.
    The corpus is loaded lazily from ChromaDB on first use.
    """

    def __init__(self):
        self._corpus: list[Document] | None = None
        self._bm25: BM25Okapi | None = None

    def _load_corpus(self):
        """Load all documents from ChromaDB to build BM25 index."""
        vs = get_vector_store()
        try:
            results = vs.get(include=["documents", "metadatas"])
            docs = results.get("documents", [])
            metas = results.get("metadatas", [])
            ids = results.get("ids", [])
            self._corpus = [
                Document(page_content=doc, metadata=meta or {}, id=id_)
                for doc, meta, id_ in zip(docs, metas, ids)
            ]
            tokenized = [doc.page_content.lower().split() for doc in self._corpus]
            self._bm25 = BM25Okapi(tokenized)
            logger.info(f"BM25 index built with {len(self._corpus)} documents.")
        except Exception as e:
            logger.error(f"Failed to build BM25 index: {e}")
            self._corpus = []

    def _semantic_search(
        self, query: str, k: int, source_types: list[str] | None = None
    ) -> list[tuple[Document, float]]:
        """Run ChromaDB similarity search with optional metadata filter."""
        vs = get_vector_store()
        where = None
        if source_types:
            if len(source_types) == 1:
                where = {"source_type": {"$eq": source_types[0]}}
            else:
                where = {"source_type": {"$in": source_types}}

        try:
            results = vs.similarity_search_with_score(query, k=k * 2, filter=where)
            return results
        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return []

    def _bm25_search(self, query: str, k: int) -> list[tuple[Document, float]]:
        """Run BM25 keyword search over the cached corpus."""
        if self._bm25 is None:
            self._load_corpus()
        if not self._corpus:
            return []

        tokens = query.lower().split()
        scores = self._bm25.get_scores(tokens)
        ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)

        results = []
        for idx, score in ranked[:k * 2]:
            if score > 0:
                results.append((self._corpus[idx], float(score)))
        return results

    def search(
        self,
        query: str,
        top_k: int = 10,
        source_types: list[str] | None = None,
    ) -> list[Document]:
        """
        Run hybrid search and return top_k deduplicated, fused results.
        """
        semantic_results = self._semantic_search(query, top_k, source_types)
        bm25_results = self._bm25_search(query, top_k)

        # Build score maps keyed by document content hash
        rrf_scores: dict[str, float] = {}
        doc_map: dict[str, Document] = {}

        for rank, (doc, _score) in enumerate(semantic_results):
            key = doc.page_content[:100]  # use first 100 chars as key
            rrf_scores[key] = rrf_scores.get(key, 0) + _rrf_score(rank)
            doc_map[key] = doc

        for rank, (doc, _score) in enumerate(bm25_results):
            key = doc.page_content[:100]
            rrf_scores[key] = rrf_scores.get(key, 0) + _rrf_score(rank)
            doc_map[key] = doc

        # Sort by fused RRF score
        ranked_keys = sorted(rrf_scores.keys(), key=lambda k: rrf_scores[k], reverse=True)
        final = []
        for key in ranked_keys[:top_k]:
            doc = doc_map[key]
            doc.metadata["rrf_score"] = rrf_scores[key]
            final.append(doc)

        logger.debug(f"Hybrid search returned {len(final)} results for: {query[:50]}")
        return final

    def invalidate_bm25_cache(self):
        """Call this after re-ingestion to rebuild BM25 index."""
        self._corpus = None
        self._bm25 = None


# Module-level singleton
_searcher: HybridSearcher | None = None


def get_hybrid_searcher() -> HybridSearcher:
    global _searcher
    if _searcher is None:
        _searcher = HybridSearcher()
    return _searcher
