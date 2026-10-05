export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 
  | 'REPORTED' 
  | 'TRIAGED' 
  | 'TENDER_ASSIGNED' 
  | 'WORK_IN_PROGRESS' 
  | 'REPAIRED' 
  | 'AI_VERIFIED';

export type RoadCategory = 
  | 'ARTERIAL' 
  | 'SUB_ARTERIAL' 
  | 'MAJOR_DISTRICT' 
  | 'RESIDENTIAL';

export type SurfaceType = 'ASPHALT' | 'CONCRETE' | 'WHITE_TOPPED';

export type BbmpZone = 
  | 'East' 
  | 'West' 
  | 'South' 
  | 'Mahadevapura' 
  | 'Bommanahalli' 
  | 'RR Nagar' 
  | 'Dasarahalli' 
  | 'Yelahanka';

export type DataSourceTag = 'VERIFIED_OFFICIAL' | 'DEMO_DATA' | 'ESTIMATED';

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  landmark?: string;
  roadName: string;
  wardNumber: number;
  wardName: string;
  zone: BbmpZone;
}

export interface ScoreItem {
  factor: string;
  points: number;
  maxPoints: number;
  description: string;
}

export interface PriorityBreakdown {
  depthRisk: number; // 0-100
  trafficVolumeImpact: number; // 0-100
  schoolHospitalProximity: number; // 0-100
  monsoonFloodingVulnerability: number; // 0-100
  twoWheelerAccidentHistory: number; // 0-100
  citizenUpvotesWeight: number; // 0-100
}

export interface PriorityScore {
  overallScore: number; // 0-100
  breakdown: PriorityBreakdown;
  scoreItems?: ScoreItem[];
  confidence: number; // 0.0 - 1.0
  explanation: string[];
  shortExplanation?: string;
  calculatedAt: string;
}

export interface DetectedHazardObject {
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, w, h] in percentages
  notes?: string;
}

export interface AIDetectionMetrics {
  depthCm: number;
  surfaceAreaSqM: number;
  estimatedVolumeLiters: number;
  asphaltDeteriorationIndex: number; // 0-100
  moistureWaterloggingRisk: number; // 0-100
  vehicleDamageHazard: number; // 0-100
  boundingPolygon?: [number, number][];
  modelConfidence: number;
  processingTimeMs: number;
  inferenceMode?: 'DEMO_INFERENCE_MODE' | 'LIVE_EDGE_MODEL';
}

export interface SupportingReport {
  reportId: string;
  citizenName: string;
  timestamp: string;
  imageUrl?: string;
  notes?: string;
  similarityScore: number; // percentage, e.g. 94%
}

export interface RepairVerification {
  incidentId: string;
  repairedAt: string;
  contractorSubmittedPhoto: string;
  aiAuditPhoto: string;
  passConfidence: number; // 0.0 - 1.0
  surfaceSmoothnessScore: number; // 0-100
  areaReductionPercent: number; // e.g. 96.4%
  unresolvedDamageDetected: boolean;
  thermalDensityScore: number; // 0-100
  verifiedBy: 'AI_VISION_AUDITOR' | 'HUMAN_OVERRIDE';
  status: 'APPROVED' | 'REJECTED_REWORK_NEEDED';
  notes: string;
  mode: 'DEMO_VERIFICATION_MODE' | 'LIVE_AUDIT_MODE';
}

export interface ComplaintHistoryItem {
  timestamp: string;
  action: string;
  actor: string;
  notes?: string;
}

export interface ComplaintDraft {
  draftId: string;
  status: 'READY_TO_SUBMIT' | 'SIMULATED_SYNC';
  generatedAt: string;
  recommendedAction: string;
  slaDeadline: string;
  watermark: string; // "AI-generated — review before submission."
}

export interface Complaint {
  id: string;
  sahayaTicketNo: string;
  incidentId: string;
  citizenName: string;
  citizenPhone: string;
  upvotes: number;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'ESCALATED_L2' | 'ESCALATED_L3' | 'RESOLVED';
  filedAt: string;
  slaDeadline: string; // ISO string
  slaBreached: boolean;
  history: ComplaintHistoryItem[];
  draftDetails?: ComplaintDraft;
}

