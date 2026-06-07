from io import BytesIO

from py_pdf import pdf_info
from pypdf import PdfWriter


def make_pdf(pages: int = 1, title: str | None = None) -> bytes:
    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=200, height=200)
    if title:
        writer.add_metadata({"/Title": title})
    buffer = BytesIO()
    writer.write(buffer)
    return buffer.getvalue()


def test_counts_pages():
    info = pdf_info(make_pdf(pages=3))
    assert info["pages"] == 3
    assert info["words"] == 0
    assert info["size_bytes"] > 0


def test_reads_title():
    info = pdf_info(make_pdf(pages=1, title="Showcase Doc"))
    assert info["title"] == "Showcase Doc"
