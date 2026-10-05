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
import { getSeverityColor, getStatusBadge } from '../utils/formatters';
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
        <p className="text-slate-400 font-mono">No incident selected for investigation.</p>
        <button
          onClick={() => setCurrentView('GODS_EYE')}
          className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
        >
          Return to God’s Eye
        </button>
      </div>
    );
  }

  const matchingComplaint = complaints.find(c => c.incidentId === selectedIncident.id || c.sahayaTicketNo === selectedIncident.sahayaTicketNo);
  const matchingContractor = contractors.find(c => c.name === selectedIncident.contractorName || c.id === selectedIncident.contractorId);
  const matchingWard = wards.find(w => w.number === selectedIncident.wardNumber);

  const sevColor = getSeverityColor(selectedIncident.severity);
  const statusInfo = getStatusBadge(selectedIncident.status);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Incident Link Copied', `Case ${selectedIncident.code} copied to clipboard`, 'success');
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto text-left animate-in fade-in duration-300">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('GODS_EYE')}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>BACK TO GOD’S EYE RADAR</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('VERIFICATION')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono text-emerald-300 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Repair Verification Lab</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Share Case</span>
          </button>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="p-6 rounded-2xl bg-[#0B0E1B] border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg sm:text-xl font-extrabold text-white">
              {selectedIncident.code}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${sevColor.bg} ${sevColor.text} border ${sevColor.border}`}>
              {selectedIncident.severity} HAZARD
            </span>
            <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-white/5 border border-white/10 text-slate-400">
              {selectedIncident.dataSource === 'VERIFIED_OFFICIAL' ? 'VERIFIED OFFICIAL DATA' : 'DEMO INFERENCE DATA'}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">AI PRIORITY SCORE</span>
              <span className="text-xl font-extrabold text-cyan-400">
                {selectedIncident.priorityDetails.overallScore}/100
              </span>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">{selectedIncident.roadName}</h1>
          <p className="text-sm text-slate-300 mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>{selectedIncident.landmark} — Ward {selectedIncident.wardNumber} ({selectedIncident.wardName}), {selectedIncident.zone} Zone</span>
          </p>
        </div>

        {/* Contractor Warranty Highlight Banner - Neutral Defensible Language */}
        {selectedIncident.isUnderWarranty ? (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-start gap-3 text-xs">
            <ShieldAlert className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-300">
                ROAD PROJECT UNDER ACTIVE CONTRACTOR WARRANTY (DEFECT LIABILITY CLAUSE 45.2)
              </div>
              <p className="text-slate-300 mt-0.5 leading-relaxed font-sans">
                Road project associated with this location was recorded under contract <strong className="text-white font-mono">{selectedIncident.contractId || 'BBMP/WO-88/2024'}</strong>. Contractor associated with the recorded road project: <strong className="text-white">{selectedIncident.contractorName}</strong> is legally obligated under Clause 45.2 to rectify this defect at <strong className="text-emerald-400">ZERO cost to the public exchequer</strong> within 48 hours of notification.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300">BBMP PWD MAINTENANCE JURISDICTION</div>
              <p className="text-slate-300 mt-0.5 leading-relaxed font-sans">
                Road project warranty has expired. Pothole assigned to BBMP Zonal Road Infrastructure rapid patching crew.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* WebNova 4-Stage Lifecycle Tracking Stepper */}
      <ComplaintTrackingStepper
        status={selectedIncident.status}
        filedAt={selectedIncident.reportedAt}
        assignedAuthority={selectedIncident.authorityName}
        contractorName={selectedIncident.contractorName}
        resolvedAt={selectedIncident.repairVerification?.repairedAt}
        slaBreached={matchingComplaint?.slaBreached}
      />

      {/* 2 Column Details: Visual Evidence & Legal/Engineering Record */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 cols: Visual Evidence & Mini Map */}
        <div className="lg:col-span-6 space-y-6">
          {/* Image Evidence Box */}
          <div className="rounded-2xl border border-white/10 bg-[#090C16] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Geotagged Photographic Audit
              </span>

              {/* Image Tabs */}
              <div className="flex bg-white/5 rounded-lg p-0.5 text-xs font-mono">
                <button
                  onClick={() => setActiveImageTab('ORIGINAL')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${activeImageTab === 'ORIGINAL' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Original
                </button>
                <button
                  onClick={() => setActiveImageTab('HEATMAP')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${activeImageTab === 'HEATMAP' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  3D Depth
                </button>
                {selectedIncident.repairVerification && (
                  <button
                    onClick={() => setActiveImageTab('REPAIRED')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${activeImageTab === 'REPAIRED' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Repaired Audit
                  </button>
                )}
              </div>
            </div>

            {/* Display Image */}
            <div className="relative rounded-xl overflow-hidden h-72 border border-white/10 bg-black">
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
                className="absolute border-2 border-red-500/80 bg-red-500/10 rounded-lg pointer-events-none"
                style={{ top: '25%', left: '25%', width: '50%', height: '50%' }}
              >
                <div className="absolute top-2 left-2 font-mono text-[10px] font-bold text-red-300 bg-black/70 px-1.5 py-0.5 rounded">
                  DEPTH: {selectedIncident.depthCm}cm
                </div>
              </div>
            </div>

            {/* Metric Strip */}
            <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <div>
                <span className="text-[10px] text-slate-500 block">DEPTH</span>
                <span className="font-bold text-red-400">{selectedIncident.depthCm} cm</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">CRATER AREA</span>
                <span className="font-bold text-slate-200">{selectedIncident.surfaceAreaSqM} m²</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">BITUMEN VOL</span>
                <span className="font-bold text-cyan-400">{selectedIncident.estimatedVolumeLiters} L</span>
              </div>
            </div>
          </div>

          {/* Merged Duplicate Citizen Reports */}
          {selectedIncident.supportingReports && selectedIncident.supportingReports.length > 0 && (
            <div className="rounded-2xl border border-purple-500/30 bg-[#090C16] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-300 font-bold flex items-center gap-1.5">
                  <GitMerge className="w-3.5 h-3.5" />
                  Cluster Duplication: {selectedIncident.supportingReports.length} Merged Reports
                </span>
                <span className="text-cyan-400 font-mono">Cluster Radius: &lt;15m</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {selectedIncident.supportingReports.map((r, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <strong className="text-white">{r.citizenName}</strong>: <span className="text-slate-400 font-sans">"{r.notes}"</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-[10px]">{r.similarityScore}% match</span>
                  </div>
                ))}
              </div>

              <div className="p-2 rounded-lg bg-purple-950/20 border border-purple-500/20 text-[11px] font-sans text-slate-300">
                <strong className="text-purple-300 font-mono">Why duplicate?</strong> 15 m spatial proximity + 94% visual feature similarity merged {selectedIncident.supportingReports.length} reports into 1 master record.
              </div>
            </div>
          )}

          {/* Mini Geospatial Map */}
          <div className="rounded-2xl border border-white/10 bg-[#090C16] p-4 space-y-3">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider block">
              Exact Geolocation (GPS Coordinates)
            </span>
            <div className="h-44 rounded-xl overflow-hidden border border-white/10">
              <BengaluruMap
                incidents={[selectedIncident]}
                selectedIncidentId={selectedIncident.id}
                height="100%"
              />
            </div>
            <div className="font-mono text-[11px] text-slate-400 flex justify-between">
              <span>LAT: {selectedIncident.coordinates.lat.toFixed(5)}° N</span>
              <span>LNG: {selectedIncident.coordinates.lng.toFixed(5)}° E</span>
            </div>
          </div>
        </div>

        {/* Right 6 cols: Contractor Accountability, Sahaya Grievance & Timeline */}
        <div className="lg:col-span-6 space-y-6">
          {/* Interactive Explainable Priority Scoring */}
          <PriorityExplainer
            priorityDetails={selectedIncident.priorityDetails}
            overallScore={selectedIncident.priorityDetails.overallScore}
          />

          {/* Contractor & Engineering Record */}
          <div className="rounded-2xl border border-white/10 bg-[#090C16] p-5 space-y-4">
            <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Contractor & BBMP Administration</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-500">ASSOCIATED ROAD CONTRACTOR</div>
                  <div className="font-bold text-white mt-0.5">{selectedIncident.contractorName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Reg: {matchingContractor?.registrationNumber || 'PWD/KP/2021'} • Quality Score: {matchingContractor?.qualityScore || 68}/100
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('CONTRACTORS')}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-400 text-[11px] font-mono border border-white/10"
                >
                  Scorecard
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-[10px] font-mono text-slate-500">BBMP WARD ENGINEERING DESK</div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">CHIEF ENGINEER</span>
                    <span className="font-semibold text-white">{matchingWard?.chiefEngineer || 'Er. R. Manjunath'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">AEE IN-CHARGE</span>
                    <span className="font-semibold text-white">{matchingWard?.assistantExecutiveEngineer || 'Er. K. Ramesh'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WebNova Department Routing Desk */}
          <DepartmentRoutingBadge
            department={selectedIncident.authorityId?.includes('BMRCL') ? 'BMRCL' : selectedIncident.authorityId?.includes('BWSSB') ? 'BWSSB' : selectedIncident.authorityId?.includes('BESCOM') ? 'BESCOM' : 'BBMP'}
            roadName={selectedIncident.roadName}
            nodalOfficer={matchingWard?.chiefEngineer || 'Sri B. S. Prahlad, Chief Engineer (Roads)'}
            routingReason={selectedIncident.isUnderWarranty ? 'Corridor under active road contractor Defect Liability Period (Clause 45.2). Routed to BBMP Major Roads Division for warranty enforcement.' : 'Arterial roadway under BBMP PWD jurisdiction. Routed to Zonal Rapid Patching Unit.'}
          />

          {/* Citizen Community Grievance & Sahaya Sync */}
          <div className="rounded-2xl border border-white/10 bg-[#090C16] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>BBMP Sahaya Grievance Registry</span>
              </h3>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                {selectedIncident.sahayaTicketNo}
              </span>
            </div>

            {/* Upvote Call to Action */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Citizen Community Weight</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Every upvote raises the incident’s algorithmic priority in the BBMP Commissioner's daily dispatch order.
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0"
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
