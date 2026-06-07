from io import BytesIO

from PIL import Image
from py_image import resize_image


def make_png(width: int = 64, height: int = 48) -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (width, height), (10, 120, 200)).save(buffer, format="PNG")
    return buffer.getvalue()


def test_resizes_to_target_dimensions():
    result = resize_image(make_png(), 32, 16, "png")
    assert result["width"] == 32
    assert result["height"] == 16
    assert result["size_bytes"] > 0
    # Round-trip: the encoded bytes really are 32x16.
    assert Image.open(BytesIO(result["data"])).size == (32, 16)


def test_rejects_unknown_format():
    try:
        resize_image(make_png(), 10, 10, "tiff")
    except ValueError:
        return
    raise AssertionError("expected ValueError for unsupported format")
