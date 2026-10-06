import os
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field

from ml.preprocessing.image_processor import ImageValidationError
from ml.inference.pipeline import PotholeAnalysisPipeline
from backend.incident_store import (
    LocationModel,
    SupportingReport,
    add_supporting_evidence,
    create_master_incident,
    get_all_incidents,
    get_incident_by_id,
)
from backend.location_service import resolve_location
from backend.duplicate_engine import DuplicateDetectionService

app = FastAPI(
    title="CivicPulse Bengaluru - Computer Vision & Incident Intelligence API",
    description="Live pothole detection, damage severity calculation, and duplicate incident resolution engine for BBMP Bengaluru.",
    version="2.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "..", "sample_data", "images")
os.makedirs(SAMPLES_DIR, exist_ok=True)
app.mount("/sample_data/images", StaticFiles(directory=SAMPLES_DIR), name="sample_images")

DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "dist")
if os.path.exists(DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

@app.get("/")
def serve_index():
    index_file = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "CivicPulse API is running. Frontend dist not built."}

@app.get("/favicon.svg")
def serve_favicon():
    fav = os.path.join(DIST_DIR, "favicon.svg")
    if os.path.exists(fav):
        return FileResponse(fav)
    return JSONResponse(status_code=404, content={"detail": "Not found"})

@app.get("/icons.svg")
def serve_icons():
    ic = os.path.join(DIST_DIR, "icons.svg")
    if os.path.exists(ic):
        return FileResponse(ic)
    return JSONResponse(status_code=404, content={"detail": "Not found"})

pipelines = {
    "auto": PotholeAnalysisPipeline(mode="auto"),
    "demo": PotholeAnalysisPipeline(mode="demo"),
    "opencv": PotholeAnalysisPipeline(mode="opencv"),
    "yolo": PotholeAnalysisPipeline(mode="yolo"),
}

class LocationLookupRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class TextReportRequest(LocationLookupRequest):
    description: str = Field(..., min_length=3, max_length=4000)
    issueType: str = "pothole"
    roadName: Optional[str] = None
    roadClass: Optional[str] = None
    roadReference: Optional[str] = None
    locality: Optional[str] = None
    ward: Optional[str] = None
    zone: Optional[str] = None
    city: Optional[str] = None
    source: Optional[str] = None
    recommendedDepartment: str = "BBMP"
    benchmarkCase: bool = False


@app.post("/api/location/resolve")
def resolve_selected_location(request: LocationLookupRequest):
    """Reverse-geocode one explicit map/GPS selection; never substitutes a preset."""
    return resolve_location(request.latitude, request.longitude)


