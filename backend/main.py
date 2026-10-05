import os
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse

from ml.preprocessing.image_processor import ImageValidationError
from ml.inference.pipeline import PotholeAnalysisPipeline
from backend.incident_store import get_all_incidents, get_incident_by_id

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

pipelines = {
    "auto": PotholeAnalysisPipeline(mode="auto"),
    "demo": PotholeAnalysisPipeline(mode="demo"),
    "opencv": PotholeAnalysisPipeline(mode="opencv"),
    "yolo": PotholeAnalysisPipeline(mode="yolo"),
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
    mode: Optional[str] = Form("auto", description="'auto', 'opencv', 'yolo', or 'demo'")
):
    try:
        if latitude is not None and not (-90.0 <= latitude <= 90.0):
            raise HTTPException(status_code=400, detail="Invalid latitude: Must be between -90.0 and 90.0 degrees.")
        if longitude is not None and not (-180.0 <= longitude <= 180.0):
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
            content_type=image.content_type
        )
        result["requestedMode"] = mode
        result["activePipelineMode"] = pipeline_mode
        return JSONResponse(status_code=200, content=result)

    except HTTPException:
        raise
    except ImageValidationError as ve:
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
