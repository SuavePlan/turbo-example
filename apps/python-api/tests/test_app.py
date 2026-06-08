import base64
from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image
from pypdf import PdfWriter
from python_api import app

client = TestClient(app)


def b64_pdf(pages: int = 2) -> str:
    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=200, height=200)
    buffer = BytesIO()
    writer.write(buffer)
    return base64.b64encode(buffer.getvalue()).decode("ascii")


def b64_png(width: int = 64, height: int = 64) -> str:
    buffer = BytesIO()
    Image.new("RGB", (width, height), (10, 120, 200)).save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("ascii")


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["service"] == "python-api"


def test_pdf_info_uses_camelcase_contract():
    res = client.post("/pdf/info", json={"data": b64_pdf(3)})
    assert res.status_code == 200
    body = res.json()
    assert body["pages"] == 3
    assert "sizeBytes" in body


def test_image_resize_round_trip():
    res = client.post(
        "/image/resize",
        json={"data": b64_png(), "width": 32, "height": 16, "format": "png"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["width"] == 32
    assert body["height"] == 16
    raw = base64.b64decode(body["data"])
    assert Image.open(BytesIO(raw)).size == (32, 16)


def test_bad_base64_is_rejected():
    res = client.post("/pdf/info", json={"data": "!!!not-base64!!!"})
    assert res.status_code == 400


def test_errors_are_localised_by_accept_language():
    en = client.post(
        "/pdf/info",
        json={"data": "!!!"},
        headers={"accept-language": "en-GB"},
    )
    assert "Invalid base64" in en.json()["detail"]

    zh = client.post(
        "/pdf/info",
        json={"data": "!!!"},
        headers={"accept-language": "zh-CN,zh;q=0.9"},
    )
    assert "无效" in zh.json()["detail"]
