"""
Code Parser — uses Tree-sitter to extract functions, classes, and methods
from JavaScript/TypeScript and Python source code.
Falls back to raw text if parsing fails.
"""
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Tree-sitter is imported lazily to avoid hard failures if grammars aren't built
_JS_PARSER = None
_PY_PARSER = None


def _get_js_parser():
    global _JS_PARSER
    if _JS_PARSER is None:
        try:
            import tree_sitter_javascript as tsjs
            from tree_sitter import Language, Parser
            JS_LANGUAGE = Language(tsjs.language())
            _JS_PARSER = Parser(JS_LANGUAGE)
        except Exception as e:
            logger.warning(f"Tree-sitter JS not available: {e}")
    return _JS_PARSER


def _get_py_parser():
    global _PY_PARSER
    if _PY_PARSER is None:
        try:
            import tree_sitter_python as tspy
            from tree_sitter import Language, Parser
            PY_LANGUAGE = Language(tspy.language())
            _PY_PARSER = Parser(PY_LANGUAGE)
        except Exception as e:
            logger.warning(f"Tree-sitter Python not available: {e}")
    return _PY_PARSER


def _extract_node_text(node, source_bytes: bytes) -> str:
    return source_bytes[node.start_byte:node.end_byte].decode("utf-8", errors="replace")


def _get_leading_comment(node, source_bytes: bytes) -> str:
    """Try to get the doc comment just above a function/class node."""
    prev = node.prev_sibling
    if prev and prev.type in ("comment", "expression_statement"):
        return _extract_node_text(prev, source_bytes).strip()
    return ""


def parse_javascript(content: str, file_path: str) -> list[dict]:
    """
    Parse JS/TS file and extract top-level functions, arrow functions,
    and class methods as individual chunks.
    Returns list of {name, type, code, docstring, start_line, end_line}
    """
    parser = _get_js_parser()
    if not parser:
        return []

    source_bytes = content.encode("utf-8")
    tree = parser.parse(source_bytes)
    chunks = []

    def walk(node):
        if node.type in (
            "function_declaration", "function_expression",
            "arrow_function", "method_definition",
            "class_declaration",
        ):
            name = ""
            # Try to find the identifier
            for child in node.children:
                if child.type in ("identifier", "property_identifier"):
                    name = _extract_node_text(child, source_bytes)
                    break

            # For arrow functions assigned to variables: look at parent
            if not name and node.parent and node.parent.type == "variable_declarator":
                for child in node.parent.children:
                    if child.type == "identifier":
                        name = _extract_node_text(child, source_bytes)
                        break

            code = _extract_node_text(node, source_bytes)
            docstring = _get_leading_comment(node, source_bytes)

            if len(code.strip()) > 10:  # skip trivial nodes
                chunks.append({
                    "name": name or "anonymous",
                    "type": node.type.replace("_declaration", "").replace("_", " "),
                    "code": code,
                    "docstring": docstring,
                    "start_line": node.start_point[0] + 1,
                    "end_line": node.end_point[0] + 1,
                    "file_path": file_path,
                })

        for child in node.children:
            walk(child)

    walk(tree.root_node)
    return chunks


def parse_python(content: str, file_path: str) -> list[dict]:
    """
    Parse Python file and extract function and class definitions.
    """
    parser = _get_py_parser()
    if not parser:
        return []

    source_bytes = content.encode("utf-8")
    tree = parser.parse(source_bytes)
    chunks = []

    def walk(node):
        if node.type in ("function_definition", "class_definition"):
            name = ""
            for child in node.children:
                if child.type == "identifier":
                    name = _extract_node_text(child, source_bytes)
                    break

            code = _extract_node_text(node, source_bytes)
            docstring = ""
            # Python docstring is first string in body
            if node.type == "function_definition":
                for child in node.children:
                    if child.type == "block":
                        for stmt in child.children:
                            if stmt.type == "expression_statement":
                                for s in stmt.children:
                                    if s.type == "string":
                                        docstring = _extract_node_text(s, source_bytes)
                                        break

            if len(code.strip()) > 10:
                chunks.append({
                    "name": name or "anonymous",
                    "type": node.type.replace("_definition", ""),
                    "code": code,
                    "docstring": docstring,
                    "start_line": node.start_point[0] + 1,
                    "end_line": node.end_point[0] + 1,
                    "file_path": file_path,
                })

        for child in node.children:
            walk(child)

    walk(tree.root_node)
    return chunks


def parse_code(content: str, file_path: str, language: str) -> list[dict]:
    """
    Main entry point. Dispatch to the right parser or return empty list
    to fall back to text chunking.
    """
    try:
        if language in ("javascript", "typescript"):
            return parse_javascript(content, file_path)
        elif language == "python":
            return parse_python(content, file_path)
    except Exception as e:
        logger.warning(f"Code parsing failed for {file_path}: {e}")
    return []
