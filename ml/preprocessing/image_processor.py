import io
import logging
from typing import Tuple, Optional, Dict, Any
from PIL import Image, ExifTags

logger = logging.getLogger("ml.preprocessing")

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB

class ImageValidationError(Exception):
    pass

def _convert_to_degrees(value) -> float:
    try:
        d = float(value[0])
        m = float(value[1])
        s = float(value[2])
        return d + (m / 60.0) + (s / 3600.0)
    except Exception:
        return 0.0

def extract_exif_gps(image: Image.Image) -> Tuple[Optional[float], Optional[float]]:
    try:
        exif = image.getexif()
        if not exif:
            return None, None

        gps_info = {}
        for tag, val in exif.items():
            tag_name = ExifTags.TAGS.get(tag, tag)
            if tag_name == "GPSInfo":
                gps_info = val
                break

        if not gps_info:
            return None, None

        gps_data = {}
        for t in gps_info:
            sub_tag = ExifTags.GPSTAGS.get(t, t)
            gps_data[sub_tag] = gps_info[t]

        lat = None
        lng = None

        if "GPSLatitude" in gps_data and "GPSLatitudeRef" in gps_data:
            lat = _convert_to_degrees(gps_data["GPSLatitude"])
            if gps_data["GPSLatitudeRef"] != "N":
                lat = -lat

        if "GPSLongitude" in gps_data and "GPSLongitudeRef" in gps_data:
            lng = _convert_to_degrees(gps_data["GPSLongitude"])
            if gps_data["GPSLongitudeRef"] != "E":
                lng = -lng

        return lat, lng
    except Exception as e:
        logger.debug(f"Could not extract EXIF GPS: {e}")
        return None, None

def validate_and_preprocess_image(
    image_bytes: bytes,
    content_type: Optional[str] = None
) -> Dict[str, Any]:
    if len(image_bytes) == 0:
        raise ImageValidationError("Empty image file provided.")

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise ImageValidationError(
            f"Image file size ({round(len(image_bytes) / 1024 / 1024, 2)}MB) exceeds limit of 15MB."
        )

    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise ImageValidationError(f"Invalid or corrupted image format: {e}")

    fmt = img.format.lower() if img.format else "unknown"
    if fmt not in ["jpeg", "jpg", "png", "webp", "bmp"]:
        raise ImageValidationError(f"Unsupported image format: {fmt}. Allowed: JPEG, PNG, WEBP, BMP.")

    gps_lat, gps_lng = extract_exif_gps(img)
    width, height = img.size

    if img.mode != "RGB":
        img = img.convert("RGB")
        out_buf = io.BytesIO()
        img.save(out_buf, format="JPEG", quality=95)
        clean_bytes = out_buf.getvalue()
    else:
        clean_bytes = image_bytes

    return {
        "width": width,
        "height": height,
        "format": fmt,
        "sizeBytes": len(image_bytes),
        "exifLatitude": gps_lat,
        "exifLongitude": gps_lng,
        "cleanBytes": clean_bytes
    }
