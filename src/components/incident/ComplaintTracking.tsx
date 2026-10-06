import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Cpu,
  Wrench,
  Send,
  ShieldCheck,
  Circle,
} from 'lucide-react';
import { Complaint, IncidentStatus } from '../../types';
import { formatDateTime } from '../../utils/formatters';

interface ComplaintTrackingProps {
  complaint: Complaint | undefined;
  incidentStatus: IncidentStatus;
}

type TrackStep = {
  key: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  completedBg: string;
  activeBg: string;
  completedText: string;
};

const TRACK_STEPS: TrackStep[] = [
  {
    key: 'REPORTED',
    label: 'Reported',
    sublabel: 'Citizen filed complaint',
    icon: <Send className="w-4 h-4" />,
    completedBg: 'bg-slate-500',
    activeBg: 'bg-cyan-500',
    completedText: 'text-slate-400',
  },
  {
    key: 'TRIAGED',
    label: 'Assigned',
    sublabel: 'AI triaged & authority notified',
    icon: <Cpu className="w-4 h-4" />,
    completedBg: 'bg-purple-500',
    activeBg: 'bg-purple-400',
    completedText: 'text-purple-400',
  },
  {
    key: 'WORK_IN_PROGRESS',
    label: 'In Progress',
    sublabel: 'Crew on site',
    icon: <Wrench className="w-4 h-4" />,
    completedBg: 'bg-amber-500',
    activeBg: 'bg-amber-400',
    completedText: 'text-amber-400',
  },
  {
    key: 'REPAIRED',
    label: 'Resolved',
    sublabel: 'Repair submitted',
    icon: <CheckCircle2 className="w-4 h-4" />,
    completedBg: 'bg-teal-500',
    activeBg: 'bg-teal-400',
    completedText: 'text-teal-400',
  },
  {
    key: 'AI_VERIFIED',
    label: 'AI Verified',
    sublabel: 'Computer vision audit passed',
    icon: <ShieldCheck className="w-4 h-4" />,
    completedBg: 'bg-emerald-500',
    activeBg: 'bg-emerald-400',
    completedText: 'text-emerald-400',
  },
];

const STATUS_ORDER: IncidentStatus[] = [
  'REPORTED',
  'TRIAGED',
  'TENDER_ASSIGNED',
  'WORK_IN_PROGRESS',
  'REPAIRED',
  'AI_VERIFIED',
];

// Map incident status to track step key
function getStepIndex(status: IncidentStatus): number {
  const map: Record<IncidentStatus, number> = {
    REPORTED: 0,
    TRIAGED: 1,
    TENDER_ASSIGNED: 1,
    WORK_IN_PROGRESS: 2,
    REPAIRED: 3,
    AI_VERIFIED: 4,
  };
  return map[status] ?? 0;
}

export const ComplaintTracking: React.FC<ComplaintTrackingProps> = ({ complaint, incidentStatus }) => {
  const currentStepIndex = getStepIndex(incidentStatus);

  const getStatusBadge = (status: Complaint['status']) => {
    const map: Record<Complaint['status'], { label: string; color: string }> = {
      OPEN: { label: 'Open', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
      ACKNOWLEDGED: { label: 'AEE Acknowledged', color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
      ESCALATED_L2: { label: 'Zonal Commissioner', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
      ESCALATED_L3: { label: 'Chief Commissioner', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
      RESOLVED: { label: 'Resolved', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    };
    return map[status] ?? { label: status, color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' };
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090C16] overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white">Complaint Tracking</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Full lifecycle status timeline</p>
          </div>
        </div>
        {complaint && (
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-500">SAHAYA TICKET</div>
            <div className="text-xs font-mono font-bold text-amber-300">{complaint.sahayaTicketNo}</div>
          </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Progress Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/5" />
          <div
            className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${(currentStepIndex / (TRACK_STEPS.length - 1)) * 100}%` }}
          />

          <div className="relative flex justify-between">
            {TRACK_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              const isPending = idx > currentStepIndex;

              return (
                <div key={step.key} className="flex flex-col items-center gap-2" style={{ width: `${100 / TRACK_STEPS.length}%` }}>
                  {/* Circle */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-slate-950 transition-all duration-500 z-10
                    ${isCompleted
                      ? `${step.completedBg} shadow-[0_0_12px_rgba(16,185,129,0.4)]`
                      : isActive
                      ? `${step.activeBg} shadow-[0_0_16px_rgba(0,240,255,0.5)] animate-pulse`
                      : 'bg-slate-800 text-slate-500'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : isActive ? (
                      <span className="text-white">{step.icon}</span>
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  {/* Labels */}
                  <div className="text-center">
                    <div className={`text-[11px] font-bold font-mono ${isCompleted ? step.completedText : isActive ? 'text-white' : 'text-slate-600'}`}>
                      {step.label}
                    </div>
                    <div className={`text-[9px] font-mono leading-tight mt-0.5 hidden sm:block ${isPending ? 'text-slate-700' : 'text-slate-500'}`}>
                      {step.sublabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLA indicator */}
        {complaint && (
          <div className={`flex items-center justify-between p-3 rounded-xl text-xs font-mono border ${
            complaint.slaBreached
              ? 'bg-red-950/20 border-red-500/30'
              : 'bg-white/[0.02] border-white/5'
          }`}>
            <div className="flex items-center gap-2">
              {complaint.slaBreached ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className={complaint.slaBreached ? 'text-red-300' : 'text-slate-300'}>
                SLA Deadline: {formatDateTime(complaint.slaDeadline)}
              </span>
            </div>
            <span className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
              complaint.slaBreached
                ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {complaint.slaBreached ? 'SLA BREACHED' : 'ON TIME'}
            </span>
          </div>
        )}

        {/* Timeline history */}
        {complaint && complaint.history.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Incident Lifecycle</div>

            <div className="relative pl-5 space-y-0 border-l border-white/10 ml-2">
              {complaint.history.map((item, idx) => {
                const isLast = idx === complaint.history.length - 1;
                const dotColor = isLast
                  ? 'bg-cyan-400 shadow-[0_0_8px_#00F0FF]'
                  : 'bg-slate-600';

                return (
                  <div key={idx} className={`relative pb-4 ${isLast ? 'pb-0' : ''}`}>
                    {/* Timeline dot */}
                    <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#090C16] ${dotColor}`} />

                    <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl p-3 transition-colors">
                      {/* Status badge */}
                      {item.status && (
                        <div className="mb-1.5">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(item.status as Complaint['status']).color}`}>
                            {getStatusBadge(item.status as Complaint['status']).label}
                          </span>
                        </div>
                      )}

                      <div className="text-xs font-semibold text-slate-100">{item.action}</div>

                      {item.notes && (
                        <div className="text-[10px] text-slate-400 mt-1 italic">{item.notes}</div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1.5">
                        <span>{formatDateTime(item.timestamp)}</span>
                        <span>•</span>
                        <span className="text-cyan-400/80">{item.actor}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!complaint && (
          <div className="py-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 font-mono">No complaint filed yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">Report this incident to begin tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Re-export STATUS_ORDER if needed
export { STATUS_ORDER };
