from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    # LLM / Embeddings
    gemini_api_key: str = ""
    embedding_model: str = "models/text-embedding-004"
    llm_model: str = "gemini-1.5-flash"

    # GitHub
    github_token: str = ""
    github_repo_owner: str = "Prjhage"
    github_repo_name: str = "Grandel"

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "sek_platform"

    # ChromaDB
    chroma_persist_directory: str = "../data/chroma"
    chroma_collection_name: str = "grandel_knowledge"

    # Retrieval
    retrieval_top_k: int = 10
    rerank_top_k: int = 5

    # App
    environment: str = "development"
    debug: bool = True

    @property
    def chroma_path(self) -> Path:
        """Resolve chroma directory relative to this file's location."""
        base = Path(__file__).parent.parent.parent.parent  # project root
        p = Path(self.chroma_persist_directory)
        if not p.is_absolute():
            p = base / p
        p.mkdir(parents=True, exist_ok=True)
        return p

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
