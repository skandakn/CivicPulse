import os
from ml.inference.pipeline import PotholeAnalysisPipeline

def test_pipeline():
    sample_path = os.path.join("sample_data", "images", "bellandur_outer_ring_road_severe.jpg")
    with open(sample_path, "rb") as f:
        img_bytes = f.read()

    print(f"Loaded sample image ({len(img_bytes)} bytes)")

    demo_pipe = PotholeAnalysisPipeline(mode="demo")
    demo_res = demo_pipe.process(img_bytes, latitude=12.9279, longitude=77.6833, road_hint="Outer Ring Road")
    print(f"[Demo] Detected: {demo_res['detected']} | Count: {demo_res['potholeCount']} | Dup: {demo_res['duplicateCheck']['matchedIncidentId']}")
    assert demo_res["detected"] is True
    assert demo_res["potholeCount"] == 3
    assert demo_res["duplicateCheck"]["matchedIncidentId"] == "BNG-PTH-1042"

    cv_pipe = PotholeAnalysisPipeline(mode="opencv")
    cv_res = cv_pipe.process(img_bytes, latitude=12.9279, longitude=77.6833, road_hint="Outer Ring Road")
    print(f"[OpenCV] Detected: {cv_res['detected']} | Count: {cv_res['potholeCount']} | Time: {cv_res['inferenceTimeMs']}ms")
    assert cv_res["detected"] is True

    print("\nPipeline tests passed!")

if __name__ == "__main__":
    test_pipeline()
