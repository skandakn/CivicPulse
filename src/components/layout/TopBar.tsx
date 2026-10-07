import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  MapPin,
  Menu,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  Plus,
  Compass,
  LogIn
} from 'lucide-react';
import { useApp, UserRole } from '../../context/AppContext';
import { useAuthSession } from '../../context/AuthContext';
import { UserButton } from '@clerk/clerk-react';
import { clerkAppearance } from '../auth/clerkAppearance';
import { ViewMode } from '../../types';

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
    resetDemo,
    setCurrentView,
    currentView,
    incidents,
    addToast
  } = useApp();

  const {
    isSignedIn,
    isDemoBypass,
    user,
    openSignIn,
    signOut,
    isClerkAvailable,
    isRealClerkUser
  } = useAuthSession();
  const canSwitchPerspective = !isRealClerkUser;

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Approva UTC / IST Timestamp readout
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const date = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
      const time = now.toLocaleTimeString('en-US', { hour12: false });
      setCurrentTimeStr(`${day} · ${date} · ${time} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isRealClerkUser) {
      setUserRole(user?.role || 'CITIZEN');
    }
  }, [isRealClerkUser, setUserRole, user?.role]);

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'AI_VERIFIED').length;
  const pendingCount = incidents.filter(i => i.status !== 'AI_VERIFIED').length;

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

  const roleLabels: Record<UserRole, { title: string; badge: string }> = {
    CITIZEN: { title: 'Citizen Reporter', badge: 'PUBLIC' },
    WARD_ENGINEER: { title: 'BBMP Ward Engineer', badge: 'OFFICIAL' },
    CHIEF_COMMISSIONER: { title: 'Chief Commissioner', badge: 'ADMIN' },
    AUDITOR: { title: 'Quality Auditor (CAG/IRC)', badge: 'AUDITOR' }
  };

  const viewTitles: Record<ViewMode, { title: string; badge1?: string; badge2?: string; badge2Alert?: boolean }> = {
    LANDING: { title: 'CivicPulse Overview', badge1: 'SHOWCASE', badge2: 'IRC-SP-100' },
    REPORT: { title: 'Report Road Hazard', badge1: 'MULTIMODAL', badge2: 'SPEECH & CV' },
    PRIORITY_QUEUE: { title: 'Approver Inbox', badge1: `${pendingCount || 12} PENDING`, badge2: `${criticalCount || 3} PAST SLA`, badge2Alert: true },
    GODS_EYE: { title: 'GIS Radar', badge1: `${incidents.length} INCIDENTS`, badge2: 'LIVE STREAM' },
    AI_ANALYSIS: { title: 'Vision Lab & Telemetry', badge1: 'STEREO 3D', badge2: 'v4.2 CV' },
    INCIDENT_DETAIL: { title: 'Investigation Dossier', badge1: 'BBMP LEDGER' },
    VERIFICATION: { title: 'AI Repair Verification', badge1: 'FORENSIC AUDIT' },
    CONTRACTORS: { title: 'Contractor DLP Ledger', badge1: 'CLAUSE 45.2' },
    COMPLAINTS: { title: 'Citizen Grievances & SLA', badge1: 'SAHAYA 2.0' },
    ANALYTICS: { title: 'Bengaluru Civic Analytics', badge1: 'AUDIT METRICS' },
    DEMO: { title: 'Hackathon Evaluation Lab', badge1: 'DETERMINISTIC' },
    SCROLL_WORLD: { title: '3D Scroll-World Flight', badge1: 'INTERACTIVE 3D' }
  };

  const activeHeader = viewTitles[currentView] || { title: 'CivicPulse Ledger', badge1: 'CIVIC OPS' };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-[74px] bg-[#CFE8D6] border-b-[3px] border-[#121210] transition-all duration-200 flex items-center justify-between px-4 lg:px-6
        ${isSidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'}
      `}
    >
      {/* Left side: Hamburger + Dynamic Header Title & Badges */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 brut-sm bg-white text-[#121210] hover:bg-black hover:text-white cursor-pointer transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <h1 className="font-display font-black text-xl sm:text-2xl text-[#121210] tracking-tight leading-none whitespace-nowrap">
              {activeHeader.title}
            </h1>
            {activeHeader.badge1 && (
              <span className="tag bg-[#FFFFFF] text-[#121210] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 whitespace-nowrap">
                {activeHeader.badge1}
              </span>
            )}
            {activeHeader.badge2 && (
              <span className={`tag ${activeHeader.badge2Alert ? 'bg-[#C03A3A] text-white' : 'bg-[#E8A030] text-[#121210]'} border-[#121210] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 whitespace-nowrap`}>
                {activeHeader.badge2}
              </span>
            )}
          </div>
          <div className="text-[10px] font-mono text-[#121210]/60 mt-1 font-bold tracking-wider hidden sm:block leading-none">
            {currentTimeStr || 'TUE · 06 OCT 2026 · 09:03:04 IST'}
          </div>
        </div>
      </div>

      {/* Right side: Search, Ward, Role, Demo, New Request */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Ward Jurisdiction selector */}
        <div className="hidden xl:flex items-center gap-1.5 brut-sm bg-white px-2 py-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#121210] shrink-0" />
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
            className="bg-transparent text-xs font-mono font-bold text-[#121210] outline-none cursor-pointer pr-1"
          >
            <option value="ALL">All Bengaluru (8 Zones)</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.id}>
                Ward {ward.number} - {ward.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar matching Approva */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="brut bg-[#FFFFFF] flex items-center gap-2 px-3 py-1.5 w-36 sm:w-56 md:w-64 cursor-pointer hover:bg-[#F3FAF5] transition-colors"
          title="Search incidents, work orders, vendors..."
        >
          <Search className="w-4 h-4 text-[#121210] shrink-0" />
          <span className="text-xs font-body text-[#121210]/60 truncate select-none flex-1">
            Search hazard, PO#, ward…
          </span>
          <span className="font-mono text-[10px] border border-[#121210] px-1 font-bold text-[#121210] shrink-0 hidden sm:inline">
            ⌘K
          </span>
        </div>

        {/* 3D Scroll World Button */}
        <button
          onClick={() => setCurrentView('SCROLL_WORLD')}
          className="hidden sm:flex brut bg-[#2E8C42] text-white hover:bg-[#257336] items-center gap-1.5 px-3 py-1.5 text-xs font-display font-extrabold btn-press cursor-pointer"
          title="Fly through 3D Bengaluru Road Odyssey (Scroll-World)"
        >
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
          <span>3D WORLD</span>
        </button>


        {/* Approva NEW REQUEST button without duplicate plus */}
        <button
          onClick={() => setCurrentView('REPORT')}
          className="brut bg-[#121210] text-[#FFFFFF] px-3.5 py-1.5 font-display font-extrabold text-xs sm:text-sm btn-press cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">NEW REQUEST</span>
          <span className="sm:hidden">NEW</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative brut-sm bg-white p-2 text-[#121210] hover:bg-black hover:text-white transition-colors cursor-pointer"
            title="System alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C03A3A] border border-[#121210]" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 brut bg-white p-4 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#121210]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#121210]" />
                  <span className="text-xs font-display font-extrabold uppercase tracking-wider text-[#121210]">
                    Civic Alerts & Audits
                  </span>
                </div>
                <span className="tag bg-[#C03A3A] text-white">
                  3 NEW
                </span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 border-2 border-[#121210] bg-[#CFE8D6]/40 hover:bg-[#CFE8D6] transition-all text-xs"
                  >
                    <div className="flex items-start gap-2">
                      {n.type === 'danger' && <AlertTriangle className="w-4 h-4 text-[#C03A3A] shrink-0 mt-0.5" />}
                      {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#2E8C42] shrink-0 mt-0.5" />}
                      {n.type === 'warning' && <FileCheck className="w-4 h-4 text-[#E8A030] shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#121210]">{n.title}</span>
                          <span className="text-[10px] font-mono text-[#121210]/60">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#121210]/80 mt-1 leading-snug">{n.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="w-full mt-3 py-1.5 brut-sm bg-[#121210] text-white font-mono text-xs font-bold hover:bg-zinc-800 cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          )}
        </div>

        {/* User Role / Profile or Direct Sign In Button */}
        {isSignedIn ? (
          <div className="relative">
            <button
              onClick={() => {
                if (canSwitchPerspective) setIsRoleDropdownOpen(!isRoleDropdownOpen);
              }}
              className="flex items-center gap-2 brut-sm bg-white px-2 py-1.5 cursor-pointer hover:bg-zinc-100 transition-colors"
            >
              {isClerkAvailable && isRealClerkUser && !isDemoBypass ? (
                <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                  <UserButton appearance={clerkAppearance} />
                </div>
              ) : (
                <div className="w-6 h-6 border border-[#121210] bg-[#CFE8D6] flex items-center justify-center font-display font-extrabold text-[11px] text-[#121210]">
                  {user?.firstName ? user.firstName.charAt(0) : 'A'}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold leading-tight font-display text-[#121210]">
                  {user?.firstName || roleLabels[userRole].badge}
                </div>
              </div>
              {canSwitchPerspective && <ChevronDown className="w-3 h-3 text-[#121210]" />}
            </button>

            {isRoleDropdownOpen && canSwitchPerspective && (
              <div className="absolute right-0 mt-2 w-60 brut bg-white p-3 z-50 space-y-2.5">
                <div className="text-[10px] font-mono font-bold tracking-widest text-[#121210]/60 uppercase">
                  DEMO PERSPECTIVE
                </div>
                <p className="text-[10px] leading-snug text-[#121210]/70">
                  Live roles are assigned by an administrator.
                </p>
                <div className="space-y-1">
                  {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setUserRole(role);
                        setIsRoleDropdownOpen(false);
                        addToast(`Switched perspective to ${roleLabels[role].title}`, 'Interface privileges adjusted', 'info');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 border-2 border-[#121210] text-xs font-display font-bold flex items-center justify-between cursor-pointer transition-colors ${
                        userRole === role ? 'bg-[#E8A030] text-[#121210]' : 'bg-white text-[#121210] hover:bg-[#CFE8D6]'
                      }`}
                    >
                      <span>{roleLabels[role].title}</span>
                      <span className="font-mono text-[9px] bg-[#121210] text-white px-1">
                        {roleLabels[role].badge}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t-2 border-[#121210] flex justify-between gap-2">
                  <button
                    onClick={resetDemo}
                    className="flex-1 py-1 brut-sm bg-white hover:bg-slate-100 font-mono text-[10px] font-bold text-center cursor-pointer"
                  >
                    RESET SEED
                  </button>
                  <button
                    onClick={async () => {
                      setIsRoleDropdownOpen(false);
                      await signOut();
                    }}
                    className="flex-1 py-1 brut-sm bg-[#C03A3A] text-white font-mono text-[10px] font-bold text-center cursor-pointer"
                  >
                    SIGN OUT
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openSignIn}
            className="brut bg-[#2E8C42] text-white hover:bg-[#257336] px-3.5 py-1.5 font-display font-extrabold text-xs flex items-center gap-1.5 btn-press cursor-pointer shadow-[2px_2px_0_0_#121210]"
            title="Authenticate with Clerk"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>SIGN IN</span>
          </button>
        )}
      </div>
    </header>
  );
};
