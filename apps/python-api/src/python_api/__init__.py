"""FastAPI sidecar that turns the py-pdf and py-image libraries into HTTP.

The Hono API proxies to this service so that the TypeScript and Python halves of
the monorepo cooperate on the shared "Document Toolkit" workflow. Responses use
the same camelCase shape as @repo/api-contract so the Hono API can forward them
verbatim.
"""

from __future__ import annotations

import base64

from fastapi import FastAPI, HTTPException
from py_image import resize_image
from py_pdf import pdf_info
from pydantic import BaseModel

app = FastAPI(title="python-api", version="0.0.0")


class PdfRequest(BaseModel):
    data: str  # base64-encoded PDF bytes


class ResizeRequest(BaseModel):
    data: str  # base64-encoded image bytes
    width: int
    height: int
    format: str = "png"


def _decode(data: str) -> bytes:
    try:
        return base64.b64decode(data, validate=True)
    except Exception as exc:  # noqa: BLE001 - surface as a clean 400
        raise HTTPException(status_code=400, detail="invalid base64 payload") from exc


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "python-api", "version": "0.0.0"}


@app.post("/pdf/info")
def pdf_info_endpoint(req: PdfRequest) -> dict[str, object]:
    try:
        info = pdf_info(_decode(req.data))
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=422, detail=f"could not parse PDF: {exc}") from exc
    return {
        "pages": info["pages"],
        "title": info["title"],
        "words": info["words"],
        "sizeBytes": info["size_bytes"],
    }


@app.post("/image/resize")
def resize_endpoint(req: ResizeRequest) -> dict[str, object]:
    try:
        result = resize_image(_decode(req.data), req.width, req.height, req.format)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=422, detail=f"could not resize image: {exc}") from exc
    return {
        "data": base64.b64encode(result["data"]).decode("ascii"),
        "width": result["width"],
        "height": result["height"],
        "format": result["format"],
        "sizeBytes": result["size_bytes"],
    }
