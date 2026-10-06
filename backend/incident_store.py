from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class LocationModel(BaseModel):
    lat: float
    lng: float
    address: str
    ward: str
    zone: str
    locality: Optional[str] = None
    city: Optional[str] = None
    source: Optional[str] = None
    roadClass: Optional[str] = None
    roadReference: Optional[str] = None

class SupportingReport(BaseModel):
    reportId: str
    timestamp: str
    reporter: str
    deviceInfo: str
    confidence: float
    imageUri: Optional[str] = None
    distanceFromCanonicalM: float = 0.0
    notes: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None

class MasterIncident(BaseModel):
    id: str  # "BNG-PTH-1042"
    canonicalLocation: LocationModel
    reports: List[SupportingReport] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    severityScore: int
    severityLevel: str
    priority: int
    road: str
    roadSegmentId: str
    authority: str
    contractor: str
    status: str
    createdAt: str
    updatedAt: str
    lastReportedAt: str
    issueType: str = "pothole"
    isDemo: bool = False

_INCIDENTS: Dict[str, MasterIncident] = {}

def init_default_incidents():
    global _INCIDENTS
    if _INCIDENTS:
        return

    now_iso = datetime.now(timezone.utc).isoformat()

    # Pre-seeded master incident BNG-PTH-1042 as requested in specification
    i1 = MasterIncident(
        id="BNG-PTH-1042",
        canonicalLocation=LocationModel(
            lat=12.9279,
            lng=77.6833,
            address="Outer Ring Road, near Bellandur EcoSpace Flyover Descent",
            ward="Ward 150 - Bellandur",
            zone="Mahadevapura"
        ),
        reports=[
            SupportingReport(
                reportId=f"REP-{104200 + i}",
                timestamp=datetime.now(timezone.utc).isoformat(),
                reporter=f"Citizen-{100 + i}@civicpulse.in",
                deviceInfo="Android DashCam v3.1",
                confidence=0.96,
                distanceFromCanonicalM=float(i * 2.5)
            ) for i in range(16)
        ],
        images=[
            "/sample_data/images/bellandur_outer_ring_road_severe.jpg"
        ],
        severityScore=94,
        severityLevel="CRITICAL",
        priority=94,
        road="Outer Ring Road (State Highway 35 Connector)",
        roadSegmentId="ORR-BLNDR-04",
        authority="BBMP Mahadevapura Division (Major Roads Dept)",
        contractor="NCC Urban Infrastructure Ltd (Contract #KA-BBMP-2025-912)",
        status="Verified",
        createdAt=now_iso,
        updatedAt=now_iso,
        lastReportedAt=now_iso,
        issueType="pothole",
        isDemo=True
    )

    _INCIDENTS[i1.id] = i1

init_default_incidents()

def get_all_incidents() -> List[MasterIncident]:
    return list(_INCIDENTS.values())

def get_incident_by_id(incident_id: str) -> Optional[MasterIncident]:
    return _INCIDENTS.get(incident_id)

def add_supporting_evidence(incident_id: str, report: SupportingReport, image_uri: Optional[str] = None):
    inc = _INCIDENTS.get(incident_id)
    if inc:
        inc.reports.append(report)
        if image_uri and image_uri not in inc.images:
            inc.images.append(image_uri)
        inc.lastReportedAt = datetime.now(timezone.utc).isoformat()
        inc.updatedAt = datetime.now(timezone.utc).isoformat()
        return inc
    return None

def create_master_incident(
    incident_id: str,
    location: LocationModel,
    road: str,
    road_segment_id: str,
    authority: str,
    contractor: str,
    severity_score: int,
    severity_level: str,
    priority: int,
    initial_report: SupportingReport,
    initial_image: Optional[str] = None,
    issue_type: str = "pothole",
    is_demo: bool = False,
    description: Optional[str] = None
) -> MasterIncident:
    now_iso = datetime.now(timezone.utc).isoformat()
    inc = MasterIncident(
        id=incident_id,
        canonicalLocation=location,
        reports=[initial_report],
        images=[initial_image] if initial_image else [],
        severityScore=severity_score,
        severityLevel=severity_level,
        priority=priority,
        road=road,
        roadSegmentId=road_segment_id,
        authority=authority,
        contractor=contractor,
        status="Reported",
        createdAt=now_iso,
        updatedAt=now_iso,
        lastReportedAt=now_iso,
        issueType=issue_type,
        isDemo=is_demo
    )
    if description:
        initial_report.notes = description
    _INCIDENTS[incident_id] = inc
    return inc
