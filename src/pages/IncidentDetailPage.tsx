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
        <p className="font-mono text-sm text-[#777b86]">No incident selected for investigation.</p>
        <button
          onClick={() => setCurrentView('PRIORITY_QUEUE')}
          className="rounded-full bg-[#17191c] text-white px-6 py-2.5 font-medium text-xs hover:bg-black transition-colors cursor-pointer"
        >
          Return to Inbox
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
    <div className="space-y-6 pb-20 max-w-[1200px] mx-auto text-left">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('PRIORITY_QUEUE')}
          className="rounded-full bg-white border border-[#17191c]/10 hover:bg-[#fafafb] px-4 py-2 text-xs text-[#17191c] flex items-center gap-2 transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Approver Inbox</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('VERIFICATION')}
            className="rounded-full bg-[#17191c] text-white hover:bg-black px-4 py-2 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Verification Lab</span>
          </button>
          <button
            onClick={handleShare}
            className="rounded-full bg-white border border-[#17191c]/10 hover:bg-[#fafafb] px-4 py-2 text-xs text-[#17191c] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#777b86]" />
            <span>Share Case</span>
          </button>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#17191c]/8 pb-5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xl sm:text-2xl font-medium text-[#17191c]">
              WO-2026-{selectedIncident.code.replace('BLR-', '')}
            </span>
            <span className={`text-[11px] font-mono px-3 py-1 rounded-full ${
              selectedIncident.severity === 'CRITICAL' ? 'bg-[#fbe1d1] text-[#5d2a1a]' : 'bg-[#f2f2f3] text-[#17191c]'
            }`}>
              {selectedIncident.severity} Hazard
            </span>
            <span className="text-[11px] font-mono bg-[#f2f2f3] text-[#17191c] px-3 py-1 rounded-full">
              {statusInfo.label}
            </span>
            <span className="text-[11px] font-mono bg-[#fafafb] text-[#777b86] px-3 py-1 rounded-full border border-[#17191c]/5">
              {selectedIncident.dataSource === 'VERIFIED_OFFICIAL' ? 'Verified Official PWD' : 'AI Radar Telemetry'}
            </span>
          </div>

          <div className="text-right font-mono">
            <span className="text-[11px] text-[#979799] block">Algorithmic Priority</span>
            <span className="text-2xl font-medium text-[#17191c]">
              {selectedIncident.priorityDetails.overallScore}
              <span className="text-xs text-[#777b86] font-normal"> / 100</span>
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#17191c]">
            {selectedIncident.roadName}
          </h1>
          <p className="text-xs sm:text-sm text-[#777b86] mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#777b86] shrink-0" />
            <span>{selectedIncident.landmark} — Ward {selectedIncident.wardNumber} ({selectedIncident.wardName}), {selectedIncident.zone} Zone</span>
          </p>
        </div>

        {/* Contractor Warranty Highlight Banner in Steep Peach card */}
        {selectedIncident.isUnderWarranty ? (
          <div className="steep-peach-card p-5 rounded-[20px] border border-[#5d2a1a]/15 flex items-start gap-3.5 text-xs">
            <ShieldAlert className="w-5 h-5 text-[#5d2a1a] shrink-0 mt-0.5 stroke-[2]" />
            <div>
              <div className="font-serif text-base text-[#5d2a1a]">
                Active Contractor Warranty (Clause 45.2 Statutory Mandate)
              </div>
              <p className="text-[#5d2a1a]/85 mt-1 leading-relaxed">
                Road project associated with this location was recorded under contract <strong className="font-mono bg-white/70 px-1.5 py-0.5 rounded text-[#5d2a1a]">{selectedIncident.contractId || 'BBMP/WO-88/2024'}</strong>. Contractor <strong>{selectedIncident.contractorName}</strong> is legally obligated under Karnataka PWD Clause 45.2 to rectify this defect at <strong className="text-[#5d2a1a] underline">zero cost to public taxpayers</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-[20px] bg-[#fafafb] p-5 border border-[#17191c]/8 flex items-start gap-3.5 text-xs text-[#777b86]">
            <AlertTriangle className="w-5 h-5 text-[#777b86] shrink-0 mt-0.5" />
            <div>
              <div className="font-serif text-base text-[#17191c]">
                BBMP PWD Maintenance Jurisdiction (Warranty Expired)
              </div>
              <p className="mt-1 leading-relaxed">
                Road project warranty has expired. Pothole assigned to BBMP Zonal Road Infrastructure rapid patching tender unit.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4-Stage Lifecycle Stepper in Clean Card */}
      <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 shadow-sm">
        <div className="text-[11px] font-mono text-[#979799] uppercase tracking-wider mb-4">
          Municipal Work Order Lifecycle
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
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-3">
              <span className="font-serif text-base text-[#17191c]">
                Geotagged Visual Evidence
              </span>

              {/* Image Tabs */}
              <div className="flex gap-1.5 text-xs font-mono">
                <button
                  onClick={() => setActiveImageTab('ORIGINAL')}
                  className={`px-3 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                    activeImageTab === 'ORIGINAL' ? 'bg-[#17191c] text-white' : 'bg-[#f2f2f3] text-[#777b86] hover:text-[#17191c]'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setActiveImageTab('HEATMAP')}
                  className={`px-3 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                    activeImageTab === 'HEATMAP' ? 'bg-[#17191c] text-white' : 'bg-[#f2f2f3] text-[#777b86] hover:text-[#17191c]'
                  }`}
                >
                  3D Depth
                </button>
                {selectedIncident.repairVerification && (
                  <button
                    onClick={() => setActiveImageTab('REPAIRED')}
                    className={`px-3 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                      activeImageTab === 'REPAIRED' ? 'bg-[#17191c] text-white' : 'bg-[#f2f2f3] text-[#777b86] hover:text-[#17191c]'
                    }`}
                  >
                    Repaired Audit
                  </button>
                )}
              </div>
            </div>

            {/* Display Image with rounded corners */}
            <div className="relative overflow-hidden h-72 rounded-[16px] bg-black">
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
                className="absolute border border-white/80 bg-black/25 backdrop-blur-[2px] rounded-lg pointer-events-none"
                style={{ top: '25%', left: '25%', width: '50%', height: '50%' }}
              >
                <div className="absolute top-2 left-2 font-mono text-[10px] text-white bg-[#17191c]/90 px-2 py-0.5 rounded-full">
                  Depth: {selectedIncident.depthCm}cm
                </div>
              </div>
            </div>

            {/* Metric Strip */}
            <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs bg-[#fafafb] p-3.5 rounded-[16px] border border-[#17191c]/5">
              <div>
                <span className="text-[10px] text-[#979799] block uppercase">Depth</span>
                <span className="font-medium text-[#17191c]">{selectedIncident.depthCm} cm</span>
              </div>
              <div>
                <span className="text-[10px] text-[#979799] block uppercase">Crater Area</span>
                <span className="font-medium text-[#17191c]">{selectedIncident.surfaceAreaSqM} m²</span>
              </div>
              <div>
                <span className="text-[10px] text-[#979799] block uppercase">Bitumen Vol</span>
                <span className="font-medium text-[#17191c]">{selectedIncident.estimatedVolumeLiters} L</span>
              </div>
            </div>
          </div>

          {/* Merged Duplicate Citizen Reports */}
          {selectedIncident.supportingReports && selectedIncident.supportingReports.length > 0 && (
            <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono border-b border-[#17191c]/8 pb-2">
                <span className="text-[#17191c] font-medium flex items-center gap-1.5">
                  <GitMerge className="w-4 h-4 text-[#777b86]" />
                  Cluster Duplication: {selectedIncident.supportingReports.length} Merged Reports
                </span>
                <span className="text-[10px] bg-[#f2f2f3] text-[#777b86] px-2 py-0.5 rounded-full">Radius &lt; 15m</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {selectedIncident.supportingReports.map((r, i) => (
                  <div key={i} className="p-3 rounded-[12px] bg-[#fafafb] border border-[#17191c]/5 flex items-center justify-between">
                    <div>
                      <strong className="text-[#17191c]">{r.citizenName}</strong>: <span className="text-[#777b86] font-sans">"{r.notes}"</span>
                    </div>
                    <span className="text-[10px] bg-[#17191c] text-white px-2 py-0.5 rounded-full">{r.similarityScore}% match</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini Geospatial Map */}
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 space-y-3 shadow-sm">
            <span className="font-serif text-base text-[#17191c] block">
              Exact GPS Geolocation
            </span>
            <div className="h-44 rounded-[16px] overflow-hidden border border-[#17191c]/8">
              <BengaluruMap
                incidents={[selectedIncident]}
                selectedIncidentId={selectedIncident.id}
                height="100%"
              />
            </div>
            <div className="font-mono text-[11px] text-[#777b86] flex justify-between">
              <span>Lat: {selectedIncident.coordinates.lat.toFixed(5)}° N</span>
              <span>Lng: {selectedIncident.coordinates.lng.toFixed(5)}° E</span>
            </div>
          </div>
        </div>

        {/* Right 6 cols: Contractor Accountability, Sahaya Grievance & Timeline */}
        <div className="lg:col-span-6 space-y-6">
          {/* Interactive Explainable Priority Scoring */}
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 shadow-sm">
            <PriorityExplainer
              priorityDetails={selectedIncident.priorityDetails}
              overallScore={selectedIncident.priorityDetails.overallScore}
            />
          </div>

          {/* Contractor & Engineering Record */}
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 space-y-4 shadow-sm">
            <h3 className="font-serif text-base text-[#17191c] flex items-center gap-2 border-b border-[#17191c]/8 pb-3">
              <Building2 className="w-4 h-4 text-[#777b86]" />
              <span>Contractor & BBMP Administration</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-[16px] bg-[#fafafb] border border-[#17191c]/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#979799] uppercase">Associated Contractor</div>
                  <div className="font-medium text-sm text-[#17191c] mt-0.5">{selectedIncident.contractorName}</div>
                  <div className="text-[11px] text-[#777b86] font-mono mt-0.5">
                    Reg: {matchingContractor?.registrationNumber || 'PWD/KP/2021'} · Score: {matchingContractor?.qualityScore || 68}/100
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('CONTRACTORS')}
                  className="rounded-full bg-white border border-[#17191c]/10 hover:bg-[#fafafb] px-3.5 py-1 text-xs font-mono cursor-pointer transition-colors"
                >
                  Scorecard →
                </button>
              </div>

              <div className="p-4 rounded-[16px] bg-[#fafafb] border border-[#17191c]/5 space-y-2">
                <div className="text-[10px] font-mono text-[#979799] uppercase">BBMP Ward Desk</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#979799] block text-[10px] font-mono">CHIEF ENGINEER</span>
                    <span className="font-medium text-[#17191c]">{matchingWard?.chiefEngineer || 'Er. R. Manjunath'}</span>
                  </div>
                  <div>
                    <span className="text-[#979799] block text-[10px] font-mono">AEE IN-CHARGE</span>
                    <span className="font-medium text-[#17191c]">{matchingWard?.assistantExecutiveEngineer || 'Er. K. Ramesh'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Routing Desk */}
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 shadow-sm">
            <DepartmentRoutingBadge
              department={selectedIncident.authorityId?.includes('BMRCL') ? 'BMRCL' : selectedIncident.authorityId?.includes('BWSSB') ? 'BWSSB' : selectedIncident.authorityId?.includes('BESCOM') ? 'BESCOM' : 'BBMP'}
              roadName={selectedIncident.roadName}
              nodalOfficer={matchingWard?.chiefEngineer || 'Sri B. S. Prahlad, Chief Engineer (Roads)'}
              routingReason={selectedIncident.isUnderWarranty ? 'Corridor under active Defect Liability Period (Clause 45.2). Routed to BBMP Major Roads for warranty repair mandate.' : 'Arterial roadway under BBMP PWD jurisdiction.'}
            />
          </div>

          {/* Citizen Community Grievance & Sahaya Sync */}
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-3">
              <h3 className="font-serif text-base text-[#17191c] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#777b86]" />
                <span>BBMP Sahaya Grievance Registry</span>
              </h3>
              <span className="text-xs font-mono bg-[#f2f2f3] text-[#17191c] px-3 py-0.5 rounded-full">
                #{selectedIncident.sahayaTicketNo}
              </span>
            </div>

            {/* Upvote Call to Action */}
            <div className="p-4 rounded-[16px] bg-[#fafafb] border border-[#17191c]/5 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-[#17191c] flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-[#777b86]" />
                  <span>Citizen Upvote Priority Boost</span>
                </div>
                <p className="text-[11px] text-[#777b86] mt-0.5 leading-relaxed">
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
                className="rounded-full bg-[#17191c] text-white hover:bg-black px-4 py-2 font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
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

