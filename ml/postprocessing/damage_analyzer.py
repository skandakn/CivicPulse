from typing import List, Dict, Any
from ml.models.base import Detection

def analyze_damage_impact(
    detections: List[Detection],
    image_width: int,
    image_height: int
) -> Dict[str, Any]:
    if not detections:
        return {
            "totalAreaSqMeters": 0.0,
            "roadObstructionPct": 0.0,
            "twoWheelerRisk": "Low",
            "busTransitDisruption": "Minimal",
            "laneClosureRecommended": False,
            "repairUrgency": "Routine Maintenance"
        }

    total_px = image_width * image_height
    total_damage_px = sum(d.areaSqPx for d in detections)
    max_det = max(detections, key=lambda d: d.areaSqPx)

    area_sq_m = round(total_damage_px * 0.000035, 2)

    min_x = min(d.box.x for d in detections)
    max_x = max(d.box.x + d.box.width for d in detections)
    obstruction_pct = round(((max_x - min_x) / max(image_width, 1)) * 100, 1)

    is_critical = any(d.severity == "Critical" for d in detections) or obstruction_pct > 40
    is_high = any(d.severity == "High" for d in detections) or len(detections) >= 3

    if is_critical:
        risk_2w = "Extreme (High Skidding & Rim Fracture Risk)"
        bus_impact = "Severe (Speed Reduction to < 10 km/h, Axle Stress)"
        lane_closure = True
        urgency = "Emergency Cold Patching Required (< 24h)"
    elif is_high:
        risk_2w = "High (Sudden Swerving Hazard)"
        bus_impact = "Moderate (Lane bottlenecking)"
        lane_closure = False
        urgency = "Priority Repair (< 48h)"
    else:
        risk_2w = "Moderate"
        bus_impact = "Low"
        lane_closure = False
        urgency = "Standard BBMP Batch Repair"

    return {
        "totalAreaSqMeters": area_sq_m,
        "roadObstructionPct": obstruction_pct,
        "twoWheelerRisk": risk_2w,
        "busTransitDisruption": bus_impact,
        "laneClosureRecommended": lane_closure,
        "repairUrgency": urgency,
        "primaryCraterId": max_det.id,
        "primaryCraterDepth": max_det.depthEstimate
    }
