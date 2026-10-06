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
  CheckSquare
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
  const { isSignedIn, isDemoBypass, user, openSignIn } = useAuthSession();

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'AI_VERIFIED').length;

  const navItems: {
    id: ViewMode;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeStyle?: string;
  }[] = [
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

      {/* Steep Editorial Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#fafafb] border-r border-[#17191c]/8 transition-all duration-200
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-[74px] flex items-center justify-between px-5 border-b border-[#17191c]/8 bg-[#fafafb]">
          <div
            onClick={() => {
              setCurrentView('PRIORITY_QUEUE');
              setIsMobileOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#17191c] flex items-center justify-center text-white shrink-0">
              <CheckSquare className="w-4 h-4 stroke-[2]" />
            </div>
            {!isCollapsed && (
              <div>
                <div className="font-serif text-lg leading-tight text-[#17191c] font-normal tracking-[-0.015em]">
                  CivicPulse
                </div>
                <div className="text-[11px] font-sans text-[#777b86]">
                  editorial ops
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-7 h-7 rounded-full bg-[#f2f2f3] hover:bg-[#ececec] text-[#777b86] hover:text-[#17191c] items-center justify-center transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Section Label */}
        {!isCollapsed && (
          <div className="text-[11px] font-sans text-[#a3a6af] uppercase tracking-wider pt-5 px-5 pb-1">
            Workspace · Approver
          </div>
        )}

        {/* Navigation list with Steep pill items */}
        <nav className="flex-1 py-3 px-3 space-y-1.5 overflow-y-auto">
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
                className={`w-full flex items-center transition-all cursor-pointer font-sans text-sm rounded-full
                  ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'}
                  ${isActive
                    ? 'bg-[#17191c] text-white font-medium shadow-sm'
                    : 'text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3]'
                  }
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 stroke-[2]" />
                  {!isCollapsed && (
                    <span className="truncate text-xs font-normal">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.id === 'PRIORITY_QUEUE'
                        ? 'bg-[#fbe1d1] text-[#5d2a1a]'
                        : 'bg-[#f2f2f3] text-[#777b86]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Dispatched Today Widget */}
        <div className="p-4 border-t border-[#17191c]/8 bg-[#fafafb]">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-[#f2f2f3] p-3.5 border border-[#17191c]/5">
                <div className="text-[10px] font-sans text-[#777b86] uppercase tracking-wider mb-1">
                  Today · Audited / Dispatched
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="font-serif text-2xl text-[#17191c]">47</div>
                  <div className="text-xs font-sans text-[#777b86]">of 59 pending</div>
                </div>
                <div className="mt-2.5 h-1.5 rounded-full overflow-hidden bg-white flex">
                  <div className="bg-[#17191c] w-[65%]" title="Approved"></div>
                  <div className="bg-[#5d2a1a] w-[15%]" title="Rejected"></div>
                  <div className="bg-[#fbe1d1] w-[20%]" title="Pending Detail"></div>
                </div>
              </div>

              {/* User Presence Card */}
              <div className="rounded-2xl bg-white p-3 flex items-center justify-between border border-[#17191c]/8 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#17191c] text-white flex items-center justify-center font-sans font-medium text-xs shrink-0">
                    {user?.firstName ? user.firstName.charAt(0) : 'M'}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-[#17191c] truncate">
                      {user?.fullName || user?.firstName || 'Mara Vossberg'}
                    </div>
                    <div className="text-[10px] text-[#777b86] truncate">
                      {isDemoBypass ? 'Chief Auditor (Demo)' : 'Chief Commissioner'}
                    </div>
                  </div>
                </div>

                {!isSignedIn && (
                  <button
                    onClick={openSignIn}
                    className="w-6 h-6 rounded-full bg-[#f2f2f3] hover:bg-[#ececec] flex items-center justify-center text-[#17191c] cursor-pointer transition-colors"
                    title="Sign In"
                  >
                    <LogIn className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2e7d32]" title="System Operational" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
