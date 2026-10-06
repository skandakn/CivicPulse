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
      subtitle: filedAt ? new Date(filedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'AI Ingestion',
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
      <div className={`p-3 bg-white brut-sm ${className}`}>
        <div className="flex items-center justify-between gap-1">
          {stages.map((st, idx) => {
            const isCompleted = idx < stepIndex;
            const isCurrent = idx === stepIndex;

            return (
              <React.Fragment key={st.key}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 border-2 border-[#121210] flex items-center justify-center text-[10px] font-mono font-black transition-all
                      ${isCompleted
                        ? 'bg-[#2E8C42] text-white'
                        : isCurrent
                        ? 'bg-[#E8A030] text-[#121210]'
                        : 'bg-white text-[#4A4A46]'
                      }
                    `}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-mono font-bold ${
                      isCurrent ? 'text-[#121210] underline' : isCompleted ? 'text-[#121210]' : 'text-[#4A4A46]'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      idx < stepIndex ? 'bg-[#2E8C42]' : 'bg-[#121210]'
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
    <div className={`p-5 bg-white brut text-left ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#121210] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#2E8C42] border border-[#121210]" />
          <span className="font-display text-xs font-black uppercase tracking-wider text-[#121210]">
            Lifecycle Pipeline Tracking
          </span>
        </div>
        {slaBreached ? (
          <span className="tag bg-[#C03A3A] text-white font-mono text-[10px] font-black flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            SLA ESCALATED
          </span>
        ) : (
          <span className="tag bg-[#CFE8D6] text-[#121210] font-mono text-[10px] font-black">
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
              className={`p-4 border-2 border-[#121210] transition-all flex flex-col justify-between relative
                ${isCompleted
                  ? 'bg-[#CFE8D6]/40 shadow-[2px_2px_0_#121210]'
                  : isCurrent
                  ? 'bg-white shadow-[4px_4px_0_#121210] ring-2 ring-[#121210]'
                  : 'bg-[#CFE8D6]/10 opacity-70'
                }
              `}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase font-black tracking-wider text-[#4A4A46]">
                    Stage 0{idx + 1}
                  </span>
                  <div
                    className={`w-7 h-7 border-2 border-[#121210] flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-[#2E8C42] text-white'
                        : isCurrent
                        ? 'bg-[#E8A030] text-[#121210]'
                        : 'bg-white text-[#4A4A46]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <div className="font-display font-black text-sm text-[#121210]">{st.title}</div>
                <div className="text-[11px] font-mono font-bold text-[#121210] mt-0.5 truncate">{st.subtitle}</div>
                <p className="font-body text-[11px] text-[#4A4A46] mt-2 leading-relaxed">
                  {st.description}
                </p>
              </div>

              {/* Status pill at bottom */}
              <div className="mt-3 pt-2.5 border-t border-[#121210]">
                <span className={`text-[10px] font-mono font-black uppercase ${
                  isCompleted ? 'text-[#2E8C42]' : isCurrent ? 'text-[#121210] font-black' : 'text-[#4A4A46]'
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
