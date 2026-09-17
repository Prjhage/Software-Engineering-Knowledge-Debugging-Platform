"""
Metadata builder — creates the metadata dict attached to each vector.
"""
from pathlib import Path


def build_file_metadata(
    file_path: str,
    source_type: str,
    language: str,
    module: str,
    chunk: dict,
    repo: str = "Grandel",
    branch: str = "main",
) -> dict:
    meta = {
        "repository": repo,
        "source_type": source_type,
        "file_path": file_path,
        "file_name": Path(file_path).name,
        "language": language,
        "module": module,
        "branch": branch,
        "chunk_index": chunk.get("chunk_index", 0),
    }
    if chunk.get("name"):
        meta["symbol_name"] = chunk["name"]
    if chunk.get("heading"):
        meta["section"] = chunk["heading"]
    if chunk.get("start_line"):
        meta["start_line"] = chunk["start_line"]
    if chunk.get("end_line"):
        meta["end_line"] = chunk["end_line"]
    return meta


def build_issue_metadata(issue: dict, chunk: dict, repo: str = "Grandel") -> dict:
    return {
        "repository": repo,
        "source_type": "github_issue",
        "file_path": f"github/issues/{issue['number']}",
        "file_name": f"issue-{issue['number']}.md",
        "issue_number": issue["number"],
        "issue_title": issue["title"],
        "issue_state": issue["state"],
        "module": "general",
        "language": "markdown",
        "chunk_index": chunk.get("chunk_index", 0),
    }


def build_pr_metadata(pr: dict, chunk: dict, repo: str = "Grandel") -> dict:
    return {
        "repository": repo,
        "source_type": "pull_request",
        "file_path": f"github/pulls/{pr['number']}",
        "file_name": f"pr-{pr['number']}.md",
        "pr_number": pr["number"],
        "pr_title": pr["title"],
        "pr_state": pr["state"],
        "module": "general",
        "language": "markdown",
        "chunk_index": chunk.get("chunk_index", 0),
    }


def build_commit_metadata(commit: dict, chunk: dict, repo: str = "Grandel") -> dict:
    return {
        "repository": repo,
        "source_type": "commit",
        "file_path": f"github/commits/{commit['sha']}",
        "file_name": f"commit-{commit['sha']}.md",
        "commit_sha": commit["sha"],
        "commit_author": commit["author"],
        "module": "general",
        "language": "text",
        "chunk_index": chunk.get("chunk_index", 0),
    }
