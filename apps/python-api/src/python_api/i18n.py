"""Minimal i18n for the FastAPI sidecar.

Mirrors the server-facing keys from the shared @repo/i18n catalog so the Python
service can answer in the caller's language (resolved from Accept-Language).
"""

from __future__ import annotations

DEFAULT_LOCALE = "en-GB"

MESSAGES: dict[str, dict[str, str]] = {
    "en-GB": {
        "invalid_base64": "Invalid base64 payload.",
        "pdf_parse": "Could not parse the PDF.",
        "image_resize": "Could not resize the image.",
        "unsupported_format": "Unsupported image format: {format}.",
    },
    "zh-CN": {
        "invalid_base64": "无效的 base64 数据。",
        "pdf_parse": "无法解析该 PDF。",
        "image_resize": "无法缩放该图片。",
        "unsupported_format": "不支持的图片格式：{format}。",
    },
}


def resolve_locale(accept_language: str | None) -> str:
    """Resolve a supported locale from an Accept-Language header (q-weighted)."""
    if not accept_language:
        return DEFAULT_LOCALE

    ranked: list[tuple[float, str]] = []
    for part in accept_language.split(","):
        bits = [b.strip() for b in part.split(";")]
        tag = bits[0].lower()
        weight = 1.0
        for b in bits[1:]:
            if b.startswith("q="):
                try:
                    weight = float(b[2:])
                except ValueError:
                    weight = 1.0
        if tag:
            ranked.append((weight, tag))

    ranked.sort(key=lambda entry: entry[0], reverse=True)
    for _, tag in ranked:
        if tag.startswith("zh"):
            return "zh-CN"
        if tag.startswith("en"):
            return "en-GB"
    return DEFAULT_LOCALE


def translate(locale: str, key: str, **params: object) -> str:
    table = MESSAGES.get(locale, MESSAGES[DEFAULT_LOCALE])
    text = table.get(key) or MESSAGES[DEFAULT_LOCALE].get(key, key)
    return text.format(**params) if params else text
