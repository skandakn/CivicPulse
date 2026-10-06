import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ViewMode,
  PotholeIncident,
  Ward,
  Road,
  Contractor,
  Authority,
  Complaint,
  RepairVerification,
  SupportingReport
} from '../types';
import {
  INITIAL_INCIDENTS,
  INITIAL_WARDS,
  INITIAL_ROADS,
  INITIAL_CONTRACTORS,
  INITIAL_AUTHORITIES,
  INITIAL_COMPLAINTS
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export type UserRole = 'CITIZEN' | 'WARD_ENGINEER' | 'CHIEF_COMMISSIONER' | 'AUDITOR';

interface AppContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  incidents: PotholeIncident[];
  selectedIncident: PotholeIncident | null;
  setSelectedIncident: (incident: PotholeIncident | null) => void;
  selectIncidentById: (id: string, targetView?: ViewMode) => void;
  selectedWardId: string;
  setSelectedWardId: (wardId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  wards: Ward[];
  roads: Road[];
  contractors: Contractor[];
  authorities: Authority[];
  complaints: Complaint[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  addPotholeReport: (newReport: Partial<PotholeIncident>) => PotholeIncident;
  mergeDuplicateReport: (masterIncidentId: string, reportNote: string, reporterName: string, evidence?: { imageUrl?: string; coordinates?: { lat: number; lng: number } }) => void;
  verifyRepair: (incidentId: string, verification: RepairVerification) => void;
  upvoteComplaint: (complaintId: string) => void;
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
  filteredIncidents: PotholeIncident[];
  isJudgeDemoOpen: boolean;
  setIsJudgeDemoOpen: (open: boolean) => void;
  isVoiceChatOpen: boolean;
  setIsVoiceChatOpen: (open: boolean) => void;
  loadDemoCase: () => void;
  resetDemo: () => void;
  updateIncidentStatus: (id: string, status: PotholeIncident['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('PRIORITY_QUEUE');
  const [incidents, setIncidents] = useState<PotholeIncident[]>(INITIAL_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<PotholeIncident | null>(INITIAL_INCIDENTS[0]);
  const [selectedWardId, setSelectedWardId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [wards] = useState<Ward[]>(INITIAL_WARDS);
  const [roads] = useState<Road[]>(INITIAL_ROADS);
  const [contractors] = useState<Contractor[]>(INITIAL_CONTRACTORS);
  const [authorities] = useState<Authority[]>(INITIAL_AUTHORITIES);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [userRole, setUserRole] = useState<UserRole>('CITIZEN');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState<boolean>(false);
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState<boolean>(false);

  // Keyboard shortcut for Cmd+K / Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = (title: string, description?: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description,
      type,
      timestamp: Date.now()
    };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const selectIncidentById = (id: string, targetView: ViewMode = 'INCIDENT_DETAIL') => {
    const match = incidents.find(inc => inc.id === id);
    if (match) {
      setSelectedIncident(match);
      setCurrentView(targetView);
    }
  };

  const loadDemoCase = () => {
    const demoIncident = incidents.find(i => i.code === 'BNG-PTH-1042') || incidents[0];
    setSelectedIncident(demoIncident);
    setIsJudgeDemoOpen(true);
    addToast('1-Click Judge Case Activated', `Case ${demoIncident.code} loaded with complete end-to-end evidence`, 'info');
  };

  const resetDemo = () => {
    setIncidents(INITIAL_INCIDENTS);
    setSelectedIncident(INITIAL_INCIDENTS[0]);
    setSelectedWardId('ALL');
    setSearchQuery('');
    setIsSearchOpen(false);
    setComplaints(INITIAL_COMPLAINTS);
    setIsJudgeDemoOpen(false);
    setCurrentView('LANDING');
    addToast('State Reset', 'System returned to pristine state (10 seed incidents ready)', 'info');
  };

  const upvoteComplaint = (complaintId: string) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          const updatedUpvotes = c.upvotes + 1;
          setIncidents(incList =>
            incList.map(inc => {
              if (inc.id === c.incidentId) {
                const newScore = Math.min(100, inc.priorityDetails.overallScore + 1);
                return {
                  ...inc,
                  upvotes: inc.upvotes + 1,
                  priorityDetails: {
                    ...inc.priorityDetails,
                    overallScore: newScore,
                    breakdown: {
                      ...inc.priorityDetails.breakdown,
                      citizenUpvotesWeight: Math.min(100, inc.priorityDetails.breakdown.citizenUpvotesWeight + 3)
                    }
                  }
                };
              }
              return inc;
            })
          );
          return { ...c, upvotes: updatedUpvotes };
        }
        return c;
      })
    );
    addToast('Citizen Upvote Recorded', 'Priority score updated in BBMP algorithmic queue', 'success');
  };

  const mergeDuplicateReport = (masterIncidentId: string, reportNote: string, reporterName: string, evidence?: { imageUrl?: string; coordinates?: { lat: number; lng: number } }) => {
    const newSupport: SupportingReport = {
      reportId: `rep-dup-${Date.now()}`,
      citizenName: reporterName || 'Citizen Commuter',
      timestamp: new Date().toISOString(),
      notes: reportNote || 'Reported identical hazard location',
      similarityScore: undefined,
      imageUrl: evidence?.imageUrl,
      coordinates: evidence?.coordinates
    };

    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === masterIncidentId) {
          const updatedReports = [newSupport, ...inc.supportingReports];
          const newScore = Math.min(100, inc.priorityDetails.overallScore + 2);
          return {
            ...inc,
            upvotes: inc.upvotes + 2,
            complaintsCount: inc.complaintsCount + 1,
            supportingReports: updatedReports,
            priorityDetails: {
              ...inc.priorityDetails,
              overallScore: newScore,
              shortExplanation: `${updatedReports.length} citizen reports merged into one master incident.`
            }
          };
        }
        return inc;
      })
    );

    addToast(
      'Duplicate Merged into Master Incident',
      `Merged report into ${masterIncidentId}. Priority boosted without map clutter.`,
      'success'
    );
  };

  const verifyRepair = (incidentId: string, verification: RepairVerification) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === incidentId) {
          const isApproved = verification.status === 'APPROVED';
          return {
            ...inc,
            status: isApproved ? 'AI_VERIFIED' : 'WORK_IN_PROGRESS',
            repairVerification: verification,
            images: {
              ...inc.images,
              repaired: verification.contractorSubmittedPhoto
            }
          };
        }
        return inc;
      })
    );

    // update complaints too
    setComplaints(prev =>
      prev.map(c => {
        if (c.incidentId === incidentId) {
          return {
            ...c,
            status: verification.status === 'APPROVED' ? 'RESOLVED' : 'ESCALATED_L2',
            history: [
              ...c.history,
              {
                timestamp: new Date().toISOString(),
                action: `AI Repair Verification: ${verification.status === 'APPROVED' ? 'APPROVED (Pass Confidence 98.4%)' : 'REWORK NEEDED'}`,
                actor: 'CivicPulse AI Surface Auditor v4.2'
              }
            ]
          };
        }
        return c;
      })
    );

    addToast(
      verification.status === 'APPROVED' ? 'AI Repair Audit Passed!' : 'Rework Notice Issued',
      verification.notes,
      verification.status === 'APPROVED' ? 'success' : 'warning'
    );
  };

  const updateIncidentStatus = (id: string, status: PotholeIncident['status']) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === id) {
          const updated = { ...inc, status, lastUpdatedAt: new Date().toISOString() };
          return updated;
        }
        return inc;
      })
    );
    setSelectedIncident(prev => (prev && prev.id === id ? { ...prev, status, lastUpdatedAt: new Date().toISOString() } : prev));
  };

  const addPotholeReport = (newReport: Partial<PotholeIncident>): PotholeIncident => {
    const lat = newReport.coordinates?.lat ?? newReport.latitude;
    const lng = newReport.coordinates?.lng ?? newReport.longitude;
    if (lat === undefined || lng === undefined || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error('A selected latitude and longitude are required to create an incident.');
    }

    const timestamp = new Date().toISOString();
    const reportCode = `BLR-RPT-${Date.now().toString(36).toUpperCase()}`;
    const locationLabel = newReport.roadName || newReport.canonicalLocation?.address || 'Not available';
    const severityScore = newReport.severityScore ?? 0;
    const priorityDetails = newReport.priorityDetails ?? {
      overallScore: newReport.riskScore ?? severityScore,
      breakdown: {
        depthRisk: 0,
        trafficVolumeImpact: 0,
        schoolHospitalProximity: 0,
        monsoonFloodingVulnerability: 0,
        twoWheelerAccidentHistory: 0,
        citizenUpvotesWeight: 0
      },
      scoreItems: [],
      confidence: newReport.confidence ?? 0,
      shortExplanation: 'Priority components are not available for this report.',
      explanation: ['No additional infrastructure or exposure data was available.'],
      calculatedAt: timestamp
    };

    const completeIncident: PotholeIncident = {
      id: `inc-${crypto.randomUUID()}`,
      code: reportCode,
      reportId: `rep-${crypto.randomUUID()}`,
      latitude: lat,
      longitude: lng,
      roadId: newReport.roadId ?? newReport.roadReference ?? 'not-available',
      roadName: newReport.roadName || 'Not available',
      wardId: newReport.wardId ?? 'not-available',
      wardName: newReport.wardName || 'Not available',
      wardNumber: newReport.wardNumber ?? 0,
      zone: newReport.zone ?? 'Not available',
      coordinates: { lat, lng },
      landmark: newReport.landmark || newReport.canonicalLocation?.locality || 'Not available',
      severity: newReport.severity ?? 'MEDIUM',
      severityScore,
      depthCm: newReport.depthCm ?? 0,
      surfaceAreaSqM: newReport.surfaceAreaSqM ?? 0,
      estimatedVolumeLiters: newReport.estimatedVolumeLiters ?? 0,
      riskScore: newReport.riskScore ?? priorityDetails.overallScore,
      confidence: newReport.confidence ?? 0,
      status: 'REPORTED',
      priorityRank: 0,
      priorityDetails,
      reportedAt: timestamp,
      lastUpdatedAt: timestamp,
      contractorId: newReport.contractorId,
      contractorName: newReport.contractorName,
      isUnderWarranty: false,
      authorityId: newReport.authorityId || 'recommended-department',
      authorityName: newReport.authorityName || 'Recommended Department: Not available',
      complaintsCount: 1,
      upvotes: 1,
      sahayaTicketNo: 'Not submitted',
      images: newReport.images || { original: '' },
      aiMetrics: newReport.aiMetrics || {
        depthCm: 0,
        surfaceAreaSqM: 0,
        estimatedVolumeLiters: 0,
        asphaltDeteriorationIndex: 0,
        moistureWaterloggingRisk: 0,
        vehicleDamageHazard: 0,
        modelConfidence: newReport.confidence ?? 0,
        processingTimeMs: 0,
        inferenceMode: 'LIVE_EDGE_MODEL'
      },
      detectedObjects: newReport.detectedObjects || [],
      supportingReports: [],
      roadHealth: newReport.roadHealth || 'Not available',
      trafficExposure: newReport.trafficExposure || 'Not available',
      nearbySensitivePlaces: newReport.nearbySensitivePlaces || [],
      dataSource: 'USER_REPORTED',
      locationSource: newReport.locationSource || newReport.canonicalLocation?.source || 'Not available',
      roadClass: newReport.roadClass || newReport.canonicalLocation?.roadClass,
      roadReference: newReport.roadReference || newReport.canonicalLocation?.roadReference,
      canonicalLocation: newReport.canonicalLocation || {
        lat,
        lng,
        address: locationLabel,
        ward: 'Not available',
        zone: 'Not available'
      },
      road: locationLabel,
      authority: newReport.authorityName || 'Recommended Department: Not available',
      contractor: 'Not assigned',
      isDemo: false
    };

    setIncidents(prev => [completeIncident, ...prev]);

    return completeIncident;
  };

  const filteredIncidents = incidents.filter(inc => {
    if (selectedWardId !== 'ALL' && inc.wardId !== selectedWardId) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = inc.roadName.toLowerCase().includes(q);
      const matchWard = inc.wardName.toLowerCase().includes(q);
      const matchCode = inc.code.toLowerCase().includes(q);
      const matchTicket = inc.sahayaTicketNo.toLowerCase().includes(q);
      const matchContractor = inc.contractorName?.toLowerCase().includes(q);
      const matchLandmark = inc.landmark.toLowerCase().includes(q);
      return matchName || matchWard || matchCode || matchTicket || matchContractor || matchLandmark;
    }
    return true;
  });

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        incidents,
        selectedIncident,
        setSelectedIncident,
        selectIncidentById,
        selectedWardId,
        setSelectedWardId,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        wards,
        roads,
        contractors,
        authorities,
        complaints,
        userRole,
        setUserRole,
        addPotholeReport,
        mergeDuplicateReport,
        verifyRepair,
        upvoteComplaint,
        toasts,
        addToast,
        dismissToast,
        filteredIncidents,
        isJudgeDemoOpen,
        setIsJudgeDemoOpen,
        isVoiceChatOpen,
        setIsVoiceChatOpen,
        loadDemoCase,
        resetDemo,
        updateIncidentStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
