import React, { useState, useEffect, useCallback } from 'react';
import {
  Flame,
  Clock,
  GitMerge,
  Archive,
  Inbox,
  AlertTriangle,
  FileText,
  Check,
  X,
  Info,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PotholeIncident } from '../types';

export const PriorityQueuePage: React.FC = () => {
  const {
    filteredIncidents,
    selectedIncident,
    setSelectedIncident,
    roads,
    addToast
  } = useApp();

  // Active top tab matching Approva: Inbox | Escalations | History | Workflow Builder
  const [activeTab, setActiveTab] = useState<'INBOX' | 'ESCALATIONS' | 'HISTORY' | 'WORKFLOW'>('INBOX');

  // Sub-filter: ALL | ARTERIAL | CRITICAL | UNDER WARRANTY
  const [subFilter, setSubFilter] = useState<'ALL' | 'ARTERIAL' | 'CRITICAL' | 'WARRANTY'>('ALL');

  // Active incident in queue (derived directly from selected or first item)
  const activeItem = selectedIncident || filteredIncidents[0];

  // Big stamp drop state: label ('APPROVED' | 'REJECTED' | 'NEEDS DETAIL'), color
  const [currentStamp, setCurrentStamp] = useState<{ label: string; color: string; time: string } | null>(null);

  // Helper for road classification
  const getRoadInfo = (inc: PotholeIncident) => {
    const road = roads.find(r => r.id === inc.roadId || r.name === inc.roadName);
    return {
      category: road?.category || 'ARTERIAL',
      surfaceType: road?.surfaceType || 'ASPHALT'
    };
  };

  // Audit trail log state
  const [auditLogs, setAuditLogs] = useState<string[]>([
    '2026-10-06 08:11:02Z  CREATED    citizen.reporter@civicpulse.org   WO-2026-0418 submitted · ₹48,920.00',
    '2026-10-06 08:11:04Z  ROUTED     system                            → chain "Arterial Road ≥ ₹25k" (4 stages)',
    '2026-10-06 08:18:47Z  STAMPED    ward.engineer@bbmp.gov.in         APPROVED · stage 1/4 · note: "Site visited. Traffic risk confirmed."',
    '2026-10-06 08:24:12Z  STAMPED    exec.engineer@bbmp.gov.in         APPROVED · stage 2/4 · attach: irc-sp-100-estimate.pdf',
    '2026-10-06 08:29:55Z  VIEWED     chief.auditor@bbmp.gov.in         stage 3/4 — awaiting final sanction decision',
    '2026-10-06 08:30:15Z  ─          ─                                 cursor blinking …▌'
  ]);

  // Filter items
  const displayItems = filteredIncidents.filter((inc) => {
    const { category } = getRoadInfo(inc);
    if (subFilter === 'ARTERIAL') return category === 'ARTERIAL';
    if (subFilter === 'CRITICAL') return inc.severity === 'CRITICAL';
    if (subFilter === 'WARRANTY') return inc.isUnderWarranty;
    return true;
  });

  // Calculate simulated repair costs based on volume
  const getEstimatedCost = (inc: PotholeIncident) => {
    const base = Math.max(12000, Math.round((inc.depthCm * 1800) + (inc.surfaceAreaSqM * 6500)));
    return base;
  };

  const activeCost = activeItem ? getEstimatedCost(activeItem) : 48920;

  // Handle dropping stamp
  const triggerStamp = useCallback((label: 'APPROVED' | 'REJECTED' | 'NEEDS DETAIL', color: string) => {
    setCurrentStamp({
      label,
      color,
      time: new Date().toLocaleTimeString()
    });

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z';
    const newLog = `${timestamp}  STAMPED    chief.auditor@bbmp.gov.in         ${label} · stage 3/4 · final decision issued`;
    setAuditLogs((prev) => [newLog, ...prev]);

    if (label === 'APPROVED') {
      addToast(
        'Municipal Work Order Approved & Dispatched',
        `Dispatched rapid hot-mix repair crew for ${activeItem?.roadName || 'Road'} (WO-${activeItem?.code || '418'})`,
        'success'
      );
    } else if (label === 'REJECTED') {
      addToast(
        'Work Order Disputed & Rejected',
        `Notice dispatched to contractor regarding warranty non-compliance or improper quote.`,
        'error'
      );
    } else {
      addToast(
        'Clarification & Re-inspection Requested',
        `Returned to BBMP Ward Engineer for core-sample depth verification.`,
        'warning'
      );
    }
  }, [activeItem, addToast]);

  // Keyboard shortcuts matching Approva spec: Cmd+Enter (Approve), Cmd+Backspace (Reject), Cmd+D (Needs Detail)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        triggerStamp('APPROVED', '#2E8C42');
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
        triggerStamp('REJECTED', '#C03A3A');
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        triggerStamp('NEEDS DETAIL', '#E8A030');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerStamp]);

  return (
    <div className="space-y-0 text-left -mx-3 sm:-mx-6 lg:-mx-8">
      {/* Steep Pill Tabs Bar */}
      <div className="px-4 lg:px-8 pt-3 pb-3 flex gap-2 border-b border-[#17191c]/8 bg-[#ffffff] overflow-x-auto">
        <button
          onClick={() => setActiveTab('INBOX')}
          className={`font-sans text-xs px-4 py-2 rounded-full cursor-pointer transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'INBOX' ? 'bg-[#17191c] text-white font-medium' : 'text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3]'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Hazard Inbox</span>
        </button>

        <button
          onClick={() => setActiveTab('ESCALATIONS')}
          className={`font-sans text-xs px-4 py-2 rounded-full cursor-pointer transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'ESCALATIONS' ? 'bg-[#17191c] text-white font-medium' : 'text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-[#5d2a1a]" />
          <span>Escalations (3)</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`font-sans text-xs px-4 py-2 rounded-full cursor-pointer transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'HISTORY' ? 'bg-[#17191c] text-white font-medium' : 'text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3]'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Audit History</span>
        </button>

        <button
          onClick={() => setActiveTab('WORKFLOW')}
          className={`font-sans text-xs px-4 py-2 rounded-full cursor-pointer transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'WORKFLOW' ? 'bg-[#17191c] text-white font-medium' : 'text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3]'
          }`}
        >
          <GitMerge className="w-3.5 h-3.5" />
          <span>Workflow Builder</span>
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'INBOX' && (
        <div className="flex flex-col xl:flex-row min-h-[calc(100vh-140px)]">
          {/* LEFT COLUMN: Request Queue (40% width) */}
          <section className="w-full xl:w-[40%] border-b xl:border-b-0 xl:border-r border-[#17191c]/8 p-4 sm:p-6 space-y-4 bg-[#fafafb] overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Filter pills & sort status */}
            <div className="flex items-center justify-between text-xs font-sans">
              <div className="flex gap-1.5 flex-wrap">
                {(['ALL', 'ARTERIAL', 'CRITICAL', 'WARRANTY'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSubFilter(filter)}
                    className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                      subFilter === filter
                        ? 'bg-[#17191c] text-white font-medium'
                        : 'bg-[#f2f2f3] text-[#777b86] hover:text-[#17191c]'
                    }`}
                  >
                    {filter === 'ALL' ? 'All' : filter === 'ARTERIAL' ? 'Arterial' : filter === 'CRITICAL' ? 'Critical' : 'DLP Warranty'}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-[#a3a6af] uppercase tracking-wider hidden sm:inline">Sort: Risk ↓</span>
            </div>

            {/* Request Cards Stream */}
            <div className="space-y-3.5">
              {displayItems.map((inc) => {
                const cost = getEstimatedCost(inc);
                const isSelected = activeItem?.id === inc.id;
                const isEscalated = inc.severity === 'CRITICAL';

                return (
                  <article
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setCurrentStamp(null);
                    }}
                    className={`p-5 rounded-[20px] relative cursor-pointer select-none transition-all ${
                      isSelected
                        ? 'bg-white ring-1 ring-[#17191c] shadow-[0_12px_24px_-4px_rgba(0,0,0,0.08)]'
                        : 'bg-white hover:bg-[#fafafb] border border-[#17191c]/6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    {/* Top ID Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[11px] font-sans px-2.5 py-0.5 rounded-full ${
                          isEscalated
                            ? 'bg-[#fbe1d1] text-[#5d2a1a] font-medium'
                            : 'bg-[#f2f2f3] text-[#777b86]'
                        }`}
                      >
                        WO-2026-{inc.code.replace('BLR-', '')}
                      </span>
                      <span className="text-[11px] font-sans text-[#a3a6af]">
                        Ward {inc.wardNumber}
                      </span>
                    </div>

                    {/* Title + Amount */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-serif text-lg leading-tight text-[#17191c] font-normal truncate">
                          {inc.roadName}
                        </div>
                        <div className="text-xs text-[#777b86] mt-1 truncate">
                          {inc.landmark} · {inc.depthCm}cm depth · {inc.surfaceAreaSqM}m² area
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-sans font-medium text-lg text-[#17191c]">
                          ₹{cost.toLocaleString('en-IN')}.00
                        </div>
                        <div className="text-[10px] font-sans text-[#a3a6af]">
                          PWD Tender
                        </div>
                      </div>
                    </div>

                    {/* Steep Tags */}
                    {(() => {
                      const { category, surfaceType } = getRoadInfo(inc);
                      return (
                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans bg-[#f2f2f3] text-[#777b86]">{category}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans bg-[#f2f2f3] text-[#777b86]">{surfaceType}</span>
                          {inc.isUnderWarranty && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans bg-[#fbe1d1] text-[#5d2a1a] font-medium">DLP Warranty</span>
                          )}
                          {isEscalated ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans bg-[#fbe1d1] text-[#5d2a1a] font-medium flex items-center gap-1">
                              <Flame className="w-3 h-3 text-[#5d2a1a]" />
                              Escalated
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans bg-[#f2f2f3] text-[#777b86] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#a3a6af]" />
                              24h SLA
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Submitter Info + Stepper Dots */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#17191c]/6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#f2f2f3] text-[#17191c] flex items-center justify-center font-sans font-medium text-[10px]">
                          {inc.wardNumber % 2 === 0 ? 'DP' : 'LA'}
                        </div>
                        <div className="text-xs leading-tight">
                          <span className="font-sans font-medium text-[#17191c]">
                            {inc.wardNumber % 2 === 0 ? 'Devin Park' : 'Lena Akhtar'}
                          </span>
                          <span className="text-[11px] text-[#a3a6af] ml-1.5">
                            Ward {inc.wardNumber}
                          </span>
                        </div>
                      </div>

                      {/* Approval chain status pipeline dots */}
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#17191c]"></span>
                        <span className="w-3 h-px bg-[#17191c]/20"></span>
                        <span className="w-2 h-2 rounded-full bg-[#17191c]"></span>
                        <span className="w-3 h-px bg-[#17191c]/20"></span>
                        <span className={`w-2 h-2 rounded-full ${isEscalated ? 'bg-[#5d2a1a]' : 'bg-[#a3a6af]'}`}></span>
                        <span className="w-3 h-px bg-[#17191c]/20"></span>
                        <span className="w-2 h-2 rounded-full bg-[#ececec]"></span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* RIGHT COLUMN: Document Pane + Action Rail */}
          <section className="flex-1 p-4 sm:p-8 overflow-y-auto bg-[#ffffff]">
            {activeItem && (
              <div className="document-layout flex flex-col xl:flex-row gap-5 items-start">
                {/* Municipal Work Order / PO Document */}
                <div id="invoice" className="flex-1 w-full bg-white rounded-[24px] border border-[#17191c]/8 p-6 sm:p-9 relative overflow-hidden min-h-[580px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)]">
                  {/* Dynamic Big Stamp Watermark Drop Target */}
                  {currentStamp && (
                    <div className="absolute top-12 right-12 z-20 pointer-events-none">
                      <div
                        className="big-stamp"
                        style={{ color: currentStamp.color }}
                      >
                        {currentStamp.label}
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start border-b border-[#17191c]/10 pb-6 gap-4">
                    <div>
                      <div className="font-serif text-2xl sm:text-3xl font-normal text-[#17191c] tracking-[-0.015em]">
                        Municipal Work Order
                      </div>
                      <div className="text-xs font-normal text-[#777b86] mt-1.5 flex items-center gap-2">
                        <span className="font-mono text-[#17191c] bg-[#f2f2f3] px-2 py-0.5 rounded-full">
                          WO-2026-{activeItem.code.replace('BLR-', '')}
                        </span>
                        <span>·</span>
                        <span>Issued 06 Oct 2026</span>
                        <span>·</span>
                        <span className="text-[#17191c] font-medium">PWD Sanction</span>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-[11px] font-medium tracking-wider text-[#979799] uppercase">
                        Jurisdiction & Bill To
                      </div>
                      <div className="font-serif text-base text-[#17191c] mt-0.5">
                        Bruhat Bengaluru Mahanagara Palike
                      </div>
                      <div className="text-xs text-[#777b86] mt-0.5">
                        Ward {activeItem.wardNumber} ({activeItem.wardName}) · {activeItem.zone} Zone
                      </div>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6 p-5 rounded-[20px] bg-[#fafafb] border border-[#17191c]/5">
                    <div>
                      <div className="text-[11px] font-medium tracking-wider text-[#979799] uppercase">
                        Assigned Contractor
                      </div>
                      <div className="text-sm font-medium text-[#17191c] mt-1">
                        {activeItem.contractorName || 'Star Infratech Pvt Ltd'}
                      </div>
                      <div className="text-xs text-[#777b86] mt-0.5 font-mono">
                        PWD-ID #4420 · Rating: 4.2 / 5.0
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-medium tracking-wider text-[#979799] uppercase">
                        Hazard Specification
                      </div>
                      <div className="text-sm font-medium text-[#17191c] mt-1">
                        {activeItem.severity} · {getRoadInfo(activeItem).surfaceType}
                      </div>
                      <div className="text-xs text-[#777b86] mt-0.5 font-mono">
                        Depth: {activeItem.depthCm}cm · Area: {activeItem.surfaceAreaSqM}m²
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-medium tracking-wider text-[#979799] uppercase">
                        SLA Mandate Due
                      </div>
                      <div className="text-sm font-medium text-[#17191c] mt-1">
                        08 Oct 2026 (48h)
                      </div>
                      <div className="text-xs text-[#777b86] mt-0.5">
                        Emergency Transit Corridor
                      </div>
                    </div>
                  </div>

                  {/* Steep Signature: Editorial Accent Peach Card for Defect Liability & Audit Warranty */}
                  <div className="steep-peach-card p-5 my-6 rounded-[20px] border border-[#5d2a1a]/15">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[11px] font-semibold tracking-wider text-[#5d2a1a]/70 uppercase">
                          Clause 45.2 · Statutory Defect Liability Protocol
                        </div>
                        <div className="font-serif text-lg font-normal text-[#5d2a1a] mt-1">
                          Zero-Downtime Guarantee Active
                        </div>
                        <div className="text-xs text-[#5d2a1a]/85 mt-1 leading-relaxed max-w-xl">
                          Contractor Star Infratech is bound to a 24-month defect liability period under BBMP Quality Act. Any post-resurfacing deformation triggers automatic bond forfeiture.
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-[#ffffff]/60 text-[#5d2a1a] border border-[#5d2a1a]/20">
                        AUDITED
                      </span>
                    </div>
                  </div>

                  {/* Line Items PO Table */}
                  <table className="w-full mt-6 text-sm">
                    <thead>
                      <tr className="border-b border-[#17191c]/10 text-[#777b86]">
                        <th className="text-left py-3 text-xs font-medium tracking-wide">
                          Description (IRC-SP-100 Spec)
                        </th>
                        <th className="text-right py-3 text-xs font-medium tracking-wide w-16">
                          Qty
                        </th>
                        <th className="text-right py-3 text-xs font-medium tracking-wide w-28">
                          Unit Rate
                        </th>
                        <th className="text-right py-3 text-xs font-medium tracking-wide w-32">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#17191c]/5 text-[#17191c]">
                      <tr>
                        <td className="py-3 text-xs leading-relaxed">
                          Bituminous Concrete Hot-Mix (Grading II, 50mm compacted)
                        </td>
                        <td className="text-right font-mono text-xs">{Math.max(1, Math.round(activeItem.surfaceAreaSqM * 1.5))}</td>
                        <td className="text-right font-mono text-xs text-[#777b86]">₹12,400.00</td>
                        <td className="text-right font-mono text-xs font-medium">
                          ₹{(Math.max(1, Math.round(activeItem.surfaceAreaSqM * 1.5)) * 12400).toLocaleString('en-IN')}.00
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-xs leading-relaxed">
                          Tack coat application with rapid bitumen emulsion (RS-1)
                        </td>
                        <td className="text-right font-mono text-xs">{activeItem.depthCm > 8 ? 2 : 1}</td>
                        <td className="text-right font-mono text-xs text-[#777b86]">₹3,450.00</td>
                        <td className="text-right font-mono text-xs font-medium">
                          ₹{((activeItem.depthCm > 8 ? 2 : 1) * 3450).toLocaleString('en-IN')}.00
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-xs leading-relaxed">
                          Pneumatic roller compaction & cold milling crew
                        </td>
                        <td className="text-right font-mono text-xs">1</td>
                        <td className="text-right font-mono text-xs text-[#777b86]">₹14,800.00</td>
                        <td className="text-right font-mono text-xs font-medium">₹14,800.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-xs leading-relaxed">
                          Traffic diversion barriers & IRC retro-reflective beacons
                        </td>
                        <td className="text-right font-mono text-xs">1</td>
                        <td className="text-right font-mono text-xs text-[#777b86]">₹4,200.00</td>
                        <td className="text-right font-mono text-xs font-medium">₹4,200.00</td>
                      </tr>
                    </tbody>
                    <tfoot className="border-t border-[#17191c]/10">
                      <tr>
                        <td colSpan={3} className="text-right py-2 text-xs text-[#777b86]">
                          Subtotal (Base Work Order Estimate)
                        </td>
                        <td className="text-right font-mono text-xs text-[#17191c]">
                          ₹{(activeCost - 3200).toLocaleString('en-IN')}.00
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="text-right py-1 text-xs text-[#777b86]">
                          GST / Infrastructure Cess (18%)
                        </td>
                        <td className="text-right font-mono text-xs text-[#17191c]">₹3,200.00</td>
                      </tr>
                      <tr className="border-t border-[#17191c]/10">
                        <td colSpan={3} className="text-right py-3 font-serif text-base text-[#17191c]">
                          Total Sanction Amount (INR)
                        </td>
                        <td className="text-right font-mono font-medium text-xl sm:text-2xl text-[#17191c]">
                          ₹{activeCost.toLocaleString('en-IN')}.00
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Approval Chain Stepper */}
                  <div className="mt-8 border-t border-[#17191c]/10 pt-5">
                    <div className="text-[11px] font-medium tracking-wider text-[#979799] uppercase mb-3">
                      Approval Chain · PWD Audit Protocol
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="rounded-full bg-[#f2f2f3] px-3.5 py-1.5 text-xs text-[#17191c] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#17191c]"></span>
                        <span className="font-medium">Citizen Submitter</span>
                        <span className="text-[10px] text-[#777b86]">08:11</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#979799]" />
                      <div className="rounded-full bg-[#f2f2f3] px-3.5 py-1.5 text-xs text-[#17191c] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#17191c]"></span>
                        <span className="font-medium">Ward Engg ✓</span>
                        <span className="text-[10px] text-[#777b86]">08:18</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#979799]" />
                      <div className="rounded-full bg-[#f2f2f3] px-3.5 py-1.5 text-xs text-[#17191c] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#17191c]"></span>
                        <span className="font-medium">Exec Engg ✓</span>
                        <span className="text-[10px] text-[#777b86]">08:24</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#979799]" />
                      <div className="rounded-full bg-[#fbe1d1] px-3.5 py-1.5 text-xs text-[#5d2a1a] flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5d2a1a] animate-pulse"></span>
                        <span>You (Chief Auditor)</span>
                        <span className="text-[10px] text-[#5d2a1a]/70 font-normal">Pending</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#979799]/40" />
                      <div className="rounded-full border border-dashed border-[#17191c]/20 px-3.5 py-1.5 text-xs text-[#979799] flex items-center gap-2">
                        <span>Zonal Commissioner</span>
                        <span className="text-[10px]">≥ ₹50k</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action Rail ("DECIDE") */}
                <div className="document-actions w-full xl:w-52 shrink-0 sticky top-4 space-y-4">
                  <div className="text-[11px] font-semibold tracking-wider text-[#979799] uppercase">
                    Decide
                  </div>

                  {/* APPROVE Button */}
                  <button
                    id="btn-approve"
                    onClick={() => triggerStamp('APPROVED', '#17191c')}
                    className="w-full bg-[#17191c] text-[#ffffff] hover:bg-black rounded-full py-3.5 px-4 flex flex-col items-center justify-center gap-1 transition-all shadow-[0_4px_16px_rgba(23,25,28,0.15)] cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Approve</span>
                    </div>
                    <span className="text-[10px] text-[#ffffff]/60 font-mono">
                      ⌘ + ↵
                    </span>
                  </button>

                  {/* REJECT Button */}
                  <button
                    id="btn-reject"
                    onClick={() => triggerStamp('REJECTED', '#5d2a1a')}
                    className="w-full border border-[#17191c]/20 bg-transparent text-[#17191c] hover:bg-[#fafafb] hover:border-[#17191c] rounded-full py-3 px-4 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-medium text-sm text-[#5d2a1a]">
                      <X className="w-4 h-4 stroke-[2.5]" />
                      <span>Reject</span>
                    </div>
                    <span className="text-[10px] text-[#777b86] font-mono">
                      ⌘ + ⌫
                    </span>
                  </button>

                  {/* NEEDS DETAIL Button */}
                  <button
                    id="btn-detail"
                    onClick={() => triggerStamp('NEEDS DETAIL', '#777b86')}
                    className="w-full bg-[#f2f2f3] text-[#17191c] hover:bg-[#e8e8ea] rounded-full py-3 px-4 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <Info className="w-4 h-4 stroke-[2]" />
                      <span>Request Detail</span>
                    </div>
                    <span className="text-[10px] text-[#777b86] font-mono">
                      ⌘ + D
                    </span>
                  </button>

                  {/* Policy Check Card */}
                  <div className="rounded-[20px] bg-[#f2f2f3] p-4">
                    <div className="text-[11px] font-semibold tracking-wider text-[#979799] uppercase pb-2 mb-2 border-b border-[#17191c]/8">
                      Policy Checks
                    </div>
                    <div className="text-xs flex justify-between py-1 text-[#17191c]">
                      <span className="text-[#777b86]">IRC-SP-100</span>
                      <span className="font-medium">Passed</span>
                    </div>
                    <div className="text-xs flex justify-between py-1 text-[#17191c]">
                      <span className="text-[#777b86]">Budget (PWD)</span>
                      <span className="font-medium">62% Allocated</span>
                    </div>
                    <div className="text-xs flex justify-between py-1 text-[#17191c]">
                      <span className="text-[#777b86]">Contractor DLP</span>
                      <span className="font-medium text-[#5d2a1a]">Active (24mo)</span>
                    </div>
                    <div className="text-xs flex justify-between py-1 text-[#17191c]">
                      <span className="text-[#777b86]">SLA Risk</span>
                      <span className="font-medium text-[#17191c]">High (24h)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIT LOG matching Steep Style */}
            <div className="mt-8 rounded-[24px] bg-[#17191c] text-[#f2f2f3] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="font-serif text-lg font-normal flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#fbe1d1]" />
                  <span>Audit Trail</span>
                  <span className="text-xs font-sans text-white/50 italic ml-1">ledger snapshot</span>
                </div>
                <span className="text-[11px] font-mono text-white/50">
                  Immutable · BBMP PWD Ledger
                </span>
              </div>
              <pre className="font-mono text-xs leading-6 whitespace-pre-wrap text-[#f2f2f3]/90 overflow-x-auto">
                {auditLogs.join('\n')}
              </pre>
            </div>

            {/* RECENTLY STAMPED MINI TABLE */}
            <div className="mt-8 rounded-[24px] bg-white border border-[#17191c]/8 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-[#17191c]/8 bg-white">
                <div className="font-serif text-lg font-normal flex items-center gap-2 text-[#17191c]">
                  <Archive className="w-4 h-4 text-[#777b86]" />
                  <span>Recently Stamped Work Orders</span>
                </div>
                <button
                  onClick={() => setActiveTab('HISTORY')}
                  className="text-xs text-[#17191c] hover:text-[#5d2a1a] transition-colors cursor-pointer"
                >
                  View All Dispatches →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="history-table w-full text-sm">
                  <thead className="bg-[#fafafb] text-[#777b86]">
                    <tr className="border-b border-[#17191c]/8">
                      <th className="text-left p-3.5 text-xs font-medium tracking-wide">WO ID</th>
                      <th className="text-left p-3.5 text-xs font-medium tracking-wide">Road / Corridor</th>
                      <th className="text-right p-3.5 text-xs font-medium tracking-wide">Amount</th>
                      <th className="text-left p-3.5 text-xs font-medium tracking-wide">Actor</th>
                      <th className="text-left p-3.5 text-xs font-medium tracking-wide">Timestamp</th>
                      <th className="text-right p-3.5 text-xs font-medium tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17191c]/5 text-[#17191c]">
                    <tr className="hover:bg-[#fafafb] transition-colors">
                      <td className="p-3.5 font-mono text-xs font-medium text-[#17191c]">WO-2026-0412</td>
                      <td className="p-3.5 text-xs">100ft Road Indiranagar</td>
                      <td className="text-right p-3.5 font-mono text-xs font-medium">₹18,440.00</td>
                      <td className="p-3.5 text-xs text-[#777b86]">M. Vossberg</td>
                      <td className="p-3.5 text-xs text-[#777b86]">06 Oct · 08:21</td>
                      <td className="text-right p-3.5">
                        <span className="inline-block text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#17191c]">
                          APPROVED
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#fafafb] transition-colors">
                      <td className="p-3.5 font-mono text-xs font-medium text-[#17191c]">WO-2026-0417</td>
                      <td className="p-3.5 text-xs">Mysore Road Flyover Ramp</td>
                      <td className="text-right p-3.5 font-mono text-xs font-medium">₹82,250.00</td>
                      <td className="p-3.5 text-xs text-[#777b86]">R. Sato</td>
                      <td className="p-3.5 text-xs text-[#777b86]">05 Oct · 17:04</td>
                      <td className="text-right p-3.5">
                        <span className="inline-block text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#fbe1d1] text-[#5d2a1a]">
                          REJECTED
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#fafafb] transition-colors">
                      <td className="p-3.5 font-mono text-xs font-medium text-[#17191c]">WO-2026-0408</td>
                      <td className="p-3.5 text-xs">Sarjapur Main Road Junction</td>
                      <td className="text-right p-3.5 font-mono text-xs font-medium">₹24,482.00</td>
                      <td className="p-3.5 text-xs text-[#777b86]">A. Klein</td>
                      <td className="p-3.5 text-xs text-[#777b86]">05 Oct · 14:48</td>
                      <td className="text-right p-3.5">
                        <span className="inline-block text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#777b86]">
                          NEEDS DETAIL
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ESCALATIONS TAB matching Steep */}
      {activeTab === 'ESCALATIONS' && (
        <div className="p-6 sm:p-8 space-y-6 max-w-[1200px] mx-auto">
          <div className="rounded-[24px] bg-[#fafafb] border border-[#17191c]/8 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#17191c]/8 gap-3">
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-normal text-[#17191c] flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-[#5d2a1a] stroke-[1.5]" />
                  <span>Escalation Queue <em className="italic font-normal">· 3 Past SLA</em></span>
                </div>
                <div className="text-xs text-[#777b86] mt-1">
                  Automatic ministerial escalation to Zonal Commissioner triggered at +24h past SLA deadline
                </div>
              </div>
              <span className="font-mono text-xs text-[#5d2a1a] bg-[#fbe1d1] px-3 py-1 rounded-full font-medium">
                SLA BREACH THRESHOLD
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              <div className="steep-card bg-white p-5 rounded-[24px] border border-[#17191c]/8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-[#fbe1d1] text-[#5d2a1a]">
                      +52h past SLA
                    </span>
                    <Flame className="w-4 h-4 text-[#5d2a1a]" />
                  </div>
                  <div className="font-serif text-lg font-normal text-[#17191c] mt-4">
                    Outer Ring Road (Bellandur)
                  </div>
                  <div className="font-mono font-medium text-2xl text-[#17191c] mt-1">
                    ₹48,920.00
                  </div>
                  <div className="text-xs text-[#777b86] mt-1">
                    Stuck at: Executive Engineer Tenders
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('INBOX');
                    addToast('Loaded Critical Escalation', 'Outer Ring Road Bellandur dossier opened in inbox', 'error');
                  }}
                  className="mt-6 w-full py-2.5 bg-[#17191c] text-white rounded-full text-xs font-medium hover:bg-black transition-colors cursor-pointer"
                >
                  Take Decision Now →
                </button>
              </div>

              <div className="steep-card bg-white p-5 rounded-[24px] border border-[#17191c]/8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-[#f2f2f3] text-[#17191c]">
                      +18h past SLA
                    </span>
                    <AlertTriangle className="w-4 h-4 text-[#777b86]" />
                  </div>
                  <div className="font-serif text-lg font-normal text-[#17191c] mt-4">
                    Bannerghatta Road (Meenakshi)
                  </div>
                  <div className="font-mono font-medium text-2xl text-[#17191c] mt-1">
                    ₹31,200.00
                  </div>
                  <div className="text-xs text-[#777b86] mt-1">
                    Stuck at: Quality Auditor Lab Core
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('INBOX');
                    addToast('Loaded Escalation', 'Bannerghatta Road dossier opened in inbox', 'warning');
                  }}
                  className="mt-6 w-full py-2.5 bg-[#17191c] text-white rounded-full text-xs font-medium hover:bg-black transition-colors cursor-pointer"
                >
                  Take Decision Now →
                </button>
              </div>

              <div className="steep-card bg-white p-5 rounded-[24px] border border-[#17191c]/8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-[#fbe1d1] text-[#5d2a1a]">
                      +71h past SLA
                    </span>
                    <Flame className="w-4 h-4 text-[#5d2a1a]" />
                  </div>
                  <div className="font-serif text-lg font-normal text-[#17191c] mt-4">
                    Old Madras Road (Swami Vivekananda)
                  </div>
                  <div className="font-mono font-medium text-2xl text-[#17191c] mt-1">
                    ₹61,440.00
                  </div>
                  <div className="text-xs text-[#777b86] mt-1">
                    Stuck at: Zonal Commissioner Sanction
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('INBOX');
                    addToast('Loaded Critical Escalation', 'Old Madras Road dossier opened in inbox', 'error');
                  }}
                  className="mt-6 w-full py-2.5 bg-[#17191c] text-white rounded-full text-xs font-medium hover:bg-black transition-colors cursor-pointer"
                >
                  Take Decision Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'HISTORY' && (
        <div className="p-6 sm:p-8 max-w-[1200px] mx-auto">
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#17191c]/8 pb-5 mb-5 gap-3">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#17191c]">
                  Municipal Audit & Dispatch <em className="italic">History</em>
                </h2>
                <p className="text-xs text-[#777b86] mt-1">
                  Complete immutable ledger of 2,481 approved, rejected, and clarified road repair work orders.
                </p>
              </div>
              <span className="font-mono text-xs font-medium px-3 py-1 rounded-full bg-[#f2f2f3] text-[#17191c]">
                2,481 Total Audits
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="history-table w-full text-sm">
                <thead className="bg-[#fafafb] text-[#777b86]">
                  <tr className="border-b border-[#17191c]/8">
                    <th className="text-left p-3.5 text-xs font-medium tracking-wide">WO ID</th>
                    <th className="text-left p-3.5 text-xs font-medium tracking-wide">Road / Corridor</th>
                    <th className="text-right p-3.5 text-xs font-medium tracking-wide">Amount (INR)</th>
                    <th className="text-left p-3.5 text-xs font-medium tracking-wide">Inspector / Auditor</th>
                    <th className="text-left p-3.5 text-xs font-medium tracking-wide">Timestamp</th>
                    <th className="text-right p-3.5 text-xs font-medium tracking-wide">Stamped Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17191c]/5 text-[#17191c]">
                  <tr className="hover:bg-[#fafafb] transition-colors">
                    <td className="p-3.5 font-mono text-xs font-medium">WO-2026-0418</td>
                    <td className="p-3.5 text-xs font-serif text-base">Outer Ring Road (Bellandur)</td>
                    <td className="text-right p-3.5 font-mono text-xs font-medium">₹48,920.00</td>
                    <td className="p-3.5 text-xs text-[#777b86]">Chief Auditor Mara</td>
                    <td className="p-3.5 text-xs text-[#777b86]">06 Oct · 08:30</td>
                    <td className="text-right p-3.5">
                      <span className="inline-block text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#17191c]">
                        APPROVED
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#fafafb] transition-colors">
                    <td className="p-3.5 font-mono text-xs font-medium">WO-2026-0416</td>
                    <td className="p-3.5 text-xs font-serif text-base">100ft Road Indiranagar</td>
                    <td className="text-right p-3.5 font-mono text-xs font-medium">₹18,440.00</td>
                    <td className="p-3.5 text-xs text-[#777b86]">Ward Engg A. Klein</td>
                    <td className="p-3.5 text-xs text-[#777b86]">06 Oct · 08:14</td>
                    <td className="text-right p-3.5">
                      <span className="inline-block text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#17191c]">
                        APPROVED
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#fafafb] transition-colors">
                    <td className="p-3.5 font-mono text-xs font-medium">WO-2026-0412</td>
                    <td className="p-3.5 text-xs font-serif text-base">Mysore Road Flyover Ramp</td>
                    <td className="text-right p-3.5 font-mono text-xs font-medium">₹82,250.00</td>
                    <td className="p-3.5 text-xs text-[#777b86]">Auditor R. Sato</td>
                    <td className="p-3.5 text-xs text-[#777b86]">05 Oct · 17:04</td>
                    <td className="text-right p-3.5">
                      <span className="inline-block text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#fbe1d1] text-[#5d2a1a]">
                        REJECTED
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#fafafb] transition-colors">
                    <td className="p-3.5 font-mono text-xs font-medium">WO-2026-0409</td>
                    <td className="p-3.5 text-xs font-serif text-base">Hosur Road (Silk Board)</td>
                    <td className="text-right p-3.5 font-mono text-xs font-medium">₹36,120.00</td>
                    <td className="p-3.5 text-xs text-[#777b86]">Chief Auditor Mara</td>
                    <td className="p-3.5 text-xs text-[#777b86]">05 Oct · 15:32</td>
                    <td className="text-right p-3.5">
                      <span className="inline-block text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#17191c]">
                        APPROVED
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#fafafb] transition-colors">
                    <td className="p-3.5 font-mono text-xs font-medium">WO-2026-0408</td>
                    <td className="p-3.5 text-xs font-serif text-base">Sarjapur Main Road</td>
                    <td className="text-right p-3.5 font-mono text-xs font-medium">₹24,482.00</td>
                    <td className="p-3.5 text-xs text-[#777b86]">Exec Engg Devin</td>
                    <td className="p-3.5 text-xs text-[#777b86]">05 Oct · 14:48</td>
                    <td className="text-right p-3.5">
                      <span className="inline-block text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#777b86]">
                        NEEDS DETAIL
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WORKFLOW BUILDER TAB matching Steep */}
      {activeTab === 'WORKFLOW' && (
        <div className="p-6 sm:p-8 max-w-[1200px] mx-auto">
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 border-b border-[#17191c]/8 gap-4">
              <div>
                <div className="font-serif text-2xl font-normal flex items-center gap-2 text-[#17191c]">
                  <GitMerge className="w-5 h-5 text-[#777b86]" />
                  <span>Workflow Protocol <em className="italic">— Arterial High-Hazard ≥ 80</em></span>
                </div>
                <div className="text-xs text-[#777b86] mt-1">
                  Drag stages to reorder · 4 active stages governing 142 live Bengaluru repair requests
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addToast('Stage Created', 'Added conditional stage to civic approval pipeline', 'info')}
                  className="px-4 py-2 text-xs font-medium rounded-full bg-[#f2f2f3] hover:bg-[#e8e8ea] text-[#17191c] transition-colors cursor-pointer"
                >
                  + Add Stage
                </button>
                <button
                  onClick={() => addToast('Workflow Published', 'New PWD sanction protocol synced to all zonal engineers', 'success')}
                  className="px-4 py-2 text-xs font-medium rounded-full bg-[#17191c] text-white hover:bg-black transition-colors cursor-pointer"
                >
                  Publish Protocol
                </button>
              </div>
            </div>

            <div className="p-8 sm:p-12 bg-[#fafafb]">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-white rounded-[20px] p-5 border border-[#17191c]/8 shadow-sm cursor-grab min-w-[160px]">
                  <div className="text-[10px] font-semibold text-[#979799] uppercase">TRIGGER</div>
                  <div className="font-medium text-sm text-[#17191c] mt-1">Citizen Report</div>
                  <div className="text-[11px] text-[#777b86] mt-0.5">AI Conf &gt; 80%</div>
                </div>

                <div className="flex items-center text-[#777b86]">
                  <ChevronRight className="w-4 h-4" />
                </div>

                <div className="bg-white rounded-[20px] p-5 border border-[#17191c]/8 shadow-sm cursor-grab min-w-[160px]">
                  <div className="text-[10px] font-semibold text-[#979799] uppercase">STAGE 1 · WARD</div>
                  <div className="font-medium text-sm text-[#17191c] mt-1">Junior Engineer</div>
                  <div className="text-[11px] text-[#777b86] mt-0.5">SLA: 24h</div>
                </div>

                <div className="flex items-center text-[#777b86]">
                  <ChevronRight className="w-4 h-4" />
                </div>

                <div className="bg-white rounded-[20px] p-5 border border-[#17191c]/8 shadow-sm cursor-grab min-w-[160px]">
                  <div className="text-[10px] font-semibold text-[#979799] uppercase">STAGE 2 · TENDER</div>
                  <div className="font-medium text-sm text-[#17191c] mt-1">Executive Engineer</div>
                  <div className="text-[11px] text-[#777b86] mt-0.5">SLA: 48h · KTPP</div>
                </div>

                <div className="flex items-center text-[#777b86]">
                  <ChevronRight className="w-4 h-4" />
                </div>

                <div className="bg-[#fbe1d1] rounded-[20px] p-5 border border-[#5d2a1a]/15 shadow-sm cursor-grab min-w-[160px]">
                  <div className="text-[10px] font-semibold text-[#5d2a1a]/70 uppercase">STAGE 3 · AUDIT</div>
                  <div className="font-serif text-base text-[#5d2a1a] mt-1">Chief Auditor</div>
                  <div className="text-[11px] text-[#5d2a1a]/85 mt-0.5">IRC-SP-100 Active</div>
                </div>

                <div className="flex items-center text-[#777b86]">
                  <ChevronRight className="w-4 h-4" />
                </div>

                <div className="bg-white rounded-[20px] p-5 border border-dashed border-[#17191c]/20 cursor-grab min-w-[160px]">
                  <div className="text-[10px] font-semibold text-[#979799] uppercase">STAGE 4 · COND.</div>
                  <div className="font-medium text-sm text-[#17191c] mt-1">Zonal Comm.</div>
                  <div className="text-[11px] text-[#777b86] mt-0.5">Sanction ≥ ₹50k</div>
                </div>

                <div className="flex items-center text-[#777b86]">
                  <ChevronRight className="w-4 h-4" />
                </div>

                <div className="bg-[#17191c] text-white rounded-[20px] p-5 shadow-sm min-w-[160px]">
                  <div className="text-[10px] font-semibold text-white/60 uppercase">OUTCOME</div>
                  <div className="font-medium text-sm mt-1">Dispatch & Pay</div>
                  <div className="text-[11px] text-white/70 mt-0.5">Ledger Committed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
