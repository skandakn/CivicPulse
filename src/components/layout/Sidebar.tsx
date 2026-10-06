import React from 'react';
import {
  PlusCircle,
  Eye,
  Cpu,
  ListOrdered,
  Building2,
  BarChart3,
  MessageSquare,
  Compass,
  ChevronLeft,
  ChevronRight,
  LogIn,
  CheckSquare,
  Home,
  Mic
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuthSession } from '../../context/AuthContext';
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
  const { currentView, setCurrentView, incidents } = useApp();
  const { isSignedIn, isDemoBypass, user, openSignIn, isRealClerkUser } = useAuthSession();

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'AI_VERIFIED').length;

  const navItems: {
    id: ViewMode;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeStyle?: string;
  }[] = [
    { id: 'LANDING', label: 'Overview / Home', icon: Home },
    { id: 'REPORT', label: 'Report Incident', icon: PlusCircle, badge: 'NEW', badgeStyle: 'bg-[#121210] text-white' },
    { id: 'SCROLL_WORLD', label: '3D Scroll World', icon: Compass, badge: 'FLYTHROUGH', badgeStyle: 'bg-[#E8A030] text-[#121210]' },
    { id: 'GODS_EYE', label: 'Live Map & Heatmap', icon: Eye, badge: incidents.length, badgeStyle: 'bg-[#121210] text-white' },
    { id: 'ANALYTICS', label: 'Dashboard', icon: BarChart3 },
    { id: 'COMPLAINTS', label: 'Complaint Tracking', icon: MessageSquare },
    { id: 'PRIORITY_QUEUE', label: 'Hazard Queue', icon: ListOrdered, badge: criticalCount, badgeStyle: 'bg-[#C03A3A] text-white' },
    { id: 'AI_ANALYSIS', label: 'Vision Lab', icon: Cpu },
    { id: 'CONTRACTORS', label: 'Contractor DLP', icon: Building2 },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-[#121210]/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Approva Brutalist Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#CFE8D6] border-r-[3px] border-[#121210] transition-all duration-200
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Stamp Header */}
        <div className="h-[74px] flex items-center justify-between px-4 border-b-[3px] border-[#121210] bg-[#CFE8D6]">
          <div
            onClick={() => {
              setCurrentView('LANDING');
              setIsMobileOpen(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 bg-[#2E8C42] brut-sm flex items-center justify-center text-white shrink-0 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <CheckSquare className="w-6 h-6 stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <div>
                <div className="font-display font-extrabold text-lg leading-tight text-[#121210] tracking-tight">
                  CIVICPULSE
                </div>
                <div className="text-[10px] font-mono tracking-widest text-[#121210]/70 font-bold">
                  v2.4 · CIVIC OPS
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 brut-sm bg-white hover:bg-[#121210] hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Section Label */}
        {!isCollapsed && (
          <div className="text-[10px] font-mono tracking-widest text-[#121210]/60 font-bold pt-4 px-4 pb-1">
            WORKSPACE · APPROVER
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 py-2 px-3 space-y-2 overflow-y-auto">
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
                className={`w-full flex items-center transition-all cursor-pointer font-display font-bold text-sm
                  ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'}
                  ${isActive
                    ? 'brut bg-[#E8A030] text-[#121210]'
                    : 'brut bg-white text-[#121210] hover:bg-[#EAF5ED]'
                  }
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4.5 h-4.5 shrink-0 stroke-[2.5]" />
                  {!isCollapsed && (
                    <span className="truncate tracking-normal text-[13px]">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 border border-[#121210] ${item.badgeStyle || 'bg-[#121210] text-white'}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Stamp Pill & Session */}
        <div className="p-3 border-t-[3px] border-[#121210] bg-[#CFE8D6]">
          {!isCollapsed ? (
            <div>
              {/* User Stamp Pill */}
              <div className="brut bg-white p-2.5 flex items-center justify-between">
                {isSignedIn && user ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 border-2 border-[#121210] bg-[#CFE8D6] flex items-center justify-center font-display font-bold text-xs shrink-0">
                      {user.firstName ? user.firstName.charAt(0) : 'U'}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold font-display truncate leading-tight">
                        {user.fullName || user.firstName}
                      </div>
                      <div className="text-[9px] font-mono text-[#121210]/60 truncate font-bold">
                        {isDemoBypass ? 'GUEST JUDGE' : isRealClerkUser ? 'CLERK AUTHENTICATED' : 'COMMISSIONER'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="text-[11px] font-mono font-bold text-slate-500">
                      Guest Session
                    </div>
                    <button
                      onClick={openSignIn}
                      className="px-2.5 py-1 brut-sm bg-[#2E8C42] text-white hover:bg-[#257336] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>SIGN IN</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-1">
              <div className="w-4 h-4 bg-[#2E8C42] border-2 border-[#121210]" title="System Operational" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
