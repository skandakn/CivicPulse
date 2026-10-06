import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  Camera,
  Scale,
  Building2,
  AlertTriangle,
  Banknote,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export interface FloatingItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  bgClass: string;
  textClass: string;
  rotationRest: number;
  rotationHover: number;
  xRest: number;
  xHover: number;
  yRest: number;
  yHover: number;
  delayMs?: number;
}

interface FolderFloatProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  items?: FloatingItem[];
  className?: string;
  onOpenDossier?: () => void;
}

const DEFAULT_ITEMS: FloatingItem[] = [
  {
    id: 'depth',
    label: 'Stereo Depth: 15.4 cm',
    icon: <Camera className="w-3.5 h-3.5" />,
    bgClass: 'bg-[#E8A030]',
    textClass: 'text-[#121210]',
    rotationRest: -4,
    rotationHover: -14,
    xRest: -60,
    xHover: -110,
    yRest: 10,
    yHover: -115,
    delayMs: 0
  },
  {
    id: 'clause',
    label: 'Clause 45.2 Zero-Cost Notice',
    icon: <Scale className="w-3.5 h-3.5" />,
    bgClass: 'bg-[#CFE8D6]',
    textClass: 'text-[#121210]',
    rotationRest: 2,
    rotationHover: -4,
    xRest: -20,
    xHover: -35,
    yRest: 0,
    yHover: -145,
    delayMs: 40
  },
  {
    id: 'grievance',
    label: '14 Sahaya Grievances Merged',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    bgClass: 'bg-white',
    textClass: 'text-[#121210]',
    rotationRest: -2,
    rotationHover: 6,
    xRest: 25,
    xHover: 55,
    yRest: 5,
    yHover: -140,
    delayMs: 80
  },
  {
    id: 'contractor',
    label: 'Contractor: Star Infratech (DLP Active)',
    icon: <Building2 className="w-3.5 h-3.5" />,
    bgClass: 'bg-white',
    textClass: 'text-[#121210]',
    rotationRest: 3,
    rotationHover: 12,
    xRest: 50,
    xHover: 105,
    yRest: 15,
    yHover: -95,
    delayMs: 120
  },
  {
    id: 'warranty',
    label: '₹48,920 Warranty Recovered',
    icon: <Banknote className="w-3.5 h-3.5" />,
    bgClass: 'bg-[#2E8C42]',
    textClass: 'text-white',
    rotationRest: 1,
    rotationHover: 2,
    xRest: 0,
    xHover: 0,
    yRest: 20,
    yHover: -60,
    delayMs: 150
  }
];

export const FolderFloat: React.FC<FolderFloatProps> = ({
  title = 'AI Evidence Dossier',
  subtitle = 'Case BNG-PTH-1042 · 14 Merged Complaints',
  badge = 'AUTO-DEDUPLICATED',
  items = DEFAULT_ITEMS,
  className = '',
  onOpenDossier
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-end pt-36 pb-4 px-4 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Notes / Tags Layer */}
      <div className="absolute inset-x-0 bottom-24 flex items-center justify-center pointer-events-none">
        {items.map((item) => {
          const x = isHovered ? item.xHover : item.xRest;
          const y = isHovered ? item.yHover : item.yRest;
          const rot = isHovered ? item.rotationHover : item.rotationRest;
          const isSelected = activeItem === item.id;

          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveItem(item.id);
              }}
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
                transition: `transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${item.delayMs || 0}ms, box-shadow 0.2s ease`
              }}
              className={`absolute pointer-events-auto cursor-pointer border-2 border-[#121210] px-3.5 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap shadow-[3px_3px_0_#121210] hover:scale-105 transition-transform ${item.bgClass} ${item.textClass} ${
                isSelected ? 'ring-2 ring-[#121210] scale-110 shadow-[5px_5px_0_#121210]' : ''
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* The Physical Folder Structure (Neo-Brutalist Boxed Aesthetic) */}
      <div
        onClick={onOpenDossier}
        className="group relative w-full max-w-[340px] cursor-pointer transition-transform duration-300"
        style={{
          transform: isHovered ? 'scale(1.02)' : 'scale(1)'
        }}
      >
        {/* Back Tab of Folder */}
        <div className="relative">
          <div className="w-28 h-6 bg-[#121210] border-t-3 border-x-3 border-[#121210] rounded-t-md ml-3 flex items-center px-2">
            <span className="text-[10px] font-mono font-black text-[#CFE8D6] uppercase tracking-wider">
              {badge}
            </span>
          </div>

          {/* Internal Document Sheets peeking out */}
          <div
            className="absolute top-2 left-4 right-4 h-12 bg-white border-2 border-[#121210] rounded-t-sm shadow-sm transition-transform duration-300"
            style={{
              transform: isHovered ? 'translateY(-12px)' : 'translateY(-2px)'
            }}
          >
            <div className="h-1.5 w-16 bg-[#CFE8D6] ml-2 mt-1.5 rounded-xs" />
            <div className="h-1 w-24 bg-[#121210]/15 ml-2 mt-1 rounded-xs" />
          </div>
          <div
            className="absolute top-3 left-6 right-6 h-10 bg-[#FAF9F5] border-2 border-[#121210] rounded-t-sm transition-transform duration-300"
            style={{
              transform: isHovered ? 'translateY(-18px) rotate(-1deg)' : 'translateY(-4px)'
            }}
          />
        </div>

        {/* Front Flap of Folder */}
        <div
          className="relative bg-[#121210] text-white p-5 border-3 border-[#121210] shadow-[6px_6px_0_#121210] group-hover:shadow-[8px_8px_0_#121210] rounded-b-md rounded-tr-md transition-all duration-300"
          style={{
            transform: isHovered ? 'rotateX(-6deg)' : 'rotateX(0deg)',
            transformOrigin: 'bottom center'
          }}
        >
          {/* Top Edge Indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#E8A030] border border-white text-[#121210] flex items-center justify-center font-bold text-xs">
                {isHovered ? <FolderOpen className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5" />}
              </div>
              <span className="font-mono text-[10px] font-bold text-[#CFE8D6] uppercase tracking-widest">
                CIVICPULSE DOSSIER
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/60">
              {items.length} EVIDENCE FILES
            </span>
          </div>

          {/* Folder Content Metadata */}
          <div className="pt-3">
            <div className="font-display font-extrabold text-base text-white tracking-tight flex items-center justify-between">
              <span>{title}</span>
              <span className="text-[#E8A030] text-xs font-mono font-bold">
                {isHovered ? 'EXPANDED' : 'HOVER TO FLOAT'}
              </span>
            </div>
            <p className="text-xs font-mono text-white/70 mt-1 leading-snug">
              {subtitle}
            </p>
          </div>

          {/* Action button inside folder */}
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#E8A030] font-bold">
              ★ STATUTORY DLP RECORD
            </span>
            <button
              type="button"
              className="px-2.5 py-1 bg-white text-[#121210] hover:bg-[#CFE8D6] font-display font-black text-[11px] uppercase border border-black flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Inspect</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Helper Subtitle */}
      <div className="mt-3 text-[11px] font-mono text-[#121210]/70 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-[#E8A030]" />
        <span>Hover over folder to float and reveal legal audit evidence</span>
      </div>
    </div>
  );
};