export interface Contract {
  id: string;
  contractNumber: string;
  roadId: string;
  contractorId: string;
  contractorName: string;
  authorityId: string;
  awardDate: string;
  completionDate: string;
  warrantyPeriodMonths: number;
  defectLiabilityExpiry: string; // ISO string
  isUnderWarranty: boolean;
  totalCostINR: number;
  status: 'ACTIVE' | 'UNDER_WARRANTY' | 'EXPIRED' | 'DEFAULTED';
  responsibilityClause: string;
}

export interface Contractor {
  id: string;
  name: string;
  registrationNumber: string;
  classRating: 'CLASS_1' | 'CLASS_2' | 'CLASS_3';
  activeContractsCount: number;
  totalKmsPaved: number;
  warrantyDefectRate: number; // percentage, e.g. 8.4%
  qualityScore: number; // 0-100
  penaltiesLeviedINR: number;
  penaltiesPaidINR: number;
  blacklistedStatus: boolean;
  contactEmail: string;
  contactPhone: string;
  activeWards: string[];
}

export interface Authority {
  id: string;
  name: string;
  acronym: 'BBMP' | 'BDA' | 'BMRCL' | 'BESCOM' | 'BWSSB';
  jurisdiction: string;
  nodalOfficer: string;
  designation: string;
  escalationContact: string;
}

export interface Road {
  id: string;
  name: string;
  code: string;
  category: RoadCategory;
  lengthKm: number;
  wardId: string;
  zone: BbmpZone;
  surfaceType: SurfaceType;
  trafficDensityIndex: number; // 0-100
  criticalFacilitiesNearby: string[]; // e.g. "Manipal Hospital", "Kendriya Vidyalaya"
  lastPavedDate: string;
  activePotholesCount: number;
}

export interface Ward {
  id: string;
  number: number;
  name: string;
  zone: BbmpZone;
  chiefEngineer: string;
  assistantExecutiveEngineer: string;
  contactPhone: string;
  activePotholesCount: number;
  criticalPotholesCount: number;
  resolvedThisMonth: number;
  budgetAllocatedLakhs: number;
  budgetUtilizedLakhs: number;
  riskIndex: number; // 0-100
}

export interface PotholeIncident {
  id: string;
  code: string; // e.g. "BLR-POT-2026-0842" / "BNG-PTH-1042"
  reportId?: string;
  latitude: number;
  longitude: number;
  roadId: string;
  roadName: string;
  wardId: string;
  wardName: string;
  wardNumber: number;
  zone: BbmpZone;
  coordinates: {
    lat: number;
    lng: number;
  };
  landmark: string;
  severity: SeverityLevel;
  severityScore: number; // 0-100
  depthCm: number;
  surfaceAreaSqM: number;
  estimatedVolumeLiters: number;
  riskScore: number; // 0-100
  confidence: number; // 0.0 - 1.0
  status: IncidentStatus;
  priorityRank: number;
  priorityDetails: PriorityScore;
  reportedAt: string;
  lastUpdatedAt: string;
  contractorId?: string;
  contractorName?: string;
  contractId?: string;
  isUnderWarranty: boolean;
  authorityId: string;
  authorityName: string;
  complaintsCount: number;
  upvotes: number;
  sahayaTicketNo: string;
  images: {
    original: string;
    detectionOverlay?: string;
    depthHeatmap?: string;
    repaired?: string;
  };
  aiMetrics: AIDetectionMetrics;
  detectedObjects: DetectedHazardObject[];
  duplicateOf?: string | null;
  supportingReports: SupportingReport[];
  roadHealth: string;
  trafficExposure: string;
  nearbySensitivePlaces: string[];
  dataSource: DataSourceTag;
  repairVerification?: RepairVerification;
}

export type ViewMode = 
  | 'LANDING'
  | 'GODS_EYE' 
  | 'REPORT' 
  | 'AI_ANALYSIS' 
  | 'PRIORITY_QUEUE' 
  | 'INCIDENT_DETAIL' 
  | 'VERIFICATION'
  | 'CONTRACTORS' 
  | 'COMPLAINTS' 
  | 'ANALYTICS';
