"""
FastAPI main application — entry point for the
Software Engineering Knowledge & Debugging Platform backend.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .core.database import close_connection
from .api import chat, repository, debugging, search

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    settings = get_settings()
    logger.info("=" * 60)
    logger.info("Software Engineering Knowledge & Debugging Platform")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"LLM Model: {settings.llm_model}")
    logger.info(f"Embedding Model: {settings.embedding_model}")
    logger.info(f"ChromaDB: {settings.chroma_path}")
    logger.info(f"Repository: {settings.github_repo_owner}/{settings.github_repo_name}")
    logger.info("=" * 60)
    yield
    await close_connection()
    logger.info("Application shutdown complete.")


app = FastAPI(
    title="Software Engineering Knowledge & Debugging Platform",
    description=(
        "An AI-powered developer assistant that understands the Grandel Hotel Booking Platform "
        "through RAG, LangChain, ChromaDB, and Gemini."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow React frontend on localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api")
app.include_router(repository.router, prefix="/api")
app.include_router(debugging.router, prefix="/api")
app.include_router(search.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "Software Engineering Knowledge & Debugging Platform",
        "version": "1.0.0",
        "repository": "Prjhage/Grandel",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
