"""
Chunker — intelligent chunking strategies for different content types.
Code: function/class level (via Tree-sitter).
Docs: section/subsection level (via heading hierarchy).
Other: RecursiveCharacterTextSplitter fallback.
"""
import logging
try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except Exception:
    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
    except Exception:
        RecursiveCharacterTextSplitter = None

from .code_parser import parse_code
from .document_parser import parse_markdown
from .file_classifier import FileClassifier

logger = logging.getLogger(__name__)

CHUNK_SIZE = 1200
CHUNK_OVERLAP = 150
MAX_CHUNK_SIZE = 4500  # allow full functions up to ~120 lines without splitting


def _split_text_fallback(text: str, max_size: int = CHUNK_SIZE) -> list[str]:
    """Generic recursive text splitter fallback."""
    if RecursiveCharacterTextSplitter is not None:
        try:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=max_size,
                chunk_overlap=CHUNK_OVERLAP,
                separators=["\n\n", "\n", " ", ""],
            )
            return splitter.split_text(text)
        except Exception:
            pass

    # Pure Python fallback
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start += max_size - CHUNK_OVERLAP
    return chunks


def chunk_code_file(content: str, file_path: str, language: str) -> list[dict]:
    """
    Chunk a code file:
    1. Try Tree-sitter function/class extraction
    2. Fall back to RecursiveCharacterTextSplitter
    Returns list of document dicts with text and metadata hints.
    """
    parsed = parse_code(content, file_path, language)

    if parsed:
        chunks = []
        for item in parsed:
            code = item["code"]
            header = f"[{item['type'].upper()}] {item['name']}"
            if item.get("docstring"):
                header += f"\n{item['docstring']}"
            full = f"{header}\n\n{code}"

            # If function is huge, sub-split it
            if len(full) > MAX_CHUNK_SIZE:
                sub_chunks = _split_text_fallback(full, CHUNK_SIZE)
                for idx, sub in enumerate(sub_chunks):
                    chunks.append({
                        "text": sub,
                        "name": item["name"],
                        "chunk_index": idx,
                        "start_line": item["start_line"],
                        "end_line": item["end_line"],
                    })
            else:
                chunks.append({
                    "text": full,
                    "name": item["name"],
                    "chunk_index": 0,
                    "start_line": item["start_line"],
                    "end_line": item["end_line"],
                })
        return chunks
    else:
        # Fallback: split whole file
        parts = _split_text_fallback(content)
        return [{"text": p, "name": "", "chunk_index": i, "start_line": None, "end_line": None}
                for i, p in enumerate(parts)]


def chunk_document_file(content: str, file_path: str) -> list[dict]:
    """
    Chunk a Markdown documentation file by sections.
    """
    sections = parse_markdown(content, file_path)

    if not sections:
        parts = _split_text_fallback(content)
        return [{"text": p, "heading": "", "chunk_index": i} for i, p in enumerate(parts)]

    chunks = []
    for section in sections:
        text = f"## {section['heading']}\n\n{section['content']}"
        if len(text) > MAX_CHUNK_SIZE:
            sub_chunks = _split_text_fallback(text, CHUNK_SIZE)
            for idx, sub in enumerate(sub_chunks):
                chunks.append({
                    "text": sub,
                    "heading": section["heading"],
                    "chunk_index": idx,
                    "start_line": section["start_line"],
                    "end_line": section["end_line"],
                })
        else:
            chunks.append({
                "text": text,
                "heading": section["heading"],
                "chunk_index": 0,
                "start_line": section["start_line"],
                "end_line": section["end_line"],
            })
    return chunks


def chunk_config_file(content: str, file_path: str) -> list[dict]:
    """Chunk config/metadata files — often small enough to keep whole."""
    if len(content) <= MAX_CHUNK_SIZE:
        return [{"text": content, "heading": "", "chunk_index": 0,
                 "start_line": 1, "end_line": content.count("\n") + 1}]
    parts = _split_text_fallback(content)
    return [{"text": p, "heading": "", "chunk_index": i} for i, p in enumerate(parts)]


def chunk_issue(issue: dict) -> list[dict]:
    """Format a GitHub issue as a single chunk."""
    labels = ", ".join(issue.get("labels", []))
    text = (
        f"[GITHUB ISSUE #{issue['number']}] {issue['title']}\n"
        f"Status: {issue['state']} | Labels: {labels}\n\n"
        f"{issue.get('body', '').strip()}"
    )
    if len(text) > MAX_CHUNK_SIZE:
        parts = _split_text_fallback(text)
        return [{"text": p, "heading": issue["title"], "chunk_index": i} for i, p in enumerate(parts)]
    return [{"text": text, "heading": issue["title"], "chunk_index": 0}]


def chunk_pull_request(pr: dict) -> list[dict]:
    """Format a GitHub PR as a single chunk."""
    files = ", ".join(pr.get("files_changed", [])[:10])
    text = (
        f"[PULL REQUEST #{pr['number']}] {pr['title']}\n"
        f"State: {pr['state']} | Branch: {pr.get('head_branch', '')} → {pr.get('base_branch', '')}\n"
        f"Files: {files}\n\n"
        f"{pr.get('body', '').strip()}"
    )
    if len(text) > MAX_CHUNK_SIZE:
        parts = _split_text_fallback(text)
        return [{"text": p, "heading": pr["title"], "chunk_index": i} for i, p in enumerate(parts)]
    return [{"text": text, "heading": pr["title"], "chunk_index": 0}]


def chunk_commit(commit: dict) -> list[dict]:
    """Format a Git commit as a single chunk."""
    files = ", ".join(commit.get("files_changed", [])[:10])
    text = (
        f"[COMMIT {commit['sha']}] {commit['message']}\n"
        f"Author: {commit['author']} | Date: {commit['date']}\n"
        f"Files: {files}"
    )
    return [{"text": text, "heading": commit["message"][:60], "chunk_index": 0}]


def chunk_file(content: str, file_path: str, source_type: str, language: str = "unknown") -> list[dict]:
    """
    Main dispatch function — choose the right chunking strategy.
    """
    if source_type == "code":
        return chunk_code_file(content, file_path, language)
    elif source_type == "documentation":
        return chunk_document_file(content, file_path)
    elif source_type in ("configuration", "project_metadata", "unknown"):
        return chunk_config_file(content, file_path)
    else:
        parts = _split_text_fallback(content)
        return [{"text": p, "heading": "", "chunk_index": i} for i, p in enumerate(parts)]
