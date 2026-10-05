import React, { useState } from 'react';
import {
  FileText,
  Clock,
  ThumbsUp,
  CheckCircle2,
  Filter,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Complaint } from '../types';
import { formatDateTime } from '../utils/formatters';
import { ComplaintTrackingStepper } from '../components/common/ComplaintTrackingStepper';
import { DepartmentRoutingBadge } from '../components/common/DepartmentRoutingBadge';

export const ComplaintsPage: React.FC = () => {
  const {
    complaints,
    incidents,
    selectIncidentById,
    upvoteComplaint
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'OPEN':
        return { label: 'Open Grievance', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'ACKNOWLEDGED':
        return { label: 'AEE Acknowledged', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'ESCALATED_L2':
        return { label: 'Escalated to Zonal Commissioner', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' };
      case 'ESCALATED_L3':
        return { label: 'Chief Commissioner Escalation', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'RESOLVED':
        return { label: 'AI Verified Resolved', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      default:
        return { label: status, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-xs font-mono text-amber-300 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>BBMP SAHAYA GATEWAY INTEGRATION</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Citizen Grievance & SLA Tracking
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Standardized workflow formatting for municipal grievance tracking. Incidents are structured to support SLA monitoring and automated escalation routing.
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sahaya Gateway Synced</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          STATUS:
        </span>
        {['ALL', 'OPEN', 'ACKNOWLEDGED', 'ESCALATED_L2', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all
              ${statusFilter === st
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_#00F0FF]'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }
            `}
          >
            {st === 'ALL' ? 'All Grievances' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.map((complaint) => {
          const matchingIncident = incidents.find(i => i.id === complaint.incidentId || i.sahayaTicketNo === complaint.sahayaTicketNo);
          const badge = getStatusBadge(complaint.status);

          return (
            <div
              key={complaint.id}
              className="p-5 rounded-2xl bg-[#090C16] border border-white/10 hover:border-cyan-500/30 transition-all shadow-xl space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    {complaint.sahayaTicketNo}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs border ${badge.color}`}>
                    {badge.label}
                  </span>
                  {complaint.slaBreached && (
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                      SLA BREACHED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Filed: {formatDateTime(complaint.filedAt)}</span>
                </div>
              </div>

              {/* Road & Pothole Details */}
              {matchingIncident && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div>
                    <h3 className="text-sm font-bold text-white">{matchingIncident.roadName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {matchingIncident.landmark} • Ward {matchingIncident.wardNumber} ({matchingIncident.wardName})
                    </p>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">SEVERITY</span>
                      <span className="font-bold text-red-400">{matchingIncident.severity}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">AI SCORE</span>
                      <span className="font-bold text-cyan-400">{matchingIncident.priorityDetails.overallScore}/100</span>
                    </div>
                    <button
                      onClick={() => selectIncidentById(matchingIncident.id, 'INCIDENT_DETAIL')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-500/30 font-bold transition-all text-xs"
                    >
                      Investigate
                    </button>
                  </div>
                </div>
              )}

              {/* WebNova 4-Stage Lifecycle Stepper */}
              <ComplaintTrackingStepper
                status={complaint.status}
                filedAt={complaint.filedAt}
                assignedAuthority={matchingIncident?.authorityName || 'BBMP Major Roads Division'}
                contractorName={matchingIncident?.contractorName}
                slaBreached={complaint.slaBreached}
                compact={false}
              />

              {/* Department Routing Desk */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <DepartmentRoutingBadge
                  department={matchingIncident?.authorityId?.includes('BMRCL') ? 'BMRCL' : matchingIncident?.authorityId?.includes('BWSSB') ? 'BWSSB' : matchingIncident?.authorityId?.includes('BESCOM') ? 'BESCOM' : 'BBMP'}
                  roadName={matchingIncident?.roadName}
                  compact={true}
                />
              </div>

              {/* Citizen & Upvote Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Complainant: <strong className="text-slate-200">{complaint.citizenName}</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-400">
                    <strong className="text-amber-300 font-bold">{complaint.upvotes}</strong> citizen upvotes
                  </span>
                  <button
                    onClick={() => upvoteComplaint(complaint.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-500/30 font-bold transition-all cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Upvote Complaint</span>
                  </button>
                </div>
              </div>

              {/* Timeline Accordion Snippet */}
              <div className="border-t border-white/5 pt-3">
                <div className="text-[11px] font-mono text-slate-500 mb-2">LATEST MUNICIPAL ACTION:</div>
                {complaint.history.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>{complaint.history[complaint.history.length - 1].action}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({complaint.history[complaint.history.length - 1].actor})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
