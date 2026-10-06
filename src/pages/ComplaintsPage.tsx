import React, { useState } from 'react';
import {
  Clock,
  ThumbsUp,
  CheckCircle2,
  Filter,
  MessageSquare,
  AlertTriangle
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
        return { label: 'OPEN GRIEVANCE', color: 'bg-[#C03A3A] text-white' };
      case 'ACKNOWLEDGED':
        return { label: 'AEE ACKNOWLEDGED', color: 'bg-[#E8A030] text-[#121210]' };
      case 'ESCALATED_L2':
        return { label: 'ZONAL COMMISSIONER ESCALATION', color: 'bg-[#C03A3A] text-white' };
      case 'ESCALATED_L3':
        return { label: 'CHIEF COMMISSIONER ESCALATION', color: 'bg-[#121210] text-white' };
      case 'RESOLVED':
        return { label: 'AI VERIFIED RESOLVED', color: 'bg-[#2E8C42] text-white' };
      default:
        return { label: status, color: 'bg-white text-[#121210]' };
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto text-left">
      {/* Header matching Approva */}
      <div className="brut-lg bg-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-[3px] border-[#121210] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="tag bg-[#E8A030] text-[#121210]">
                BBMP SAHAYA 2.0 INTEGRATION
              </span>
              <span className="tag bg-[#CFE8D6] text-[#121210]">
                SLA ENFORCEMENT
              </span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-[#121210] tracking-tight">
              Citizen Grievances & SLA Escalations
            </h1>
            <p className="text-sm font-body text-[#121210]/70 mt-1 max-w-2xl">
              Live sync with Karnataka BBMP Sahaya 2.0 portal. Potholes with breached SLAs automatically trigger escalation to Zonal Commissioners.
            </p>
          </div>

          <div className="flex items-center gap-2 brut-sm bg-[#CFE8D6] px-3 py-1.5 font-mono text-xs font-bold text-[#121210]">
            <span className="w-2.5 h-2.5 bg-[#2E8C42] border border-[#121210]" />
            <span>SAHAYA GATEWAY: CONNECTED</span>
          </div>
        </div>

        {/* Filter Tabs in Brutalist design */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#121210] mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            FILTER STATUS:
          </span>
          {['ALL', 'OPEN', 'ACKNOWLEDGED', 'ESCALATED_L2', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 border-2 border-[#121210] text-xs font-mono font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#121210] text-white shadow-[2px_2px_0_#121210]'
                  : 'bg-white text-[#121210] hover:bg-[#CFE8D6]'
              }`}
            >
              {st === 'ALL' ? 'ALL GRIEVANCES' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List in Brutalist Cards */}
      <div className="space-y-4">
        {filteredComplaints.map((complaint) => {
          const matchingIncident = incidents.find(i => i.id === complaint.incidentId || i.sahayaTicketNo === complaint.sahayaTicketNo);
          const badge = getStatusBadge(complaint.status);

          return (
            <div
              key={complaint.id}
              className="brut-card p-5 space-y-4 bg-white"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#121210]/15 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#121210] bg-[#CFE8D6] px-2.5 py-1 border-2 border-[#121210]">
                    {complaint.sahayaTicketNo}
                  </span>
                  <span className={`tag ${badge.color}`}>
                    {badge.label}
                  </span>
                  {complaint.slaBreached && (
                    <span className="tag bg-[#C03A3A] text-white">
                      <AlertTriangle className="w-3 h-3" />
                      SLA BREACHED (+24H)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-[#121210]/70 font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#121210]" />
                  <span>FILED: {formatDateTime(complaint.filedAt)}</span>
                </div>
              </div>

              {/* Road & Pothole Details */}
              {matchingIncident && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 border-2 border-[#121210] bg-[#CFE8D6]/30">
                  <div>
                    <h3 className="font-display font-extrabold text-base text-[#121210]">
                      {matchingIncident.roadName}
                    </h3>
                    <p className="text-xs font-body text-[#121210]/70 mt-0.5">
                      {matchingIncident.landmark} · Ward {matchingIncident.wardNumber} ({matchingIncident.wardName})
                    </p>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[#121210]/60 block font-bold">SEVERITY</span>
                      <span className="font-bold text-[#C03A3A]">{matchingIncident.severity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#121210]/60 block font-bold">AI SCORE</span>
                      <span className="font-extrabold text-base text-[#121210]">
                        {matchingIncident.priorityDetails.overallScore}/100
                      </span>
                    </div>
                    <button
                      onClick={() => selectIncidentById(matchingIncident.id, 'INCIDENT_DETAIL')}
                      className="brut-sm bg-[#121210] text-white hover:bg-zinc-800 px-3 py-1 font-display font-bold text-xs cursor-pointer"
                    >
                      INVESTIGATE
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
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-[#121210]/15 text-xs">
                <div className="flex items-center gap-2 text-[#121210]/80">
                  <MessageSquare className="w-3.5 h-3.5 text-[#121210]" />
                  <span>Complainant: <strong className="text-[#121210] font-display font-bold">{complaint.citizenName}</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#121210] font-bold">
                    <strong>{complaint.upvotes}</strong> citizen upvotes
                  </span>
                  <button
                    onClick={() => upvoteComplaint(complaint.id)}
                    className="brut-sm bg-[#2E8C42] text-white hover:bg-black px-3 py-1 font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Upvote Grievance</span>
                  </button>
                </div>
              </div>

              {/* Timeline */}
              {complaint.history.length > 0 && (
                <div className="p-2 border border-[#121210] bg-[#CFE8D6]/20 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E8C42] shrink-0" />
                  <span className="font-bold text-[#121210]">LATEST ACTION:</span>
                  <span>{complaint.history[complaint.history.length - 1].action}</span>
                  <span className="text-[#121210]/60">({complaint.history[complaint.history.length - 1].actor})</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
