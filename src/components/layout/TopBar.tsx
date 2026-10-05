import React, { useState } from 'react';
import {
  Search,
  Bell,
  MapPin,
  Menu,
  User,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  Zap
} from 'lucide-react';
import { useApp, UserRole } from '../../context/AppContext';

interface TopBarProps {
  isSidebarCollapsed: boolean;
  onOpenMobileSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isSidebarCollapsed,
  onOpenMobileSidebar
}) => {
  const {
    wards,
    selectedWardId,
    setSelectedWardId,
    setIsSearchOpen,
    userRole,
    setUserRole,
    loadDemoCase,
    addToast
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const notifications = [
    {
      id: 'n-1',
      title: 'Critical SLA Escalation',
      desc: 'Outer Ring Road (Bellandur) passed 300 citizen upvotes — Escalated to Zonal Commissioner',
      time: '12m ago',
      type: 'danger'
    },
    {
      id: 'n-2',
      title: 'AI Verification Passed',
      desc: '100ft Road Indiranagar hot-mix patch confirmed with 98.4% surface smoothness',
      time: '1h ago',
      type: 'success'
    },
    {
      id: 'n-3',
      title: 'Contractor Warranty Alert',
      desc: 'Defect Liability notice dispatched to Star Infratech Pvt Ltd (Clause 45.2)',
      time: '2h ago',
      type: 'warning'
    }
  ];

  const roleLabels: Record<UserRole, { title: string; badge: string; color: string }> = {
    CITIZEN: { title: 'Citizen Reporter', badge: 'Public', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    WARD_ENGINEER: { title: 'BBMP Ward Engineer', badge: 'Official', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    CHIEF_COMMISSIONER: { title: 'Chief Commissioner', badge: 'Admin', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    AUDITOR: { title: 'Quality Auditor (CAG/IRC)', badge: 'Auditor', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-[#08090D]/90 backdrop-blur-md border-b border-white/10 transition-all duration-300 flex items-center justify-between px-4 lg:px-6
        ${isSidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'}
      `}
    >
      {/* Left side: Hamburger + Location Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Bengaluru Location Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 transition-colors">
          <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              Jurisdiction
            </span>
            <select
              value={selectedWardId}
              onChange={(e) => {
                setSelectedWardId(e.target.value);
                const ward = wards.find(w => w.id === e.target.value);
                addToast(
                  ward ? `Focused on Ward ${ward.number} (${ward.name})` : 'All Bengaluru Wards',
                  'Filtering geospatial feeds and priority queues',
                  'info'
                );
              }}
              className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer pr-2"
            >
              <option value="ALL" className="bg-[#0f121d] text-slate-200">
                All Bengaluru (8 Zones • 198 Wards)
              </option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id} className="bg-[#0f121d] text-slate-200">
                  Ward {ward.number} - {ward.name} ({ward.zone})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Center/Right: 1-Click Demo, Search, Status, Notifications, Role Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1-Click Judge Demo Quick Action */}
        <button
          onClick={loadDemoCase}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold font-mono text-xs shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all cursor-pointer hover:scale-105"
        >
          <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
          <span>Judge Demo</span>
        </button>

        {/* Global Quick Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 transition-all text-xs cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-normal text-slate-400">Search roads, wards, tickets...</span>
          <kbd className="ml-3 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
        >
          <Search className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Live AI Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="hidden xl:inline">AI Vision v4.2 Active</span>
          <span className="xl:hidden">AI Active</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">28ms</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0E121B] border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Civic Alerts & Audits
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono">
                  3 New
                </span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      {n.type === 'danger' && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                      {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                      {n.type === 'warning' && <FileCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-100">{n.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="w-full mt-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-white bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                Close Alerts
              </button>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 transition-all text-xs cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold text-xs">
              <User className="w-3.5 h-3.5 text-slate-900" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 leading-none">
                {roleLabels[userRole].title}
              </div>
              <span className={`text-[9px] font-mono px-1 rounded border inline-block mt-0.5 ${roleLabels[userRole].color}`}>
                {roleLabels[userRole].badge}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0E121B] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 py-1.5 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                Switch Perspective
              </div>
              {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setUserRole(role);
                    setIsRoleDropdownOpen(false);
                    addToast(`Switched perspective to ${roleLabels[role].title}`, 'Interface privileges adjusted', 'info');
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer
                    ${userRole === role ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-300 hover:bg-white/5'}
                  `}
                >
                  <span>{roleLabels[role].title}</span>
                  <span className={`text-[9px] font-mono px-1 rounded border ${roleLabels[role].color}`}>
                    {roleLabels[role].badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
