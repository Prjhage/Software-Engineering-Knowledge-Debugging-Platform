"""
LLM singleton — Gemini via LangChain ChatGoogleGenerativeAI.
"""
from functools import lru_cache
from langchain_google_genai import ChatGoogleGenerativeAI
from ..core.config import get_settings


@lru_cache()
def get_llm() -> ChatGoogleGenerativeAI:
    """Returns a cached Gemini LLM instance."""
    settings = get_settings()
    return ChatGoogleGenerativeAI(
        model=settings.llm_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.1,      # low temperature for grounded, factual answers
        max_output_tokens=2048,
        convert_system_message_to_human=True,
    )
