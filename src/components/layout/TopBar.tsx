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
  Zap,
  Plus,
  Compass
} from 'lucide-react';
import { useApp, UserRole } from '../../context/AppContext';
import { useAuthSession } from '../../context/AuthContext';
import { UserButton } from '@clerk/clerk-react';
import { clerkAppearance } from '../auth/clerkAppearance';

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
    resetDemo,
    setCurrentView,
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

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-[74px] bg-[#ffffff]/95 backdrop-blur-md border-b border-[#17191c]/8 transition-all duration-200 flex items-center justify-between px-4 lg:px-8
        ${isSidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'}
      `}
    >
      {/* Left side: Hamburger + Steep Editorial Serif Title & Badges */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden w-9 h-9 rounded-full bg-[#f2f2f3] flex items-center justify-center text-[#17191c] hover:bg-[#ececec] cursor-pointer transition-colors"
          title="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h1 className="font-serif text-2xl lg:text-3xl text-[#17191c] font-normal tracking-[-0.015em] leading-none whitespace-nowrap">
              Approver <em className="italic">Inbox</em>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-sans bg-[#f2f2f3] text-[#777b86] font-normal whitespace-nowrap">
              {pendingCount || 12} pending
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-sans bg-[#fbe1d1] text-[#5d2a1a] font-medium whitespace-nowrap">
              {criticalCount || 3} past SLA
            </span>
          </div>
          <div className="text-xs font-sans text-[#777b86] mt-1 hidden sm:block leading-none">
            {currentTimeStr || 'Tue · 06 Oct 2026 · 09:03 IST'}
          </div>
        </div>
      </div>

      {/* Right side: Search, Ward, Role, Demo, New Request */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Ward Jurisdiction selector */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-full bg-[#f2f2f3] px-3 py-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#777b86] shrink-0" />
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
            className="bg-transparent text-xs font-sans text-[#17191c] outline-none cursor-pointer pr-1"
          >
            <option value="ALL">All Bengaluru (8 Zones)</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.id}>
                Ward {ward.number} - {ward.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar matching Steep input style */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="rounded-full bg-[#f2f2f3] flex items-center gap-2 px-3.5 py-1.5 w-36 sm:w-52 md:w-60 cursor-pointer hover:bg-[#ececec] transition-colors"
          title="Search incidents, work orders, vendors..."
        >
          <Search className="w-3.5 h-3.5 text-[#a3a6af] shrink-0" />
          <span className="text-xs font-sans text-[#a3a6af] truncate select-none flex-1">
            Search hazard, PO#, ward…
          </span>
          <span className="font-sans text-[11px] text-[#a3a6af] shrink-0 hidden sm:inline">
            ⌘K
          </span>
        </div>

        {/* 3D Scroll World Button */}
        <button
          onClick={() => setCurrentView('SCROLL_WORLD')}
          className="hidden sm:inline-flex pill-btn-ghost text-xs px-3.5 py-1.5"
          title="Fly through 3D Bengaluru Road Odyssey (Scroll-World)"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>3D World</span>
        </button>

        {/* 1-Click Judge Demo Ghost Pill */}
        <button
          onClick={loadDemoCase}
          className="hidden md:inline-flex pill-btn-ghost text-xs px-3.5 py-1.5"
          title="Load high-risk demonstration scenario"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Demo</span>
        </button>

        {/* Steep Filled Pill: NEW REQUEST */}
        <button
          onClick={() => setCurrentView('REPORT')}
          className="pill-btn-filled text-xs px-4 py-1.5"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">New request</span>
          <span className="sm:hidden">New</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative w-9 h-9 rounded-full bg-[#f2f2f3] text-[#17191c] hover:bg-[#ececec] transition-colors cursor-pointer flex items-center justify-center"
            title="System alerts"
          >
            <Bell className="w-4 h-4 text-[#17191c]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#5d2a1a]" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white border border-[#17191c]/8 p-5 z-50 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08)] animate-in fade-in">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#17191c]/8">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#17191c]" />
                  <span className="text-xs font-serif italic text-[#17191c]">
                    Civic Alerts & Audits
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#fbe1d1] text-[#5d2a1a] font-medium">
                  3 new
                </span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-2xl bg-[#f2f2f3] hover:bg-[#ececec] transition-all text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      {n.type === 'danger' && <AlertTriangle className="w-4 h-4 text-[#5d2a1a] shrink-0 mt-0.5" />}
                      {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />}
                      {n.type === 'warning' && <FileCheck className="w-4 h-4 text-[#5d2a1a] shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#17191c]">{n.title}</span>
                          <span className="text-[11px] text-[#777b86]">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#777b86] mt-1 leading-snug">{n.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="w-full mt-3 py-2 rounded-full bg-[#17191c] text-white text-xs font-sans hover:bg-[#2b2e34] cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* User Role / Profile */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 rounded-full bg-[#f2f2f3] px-2.5 py-1.5 cursor-pointer hover:bg-[#ececec] transition-colors"
          >
            {isClerkAvailable && isRealClerkUser && !isDemoBypass ? (
              <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                <UserButton appearance={clerkAppearance} />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#17191c] flex items-center justify-center text-[11px] text-white font-medium">
                {user?.firstName ? user.firstName.charAt(0) : 'A'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-[#17191c]">
                {roleLabels[userRole].badge}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#777b86]" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-white border border-[#17191c]/8 p-4 z-50 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08)] space-y-2.5">
              <div className="text-[11px] font-sans text-[#777b86] uppercase tracking-wider">
                Switch Perspective
              </div>
              <div className="space-y-1">
                {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setUserRole(role);
                      setIsRoleDropdownOpen(false);
                      addToast(`Switched perspective to ${roleLabels[role].title}`, 'Interface privileges adjusted', 'info');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-sans flex items-center justify-between cursor-pointer transition-colors ${
                      userRole === role ? 'bg-[#fbe1d1] text-[#5d2a1a] font-medium' : 'text-[#17191c] hover:bg-[#f2f2f3]'
                    }`}
                  >
                    <span>{roleLabels[role].title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#777b86]">
                      {roleLabels[role].badge}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-[#17191c]/8 flex justify-between gap-2">
                <button
                  onClick={resetDemo}
                  className="flex-1 py-1.5 rounded-full bg-[#f2f2f3] hover:bg-[#ececec] text-xs text-[#17191c] text-center cursor-pointer"
                >
                  Reset
                </button>
                {isSignedIn ? (
                  <button
                    onClick={async () => {
                      setIsRoleDropdownOpen(false);
                      await signOut();
                    }}
                    className="flex-1 py-1.5 rounded-full bg-[#5d2a1a] text-white text-xs text-center cursor-pointer"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      openSignIn();
                    }}
                    className="flex-1 py-1.5 rounded-full bg-[#17191c] text-white text-xs text-center cursor-pointer"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