@app.post("/api/report-text")
def create_text_or_voice_report(request: TextReportRequest):
    """Create an in-app report from citizen text/voice without claiming CV ran."""
    if not request.description.strip():
        raise HTTPException(status_code=400, detail="A description is required.")

    location = LocationModel(
        lat=request.latitude,
        lng=request.longitude,
        address=request.roadName or request.locality or "Not available",
        ward=request.ward or "Not available",
        zone=request.zone or "Not available",
        locality=request.locality,
        city=request.city,
        source=request.source,
        roadClass=request.roadClass,
        roadReference=request.roadReference,
    )
    duplicate_result = DuplicateDetectionService().check_duplicate(
        lat=request.latitude,
        lng=request.longitude,
        issue_type=request.issueType,
        road_hint=request.roadName,
        image_bytes=None,
        include_demo=request.benchmarkCase,
    )
    timestamp = datetime.now(timezone.utc).isoformat()
    report_entry = SupportingReport(
        reportId=f"REP-{uuid.uuid4().hex[:8].upper()}",
        timestamp=timestamp,
        reporter="Citizen reporter",
        deviceInfo="CivicPulse web report",
        confidence=0.0,
        notes=request.description,
        coordinates={"lat": request.latitude, "lng": request.longitude},
    )

    matched = None
    if duplicate_result["isDuplicate"] and duplicate_result["matchedIncidentId"]:
        matched = add_supporting_evidence(duplicate_result["matchedIncidentId"], report_entry)

    if matched:
        incident = matched
        report_count = len(matched.reports)
    else:
        incident_id = f"BLR-RPT-{uuid.uuid4().hex[:8].upper()}"
        incident = create_master_incident(
            incident_id=incident_id,
            location=location,
            road=request.roadName or "Not available",
            road_segment_id=request.roadReference or "Not available",
            authority=f"Recommended Department: {request.recommendedDepartment}",
            contractor="Not assigned",
            severity_score=0,
            severity_level="NOT_ASSESSED",
            priority=0,
            initial_report=report_entry,
            issue_type=request.issueType,
            is_demo=request.benchmarkCase,
            description=request.description,
        )
        report_count = 1
        duplicate_result = {
            **duplicate_result,
            "isDuplicate": False,
            "matchedIncidentId": None,
            "reason": "Text/voice report saved. Computer vision and visual similarity were not run because no image was attached.",
        }

    return {
        "detected": False,
        "confidence": 0.0,
        "detections": [],
        "estimatedSeverity": "Not assessed",
        "damageArea": "Not assessed",
        "potholeCount": 0,
        "roadCondition": "Photo not provided; computer vision was not run.",
        "explanation": "This report contains the citizen's text or voice transcript and selected coordinates. Add a photo to run computer vision.",
        "imageMetadata": {"width": 0, "height": 0, "sizeBytes": 0, "format": "none"},
        "damageImpact": {
            "totalAreaSqMeters": 0,
            "roadObstructionPct": 0,
            "twoWheelerRisk": "Not assessed",
            "busTransitDisruption": "Not assessed",
            "laneClosureRecommended": False,
            "repairUrgency": "Not assessed",
        },
        "severityEngine": {"score": 0, "level": "NOT_ASSESSED", "factors": {}, "explanations": []},
        "duplicateCheck": duplicate_result,
        "incident": {
            "id": incident.id,
            "canonicalLocation": incident.canonicalLocation.model_dump(),
            "priority": incident.priority,
            "severity": incident.severityLevel,
            "reportsMerged": report_count,
            "road": incident.road,
            "authority": incident.authority,
            "recommendedDepartment": request.recommendedDepartment,
            "contractor": "Not assigned",
            "status": incident.status,
            "lastReportedAt": incident.lastReportedAt,
        },
        "inferenceTimeMs": 0,
        "modelName": "Text/voice intake; CV not run",
        "cvNotRun": True,
        "issueType": request.issueType,
        "description": request.description,
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CivicPulse ML Engine",
        "city": "Bengaluru",
        "activeDetectors": ["OpenCV-AdaptiveCrater-v2.4", "YOLO-Adapter", "Demo-Benchmark"],
        "defaultMode": "auto"
    }

