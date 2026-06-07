"""Image resizing for the Turbo polyglot showcase.

A thin wrapper around Pillow that powers the ``/image/resize`` endpoint exposed
by the Python FastAPI service (and proxied by the Hono API).
"""

from __future__ import annotations

from io import BytesIO
from typing import TypedDict

from PIL import Image

__all__ = ["ResizeResult", "resize_image"]

_FORMATS = {"png": "PNG", "jpeg": "JPEG", "webp": "WEBP"}


class ResizeResult(TypedDict):
    data: bytes
    width: int
    height: int
    format: str
    size_bytes: int


def resize_image(data: bytes, width: int, height: int, fmt: str = "png") -> ResizeResult:
    """Resize an image to ``width`` x ``height`` and re-encode it.

    Args:
        data: Raw source image bytes (any format Pillow can read).
        width: Target width in pixels.
        height: Target height in pixels.
        fmt: Output format, one of ``png``, ``jpeg`` or ``webp``.

    Returns:
        The resized image bytes plus its dimensions, format and size.
    """
    pillow_format = _FORMATS.get(fmt.lower())
    if pillow_format is None:
        raise ValueError(f"unsupported format: {fmt}")

    image = Image.open(BytesIO(data))
    if pillow_format == "JPEG" and image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    resized = image.resize((width, height))
    out = BytesIO()
    resized.save(out, format=pillow_format)
    payload = out.getvalue()

    return ResizeResult(
        data=payload,
        width=width,
        height=height,
        format=fmt.lower(),
        size_bytes=len(payload),
    )
