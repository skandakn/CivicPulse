import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from ml.preprocessing.image_processor import validate_and_preprocess_image
from ml.models.model_factory import get_detector
from ml.postprocessing.damage_analyzer import analyze_damage_impact
from backend.severity_engine import SeverityEngine
from backend.duplicate_engine import DuplicateDetectionService
from backend.incident_store import (
    add_supporting_evidence,
    create_master_incident,
    get_incident_by_id,
    SupportingReport,
    LocationModel
)

class PotholeAnalysisPipeline:
    def __init__(self, mode: str = "auto"):
        self.mode = mode
        self.detector = get_detector(mode)
        self.severity_engine = SeverityEngine()
        self.duplicate_service = DuplicateDetectionService()

    def process(
        self,
        image_bytes: bytes,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        road_hint: Optional[str] = None,
        content_type: Optional[str] = None
    ) -> Dict[str, Any]:
        preprocessed = validate_and_preprocess_image(image_bytes, content_type)
        width = preprocessed["width"]
        height = preprocessed["height"]

        effective_lat = latitude if latitude is not None else preprocessed.get("exifLatitude")
        effective_lng = longitude if longitude is not None else preprocessed.get("exifLongitude")

        if effective_lat is None or effective_lng is None:
            effective_lat = 12.9279
            effective_lng = 77.6833

        detection_result = self.detector.detect(preprocessed["cleanBytes"])
        damage_impact = analyze_damage_impact(detection_result.detections, width, height)

        duplicate_result = self.duplicate_service.check_duplicate(
            lat=effective_lat,
            lng=effective_lng,
            issue_type="pothole",
            road_hint=road_hint,
            image_bytes=preprocessed["cleanBytes"]
        )

        matched_incident = None
        if duplicate_result["isDuplicate"]:
            matched_incident = get_incident_by_id(duplicate_result["matchedIncidentId"])

        previous_count = len(matched_incident.reports) if matched_incident else 1

        max_rel_area = (
            max([d.relativeArea for d in detection_result.detections], default=0.0)
            if detection_result.detections else 0.0
        )
        severity_breakdown = self.severity_engine.calculate_severity(
            pothole_count=detection_result.potholeCount,
            max_relative_area=max_rel_area,
            road_obstruction_pct=damage_impact["roadObstructionPct"],
            confidence=detection_result.confidence,
            lat=effective_lat,
            lng=effective_lng,
            previous_reports_count=previous_count,
            road_type="Arterial"
        )

        priority_score = min(100, int(severity_breakdown.score * 0.9 + min(10, previous_count * 0.6)))

        now_iso = datetime.now(timezone.utc).isoformat()
        new_report_id = f"REP-{uuid.uuid4().hex[:8].upper()}"

        report_entry = SupportingReport(
            reportId=new_report_id,
            timestamp=now_iso,
            reporter="Hackathon-CivicUser@bengaluru.gov.in",
            deviceInfo="CivicPulse Mobile Web (Sensor AI)",
            confidence=detection_result.confidence,
            distanceFromCanonicalM=duplicate_result.get("distanceMeters") or 0.0
        )

        if duplicate_result["isDuplicate"] and duplicate_result["matchedIncidentId"]:
            incident_id = duplicate_result["matchedIncidentId"]
            updated_inc = add_supporting_evidence(incident_id, report_entry)
            resolved_incident = updated_inc or matched_incident
            reports_merged = len(resolved_incident.reports) if resolved_incident else previous_count + 1
        else:
            incident_id = f"BNG-PTH-{uuid.uuid4().int % 9000 + 1000}"
            loc = LocationModel(
                lat=effective_lat,
                lng=effective_lng,
                address=road_hint or "Outer Ring Road, Bengaluru",
                ward="Ward 150 - Bellandur",
                zone="Mahadevapura"
            )
            resolved_incident = create_master_incident(
                incident_id=incident_id,
                location=loc,
                road=road_hint or "Outer Ring Road (State Highway 35 Connector)",
                road_segment_id=f"ORR-BLNDR-{uuid.uuid4().hex[:4].upper()}",
                authority="BBMP Mahadevapura Division",
                contractor="NCC Urban Infrastructure Ltd",
                severity_score=severity_breakdown.score,
                severity_level=severity_breakdown.level.upper(),
                priority=priority_score,
                initial_report=report_entry
            )
            reports_merged = 1

        return {
            "detected": detection_result.detected,
            "confidence": detection_result.confidence,
            "detections": [d.model_dump() for d in detection_result.detections],
            "estimatedSeverity": detection_result.estimatedSeverity,
            "damageArea": detection_result.damageArea,
            "potholeCount": detection_result.potholeCount,
            "roadCondition": detection_result.roadCondition,
            "explanation": detection_result.explanation,
            "imageMetadata": {
                "width": width,
                "height": height,
                "sizeBytes": preprocessed["sizeBytes"],
                "format": preprocessed["format"]
            },
            "damageImpact": damage_impact,
            "severityEngine": {
                "score": severity_breakdown.score,
                "level": severity_breakdown.level.upper(),
                "factors": severity_breakdown.factors,
                "explanations": severity_breakdown.factorExplanations
            },
            "duplicateCheck": {
                "isDuplicate": duplicate_result["isDuplicate"],
                "duplicateProbability": duplicate_result["duplicateProbability"],
                "matchedIncidentId": duplicate_result["matchedIncidentId"],
                "reason": duplicate_result["reason"],
                "distanceMeters": duplicate_result.get("distanceMeters")
            },
            "incident": {
                "id": resolved_incident.id,
                "canonicalLocation": resolved_incident.canonicalLocation.model_dump(),
                "priority": priority_score,
                "severity": resolved_incident.severityLevel,
                "reportsMerged": reports_merged,
                "road": resolved_incident.road,
                "authority": resolved_incident.authority,
                "contractor": resolved_incident.contractor,
                "status": resolved_incident.status,
                "lastReportedAt": resolved_incident.lastReportedAt
            },
            "inferenceTimeMs": detection_result.inferenceTimeMs,
            "modelName": detection_result.modelName
        }
