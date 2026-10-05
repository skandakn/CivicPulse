import React from 'react';
import {
  Compass,
  PlusCircle,
  Eye,
  Cpu,
  ListOrdered,
  FileText,
  Building2,
  BarChart3,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewMode } from '../../types';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { currentView, setCurrentView, incidents, complaints } = useApp();

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'AI_VERIFIED').length;
  const activeComplaintsCount = complaints.filter(c => c.status !== 'RESOLVED').length;

  const navItems: {
    id: ViewMode;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    { id: 'LANDING', label: 'Overview', icon: Compass },
    { id: 'REPORT', label: 'Report Pothole', icon: PlusCircle, badge: 'Live', badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' },
    { id: 'GODS_EYE', label: 'God’s Eye', icon: Eye, badge: incidents.length, badgeColor: 'bg-cyan-500/20 text-cyan-400' },
    { id: 'AI_ANALYSIS', label: 'Pothole Intelligence', icon: Cpu },
    { id: 'PRIORITY_QUEUE', label: 'Priority Queue', icon: ListOrdered, badge: criticalCount, badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    { id: 'COMPLAINTS', label: 'Complaints', icon: FileText, badge: activeComplaintsCount, badgeColor: 'bg-amber-500/20 text-amber-400' },
    { id: 'CONTRACTORS', label: 'Contractors', icon: Building2 },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#090B10] border-r border-white/10 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div
            onClick={() => {
              setCurrentView('LANDING');
              setIsMobileOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)] group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            {!isCollapsed && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                    CivicPulse
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
                    BLR
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 tracking-wider uppercase font-mono">
                  Pothole Intelligence
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative
                  ${isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                  }
                  ${isCollapsed ? 'justify-center' : 'justify-between'}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors
                      ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}
                    `}
                  />
                  {!isCollapsed && (
                    <span className="truncate tracking-wide">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed active dot */}
                {isCollapsed && isActive && (
                  <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-white/10 bg-[#07080D]">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  AI Neural Core
                </span>
                <span className="font-mono text-cyan-400">v4.2</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                BBMP Sahaya API Synced • 28ms latency
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title="AI Vision Online">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
