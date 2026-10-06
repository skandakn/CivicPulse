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
  tagBg: string;
  tagColor: string;
  defaultNodal: string;
  defaultReason: string;
}> = {
  BBMP: {
    name: 'BBMP',
    fullName: 'Bruhat Bengaluru Mahanagara Palike',
    division: 'Major Roads & Infrastructure Division',
    icon: Building2,
    tagBg: 'bg-[#CFE8D6]',
    tagColor: 'text-[#121210]',
    defaultNodal: 'Sri B. S. Prahlad, Chief Engineer (Roads)',
    defaultReason: 'Classified as Arterial / Sub-Arterial road under BBMP DLP Warranty'
  },
  BMRCL: {
    name: 'BMRCL',
    fullName: 'Bangalore Metro Rail Corporation Limited',
    division: 'Namma Metro Infrastructure & Alignment',
    icon: Train,
    tagBg: 'bg-[#CFE8D6]',
    tagColor: 'text-[#121210]',
    defaultNodal: 'Sri V. Ravichandran, GM Infrastructure',
    defaultReason: 'Metro Phase 2A/2B alignment corridor under BMRCL maintenance covenant'
  },
  BWSSB: {
    name: 'BWSSB',
    fullName: 'Bangalore Water Supply and Sewerage Board',
    division: 'Water Supply Pipeline & Drainage Restorations',
    icon: Droplets,
    tagBg: 'bg-[#CFE8D6]',
    tagColor: 'text-[#121210]',
    defaultNodal: 'Sri R. Manjunath, SE Water Supply Infrastructure',
    defaultReason: 'Defect induced by pipeline trenching or sewerage cut-and-cover work'
  },
  BESCOM: {
    name: 'BESCOM',
    fullName: 'Bangalore Electricity Supply Company Limited',
    division: 'Underground Cable Trenching & Utility Restorations',
    icon: Zap,
    tagBg: 'bg-[#E8A030]',
    tagColor: 'text-[#121210]',
    defaultNodal: 'Sri T. Narayana, SE Electrical Infrastructure',
    defaultReason: 'Underground HT/LT power cable laying work requiring road reinstatement'
  },
  BDA: {
    name: 'BDA',
    fullName: 'Bangalore Development Authority',
    division: 'Peripheral Ring Road & Layout Arterials',
    icon: MapPin,
    tagBg: 'bg-[#2E8C42]',
    tagColor: 'text-white',
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
  const normalizedDept = (department && department.toUpperCase() in DEPARTMENT_METADATA
    ? department.toUpperCase()
    : 'BBMP') as MunicipalDepartment;

  const meta = DEPARTMENT_METADATA[normalizedDept];
  const Icon = meta.icon;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-white brut-sm ${className}`}>
        <Icon className="w-3.5 h-3.5 text-[#121210]" />
        <span className="font-mono text-xs font-black text-[#121210]">
          {meta.name}
        </span>
        <span className="text-[10px] text-[#4A4A46] font-mono">
          · {meta.division.split('&')[0]}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white brut text-left ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#121210]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#CFE8D6] border-2 border-[#121210] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#121210]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`tag ${meta.tagBg} ${meta.tagColor} font-mono text-xs font-black`}>
                {meta.name}
              </span>
              <span className="stamp border-[#2E8C42] text-[#2E8C42] text-[10px] font-black">
                OFFICIAL JURISDICTION
              </span>
            </div>
            <div className="font-display text-sm font-black text-[#121210] mt-1">
              {meta.fullName}
            </div>
            {roadName && (
              <div className="text-[11px] text-[#4A4A46] font-mono mt-0.5">
                Corridor: <span className="font-bold text-[#121210]">{roadName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-[#4A4A46] text-[10px] font-bold uppercase block">MUNICIPAL DESK</span>
          <span className="text-[#121210] font-black">{meta.division}</span>
        </div>
      </div>

      {/* Nodal Officer & Routing Justification */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[#CFE8D6]/30 border-2 border-[#121210] space-y-1">
          <div className="flex items-center gap-1.5 text-[#4A4A46] text-[10px] font-mono font-bold uppercase">
            <UserCheck className="w-3.5 h-3.5 text-[#2E8C42]" />
            <span>DESIGNATED NODAL OFFICER</span>
          </div>
          <div className="text-[#121210] font-bold">
            {nodalOfficer || meta.defaultNodal}
          </div>
          {contactNumber && (
            <div className="text-[11px] font-mono font-bold text-[#2E8C42]">
              Helpline: {contactNumber}
            </div>
          )}
        </div>

        <div className="p-3 bg-[#CFE8D6]/30 border-2 border-[#121210] space-y-1">
          <div className="flex items-center gap-1.5 text-[#4A4A46] text-[10px] font-mono font-bold uppercase">
            <ShieldAlert className="w-3.5 h-3.5 text-[#E8A030]" />
            <span>AUTOMATED ROUTING RATIONALE</span>
          </div>
          <div className="font-body text-[#121210] text-[11px] leading-relaxed">
            {routingReason || meta.defaultReason}
          </div>
        </div>
      </div>
    </div>
  );
};
