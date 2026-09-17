"""
Context Builder — assembles retrieved chunks into a structured context string
that can be injected into LLM prompts.
"""
from langchain_core.documents import Document
from ..schemas.chat import SourceChunk


def build_context(documents: list[Document], max_chars: int = 6000) -> str:
    """
    Format retrieved documents into a context block for the LLM.
    Each chunk is labeled with its source type and file path.
    """
    if not documents:
        return "No relevant repository information found."

    sections = []
    total_chars = 0

    for i, doc in enumerate(documents, start=1):
        meta = doc.metadata
        source_type = meta.get("source_type", "unknown")
        file_path = meta.get("file_path", "unknown")
        symbol = meta.get("symbol_name", "")
        section = meta.get("section", "")

        # Build source label
        label_parts = [f"[{source_type.upper()}]", file_path]
        if symbol:
            label_parts.append(f"→ {symbol}")
        if section:
            label_parts.append(f"§ {section}")
        label = " ".join(label_parts)

        chunk_text = f"--- Source {i}: {label} ---\n{doc.page_content}\n"

        if total_chars + len(chunk_text) > max_chars:
            break

        sections.append(chunk_text)
        total_chars += len(chunk_text)

    return "\n".join(sections)


def documents_to_source_chunks(documents: list[Document]) -> list[SourceChunk]:
    """Convert LangChain Documents to API SourceChunk schema objects."""
    sources = []
    for doc in documents:
        meta = doc.metadata
        sources.append(SourceChunk(
            file=meta.get("file_path", meta.get("file_name", "unknown")),
            source_type=meta.get("source_type", "unknown"),
            snippet=doc.page_content[:250] + ("..." if len(doc.page_content) > 250 else ""),
            score=meta.get("rerank_score", meta.get("rrf_score")),
            module=meta.get("module"),
            language=meta.get("language"),
            section=meta.get("section") or meta.get("symbol_name"),
            issue_number=meta.get("issue_number"),
        ))
    return sources
