"""
Pydantic schemas for retrieval results.
"""
from pydantic import BaseModel
from typing import Optional


class RetrievalResult(BaseModel):
    content: str
    metadata: dict
    score: Optional[float] = None
    source_type: str = "unknown"

    @property
    def file_path(self) -> str:
        return self.metadata.get("file_path", self.metadata.get("file", "unknown"))

    @property
    def display_name(self) -> str:
        fp = self.file_path
        # Show last 3 path parts for readability
        parts = fp.replace("\\", "/").split("/")
        return "/".join(parts[-3:]) if len(parts) > 3 else fp


class SearchRequest(BaseModel):
    query: str
    source_types: Optional[list[str]] = None  # filter by source_type
    top_k: int = 5