@app.get("/api/sample-images")
def list_sample_images():
    samples = [
        {
            "id": "bellandur-severe",
            "name": "Outer Ring Road (Bellandur Flyover)",
            "description": "Multi-crater cluster across primary bus & two-wheeler corridor (Duplicates BNG-PTH-1042)",
            "url": "/sample_data/images/bellandur_outer_ring_road_severe.jpg",
            "defaultLat": 12.9279,
            "defaultLng": 77.6833,
            "road": "Outer Ring Road (Bellandur)",
            "ward": "Ward 150 - Bellandur",
            "expectedDuplicate": "BNG-PTH-1042",
            "benchmarkPotholes": 3
        },
        {
            "id": "indiranagar-crater",
            "name": "Indiranagar 100ft Road",
            "description": "Deep asphalt cavity near CMH Hospital junction (Duplicates BNG-PTH-1088)",
            "url": "/sample_data/images/indiranagar_100ft_road_cluster.jpg",
            "defaultLat": 12.9784,
            "defaultLng": 77.6408,
            "road": "100 Feet Road (Indiranagar)",
            "ward": "Ward 80 - Hoysala Nagar",
            "expectedDuplicate": "BNG-PTH-1088",
            "benchmarkPotholes": 1
        },
        {
            "id": "whitefield-critical",
            "name": "Whitefield ITPL Main Road",
            "description": "Water-filled severe trench near Pattandur Agrahara (Duplicates BNG-PTH-1102)",
            "url": "/sample_data/images/whitefield_itpl_critical.jpg",
            "defaultLat": 12.9866,
            "defaultLng": 77.7381,
            "road": "ITPL Main Road",
            "ward": "Ward 84 - Hagadur",
            "expectedDuplicate": "BNG-PTH-1102",
            "benchmarkPotholes": 2
        },
        {
            "id": "koramangala-moderate",
            "name": "Koramangala 80ft Road",
            "description": "Medium depression near Sony World Junction",
            "url": "/sample_data/images/koramangala_80ft_road_moderate.jpg",
            "defaultLat": 12.9352,
            "defaultLng": 77.6245,
            "road": "80 Feet Road (Koramangala)",
            "ward": "Ward 151 - Koramangala",
            "expectedDuplicate": None,
            "benchmarkPotholes": 1
        },
        {
            "id": "indoor-hackathon-test",
            "name": "Indoor Hackathon Test Card",
            "description": "Live computer vision verification test card for indoor hackathon submission",
            "url": "/sample_data/images/indoor_hackathon_demo.jpg",
            "defaultLat": 12.9279,
            "defaultLng": 77.6833,
            "road": "Bengaluru Innovation Lab",
            "ward": "Ward 150 - Bellandur",
            "expectedDuplicate": "BNG-PTH-1042",
            "benchmarkPotholes": 2
        }
    ]
    return {"samples": samples}

@app.post("/api/analyze-pothole")
async def analyze_pothole(
    image: UploadFile = File(..., description="Uploaded road photo or frame"),
    latitude: Optional[float] = Form(None, description="Optional GPS latitude"),
    longitude: Optional[float] = Form(None, description="Optional GPS longitude"),
    road_hint: Optional[str] = Form(None, description="Optional road or landmark name"),
    locality_hint: Optional[str] = Form(None),
    ward_hint: Optional[str] = Form(None),
    zone_hint: Optional[str] = Form(None),
    city_hint: Optional[str] = Form(None),
    road_class_hint: Optional[str] = Form(None),
    road_reference_hint: Optional[str] = Form(None),
    location_source: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    benchmark_case: bool = Form(False),
    mode: Optional[str] = Form("auto", description="'auto', 'opencv', 'yolo', or 'demo'")
):
    try:
        if latitude is None or longitude is None:
            raise HTTPException(status_code=400, detail="Select a location before analyzing a report.")
        if not (-90.0 <= latitude <= 90.0):
            raise HTTPException(status_code=400, detail="Invalid latitude: Must be between -90.0 and 90.0 degrees.")
        if not (-180.0 <= longitude <= 180.0):
            raise HTTPException(status_code=400, detail="Invalid longitude: Must be between -180.0 and 180.0 degrees.")

        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        pipeline_mode = mode.lower() if mode and mode.lower() in pipelines else "auto"
        active_pipeline = pipelines[pipeline_mode]

        result = active_pipeline.process(
            image_bytes=image_bytes,
            latitude=latitude,
            longitude=longitude,
            road_hint=road_hint,
            location={
                "locality": locality_hint,
                "ward": ward_hint,
                "zone": zone_hint,
                "city": city_hint,
                "roadClass": road_class_hint,
                "roadReference": road_reference_hint,
                "source": location_source,
            },
            content_type=image.content_type,
            benchmark_case=benchmark_case
        )
        result["description"] = description
        result["requestedMode"] = mode
        result["activePipelineMode"] = pipeline_mode
        return JSONResponse(status_code=200, content=result)

    except HTTPException:
        raise
    except ImageValidationError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.get("/api/incidents")
def list_incidents():
    incidents = get_all_incidents()
    return {"incidents": [inc.model_dump() for inc in incidents]}

@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")
    return inc.model_dump()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
