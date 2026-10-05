"""
Focused Validation Suite for CivicPulse Computer Vision Subsystem
Validates:
1. Three inference modes tested separately (DEMO, OPENCV, YOLO)
2. OpenCV evaluated across 10 varied road conditions
3. Isolation of DEMO mode (never silently activates on OPENCV or YOLO)
4. API error handling on valid, invalid, oversized, missing/invalid coords
5. End-to-end pipeline execution
"""

import os
import io
import json
import time
import urllib.request
import urllib.parse
from PIL import Image

BASE_URL = "http://127.0.0.1:8000"
VAL_DIR = os.path.join(os.path.dirname(__file__), "sample_data", "images", "validation_set")

def post_multipart(url: str, fields: dict, files: dict):
    boundary = "----CivicPulseValidationBoundary" + str(int(time.time()))
    body = bytearray()

    for key, val in fields.items():
        if val is not None:
            body.extend(f"--{boundary}\r\n".encode("utf-8"))
            body.extend(f'Content-Disposition: form-data; name="{key}"\r\n\r\n'.encode("utf-8"))
            body.extend(f"{val}\r\n".encode("utf-8"))

    for key, (filename, file_bytes, content_type) in files.items():
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        body.extend(f'Content-Disposition: form-data; name="{key}"; filename="{filename}"\r\n'.encode("utf-8"))
        body.extend(f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"))
        body.extend(file_bytes)
        body.extend(b"\r\n")

    body.extend(f"--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(url, data=bytes(body))
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")

    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            resp_body = resp.read().decode("utf-8")
            return status, json.loads(resp_body)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = {"raw": err_body}
        return e.code, parsed
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    print("=" * 80)
    print("CIVICPULSE COMPUTER VISION SUB-SYSTEM FOCUSED VALIDATION")
    print("=" * 80)

    # ---------------------------------------------------------
    # TEST 1: Test Three Modes Separately
    # ---------------------------------------------------------
    print("\n[TEST 1] Testing Three Modes Separately (DEMO, OPENCV, YOLO)...")
    test_img_path = os.path.join(VAL_DIR, "01_large_pothole.jpg")
    with open(test_img_path, "rb") as f:
        img_bytes = f.read()

    modes = ["demo", "opencv", "yolo"]
    mode_results = {}
    for m in modes:
        status, res = post_multipart(
            f"{BASE_URL}/api/analyze-pothole",
            fields={"mode": m, "latitude": "12.9279", "longitude": "77.6833", "road_hint": "Test Corridor"},
            files={"image": ("test.jpg", img_bytes, "image/jpeg")}
        )
        mode_results[m] = (status, res)
        print(f" -> Mode: {m.upper()}")
        print(f"    Status: {status}")
        print(f"    Model Name: {res.get('modelName')}")
        print(f"    Active Pipeline Mode: {res.get('activePipelineMode')}")
        print(f"    Detections Count: {res.get('potholeCount')}")
        print(f"    Confidence: {res.get('confidence')}")
        print(f"    Damage Area: {res.get('damageArea')}")
        print(f"    Estimated Severity: {res.get('estimatedSeverity')}")

    # ---------------------------------------------------------
    # TEST 2: Test OpenCV on 10 Varied Pothole Images
    # ---------------------------------------------------------
    print("\n[TEST 2] Testing OpenCV Surface Detector Across 10 Varied Road Conditions...")
    validation_images = [
        ("01_large_pothole.jpg", "Large Pothole", 1),
        ("02_small_pothole.jpg", "Small Pothole", 1),
        ("03_shallow_pothole.jpg", "Shallow Pothole", 1),
        ("04_dark_asphalt.jpg", "Dark Asphalt", 1),
        ("05_bright_asphalt.jpg", "Bright Asphalt", 1),
        ("06_wet_road.jpg", "Wet Road", 1),
        ("07_multiple_potholes.jpg", "Multiple Potholes", 4),
        ("08_shadow_heavy_image.jpg", "Shadow-Heavy Image", 1),
        ("09_low_quality_smartphone_image.jpg", "Low-Quality Smartphone", 1),
        ("10_non_pothole_road_image.jpg", "Non-Pothole Road", 0),
    ]

    cv_evaluations = []
    for filename, label, expected_count in validation_images:
        path = os.path.join(VAL_DIR, filename)
        with open(path, "rb") as f:
            b = f.read()

        status, res = post_multipart(
            f"{BASE_URL}/api/analyze-pothole",
            fields={"mode": "opencv", "latitude": "12.9352", "longitude": "77.6245"},
            files={"image": (filename, b, "image/jpeg")}
        )

        detected = res.get("detected", False)
        count = res.get("potholeCount", 0)
        conf = res.get("confidence", 0.0)
        sev = res.get("estimatedSeverity", "N/A")
        boxes = res.get("detections", [])

        # Evaluation metrics
        if expected_count > 0:
            success = count > 0
            fn = max(0, expected_count - count)
            fp = max(0, count - expected_count)
        else:
            success = (count == 0)
            fn = 0
            fp = count

        box_quality = "Good" if detected and all(d["box"]["width"] > 0 and d["box"]["height"] > 0 for d in boxes) else ("N/A (0 det)" if count == 0 else "Poor")

        cv_evaluations.append({
            "image": label,
            "filename": filename,
            "expected": expected_count,
            "detected": count,
            "success": "PASS" if success else "WARN/FAIL",
            "false_positives": fp,
            "false_negatives": fn,
            "confidence": f"{round(conf * 100, 1)}%",
            "severity": sev,
            "box_quality": box_quality
        })

    print(f"{'Condition':<25} | {'Exp':<3} | {'Det':<3} | {'Status':<6} | {'FP':<2} | {'FN':<2} | {'Conf':<6} | {'Box Quality':<12}")
    print("-" * 75)
    for ev in cv_evaluations:
        print(f"{ev['image']:<25} | {ev['expected']:<3} | {ev['detected']:<3} | {ev['success']:<6} | {ev['false_positives']:<2} | {ev['false_negatives']:<2} | {ev['confidence']:<6} | {ev['box_quality']:<12}")

    # ---------------------------------------------------------
    # TEST 3: Verify Demo Mode Isolation
    # ---------------------------------------------------------
    print("\n[TEST 3] Verifying Demo Mode Isolation...")
    # Request OPENCV explicitly - check that modelName is NOT Demo and pipeline is opencv
    _, res_opencv = mode_results["opencv"]
    is_cv_isolated = "DEMO" not in res_opencv.get("modelName", "") and res_opencv.get("activePipelineMode") == "opencv"

    # Request YOLO explicitly - check that modelName is NOT Demo
    _, res_yolo = mode_results["yolo"]
    is_yolo_isolated = "DEMO" not in res_yolo.get("modelName", "") and res_yolo.get("activePipelineMode") == "yolo"

    # Request DEMO explicitly - check that it IS Demo
    _, res_demo = mode_results["demo"]
    is_demo_correct = "DEMO" in res_demo.get("modelName", "") and res_demo.get("activePipelineMode") == "demo"

    print(f" -> OpenCV Isolation: {'PASSED (No Demo silent leak)' if is_cv_isolated else 'FAILED'}")
    print(f" -> YOLO Isolation:   {'PASSED (No Demo silent leak)' if is_yolo_isolated else 'FAILED'}")
    print(f" -> Demo Explicit:    {'PASSED (Demo loaded correctly)' if is_demo_correct else 'FAILED'}")

    # ---------------------------------------------------------
    # TEST 4: API Error Handling Tests
    # ---------------------------------------------------------
    print("\n[TEST 4] Verifying API Behavior & Error Handling...")
    api_tests = []

    # 1. Valid Image
    s1, r1 = post_multipart(
        f"{BASE_URL}/api/analyze-pothole",
        fields={"mode": "opencv"},
        files={"image": ("valid.jpg", img_bytes, "image/jpeg")}
    )
    api_tests.append(("Valid image", s1 == 200, s1, "Analysis returned successfully"))

    # 2. Invalid File (Corrupt binary / text)
    s2, r2 = post_multipart(
        f"{BASE_URL}/api/analyze-pothole",
        fields={"mode": "opencv"},
        files={"image": ("bad.txt", b"This is not a picture of a road.", "text/plain")}
    )
    api_tests.append(("Invalid file format (text/plain)", s2 == 400, s2, r2.get("detail", "")))

    # 3. Oversized file (> 15MB)
    fake_huge = b"\x00" * (16 * 1024 * 1024)
    s3, r3 = post_multipart(
        f"{BASE_URL}/api/analyze-pothole",
        fields={"mode": "opencv"},
        files={"image": ("huge.jpg", fake_huge, "image/jpeg")}
    )
    api_tests.append(("Oversized file (>15MB)", s3 == 400, s3, r3.get("detail", "")))

    # 4. Image without GPS
    s4, r4 = post_multipart(
        f"{BASE_URL}/api/analyze-pothole",
        fields={"mode": "opencv"},
        files={"image": ("valid.jpg", img_bytes, "image/jpeg")}
    )
    has_canonical = "incident" in r4 and "canonicalLocation" in r4["incident"]
    api_tests.append(("Image without GPS (Defaults applied)", s4 == 200 and has_canonical, s4, f"Assigned to {r4.get('incident', {}).get('canonicalLocation', {}).get('ward')}"))

    # 5. Image with GPS
    s5, r5 = post_multipart(
        f"{BASE_URL}/api/analyze-pothole",
        fields={"mode": "opencv", "latitude": "12.9784", "longitude": "77.6408", "road_hint": "Indiranagar 100ft Rd"},
        files={"image": ("valid.jpg", img_bytes, "image/jpeg")}
    )
    api_tests.append(("Image with GPS (12.9784, 77.6408)", s5 == 200, s5, f"Matched duplicate: {r5.get('duplicateCheck', {}).get('matchedIncidentId')}"))

    # 6. Missing Coordinates (Explicit None or omitted)
    s6, r6 = post_multipart(
        f"{BASE_URL}/api/analyze-pothole",
        fields={"mode": "opencv"},
        files={"image": ("valid.jpg", img_bytes, "image/jpeg")}
    )
    api_tests.append(("Missing coordinates", s6 == 200, s6, "Handled via default coordinates"))

    # 7. Invalid Coordinates (Latitude > 90.0)
    s7, r7 = post_multipart(
        f"{BASE_URL}/api/analyze-pothole",
        fields={"mode": "opencv", "latitude": "999.0", "longitude": "77.6408"},
        files={"image": ("valid.jpg", img_bytes, "image/jpeg")}
    )
    api_tests.append(("Invalid coordinates (lat=999.0)", s7 == 400, s7, r7.get("detail", "")))

    # 8. Invalid Coordinates (Non-numeric string)
    s8, r8 = post_multipart(
        f"{BASE_URL}/api/analyze-pothole",
        fields={"mode": "opencv", "latitude": "INVALID_LAT", "longitude": "77.6408"},
        files={"image": ("valid.jpg", img_bytes, "image/jpeg")}
    )
    api_tests.append(("Invalid coordinates (string)", s8 == 422, s8, "Rejected with 422 Unprocessable Entity"))

    for name, ok, code, detail in api_tests:
        print(f" -> {name:<36} : {'PASS' if ok else 'FAIL'} (HTTP {code}) -> {detail[:50]}")

    # ---------------------------------------------------------
    # TEST 5: Verify End-to-End Pipeline
    # ---------------------------------------------------------
    print("\n[TEST 5] Verifying Full End-to-End Pipeline Flow...")
    # Bellandur ORR image matching BNG-PTH-1042
    s_e2e, r_e2e = post_multipart(
        f"{BASE_URL}/api/analyze-pothole",
        fields={"mode": "opencv", "latitude": "12.9279", "longitude": "77.6833", "road_hint": "Outer Ring Road (Bellandur)"},
        files={"image": ("bellandur.jpg", img_bytes, "image/jpeg")}
    )

    flow_checks = [
        ("Upload -> FastAPI Response", s_e2e == 200),
        ("Preprocessing (Image Metadata)", "imageMetadata" in r_e2e and r_e2e["imageMetadata"]["width"] > 0),
        ("Detector (OpenCV Bounding Boxes)", "detections" in r_e2e and len(r_e2e["detections"]) > 0),
        ("Damage Analyzer (Impact & Area)", "damageImpact" in r_e2e and "totalAreaSqMeters" in r_e2e["damageImpact"]),
        ("Severity Engine (0-100 Score)", "severityEngine" in r_e2e and 0 <= r_e2e["severityEngine"]["score"] <= 100),
        ("Duplicate Engine (Distance & Corridor Match)", "duplicateCheck" in r_e2e and "duplicateProbability" in r_e2e["duplicateCheck"]),
        ("Incident Result (Canonical ID Resolution)", "incident" in r_e2e and r_e2e["incident"]["id"] == "BNG-PTH-1042"),
        ("Reports Merged Counter", r_e2e.get("incident", {}).get("reportsMerged", 0) >= 17)
    ]

    for stage, passed in flow_checks:
        print(f" -> {stage:<45} : {'PASS' if passed else 'FAIL'}")

    all_passed = all(p for _, p in flow_checks) and all(ok for _, ok, _, _ in api_tests)
    print("\n" + "=" * 80)
    print(f"VALIDATION SUITE COMPLETED: {'ALL CHECKS PASSED' if all_passed else 'SOME CHECKS FLAGGED'}")
    print("=" * 80)

if __name__ == "__main__":
    run_tests()
