"""
Ingestion Pipeline — orchestrates the full ingestion workflow:
GitHub → File Discovery → Classification → Parsing → Chunking →
Metadata → Embeddings → ChromaDB

Run this once (or when the repo is updated) to build the knowledge base.
"""
import logging
import time
import uuid
from datetime import datetime
from tqdm import tqdm

from .repository_loader import RepositoryLoader
from .file_classifier import FileClassifier
from .chunker import chunk_file, chunk_issue, chunk_pull_request, chunk_commit
from .metadata import (
    build_file_metadata,
    build_issue_metadata,
    build_pr_metadata,
    build_commit_metadata,
)
from ..rag.embeddings import get_embedding_function
from ..rag.vector_store import get_vector_store

logger = logging.getLogger(__name__)


class IngestionPipeline:
    """Full repository ingestion pipeline."""

    def __init__(self, use_cache: bool = True):
        self.loader = RepositoryLoader()
        self.classifier = FileClassifier()
        self.use_cache = use_cache
        self.stats = {
            "files_found": 0,
            "files_skipped": 0,
            "files_processed": 0,
            "documents_created": 0,
            "issues_indexed": 0,
            "pull_requests_indexed": 0,
            "commits_indexed": 0,
            "errors": 0,
            "started_at": None,
            "finished_at": None,
        }

    def run(self) -> dict:
        """Execute the full ingestion and return a summary."""
        self.stats["started_at"] = datetime.utcnow().isoformat()
        logger.info("=" * 60)
        logger.info("Starting ingestion pipeline for Grandel repository")
        logger.info("=" * 60)

        # Step 1: Load raw data (with optional cache)
        raw = None
        if self.use_cache:
            raw = self.loader.load_from_cache()

        if raw is None:
            logger.info("Fetching fresh data from GitHub...")
            raw_files = self.loader.load_all_files()
            raw_issues = self.loader.load_issues()
            raw_prs = self.loader.load_pull_requests()
            raw_commits = self.loader.load_commits()
            raw = {
                "files": raw_files,
                "issues": raw_issues,
                "pull_requests": raw_prs,
                "commits": raw_commits,
            }
            self.loader.save_raw(raw)

        # Step 2: Prepare vector store
        embeddings = get_embedding_function()
        vector_store = get_vector_store(embeddings)

        # Step 3: Process source code and documentation files
        all_documents = []
        all_metadatas = []
        all_ids = []

        self.stats["files_found"] = len(raw["files"])
        logger.info(f"Processing {len(raw['files'])} files...")

        for file_item in tqdm(raw["files"], desc="Ingesting files"):
            path = file_item["path"]
            content = file_item["content"]

            source_type = self.classifier.classify(path)
            if source_type == "unknown":
                self.stats["files_skipped"] += 1
                continue

            language = self.classifier.detect_language(path)
            module = self.classifier.detect_module(path)

            try:
                chunks = chunk_file(content, path, source_type, language)
                for idx, chunk in enumerate(chunks):
                    if not chunk["text"].strip():
                        continue
                    meta = build_file_metadata(path, source_type, language, module, chunk)
                    doc_id = f"{path.replace('/', '_')}_{idx}_{uuid.uuid4().hex[:6]}"

                    all_documents.append(chunk["text"])
                    all_metadatas.append(meta)
                    all_ids.append(doc_id)

                self.stats["files_processed"] += 1
            except Exception as e:
                logger.error(f"Error processing {path}: {e}")
                self.stats["errors"] += 1

        # Step 4: Process GitHub issues
        logger.info(f"Processing {len(raw['issues'])} issues...")
        for issue in tqdm(raw["issues"], desc="Ingesting issues"):
            try:
                chunks = chunk_issue(issue)
                for idx, chunk in enumerate(chunks):
                    meta = build_issue_metadata(issue, chunk)
                    doc_id = f"issue_{issue['number']}_{idx}_{uuid.uuid4().hex[:6]}"
                    all_documents.append(chunk["text"])
                    all_metadatas.append(meta)
                    all_ids.append(doc_id)
                self.stats["issues_indexed"] += 1
            except Exception as e:
                logger.error(f"Error processing issue #{issue.get('number')}: {e}")
                self.stats["errors"] += 1

        # Step 5: Process Pull Requests
        logger.info(f"Processing {len(raw['pull_requests'])} pull requests...")
        for pr in tqdm(raw["pull_requests"], desc="Ingesting PRs"):
            try:
                chunks = chunk_pull_request(pr)
                for idx, chunk in enumerate(chunks):
                    meta = build_pr_metadata(pr, chunk)
                    doc_id = f"pr_{pr['number']}_{idx}_{uuid.uuid4().hex[:6]}"
                    all_documents.append(chunk["text"])
                    all_metadatas.append(meta)
                    all_ids.append(doc_id)
                self.stats["pull_requests_indexed"] += 1
            except Exception as e:
                logger.error(f"Error processing PR #{pr.get('number')}: {e}")
                self.stats["errors"] += 1

        # Step 6: Process Commits (Index top 15 recent commits for context)
        recent_commits = raw["commits"][:15]
        logger.info(f"Processing {len(recent_commits)} recent commits...")
        for commit in tqdm(recent_commits, desc="Ingesting commits"):
            try:
                chunks = chunk_commit(commit)
                for idx, chunk in enumerate(chunks):
                    meta = build_commit_metadata(commit, chunk)
                    doc_id = f"commit_{commit['sha']}_{idx}_{uuid.uuid4().hex[:6]}"
                    all_documents.append(chunk["text"])
                    all_metadatas.append(meta)
                    all_ids.append(doc_id)
                self.stats["commits_indexed"] += 1
            except Exception as e:
                logger.error(f"Error processing commit {commit.get('sha')}: {e}")
                self.stats["errors"] += 1

        # Step 7: Add all documents to ChromaDB in batches with rate-limit protection
        self.stats["documents_created"] = len(all_documents)
        logger.info(f"Adding {len(all_documents)} documents to ChromaDB...")
        BATCH_SIZE = 25

        for i in tqdm(range(0, len(all_documents), BATCH_SIZE), desc="Embedding"):
            batch_docs = all_documents[i:i + BATCH_SIZE]
            batch_meta = all_metadatas[i:i + BATCH_SIZE]
            batch_ids = all_ids[i:i + BATCH_SIZE]

            max_retries = 5
            for attempt in range(max_retries):
                try:
                    vector_store.add_texts(
                        texts=batch_docs,
                        metadatas=batch_meta,
                        ids=batch_ids,
                    )
                    break
                except Exception as e:
                    err_str = str(e)
                    if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                        wait_sec = 25 + (attempt * 10)
                        logger.warning(f"Rate limit hit on batch {i//BATCH_SIZE + 1}. Waiting {wait_sec}s before retry {attempt + 1}/{max_retries}...")
                        time.sleep(wait_sec)
                    else:
                        logger.error(f"Error adding batch {i}: {e}")
                        break
            time.sleep(0.5)  # Gentle spacing between batches to respect free tier RPM

        self.stats["finished_at"] = datetime.utcnow().isoformat()
        logger.info("=" * 60)
        logger.info("Ingestion complete!")
        logger.info(f"Summary: {self.stats}")
        logger.info("=" * 60)

        return self.stats
