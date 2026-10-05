import React from 'react';
import {
  CheckCircle2,
  Clock,
  Wrench,
  ShieldCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { IncidentStatus, Complaint } from '../../types';

export type TrackingStage = 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';

interface ComplaintTrackingStepperProps {
  status: IncidentStatus | Complaint['status'] | string;
  filedAt?: string;
  assignedAuthority?: string;
  contractorName?: string;
  resolvedAt?: string;
  slaBreached?: boolean;
  compact?: boolean;
  className?: string;
}

export const mapStatusToTrackingStage = (status: string): {
  stage: TrackingStage;
  stepIndex: number; // 0, 1, 2, 3
  label: string;
} => {
  switch (status) {
    case 'REPORTED':
    case 'OPEN':
      return { stage: 'REPORTED', stepIndex: 0, label: 'Reported' };
    
    case 'TRIAGED':
    case 'TENDER_ASSIGNED':
    case 'ACKNOWLEDGED':
    case 'ESCALATED_L2':
      return { stage: 'ASSIGNED', stepIndex: 1, label: 'Assigned' };
    
    case 'WORK_IN_PROGRESS':
    case 'ESCALATED_L3':
      return { stage: 'IN_PROGRESS', stepIndex: 2, label: 'In Progress' };
    
    case 'REPAIRED':
    case 'AI_VERIFIED':
    case 'RESOLVED':
      return { stage: 'RESOLVED', stepIndex: 3, label: 'Resolved' };
    
    default:
      return { stage: 'REPORTED', stepIndex: 0, label: 'Reported' };
  }
};

export const ComplaintTrackingStepper: React.FC<ComplaintTrackingStepperProps> = ({
  status,
  filedAt,
  assignedAuthority = 'BBMP Road Infrastructure Dept',
  contractorName,
  resolvedAt,
  slaBreached = false,
  compact = false,
  className = ''
}) => {
  const { stepIndex } = mapStatusToTrackingStage(status);

  const stages = [
    {
      key: 'REPORTED',
      title: 'Reported',
      subtitle: filedAt ? new Date(filedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'AI Verified Ingestion',
      icon: Clock,
      description: 'Logged via Multimodal Ingestion (Photo/Voice/Text) & Geotagged'
    },
    {
      key: 'ASSIGNED',
      title: 'Assigned',
      subtitle: assignedAuthority.split(' ')[0] || 'BBMP Roads',
      icon: ArrowRight,
      description: `Routed to ${assignedAuthority}${contractorName ? ` (${contractorName})` : ''}`
    },
    {
      key: 'IN_PROGRESS',
      title: 'In Progress',
      subtitle: stepIndex >= 2 ? 'Crew Mobilized' : 'Pending Queue',
      icon: Wrench,
      description: 'Hot-mix asphalt dispatch & rapid road resurfacing crew active'
    },
    {
      key: 'RESOLVED',
      title: 'Resolved',
      subtitle: stepIndex === 3 ? (resolvedAt ? new Date(resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'AI Certified') : 'Post-Repair Audit',
      icon: ShieldCheck,
      description: 'Dual-photo AI vision smoothness audit passed & citizen certified'
    }
  ];

  if (compact) {
    return (
      <div className={`p-3 rounded-xl bg-white/[0.02] border border-white/10 ${className}`}>
        <div className="flex items-center justify-between gap-1">
          {stages.map((st, idx) => {
            const isCompleted = idx < stepIndex;
            const isCurrent = idx === stepIndex;

            return (
              <React.Fragment key={st.key}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-all
                      ${isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isCurrent
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_#00F0FF]'
                        : 'bg-white/5 text-slate-500 border border-white/10'
                      }
                    `}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-mono font-medium ${
                      isCurrent ? 'text-cyan-300 font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded transition-all ${
                      idx < stepIndex ? 'bg-emerald-500/50' : 'bg-white/10'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl bg-[#080B15] border border-white/10 shadow-lg ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            WebNova 4-Stage Lifecycle Tracking
          </span>
        </div>
        {slaBreached ? (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold animate-pulse">
            <AlertCircle className="w-3 h-3" />
            SLA ESCALATED
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            SLA WITHIN COMPLIANCE
          </span>
        )}
      </div>

      {/* 4-Stage Visual Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative">
        {stages.map((st, idx) => {
          const isCompleted = idx < stepIndex;
          const isCurrent = idx === stepIndex;
          const Icon = st.icon;

          return (
            <div
              key={st.key}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative
                ${isCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                  : isCurrent
                  ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.15)] ring-1 ring-cyan-500/40'
                  : 'bg-white/[0.02] border-white/5 opacity-60'
                }
              `}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                    isCurrent ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    Stage 0{idx + 1}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isCurrent
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <div className="font-bold text-sm text-white">{st.title}</div>
                <div className="text-[11px] font-mono text-cyan-300 mt-0.5 truncate">{st.subtitle}</div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {st.description}
                </p>
              </div>

              {/* Status pill at bottom */}
              <div className="mt-3 pt-2.5 border-t border-white/5">
                <span className={`text-[10px] font-mono font-bold uppercase ${
                  isCompleted ? 'text-emerald-400' : isCurrent ? 'text-cyan-400' : 'text-slate-600'
                }`}>
                  {isCompleted ? '✓ Completed' : isCurrent ? '● Active Now' : '○ Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
