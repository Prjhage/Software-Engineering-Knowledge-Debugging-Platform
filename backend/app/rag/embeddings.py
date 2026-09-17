"""
Embeddings — wraps Google Generative AI Embeddings for LangChain.
"""
from functools import lru_cache
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from ..core.config import get_settings


@lru_cache()
def get_embedding_function() -> GoogleGenerativeAIEmbeddings:
    """Returns a cached embedding function using Gemini text-embedding-004."""
    settings = get_settings()
    return GoogleGenerativeAIEmbeddings(
        model=settings.embedding_model,
        google_api_key=settings.gemini_api_key,
    )
