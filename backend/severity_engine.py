import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class SeverityFactors(BaseModel):
    visual_size_weight: float = 20.0
    pothole_count_weight: float = 15.0
    road_obstruction_weight: float = 15.0
    confidence_weight: float = 10.0
    road_importance_weight: float = 15.0
    hub_proximity_weight: float = 10.0
    previous_reports_weight: float = 10.0
    persistence_weight: float = 5.0

class SeverityBreakdown(BaseModel):
    score: int = Field(..., ge=0, le=100)
    level: str
    factors: Dict[str, float]
    factorExplanations: List[str]

BENGALURU_CRITICAL_HUBS = [
    {"name": "Silk Board Junction", "lat": 12.9176, "lng": 77.6238, "radius_km": 2.5, "importance": "Arterial"},
    {"name": "Bellandur Outer Ring Road Tech Corridor", "lat": 12.9279, "lng": 77.6833, "radius_km": 3.0, "importance": "Arterial"},
    {"name": "Indiranagar 100ft Road / CMH Hospital", "lat": 12.9784, "lng": 77.6408, "radius_km": 2.0, "importance": "Sub-Arterial"},
    {"name": "Whitefield ITPL Main Road", "lat": 12.9866, "lng": 77.7381, "radius_km": 3.0, "importance": "Arterial"},
    {"name": "Koramangala Sony World / 80ft Road", "lat": 12.9352, "lng": 77.6245, "radius_km": 2.0, "importance": "Sub-Arterial"},
    {"name": "Majestic Kempegowda Intermodal Station", "lat": 12.9774, "lng": 77.5713, "radius_km": 2.5, "importance": "Arterial"},
    {"name": "Hebbal Flyover / Airport Expressway", "lat": 13.0358, "lng": 77.5970, "radius_km": 3.0, "importance": "Arterial"},
    {"name": "Manipal Hospital HAL Airport Road", "lat": 12.9592, "lng": 77.6482, "radius_km": 1.5, "importance": "Hospital-Zone"}
]

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class SeverityEngine:
    def __init__(self, config: Optional[SeverityFactors] = None):
        self.config = config or SeverityFactors()

    def find_nearest_hub(self, lat: Optional[float], lng: Optional[float]):
        if lat is None or lng is None:
            return None, 999.0
        best_hub = None
        min_dist = 999.0
        for hub in BENGALURU_CRITICAL_HUBS:
            d = haversine_distance_km(lat, lng, hub["lat"], hub["lng"])
            if d < min_dist:
                min_dist = d
                best_hub = hub
        return best_hub, min_dist

    def calculate_severity(
        self,
        pothole_count: int,
        max_relative_area: float,
        road_obstruction_pct: float,
        confidence: float,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        previous_reports_count: int = 1,
        persistence_days: int = 0,
        road_type: str = "Arterial"
    ) -> SeverityBreakdown:
        factors: Dict[str, float] = {}
        explanations: List[str] = []

        # 1. Visual size score
        size_score = min(1.0, max_relative_area / 0.08)
        factors["visual_size"] = round(size_score * self.config.visual_size_weight, 2)
        if size_score > 0.6:
            explanations.append(f"Major physical crater size ({round(max_relative_area * 100, 1)}% frame coverage)")

        # 2. Number of potholes score
        count_score = min(1.0, pothole_count / 3.0)
        factors["pothole_count"] = round(count_score * self.config.pothole_count_weight, 2)
        if pothole_count >= 3:
            explanations.append(f"Multi-crater cluster ({pothole_count} distinct depressions in single frame)")

        # 3. Road obstruction percentage
        obstruction_score = min(1.0, road_obstruction_pct / 45.0)
        factors["road_obstruction"] = round(obstruction_score * self.config.road_obstruction_weight, 2)
        if road_obstruction_pct > 30:
            explanations.append(f"High roadway obstruction ({road_obstruction_pct}% vehicle track span)")

        # 4. Model detection confidence
        conf_score = max(0.0, min(1.0, (confidence - 0.5) / 0.5))
        factors["confidence"] = round(conf_score * self.config.confidence_weight, 2)

        # 5. Road importance score
        road_multiplier = {
            "Arterial": 1.0,
            "Sub-Arterial": 0.85,
            "Major Collector": 0.70,
            "Ward Road": 0.50
        }.get(road_type, 0.80)
        factors["road_importance"] = round(road_multiplier * self.config.road_importance_weight, 2)
        explanations.append(f"Classified road category: {road_type}")

        # 6. Proximity to critical hubs
        hub, dist_km = self.find_nearest_hub(lat, lng)
        if hub and dist_km <= hub["radius_km"]:
            hub_score = max(0.4, 1.0 - (dist_km / hub["radius_km"]))
            explanations.append(f"Within {round(dist_km, 2)}km of high-traffic node ({hub['name']})")
        else:
            hub_score = 0.35
        factors["hub_proximity"] = round(hub_score * self.config.hub_proximity_weight, 2)

        # 7. Previous reports count
        report_score = min(1.0, 0.2 + (previous_reports_count / 15.0) * 0.8)
        factors["previous_reports"] = round(report_score * self.config.previous_reports_weight, 2)
        if previous_reports_count > 3:
            explanations.append(f"Aggregated citizen velocity ({previous_reports_count} corroborating reports)")

        # 8. Persistence in days
        pers_score = min(1.0, (persistence_days + 1) / 14.0)
        factors["persistence"] = round(pers_score * self.config.persistence_weight, 2)

        total_score = sum(factors.values())
        final_score = int(round(max(0.0, min(100.0, total_score))))

        # 0–25 Low, 26–50 Medium, 51–75 High, 76–100 Critical
        if final_score <= 25:
            level = "Low"
        elif final_score <= 50:
            level = "Medium"
        elif final_score <= 75:
            level = "High"
        else:
            level = "Critical"

        return SeverityBreakdown(
            score=final_score,
            level=level,
            factors=factors,
            factorExplanations=explanations
        )
