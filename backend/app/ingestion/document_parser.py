"""
Document Parser — splits Markdown documents into sections by heading hierarchy.
"""
import re
import logging

logger = logging.getLogger(__name__)


def parse_markdown(content: str, file_path: str) -> list[dict]:
    """
    Split a Markdown document into sections based on headings (# ## ###).
    Returns list of {heading, level, content, start_line, end_line}
    """
    lines = content.split("\n")
    sections = []
    current_heading = file_path  # fallback heading
    current_level = 0
    current_lines = []
    start_line = 1

    heading_pattern = re.compile(r"^(#{1,6})\s+(.*)")

    for i, line in enumerate(lines, start=1):
        match = heading_pattern.match(line)
        if match:
            # Save the previous section
            text = "\n".join(current_lines).strip()
            if text:
                sections.append({
                    "heading": current_heading,
                    "level": current_level,
                    "content": text,
                    "start_line": start_line,
                    "end_line": i - 1,
                    "file_path": file_path,
                })
            current_heading = match.group(2).strip()
            current_level = len(match.group(1))
            current_lines = []
            start_line = i
        else:
            current_lines.append(line)

    # Save the last section
    text = "\n".join(current_lines).strip()
    if text:
        sections.append({
            "heading": current_heading,
            "level": current_level,
            "content": text,
            "start_line": start_line,
            "end_line": len(lines),
            "file_path": file_path,
        })

    return sections
