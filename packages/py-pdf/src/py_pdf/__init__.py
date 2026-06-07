"""PDF parsing for the Turbo polyglot showcase.

A tiny, dependency-light wrapper around ``pypdf`` that powers the ``/pdf/info``
endpoint exposed by the Python FastAPI service (and proxied by the Hono API).
"""

from __future__ import annotations

from io import BytesIO
from typing import TypedDict

from pypdf import PdfReader

__all__ = ["PdfInfo", "pdf_info"]


class PdfInfo(TypedDict):
    pages: int
    title: str | None
    words: int
    size_bytes: int


def pdf_info(data: bytes) -> PdfInfo:
    """Return structural information about a PDF document.

    Args:
        data: Raw PDF bytes.

    Returns:
        Page count, document title (if present), total word count across all
        extracted text, and the source size in bytes.
    """
    reader = PdfReader(BytesIO(data))

    title: str | None = None
    if reader.metadata is not None and reader.metadata.title:
        title = str(reader.metadata.title)

    words = 0
    for page in reader.pages:
        text = page.extract_text() or ""
        words += len(text.split())

    return PdfInfo(
        pages=len(reader.pages),
        title=title,
        words=words,
        size_bytes=len(data),
    )
