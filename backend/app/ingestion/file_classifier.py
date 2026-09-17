"""
File Classifier — determines the source type of each repository file.
"""
from pathlib import Path

CODE_EXTENSIONS = {
    ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".go",
    ".rb", ".php", ".cs", ".cpp", ".c", ".h", ".swift",
    ".kt", ".rs", ".scala",
}

DOC_EXTENSIONS = {".md", ".txt", ".rst", ".adoc"}

CONFIG_EXTENSIONS = {
    ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg",
    ".env.example", ".properties",
}

PROJECT_META_FILES = {
    "package.json", "requirements.txt", "pyproject.toml",
    "setup.py", "setup.cfg", "Makefile", "Dockerfile",
    "docker-compose.yml", "docker-compose.yaml",
    ".gitignore", "render.yaml", "vercel.json",
}

DIAGRAM_EXTENSIONS = {".drawio", ".puml", ".plantuml"}


class FileClassifier:
    """Classifies a file into a source_type category."""

    @staticmethod
    def classify(file_path: str) -> str:
        """
        Returns one of:
          code | documentation | configuration | project_metadata | diagram | unknown
        """
        path = Path(file_path)
        ext = path.suffix.lower()
        name = path.name.lower()

        if name in {f.lower() for f in PROJECT_META_FILES}:
            return "project_metadata"

        if ext in CODE_EXTENSIONS:
            return "code"

        if ext in DOC_EXTENSIONS:
            return "documentation"

        if ext in CONFIG_EXTENSIONS:
            return "configuration"

        if ext in DIAGRAM_EXTENSIONS:
            return "diagram"

        return "unknown"

    @staticmethod
    def detect_language(file_path: str) -> str:
        """Returns the programming language for code files."""
        ext_to_lang = {
            ".js": "javascript", ".jsx": "javascript",
            ".ts": "typescript", ".tsx": "typescript",
            ".py": "python",
            ".java": "java",
            ".go": "go",
            ".rb": "ruby",
            ".php": "php",
            ".cs": "csharp",
            ".cpp": "cpp", ".c": "c", ".h": "c",
            ".swift": "swift",
            ".kt": "kotlin",
            ".rs": "rust",
        }
        ext = Path(file_path).suffix.lower()
        return ext_to_lang.get(ext, "unknown")

    @staticmethod
    def detect_module(file_path: str) -> str:
        """
        Infer the feature module from the file path.
        e.g. 'Backend/controllers/bookingController.js' → 'booking'
        """
        path_lower = file_path.lower().replace("\\", "/")
        module_keywords = [
            "booking", "property", "payment", "auth", "user",
            "notification", "review", "qr", "ai", "search",
            "host", "guest", "admin", "middleware", "model",
        ]
        for kw in module_keywords:
            if kw in path_lower:
                return kw
        return "general"
