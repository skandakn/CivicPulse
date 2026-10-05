from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x: int = Field(..., description="Top-left X coordinate in pixels")
    y: int = Field(..., description="Top-left Y coordinate in pixels")
    width: int = Field(..., description="Width in pixels")
    height: int = Field(..., description="Height in pixels")
    x_norm: Optional[float] = Field(None, description="Normalized X (0-1)")
    y_norm: Optional[float] = Field(None, description="Normalized Y (0-1)")
    width_norm: Optional[float] = Field(None, description="Normalized Width (0-1)")
    height_norm: Optional[float] = Field(None, description="Normalized Height (0-1)")

class Detection(BaseModel):
    id: str
    label: str = "pothole"
    confidence: float
    box: BoundingBox
    severity: str  # "Low" | "Medium" | "High" | "Critical"
    areaSqPx: int
    relativeArea: float
    depthEstimate: Optional[str] = "Deep (> 8cm)"
    polygon: Optional[List[List[int]]] = Field(None, description="Polygon contour vertices [ [x,y], ... ]")

class DetectionResult(BaseModel):
    detected: bool
    confidence: float
    detections: List[Detection]
    estimatedSeverity: str
    damageArea: str
    potholeCount: int
    roadCondition: str
    explanation: str
    inferenceTimeMs: float
    modelName: str
    metadata: Optional[Dict[str, Any]] = None

class BasePotholeDetector(ABC):
    """Abstract interface for Pothole Detection model adapters."""

    def __init__(self, model_name: str):
        self.model_name = model_name

    @abstractmethod
    def detect(self, image_bytes: bytes, **kwargs) -> DetectionResult:
        """Run inference on the given image bytes and return structured DetectionResult."""
        pass
