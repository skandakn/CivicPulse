import math
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from backend.incident_store import get_all_incidents, MasterIncident

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class DuplicateDetectionService:
    def __init__(self, max_duplicate_radius_m: float = 65.0):
        self.max_radius_m = max_duplicate_radius_m

    def check_duplicate(
        self,
        lat: Optional[float],
        lng: Optional[float],
        issue_type: str = "pothole",
        road_hint: Optional[str] = None,
        image_bytes: Optional[bytes] = None,
        include_demo: bool = False
    ) -> Dict[str, Any]:
        incidents = get_all_incidents()

        if lat is None or lng is None:
            return {
                "isDuplicate": False,
                "duplicateProbability": 0.0,
                "matchedIncidentId": None,
                "reason": "A selected coordinate is required for duplicate detection.",
                "distanceMeters": None,
                "canonicalLocation": None,
                "existingReportsCount": 0,
                "incidentStatus": None,
            }

        default_lat = lat
        default_lng = lng

        best_match: Optional[MasterIncident] = None
        highest_prob = 0.0
        best_distance = 999999.0
        best_segment_match = False

        for inc in incidents:
            if getattr(inc, "isDemo", False) and not include_demo:
                continue
            if getattr(inc, "issueType", "pothole") != issue_type:
                continue
            dist_m = haversine_distance_meters(
                default_lat, default_lng,
                inc.canonicalLocation.lat, inc.canonicalLocation.lng
            )

            if dist_m <= self.max_radius_m:
                spatial_score = max(0.0, 1.0 - (dist_m / self.max_radius_m))
            else:
                spatial_score = 0.0

            segment_score = 0.0
            if road_hint:
                if road_hint.lower() in inc.road.lower() or inc.road.lower() in road_hint.lower():
                    segment_score = 0.20
            else:
                segment_score = 0.15

            issue_score = 0.10 if issue_type == "pothole" else 0.05
            try:
                last_reported = datetime.fromisoformat(inc.lastReportedAt.replace("Z", "+00:00"))
                if last_reported.tzinfo is None:
                    last_reported = last_reported.replace(tzinfo=timezone.utc)
                age_days = (datetime.now(timezone.utc) - last_reported).total_seconds() / 86400
                temporal_score = 0.15 if age_days <= 30 else 0.05 if age_days <= 180 else 0.0
            except (AttributeError, TypeError, ValueError):
                temporal_score = 0.0

            if spatial_score > 0:
                # No visual similarity service is wired into this backend yet;
                # do not award a fabricated visual match score.
                prob = min(0.95, (spatial_score * 0.55) + segment_score + issue_score + temporal_score)
            else:
                prob = 0.0

            if prob > highest_prob:
                highest_prob = prob
                best_match = inc
                best_distance = dist_m
                best_segment_match = segment_score > 0

        is_duplicate = highest_prob >= 0.70 and best_match is not None

        if is_duplicate and best_match:
            prob_pct = int(round(highest_prob * 100))
            reason = (
                f"{prob_pct}% potential duplicate of {best_match.id}: selected point is "
                f"{int(round(best_distance))}m away, with matching road and recent incident context."
                if best_segment_match else
                f"{prob_pct}% potential duplicate of {best_match.id}: selected point is "
                f"{int(round(best_distance))}m from the existing incident."
            )
            return {
                "isDuplicate": True,
                "duplicateProbability": round(highest_prob, 3),
                "matchedIncidentId": best_match.id,
                "reason": reason,
                "distanceMeters": round(best_distance, 1),
                "canonicalLocation": best_match.canonicalLocation.model_dump(),
                "existingReportsCount": len(best_match.reports),
                "incidentStatus": best_match.status
            }

        return {
            "isDuplicate": False,
            "duplicateProbability": round(highest_prob, 3),
            "matchedIncidentId": None,
            "reason": "No matching incident met the location, road, issue-type, and recency threshold.",
            "distanceMeters": round(best_distance, 1) if best_match else None,
            "canonicalLocation": None,
            "existingReportsCount": 0,
            "incidentStatus": None
        }
