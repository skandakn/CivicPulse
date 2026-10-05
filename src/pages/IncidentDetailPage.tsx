import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  Calendar,
  ThumbsUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  User,
  ExternalLink,
  Cpu,
  ArrowLeft,
  Share2,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSeverityColor, getStatusBadge, formatDate, formatDateTime } from '../utils/formatters';
import { BengaluruMap } from '../components/map/BengaluruMap';

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
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>BACK TO GOD’S EYE RADAR</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Share Case</span>
          </button>
          <button
            onClick={() => {
              addToast('Work Order Generated', `BBMP Work Order generated for ${selectedIncident.code}`, 'success');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono text-cyan-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export BBMP PWD Notice</span>
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
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">AI PRIORITY INDEX</span>
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

        {/* Contractor Warranty Highlight Banner */}
        {selectedIncident.isUnderWarranty ? (
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-start gap-3 text-xs">
            <ShieldAlert className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-300">
                ACTIVE CONTRACTOR WARRANTY (DEFECT LIABILITY PERIOD CLAUSE 45.2)
              </div>
              <p className="text-slate-300 mt-0.5">
                Contractor <strong className="text-white">{selectedIncident.contractorName}</strong> is legally obligated to repair this defect at <strong className="text-emerald-400">ZERO cost to the public exchequer</strong> within 48 hours of notification.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300">BBMP PWD MAINTENANCE JURISDICTION</div>
              <p className="text-slate-300 mt-0.5">
                Road defect liability period expired. Assigned to BBMP Zonal Road Infrastructure rapid patching crew.
              </p>
            </div>
          </div>
        )}
      </div>

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

          {/* Mini Geospatial Map */}
          <div className="rounded-2xl border border-white/10 bg-[#090C16] p-4 space-y-3">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider block">
              Exact Geolocation (GPS Coordinates)
            </span>
            <div className="h-48 rounded-xl overflow-hidden border border-white/10">
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
          {/* Contractor & Engineering Record */}
          <div className="rounded-2xl border border-white/10 bg-[#090C16] p-5 space-y-4">
            <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Contractor & BBMP Administration</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-500">ASSIGNED ROAD CONTRACTOR</div>
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

            {/* Audit History Timeline */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Incident Lifecycle & Escalation History
              </span>

              <div className="relative pl-6 space-y-4 border-l border-white/10 ml-2 text-xs">
                {(matchingComplaint?.history || [
                  { timestamp: selectedIncident.reportedAt, action: 'Complaint filed via CivicPulse with geotagged imagery', actor: 'Citizen Reporter' },
                  { timestamp: selectedIncident.lastUpdatedAt, action: 'AI computer vision triaged severity and depth stereopsis', actor: 'AI Vision Auditor v4.2' }
                ]).map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-cyan-400 border-2 border-[#090C16] shadow-[0_0_8px_#00F0FF]" />
                    <div className="font-semibold text-slate-100">{item.action}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>{formatDateTime(item.timestamp)}</span>
                      <span>•</span>
                      <span className="text-cyan-400">{item.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
