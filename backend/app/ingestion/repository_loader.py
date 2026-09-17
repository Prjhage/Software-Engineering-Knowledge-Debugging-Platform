"""
Repository Loader — fetches all content from the Grandel GitHub repo
using the PyGithub API: source files, docs, issues, PRs, commit history.
"""
import base64
import json
import logging
import time
from pathlib import Path
from typing import Any
from github import Github, GithubException
from ..core.config import get_settings

logger = logging.getLogger(__name__)

# Files/dirs to completely ignore during ingestion


IGNORE_PATHS = {
    "node_modules", ".git", "dist", "build", "coverage",
    ".next", "__pycache__", ".pytest_cache", "venv", ".venv",
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
}

IGNORE_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff",
    ".woff2", ".ttf", ".eot", ".mp4", ".mp3", ".pdf", ".zip",
    ".tar", ".gz", ".lock",
}

IGNORE_FILES = {
    ".env", ".env.local", ".env.production", ".env.development",
    "secrets.json", "credentials.json",
}


class RepositoryLoader:
    """Loads all content from a GitHub repository via the API."""

    def __init__(self):
        self.settings = get_settings()
        token = self.settings.github_token or None
        self.gh = Github(token)
        self.repo_owner = self.settings.github_repo_owner
        self.repo_name = self.settings.github_repo_name

    def _should_skip(self, path: str) -> bool:
        """Return True if this file/path should be skipped."""
        parts = path.replace("\\", "/").split("/")

        # Skip ignored directories
        for part in parts:
            if part in IGNORE_PATHS:
                return True

        # Skip ignored extensions
        ext = Path(path).suffix.lower()
        if ext in IGNORE_EXTENSIONS:
            return True

        # Skip ignored filenames
        fname = Path(path).name
        if fname in IGNORE_FILES or fname.startswith(".env"):
            return True

        return False

    def _get_file_content(self, file_content) -> str | None:
        """Decode file content from GitHub API response."""
        try:
            if file_content.encoding == "base64":
                raw = base64.b64decode(file_content.content)
                return raw.decode("utf-8", errors="replace")
            return file_content.decoded_content.decode("utf-8", errors="replace")
        except Exception as e:
            logger.warning(f"Could not decode {file_content.path}: {e}")
            return None

    def load_all_files(self) -> list[dict[str, Any]]:
        """
        Walk the entire repo tree and return a list of dicts:
        {path, content, size, language_hint}
        """
        logger.info(f"Loading files from {self.repo_owner}/{self.repo_name}...")
        repo = self.gh.get_repo(f"{self.repo_owner}/{self.repo_name}")
        files: list[dict[str, Any]] = []

        try:
            tree = repo.get_git_tree(sha="main", recursive=True)
        except GithubException:
            tree = repo.get_git_tree(sha="master", recursive=True)

        for item in tree.tree:
            if item.type != "blob":
                continue
            if self._should_skip(item.path):
                logger.debug(f"Skipping: {item.path}")
                continue
            if item.size and item.size > 300_000:  # skip files > 300KB
                logger.debug(f"Skipping (too large): {item.path}")
                continue

            try:
                file_obj = repo.get_contents(item.path)
                content = self._get_file_content(file_obj)
                if content:
                    files.append({
                        "path": item.path,
                        "content": content,
                        "size": item.size,
                    })
                    logger.debug(f"Loaded: {item.path}")
                time.sleep(0.05)  # be gentle with the API
            except Exception as e:
                logger.warning(f"Error loading {item.path}: {e}")

        logger.info(f"Loaded {len(files)} files from repo.")
        return files

    def load_issues(self, max_issues: int = 100) -> list[dict[str, Any]]:
        """Fetch GitHub issues (open + closed)."""
        logger.info("Loading GitHub issues...")
        repo = self.gh.get_repo(f"{self.repo_owner}/{self.repo_name}")
        issues_data = []
        try:
            for issue in repo.get_issues(state="all"):
                if len(issues_data) >= max_issues:
                    break
                if issue.pull_request:
                    continue
                issues_data.append({
                    "number": issue.number,
                    "title": issue.title,
                    "body": issue.body or "",
                    "state": issue.state,
                    "labels": [l.name for l in issue.labels],
                    "created_at": issue.created_at.isoformat(),
                    "closed_at": issue.closed_at.isoformat() if issue.closed_at else None,
                    "url": issue.html_url,
                })
        except Exception as e:
            logger.warning(f"Error while loading issues: {e}")

        logger.info(f"Loaded {len(issues_data)} issues.")
        return issues_data

    def load_pull_requests(self, max_prs: int = 50) -> list[dict[str, Any]]:
        """Fetch GitHub pull requests."""
        logger.info("Loading pull requests...")
        repo = self.gh.get_repo(f"{self.repo_owner}/{self.repo_name}")
        prs_data = []

        try:
            for pr in repo.get_pulls(state="all"):
                if len(prs_data) >= max_prs:
                    break
                try:
                    files = [f.filename for f in pr.get_files()]
                except Exception:
                    files = []
                prs_data.append({
                    "number": pr.number,
                    "title": pr.title,
                    "body": pr.body or "",
                    "state": pr.state,
                    "base_branch": pr.base.ref,
                    "head_branch": pr.head.ref,
                    "created_at": pr.created_at.isoformat(),
                    "merged_at": pr.merged_at.isoformat() if pr.merged_at else None,
                    "url": pr.html_url,
                    "files_changed": files,
                })
        except Exception as e:
            logger.warning(f"Error while loading pull requests: {e}")

        logger.info(f"Loaded {len(prs_data)} pull requests.")
        return prs_data

    def load_commits(self, max_commits: int = 100) -> list[dict[str, Any]]:
        """Fetch recent Git commits."""
        logger.info("Loading commit history...")
        repo = self.gh.get_repo(f"{self.repo_owner}/{self.repo_name}")
        commits_data = []

        try:
            for commit in repo.get_commits():
                if len(commits_data) >= max_commits:
                    break
                try:
                    files = [f.filename for f in commit.files[:20]]
                except Exception:
                    files = []

                commits_data.append({
                    "sha": commit.sha[:10],
                    "message": commit.commit.message,
                    "author": commit.commit.author.name if commit.commit.author else "Unknown",
                    "date": commit.commit.author.date.isoformat() if commit.commit.author else "",
                    "files_changed": files,
                    "url": commit.html_url,
                })
        except Exception as e:
            logger.warning(f"Error while loading commits: {e}")

        logger.info(f"Loaded {len(commits_data)} commits.")
        return commits_data

    def save_raw(self, data: dict, output_dir: str = "../data/raw"):
        """Persist raw fetched data to JSON files for caching."""
        out = Path(output_dir)
        out.mkdir(parents=True, exist_ok=True)
        for key, value in data.items():
            fpath = out / f"{key}.json"
            with open(fpath, "w", encoding="utf-8") as f:
                json.dump(value, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved raw data: {fpath}")

    def load_from_cache(self, output_dir: str = "../data/raw") -> dict | None:
        """Load previously cached raw data if available."""
        out = Path(output_dir)
        result = {}
        for key in ["files", "issues", "pull_requests", "commits"]:
            fpath = out / f"{key}.json"
            if fpath.exists():
                with open(fpath, encoding="utf-8") as f:
                    result[key] = json.load(f)
            else:
                return None  # cache is incomplete
        logger.info("Loaded from cache.")
        return result
