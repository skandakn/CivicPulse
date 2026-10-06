import React, { useState } from 'react';
import {
  Clock,
  ThumbsUp,
  CheckCircle2,
  Filter,
  MessageSquare,
  AlertTriangle,
  ArrowRight
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
        return { label: 'Open Grievance', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'ACKNOWLEDGED':
        return { label: 'AEE Acknowledged', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'ESCALATED_L2':
        return { label: 'Zonal Commissioner Escalation', color: 'bg-[#5d2a1a]/10 text-[#5d2a1a] border-[#5d2a1a]/20 font-medium' };
      case 'ESCALATED_L3':
        return { label: 'Chief Commissioner Escalation', color: 'bg-[#17191c] text-white border-transparent' };
      case 'RESOLVED':
        return { label: 'AI Verified Resolved', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      default:
        return { label: status, color: 'bg-stone-50 text-[#17191c] border-stone-200' };
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto text-left">
      {/* Editorial Header */}
      <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#17191c]/8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-[#f2f2f3] text-[#777b86]">
                BBMP Sahaya 2.0 Integration
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-[#fbe1d1] text-[#5d2a1a]">
                SLA Enforcement
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#17191c] tracking-tight">
              Citizen Grievances &amp; <span className="italic">SLA Escalations</span>
            </h1>
            <p className="text-sm font-sans text-[#777b86] mt-2 max-w-2xl leading-relaxed">
              Live sync with Karnataka BBMP Sahaya 2.0 portal. Potholes with breached SLAs automatically trigger escalation to Zonal Commissioners.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-[#fafafb] border border-[#17191c]/10 px-4 py-2 font-mono text-xs text-[#17191c]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#777b86]">Gateway:</span>
            <span className="font-semibold text-[#17191c]">Synchronized</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-[#777b86] mr-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            Filter Status:
          </span>
          {['ALL', 'OPEN', 'ACKNOWLEDGED', 'ESCALATED_L2', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#17191c] text-white shadow-sm'
                  : 'bg-transparent text-[#777b86] border border-[#17191c]/15 hover:text-[#17191c] hover:border-[#17191c]'
              }`}
            >
              {st === 'ALL' ? 'All Grievances' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List in Steep Editorial Cards */}
      <div className="space-y-4">
        {filteredComplaints.map((complaint) => {
          const matchingIncident = incidents.find(i => i.id === complaint.incidentId || i.sahayaTicketNo === complaint.sahayaTicketNo);
          const badge = getStatusBadge(complaint.status);

          return (
            <div
              key={complaint.id}
              className="rounded-[24px] p-6 space-y-5 bg-white border border-[#17191c]/8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:border-[#17191c]/20 transition-all"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#17191c]/8">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-[#17191c] bg-[#f2f2f3] px-3 py-1 rounded-full border border-[#17191c]/10">
                    {complaint.sahayaTicketNo}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs border font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                  {complaint.slaBreached && (
                    <span className="px-3 py-1 rounded-full text-xs bg-[#fbe1d1] text-[#5d2a1a] border border-[#5d2a1a]/20 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-[#5d2a1a]" />
                      SLA Breached (+24h)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-[#777b86]">
                  <Clock className="w-3.5 h-3.5 text-[#777b86]" />
                  <span>Filed {formatDateTime(complaint.filedAt)}</span>
                </div>
              </div>

              {/* Road & Pothole Details Fragment */}
              {matchingIncident && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#fafafb] border border-[#17191c]/8">
                  <div>
                    <h3 className="font-serif text-lg text-[#17191c] font-normal">
                      {matchingIncident.roadName}
                    </h3>
                    <p className="text-xs font-sans text-[#777b86] mt-0.5">
                      {matchingIncident.landmark} · Ward {matchingIncident.wardNumber} ({matchingIncident.wardName})
                    </p>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[#777b86] block font-mono uppercase tracking-wider">Severity</span>
                      <span className="font-semibold text-rose-700">{matchingIncident.severity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#777b86] block font-mono uppercase tracking-wider">AI Score</span>
                      <span className="font-serif text-base text-[#17191c]">
                        {matchingIncident.priorityDetails.overallScore}/100
                      </span>
                    </div>
                    <button
                      onClick={() => selectIncidentById(matchingIncident.id, 'INCIDENT_DETAIL')}
                      className="px-4 py-1.5 rounded-full bg-[#17191c] text-white hover:bg-[#2b2e33] text-xs font-sans transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Stepper */}
              <ComplaintTrackingStepper
                status={complaint.status}
                filedAt={complaint.filedAt}
                assignedAuthority={matchingIncident?.authorityName || 'BBMP Major Roads Division'}
                contractorName={matchingIncident?.contractorName}
                slaBreached={complaint.slaBreached}
                compact={false}
              />

              {/* Department Routing */}
              <div className="pt-1">
                <DepartmentRoutingBadge
                  department={matchingIncident?.authorityId?.includes('BMRCL') ? 'BMRCL' : matchingIncident?.authorityId?.includes('BWSSB') ? 'BWSSB' : matchingIncident?.authorityId?.includes('BESCOM') ? 'BESCOM' : 'BBMP'}
                  roadName={matchingIncident?.roadName}
                  compact={true}
                />
              </div>

              {/* Complainant & Upvote Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#17191c]/8 text-xs">
                <div className="flex items-center gap-2 text-[#777b86]">
                  <MessageSquare className="w-3.5 h-3.5 text-[#777b86]" />
                  <span>Complainant: <strong className="text-[#17191c] font-medium">{complaint.citizenName}</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#777b86]">
                    <strong className="text-[#17191c]">{complaint.upvotes}</strong> citizen endorsements
                  </span>
                  <button
                    onClick={() => upvoteComplaint(complaint.id)}
                    className="px-4 py-1.5 rounded-full bg-transparent border border-[#17191c]/20 hover:border-[#17191c] text-[#17191c] text-xs font-sans flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Endorse Grievance</span>
                  </button>
                </div>
              </div>

              {/* Timeline */}
              {complaint.history.length > 0 && (
                <div className="p-3 rounded-xl bg-[#fafafb] border border-[#17191c]/8 text-xs font-mono flex items-center gap-2 text-[#17191c]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[#777b86] uppercase tracking-wider text-[10px]">Latest Action:</span>
                  <span>{complaint.history[complaint.history.length - 1].action}</span>
                  <span className="text-[#777b86]">({complaint.history[complaint.history.length - 1].actor})</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
