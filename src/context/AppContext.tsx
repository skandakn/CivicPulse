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
  mergeDuplicateReport: (masterIncidentId: string, reportNote: string, reporterName: string) => void;
  verifyRepair: (incidentId: string, verification: RepairVerification) => void;
  upvoteComplaint: (complaintId: string) => void;
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
  filteredIncidents: PotholeIncident[];
  isJudgeDemoOpen: boolean;
  setIsJudgeDemoOpen: (open: boolean) => void;
  loadDemoCase: () => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('LANDING');
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
    addToast('1-Click Judge Demo Activated', `Case ${demoIncident.code} loaded with complete end-to-end evidence`, 'info');
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
    addToast('Demo State Reset', 'System returned to pristine state (10 seed incidents ready)', 'info');
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

  const mergeDuplicateReport = (masterIncidentId: string, reportNote: string, reporterName: string) => {
    const newSupport: SupportingReport = {
      reportId: `rep-dup-${Date.now()}`,
      citizenName: reporterName || 'Citizen Commuter',
      timestamp: new Date().toISOString(),
      notes: reportNote || 'Reported identical hazard location',
      similarityScore: 94
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

  const addPotholeReport = (newReport: Partial<PotholeIncident>): PotholeIncident => {
    const count = incidents.length + 1;
    const randomTicket = Math.floor(10000 + Math.random() * 90000);
    const code = `BNG-PTH-${1042 + count}`;
    const sahayaTicketNo = `BBMP-SHY-2026-${randomTicket}`;
    const lat = newReport.coordinates?.lat || newReport.latitude || 12.9298;
    const lng = newReport.coordinates?.lng || newReport.longitude || 77.6835;

    const completeIncident: PotholeIncident = {
      id: `inc-${Date.now()}`,
      code,
      reportId: `rep-${Date.now()}`,
      latitude: lat,
      longitude: lng,
      roadId: newReport.roadId || 'road-01',
      roadName: newReport.roadName || 'Outer Ring Road, Bengaluru',
      wardId: newReport.wardId || 'ward-150',
      wardName: newReport.wardName || 'Bellandur',
      wardNumber: newReport.wardNumber || 150,
      zone: newReport.zone || 'Mahadevapura',
      coordinates: { lat, lng },
      landmark: newReport.landmark || 'Near main intersection',
      severity: newReport.severity || 'CRITICAL',
      severityScore: newReport.severityScore || 94,
      depthCm: newReport.depthCm || 14.5,
      surfaceAreaSqM: newReport.surfaceAreaSqM || 1.35,
      estimatedVolumeLiters: newReport.estimatedVolumeLiters || 32.0,
      riskScore: newReport.riskScore || 94,
      confidence: 0.97,
      status: 'TRIAGED',
      priorityRank: 1,
      priorityDetails: newReport.priorityDetails || {
        overallScore: 94,
        breakdown: {
          depthRisk: 92,
          trafficVolumeImpact: 95,
          schoolHospitalProximity: 90,
          monsoonFloodingVulnerability: 94,
          twoWheelerAccidentHistory: 89,
          citizenUpvotesWeight: 75
        },
        scoreItems: [
          { factor: 'Visual severity & depth (>14cm)', points: 30, maxPoints: 35, description: '14.5cm depth extracted from camera stereopsis.' },
          { factor: 'Traffic exposure', points: 21, maxPoints: 25, description: 'High commuter density corridor.' },
          { factor: 'Report density', points: 15, maxPoints: 20, description: 'Initial verified report.' },
          { factor: 'Persistence', points: 12, maxPoints: 15, description: 'Active unresolved hazard.' },
          { factor: 'Road importance', points: 8, maxPoints: 10, description: 'Arterial transit road.' },
          { factor: 'Sensitive location', points: 5, maxPoints: 5, description: 'Near hospitals and schools.' }
        ],
        confidence: 0.97,
        shortExplanation: 'High-confidence pothole on a high-traffic corridor with immediate damage hazard.',
        explanation: [
          'High depth (>14cm) detected via camera depth stereopsis.',
          'High density traffic corridor in Bengaluru.',
          'Road project associated with recorded tender under Contractor Warranty.'
        ],
        calculatedAt: new Date().toISOString()
      },
      reportedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      contractorId: newReport.contractorId || 'cont-01',
      contractorName: newReport.contractorName || 'Star Infratech Bengaluru Pvt Ltd',
      isUnderWarranty: true,
      authorityId: 'auth-bbmp',
      authorityName: 'Bruhat Bengaluru Mahanagara Palike (BBMP) - Major Roads',
      complaintsCount: 1,
      upvotes: 1,
      sahayaTicketNo,
      images: newReport.images || {
        original: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
      },
      aiMetrics: newReport.aiMetrics || {
        depthCm: 14.5,
        surfaceAreaSqM: 1.35,
        estimatedVolumeLiters: 32.0,
        asphaltDeteriorationIndex: 91,
        moistureWaterloggingRisk: 88,
        vehicleDamageHazard: 95,
        modelConfidence: 0.978,
        processingTimeMs: 35,
        inferenceMode: 'DEMO_INFERENCE_MODE'
      },
      detectedObjects: [
        { label: 'Surface Crater', confidence: 0.98, bbox: [25, 25, 50, 50], notes: 'High depth entrapment zone' }
      ],
      supportingReports: [],
      roadHealth: 'Pavement Condition Index: 32/100 (High Deterioration)',
      trafficExposure: '22,000 PCU/hr • City Arterial Route',
      nearbySensitivePlaces: ['Local Hospital (0.5 km)', 'School Zone (0.8 km)'],
      dataSource: 'DEMO_DATA'
    };

    setIncidents(prev => [completeIncident, ...prev]);

    // create matching complaint
    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      sahayaTicketNo,
      incidentId: completeIncident.id,
      citizenName: 'Citizen Reporter',
      citizenPhone: '+91 98450 00000',
      upvotes: 1,
      status: 'OPEN',
      filedAt: completeIncident.reportedAt,
      slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      slaBreached: false,
      history: [
        {
          timestamp: completeIncident.reportedAt,
          action: 'Complaint generated via CivicPulse AI ingestion pipeline',
          actor: 'CivicPulse Citizen Portal'
        },
        {
          timestamp: completeIncident.reportedAt,
          action: `AI Classification: ${completeIncident.severity} (Score ${completeIncident.priorityDetails.overallScore}/100)`,
          actor: 'CivicPulse Neural Model v4.2'
        }
      ],
      draftDetails: {
        draftId: `DFT-BBMP-2026-${randomTicket}`,
        status: 'READY_TO_SUBMIT',
        generatedAt: completeIncident.reportedAt,
        recommendedAction: 'Emergency cold-mix pothole compaction within 24h as per IRC-SP-100.',
        slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        watermark: 'AI-generated — review before submission.'
      }
    };
    setComplaints(prev => [newComplaint, ...prev]);

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
        loadDemoCase,
        resetDemo
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
