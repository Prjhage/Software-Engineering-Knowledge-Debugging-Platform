"""
Debugging Service — investigates errors using multi-source retrieval.
Searches code + docs + issues + commits and produces a structured debug report.
"""
import json
import logging
import uuid

from ..rag.hybrid_search import get_hybrid_searcher
from ..rag.reranker import rerank
from ..rag.context_builder import build_context, documents_to_source_chunks
from ..services.llm import get_llm
from ..prompts.debugging_prompt import debugging_prompt
from ..schemas.debugging import DebugRequest, DebugResponse, PossibleCause
from ..core.config import get_settings

logger = logging.getLogger(__name__)


class DebuggingService:
    def __init__(self):
        self.settings = get_settings()
        self.searcher = get_hybrid_searcher()
        self.llm = get_llm()

    def investigate(self, request: DebugRequest) -> DebugResponse:
        """
        Multi-source debugging investigation:
        1. Extract search queries from the error
        2. Search code, docs, issues, and commits
        3. Rerank evidence
        4. Call Gemini for structured analysis
        5. Parse JSON response into DebugResponse
        """
        session_id = request.session_id or str(uuid.uuid4())
        error_msg = request.error_message

        # Build a comprehensive search query from the error
        search_query = error_msg
        if request.endpoint:
            search_query += f" {request.endpoint}"

        logger.info(f"Debugging: {error_msg[:80]}")

        # Search across all relevant source types
        all_docs = []

        # 1. Search code (most important for debugging)
        code_docs = self.searcher.search(
            search_query,
            top_k=8,
            source_types=["code"],
        )
        all_docs.extend(code_docs)

        # 2. Search documentation
        doc_docs = self.searcher.search(
            search_query,
            top_k=4,
            source_types=["documentation"],
        )
        all_docs.extend(doc_docs)

        # 3. Search GitHub issues (find similar past problems)
        issue_docs = self.searcher.search(
            error_msg,
            top_k=4,
            source_types=["github_issue"],
        )
        all_docs.extend(issue_docs)

        # 4. Search commits (find recent changes)
        commit_docs = self.searcher.search(
            search_query,
            top_k=3,
            source_types=["commit"],
        )
        all_docs.extend(commit_docs)

        # Deduplicate and rerank
        seen = set()
        unique_docs = []
        for doc in all_docs:
            key = doc.page_content[:100]
            if key not in seen:
                seen.add(key)
                unique_docs.append(doc)

        reranked = rerank(error_msg, unique_docs, top_k=self.settings.rerank_top_k + 3)
        context = build_context(reranked)
        sources = documents_to_source_chunks(reranked)

        # Call Gemini
        try:
            chain = debugging_prompt | self.llm
            response = chain.invoke({
                "context": context,
                "error_message": error_msg,
                "endpoint": request.endpoint or "Not specified",
                "expected": request.expected_behavior or "Not specified",
                "actual": request.actual_behavior or "Not specified",
            })
            raw = response.content

            # Try to parse JSON from the response
            try:
                # Handle markdown code blocks
                if "```json" in raw:
                    raw = raw.split("```json")[1].split("```")[0].strip()
                elif "```" in raw:
                    raw = raw.split("```")[1].split("```")[0].strip()

                data = json.loads(raw)
                causes = [
                    PossibleCause(
                        cause=c.get("cause", ""),
                        evidence=c.get("evidence", []),
                        confidence=c.get("confidence", "medium"),
                    )
                    for c in data.get("possible_causes", [])
                ]
                return DebugResponse(
                    session_id=session_id,
                    summary=data.get("summary", ""),
                    possible_causes=causes,
                    recommended_investigation=data.get("recommended_investigation", []),
                    sources=sources,
                    inference_note=data.get("inference_note", ""),
                )
            except json.JSONDecodeError:
                # LLM didn't return valid JSON — wrap raw text
                logger.warning("Debugging response was not JSON. Wrapping raw text.")
                return DebugResponse(
                    session_id=session_id,
                    summary=raw[:500],
                    possible_causes=[],
                    recommended_investigation=["Review the raw analysis above."],
                    sources=sources,
                    inference_note="Response parsing failed; raw LLM output provided.",
                )

        except Exception as e:
            logger.error(f"Debugging LLM call failed: {e}")
            return DebugResponse(
                session_id=session_id,
                summary=f"Error during debugging investigation: {e}",
                possible_causes=[],
                recommended_investigation=[],
                sources=sources,
                inference_note="",
            )
