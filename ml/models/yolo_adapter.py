import os
import time
import logging
from ml.models.base import BasePotholeDetector, DetectionResult
from ml.models.opencv_detector import OpenCVSurfaceDetector

logger = logging.getLogger("ml.models.yolo")

class YoloPotholeDetector(BasePotholeDetector):
    """
    YOLOv8 / YOLO11 Model Adapter.
    If weights file is provided, executes deep neural network object detection.
    Otherwise gracefully falls back to the OpenCV surface defect detector.
    """

    def __init__(self, weights_path: str = None):
        super().__init__(model_name="YOLO-Pothole-Detector")
        self.weights_path = weights_path or os.getenv("YOLO_WEIGHTS_PATH", "ml/models/pothole_yolo.pt")
        self.model = None
        self.fallback = OpenCVSurfaceDetector()
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.weights_path):
            try:
                from ultralytics import YOLO
                self.model = YOLO(self.weights_path)
                logger.info(f"Loaded YOLO model weights from {self.weights_path}")
            except Exception as e:
                logger.warning(f"Could not initialize YOLO: {e}. Fallback to OpenCV enabled.")
                self.model = None
        else:
            logger.info("YOLO weights not found. Production OpenCV detector will be utilized.")

    def detect(self, image_bytes: bytes, **kwargs) -> DetectionResult:
        if self.model is not None:
            start_time = time.perf_counter()
            import cv2
            import numpy as np
            from ml.models.base import Detection, BoundingBox

            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            results = self.model(img)
            
            detections = []
            img_h, img_w = img.shape[:2]
            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    name = self.model.names.get(cls_id, "pothole")
                    w = int(x2 - x1)
                    h = int(y2 - y1)
                    detections.append(
                        Detection(
                            id=f"yolo-{len(detections)+1}",
                            label=name,
                            confidence=round(conf, 3),
                            box=BoundingBox(
                                x=int(x1),
                                y=int(y1),
                                width=w,
                                height=h,
                                x_norm=round(x1 / img_w, 4),
                                y_norm=round(y1 / img_h, 4),
                                width_norm=round(w / img_w, 4),
                                height_norm=round(h / img_h, 4)
                            ),
                            severity="High" if (w * h) > 30000 else "Medium",
                            areaSqPx=w * h,
                            relativeArea=round((w * h) / (img_w * img_h), 4)
                        )
                    )

            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return DetectionResult(
                detected=len(detections) > 0,
                confidence=round(max([d.confidence for d in detections], default=0.0), 3),
                detections=detections,
                estimatedSeverity="Severe" if len(detections) >= 2 else "Moderate",
                damageArea=f"{round(sum(d.areaSqPx for d in detections) * 0.000035, 2)} m²",
                potholeCount=len(detections),
                roadCondition="YOLO Classified Hazard",
                explanation=f"{len(detections)} pothole(s) detected via deep neural network.",
                inferenceTimeMs=round(elapsed_ms, 1),
                modelName=self.model_name
            )

        return self.fallback.detect(image_bytes, **kwargs)
