import os
from ml.models.base import BasePotholeDetector
from ml.models.opencv_detector import OpenCVSurfaceDetector
from ml.models.demo_adapter import DemoPreparedDetector
from ml.models.yolo_adapter import YoloPotholeDetector

def get_detector(mode: str = "auto") -> BasePotholeDetector:
    mode = mode.lower()
    if mode == "demo":
        return DemoPreparedDetector()
    elif mode == "yolo":
        return YoloPotholeDetector()
    elif mode == "opencv":
        return OpenCVSurfaceDetector()
    else:  # auto
        yolo_path = os.getenv("YOLO_WEIGHTS_PATH", "ml/models/pothole_yolo.pt")
        if os.path.exists(yolo_path):
            return YoloPotholeDetector(weights_path=yolo_path)
        return OpenCVSurfaceDetector()
