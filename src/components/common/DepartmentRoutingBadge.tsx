import React from 'react';
import {
  Building2,
  Train,
  Droplets,
  Zap,
  MapPin,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

export type MunicipalDepartment = 'BBMP' | 'BMRCL' | 'BWSSB' | 'BESCOM' | 'BDA';

interface DepartmentRoutingBadgeProps {
  department: MunicipalDepartment | string;
  roadName?: string;
  nodalOfficer?: string;
  routingReason?: string;
  contactNumber?: string;
  compact?: boolean;
  className?: string;
}

const DEPARTMENT_METADATA: Record<MunicipalDepartment, {
  name: string;
  fullName: string;
  division: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  border: string;
  badgeBg: string;
  defaultNodal: string;
  defaultReason: string;
}> = {
  BBMP: {
    name: 'BBMP',
    fullName: 'Bruhat Bengaluru Mahanagara Palike',
    division: 'Major Roads & Infrastructure Division',
    icon: Building2,
    color: 'text-cyan-300',
    border: 'border-cyan-500/30',
    badgeBg: 'bg-cyan-950/40',
    defaultNodal: 'Sri B. S. Prahlad, Chief Engineer (Roads)',
    defaultReason: 'Classified as Arterial / Sub-Arterial road under BBMP DLP Warranty'
  },
  BMRCL: {
    name: 'BMRCL',
    fullName: 'Bangalore Metro Rail Corporation Limited',
    division: 'Namma Metro Infrastructure & Alignment',
    icon: Train,
    color: 'text-purple-300',
    border: 'border-purple-500/30',
    badgeBg: 'bg-purple-950/40',
    defaultNodal: 'Sri V. Ravichandran, GM Infrastructure',
    defaultReason: 'Metro Phase 2A/2B alignment corridor under BMRCL maintenance covenant'
  },
  BWSSB: {
    name: 'BWSSB',
    fullName: 'Bangalore Water Supply and Sewerage Board',
    division: 'Water Supply Pipeline & Drainage Restorations',
    icon: Droplets,
    color: 'text-sky-300',
    border: 'border-sky-500/30',
    badgeBg: 'bg-sky-950/40',
    defaultNodal: 'Sri R. Manjunath, SE Water Supply Infrastructure',
    defaultReason: 'Defect induced by pipeline trenching or sewerage cut-and-cover work'
  },
  BESCOM: {
    name: 'BESCOM',
    fullName: 'Bangalore Electricity Supply Company Limited',
    division: 'Underground Cable Trenching & Utility Restorations',
    icon: Zap,
    color: 'text-amber-300',
    border: 'border-amber-500/30',
    badgeBg: 'bg-amber-950/40',
    defaultNodal: 'Sri T. Narayana, SE Electrical Infrastructure',
    defaultReason: 'Underground HT/LT power cable laying work requiring road reinstatement'
  },
  BDA: {
    name: 'BDA',
    fullName: 'Bangalore Development Authority',
    division: 'Peripheral Ring Road & Layout Arterials',
    icon: MapPin,
    color: 'text-emerald-300',
    border: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-950/40',
    defaultNodal: 'Executive Engineer (BDA Engineering Division)',
    defaultReason: 'Corridor located within BDA layout boundary prior to civic handover'
  }
};

export const DepartmentRoutingBadge: React.FC<DepartmentRoutingBadgeProps> = ({
  department,
  roadName,
  nodalOfficer,
  routingReason,
  contactNumber,
  compact = false,
  className = ''
}) => {
  // Normalize acronym
  const normalizedDept = (department.toUpperCase() in DEPARTMENT_METADATA
    ? department.toUpperCase()
    : 'BBMP') as MunicipalDepartment;

  const meta = DEPARTMENT_METADATA[normalizedDept];
  const Icon = meta.icon;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${meta.badgeBg} border ${meta.border} ${className}`}>
        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
        <span className={`font-mono text-xs font-bold ${meta.color}`}>
          {meta.name}
        </span>
        <span className="text-[10px] text-slate-400">
          • {meta.division.split('&')[0]}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl ${meta.badgeBg} border ${meta.border} text-left shadow-lg ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shadow-inner`}>
            <Icon className={`w-5 h-5 ${meta.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm font-extrabold ${meta.color}`}>
                {meta.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                OFFICIAL JURISDICTION
              </span>
            </div>
            <div className="text-xs font-semibold text-white mt-0.5">
              {meta.fullName}
            </div>
            {roadName && (
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Corridor: {roadName}
              </div>
            )}
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-slate-400 text-[10px] block">MUNICIPAL DESK</span>
          <span className="text-slate-200 font-semibold">{meta.division}</span>
        </div>
      </div>

      {/* Nodal Officer & Routing Justification */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>DESIGNATED NODAL OFFICER</span>
          </div>
          <div className="text-slate-200 font-medium">
            {nodalOfficer || meta.defaultNodal}
          </div>
          {contactNumber && (
            <div className="text-[11px] font-mono text-cyan-400">
              Helpline: {contactNumber}
            </div>
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>AUTOMATED ROUTING RATIONALE</span>
          </div>
          <div className="text-slate-300 text-[11px] leading-relaxed">
            {routingReason || meta.defaultReason}
          </div>
        </div>
      </div>
    </div>
  );
};
