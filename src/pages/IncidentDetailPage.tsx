import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  ThumbsUp,
  AlertTriangle,
  Building2,
  FileText,
  ArrowLeft,
  Share2,
  GitMerge,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getStatusBadge } from '../utils/formatters';
import { BengaluruMap } from '../components/map/BengaluruMap';
import { PriorityExplainer } from '../components/incident/PriorityExplainer';
import { ComplaintGenerator } from '../components/incident/ComplaintGenerator';
import { ComplaintTrackingStepper } from '../components/common/ComplaintTrackingStepper';
import { DepartmentRoutingBadge } from '../components/common/DepartmentRoutingBadge';

export const IncidentDetailPage: React.FC = () => {
  const {
    selectedIncident,
    setCurrentView,
    upvoteComplaint,
    complaints,
    contractors,
    wards,
    addToast
  } = useApp();

  const [activeImageTab, setActiveImageTab] = useState<'ORIGINAL' | 'HEATMAP' | 'REPAIRED'>('ORIGINAL');

  if (!selectedIncident) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="font-mono text-sm text-[#121210]/60">No incident selected for investigation.</p>
        <button
          onClick={() => setCurrentView('PRIORITY_QUEUE')}
          className="brut bg-[#121210] text-white px-5 py-2 font-display font-bold text-xs btn-press cursor-pointer"
        >
          RETURN TO INBOX
        </button>
      </div>
    );
  }

  const matchingComplaint = complaints.find(c => c.incidentId === selectedIncident.id || c.sahayaTicketNo === selectedIncident.sahayaTicketNo);
  const matchingContractor = contractors.find(c => c.name === selectedIncident.contractorName || c.id === selectedIncident.contractorId);
  const matchingWard = wards.find(w => w.number === selectedIncident.wardNumber);

  const statusInfo = getStatusBadge(selectedIncident.status);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Incident Link Copied', `Case ${selectedIncident.code} copied to clipboard`, 'success');
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto text-left">
      {/* Top Navigation Row matching Approva */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('PRIORITY_QUEUE')}
          className="brut-sm bg-white hover:bg-zinc-100 px-3.5 py-1.5 font-display font-extrabold text-xs text-[#121210] flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← BACK TO APPROVER INBOX</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('VERIFICATION')}
            className="brut-sm bg-[#2E8C42] text-white hover:bg-black px-3 py-1.5 font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Verification Lab</span>
          </button>
          <button
            onClick={handleShare}
            className="brut-sm bg-white hover:bg-zinc-100 px-3 py-1.5 font-display font-bold text-xs text-[#121210] flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Case</span>
          </button>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="brut-lg bg-white p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#121210] pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#121210]">
              WO-2026-{selectedIncident.code.replace('BLR-', '')}
            </span>
            <span className={`tag ${selectedIncident.severity === 'CRITICAL' ? 'bg-[#C03A3A] text-white' : 'bg-[#E8A030] text-[#121210]'}`}>
              {selectedIncident.severity} HAZARD
            </span>
            <span className="tag bg-[#CFE8D6] text-[#121210]">
              {statusInfo.label}
            </span>
            <span className="tag bg-white text-[#121210]">
              {selectedIncident.dataSource === 'VERIFIED_OFFICIAL' ? 'VERIFIED OFFICIAL PWD' : 'AI RADAR TELEMETRY'}
            </span>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-[#121210]/60 block font-bold">ALGORITHMIC PRIORITY</span>
            <span className="text-2xl font-extrabold text-[#121210]">
              {selectedIncident.priorityDetails.overallScore}
              <span className="text-xs text-[#121210]/60 font-normal">/100</span>
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#121210]">
            {selectedIncident.roadName}
          </h1>
          <p className="text-sm font-body text-[#121210]/70 mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#121210] shrink-0" />
            <span>{selectedIncident.landmark} — Ward {selectedIncident.wardNumber} ({selectedIncident.wardName}), {selectedIncident.zone} Zone</span>
          </p>
        </div>

        {/* Contractor Warranty Highlight Banner in Approva Brutalist box */}
        {selectedIncident.isUnderWarranty ? (
          <div className="brut bg-[#CFE8D6] p-4 border-[#2E8C42] flex items-start gap-3 text-xs">
            <ShieldAlert className="w-5 h-5 text-[#2E8C42] shrink-0 mt-0.5 stroke-[2.5]" />
            <div>
              <div className="font-display font-extrabold text-sm text-[#121210]">
                ACTIVE CONTRACTOR WARRANTY (DEFECT LIABILITY PERIOD CLAUSE 45.2)
              </div>
              <p className="text-[#121210]/85 mt-1 leading-relaxed font-body">
                Road project associated with this location was recorded under contract <strong className="font-mono bg-white px-1 border border-[#121210]">{selectedIncident.contractId || 'BBMP/WO-88/2024'}</strong>. Contractor <strong className="underline">{selectedIncident.contractorName}</strong> is legally obligated under Karnataka PWD Clause 45.2 to rectify this defect at <strong className="text-[#2E8C42] font-bold">ZERO cost to public taxpayers</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="brut bg-[#F4D89A] p-4 border-[#E8A030] flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-[#121210] shrink-0 mt-0.5" />
            <div>
              <div className="font-display font-extrabold text-sm text-[#121210]">
                BBMP PWD MAINTENANCE JURISDICTION (WARRANTY EXPIRED)
              </div>
              <p className="text-[#121210]/85 mt-1 leading-relaxed font-body">
                Road project warranty has expired. Pothole assigned to BBMP Zonal Road Infrastructure rapid patching tender unit.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4-Stage Lifecycle Stepper in Brutalist frame */}
      <div className="brut bg-white p-5">
        <div className="font-mono text-[10px] font-bold text-[#121210]/60 uppercase tracking-widest mb-3">
          MUNICIPAL WORK ORDER LIFECYCLE
        </div>
        <ComplaintTrackingStepper
          status={selectedIncident.status}
          filedAt={selectedIncident.reportedAt}
          assignedAuthority={selectedIncident.authorityName}
          contractorName={selectedIncident.contractorName}
          resolvedAt={selectedIncident.repairVerification?.repairedAt}
          slaBreached={matchingComplaint?.slaBreached}
        />
      </div>

      {/* 2 Column Details: Visual Evidence & Legal/Engineering Record */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: Visual Evidence & Mini Map */}
        <div className="lg:col-span-6 space-y-6">
          {/* Image Evidence Box */}
          <div className="brut bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
              <span className="font-display font-extrabold text-sm text-[#121210] uppercase">
                Geotagged Visual Evidence
              </span>

              {/* Image Tabs matching Approva */}
              <div className="flex gap-1 text-xs font-mono">
                <button
                  onClick={() => setActiveImageTab('ORIGINAL')}
                  className={`px-2 py-0.5 border border-[#121210] font-bold cursor-pointer transition-colors ${
                    activeImageTab === 'ORIGINAL' ? 'bg-[#121210] text-white' : 'bg-white text-[#121210]'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setActiveImageTab('HEATMAP')}
                  className={`px-2 py-0.5 border border-[#121210] font-bold cursor-pointer transition-colors ${
                    activeImageTab === 'HEATMAP' ? 'bg-[#121210] text-white' : 'bg-white text-[#121210]'
                  }`}
                >
                  3D Depth
                </button>
                {selectedIncident.repairVerification && (
                  <button
                    onClick={() => setActiveImageTab('REPAIRED')}
                    className={`px-2 py-0.5 border border-[#121210] font-bold cursor-pointer transition-colors ${
                      activeImageTab === 'REPAIRED' ? 'bg-[#2E8C42] text-white' : 'bg-white text-[#121210]'
                    }`}
                  >
                    Repaired Audit
                  </button>
                )}
              </div>
            </div>

            {/* Display Image with brutalist border */}
            <div className="relative overflow-hidden h-72 border-2 border-[#121210] bg-black">
              <img
                src={
                  activeImageTab === 'REPAIRED' && selectedIncident.repairVerification
                    ? selectedIncident.repairVerification.contractorSubmittedPhoto
                    : selectedIncident.images.original
                }
                alt={selectedIncident.roadName}
                className="w-full h-full object-cover"
              />

              {activeImageTab === 'HEATMAP' && (
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/40 via-amber-500/25 to-transparent mix-blend-overlay pointer-events-none" />
              )}

              {/* Bounding box marker */}
              <div
                className="absolute border-2 border-[#121210] bg-[#C03A3A]/20 pointer-events-none"
                style={{ top: '25%', left: '25%', width: '50%', height: '50%' }}
              >
                <div className="absolute top-2 left-2 font-mono text-[10px] font-bold text-white bg-[#121210] px-1.5 py-0.5">
                  DEPTH: {selectedIncident.depthCm}cm
                </div>
              </div>
            </div>

            {/* Metric Strip */}
            <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs bg-[#CFE8D6]/30 p-2.5 border-2 border-[#121210]">
              <div>
                <span className="text-[10px] text-[#121210]/60 block font-bold">DEPTH</span>
                <span className="font-extrabold text-[#C03A3A]">{selectedIncident.depthCm} cm</span>
              </div>
              <div>
                <span className="text-[10px] text-[#121210]/60 block font-bold">CRATER AREA</span>
                <span className="font-bold text-[#121210]">{selectedIncident.surfaceAreaSqM} m²</span>
              </div>
              <div>
                <span className="text-[10px] text-[#121210]/60 block font-bold">BITUMEN VOL</span>
                <span className="font-bold text-[#121210]">{selectedIncident.estimatedVolumeLiters} L</span>
              </div>
            </div>
          </div>

          {/* Merged Duplicate Citizen Reports */}
          {selectedIncident.supportingReports && selectedIncident.supportingReports.length > 0 && (
            <div className="brut bg-white p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono border-b-2 border-[#121210] pb-2">
                <span className="text-[#121210] font-bold flex items-center gap-1.5">
                  <GitMerge className="w-4 h-4" />
                  Cluster Duplication: {selectedIncident.supportingReports.length} Merged Reports
                </span>
                <span className="tag bg-[#CFE8D6]">RADIUS &lt;15m</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {selectedIncident.supportingReports.map((r, i) => (
                  <div key={i} className="p-2 border border-[#121210] bg-[#CFE8D6]/20 flex items-center justify-between">
                    <div>
                      <strong className="text-[#121210]">{r.citizenName}</strong>: <span className="text-[#121210]/70 font-sans">"{r.notes}"</span>
                    </div>
                    <span className="font-bold text-[10px] bg-[#121210] text-white px-1">{r.similarityScore}% match</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini Geospatial Map */}
          <div className="brut bg-white p-5 space-y-3">
            <span className="font-display font-extrabold text-sm text-[#121210] uppercase block">
              Exact GPS Geolocation
            </span>
            <div className="h-44 border-2 border-[#121210] overflow-hidden">
              <BengaluruMap
                incidents={[selectedIncident]}
                selectedIncidentId={selectedIncident.id}
                height="100%"
              />
            </div>
            <div className="font-mono text-[11px] text-[#121210]/70 flex justify-between font-bold">
              <span>LAT: {selectedIncident.coordinates.lat.toFixed(5)}° N</span>
              <span>LNG: {selectedIncident.coordinates.lng.toFixed(5)}° E</span>
            </div>
          </div>
        </div>

        {/* Right 6 cols: Contractor Accountability, Sahaya Grievance & Timeline */}
        <div className="lg:col-span-6 space-y-6">
          {/* Interactive Explainable Priority Scoring */}
          <div className="brut bg-white p-5">
            <PriorityExplainer
              priorityDetails={selectedIncident.priorityDetails}
              overallScore={selectedIncident.priorityDetails.overallScore}
            />
          </div>

          {/* Contractor & Engineering Record */}
          <div className="brut bg-white p-5 space-y-4">
            <h3 className="font-display font-extrabold text-sm text-[#121210] uppercase flex items-center gap-2 border-b-2 border-[#121210] pb-2">
              <Building2 className="w-4 h-4 text-[#121210]" />
              <span>Contractor & BBMP Administration</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 border-2 border-[#121210] bg-[#CFE8D6]/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#121210]/60 font-bold uppercase">ASSOCIATED CONTRACTOR</div>
                  <div className="font-display font-extrabold text-base text-[#121210] mt-0.5">{selectedIncident.contractorName}</div>
                  <div className="text-[11px] text-[#121210]/70 font-mono mt-0.5">
                    Reg: {matchingContractor?.registrationNumber || 'PWD/KP/2021'} · Score: {matchingContractor?.qualityScore || 68}/100
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('CONTRACTORS')}
                  className="brut-sm bg-white hover:bg-zinc-100 px-3 py-1 text-xs font-mono font-bold cursor-pointer"
                >
                  Scorecard
                </button>
              </div>

              <div className="p-3 border-2 border-[#121210] bg-white space-y-2">
                <div className="text-[10px] font-mono text-[#121210]/60 font-bold uppercase">BBMP WARD DESK</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#121210]/60 block text-[10px] font-mono">CHIEF ENGINEER</span>
                    <span className="font-bold text-[#121210]">{matchingWard?.chiefEngineer || 'Er. R. Manjunath'}</span>
                  </div>
                  <div>
                    <span className="text-[#121210]/60 block text-[10px] font-mono">AEE IN-CHARGE</span>
                    <span className="font-bold text-[#121210]">{matchingWard?.assistantExecutiveEngineer || 'Er. K. Ramesh'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Routing Desk */}
          <div className="brut bg-white p-5">
            <DepartmentRoutingBadge
              department={selectedIncident.authorityId?.includes('BMRCL') ? 'BMRCL' : selectedIncident.authorityId?.includes('BWSSB') ? 'BWSSB' : selectedIncident.authorityId?.includes('BESCOM') ? 'BESCOM' : 'BBMP'}
              roadName={selectedIncident.roadName}
              nodalOfficer={matchingWard?.chiefEngineer || 'Sri B. S. Prahlad, Chief Engineer (Roads)'}
              routingReason={selectedIncident.isUnderWarranty ? 'Corridor under active Defect Liability Period (Clause 45.2). Routed to BBMP Major Roads for warranty repair mandate.' : 'Arterial roadway under BBMP PWD jurisdiction.'}
            />
          </div>

          {/* Citizen Community Grievance & Sahaya Sync */}
          <div className="brut bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
              <h3 className="font-display font-extrabold text-sm text-[#121210] uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#121210]" />
                <span>BBMP Sahaya Grievance Registry</span>
              </h3>
              <span className="tag bg-[#E8A030] text-[#121210]">
                {selectedIncident.sahayaTicketNo}
              </span>
            </div>

            {/* Upvote Call to Action */}
            <div className="p-4 border-2 border-[#121210] bg-[#CFE8D6]/40 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-display font-bold text-[#121210] flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-[#121210]" />
                  <span>Citizen Upvote Priority Boost</span>
                </div>
                <p className="text-[11px] font-body text-[#121210]/70 mt-0.5">
                  Each citizen upvote elevates this ticket’s rank in the Commissioner's dispatch order.
                </p>
              </div>

              <button
                onClick={() => {
                  if (matchingComplaint) {
                    upvoteComplaint(matchingComplaint.id);
                  } else {
                    addToast('Upvote Registered', 'Priority incremented', 'success');
                  }
                }}
                className="brut bg-[#2E8C42] text-white hover:bg-black px-4 py-2 font-display font-extrabold text-xs btn-press cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Upvote ({selectedIncident.upvotes})</span>
              </button>
            </div>

            {/* Official AI Civic Complaint Generator */}
            <ComplaintGenerator incident={selectedIncident} />
          </div>
        </div>
      </div>
    </div>
  );
};
