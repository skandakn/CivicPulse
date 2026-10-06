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

export interface HistoryRecord {
  id: string;
  woId: string;
  roadName: string;
  amount: number;
  inspector: string;
  timestamp: string;
  status: 'APPROVED' | 'REJECTED' | 'NEEDS DETAIL';
  incidentId?: string;
}

export interface EscalationItem {
  id: string;
  incidentId: string;
  roadName: string;
  amount: number;
  slaNotice: string;
  stuckAt: string;
  severity: 'CRITICAL' | 'HIGH';
  status: 'PENDING' | 'DECIDED';
  decidedStatus?: 'APPROVED' | 'REJECTED' | 'NEEDS DETAIL';
}

const INITIAL_HISTORY: HistoryRecord[] = [
  {
    id: 'hist-01',
    woId: 'WO-2026-0418',
    roadName: 'Outer Ring Road (Bellandur)',
    amount: 48920,
    inspector: 'Chief Auditor Mara',
    timestamp: '06 OCT · 08:30',
    status: 'APPROVED',
    incidentId: 'inc-01'
  },
  {
    id: 'hist-02',
    woId: 'WO-2026-0416',
    roadName: '100ft Road Indiranagar',
    amount: 18440,
    inspector: 'Ward Engg A. Klein',
    timestamp: '06 OCT · 08:14',
    status: 'APPROVED',
    incidentId: 'inc-05'
  },
  {
    id: 'hist-03',
    woId: 'WO-2026-0412',
    roadName: 'Mysore Road Flyover Ramp',
    amount: 82250,
    inspector: 'Auditor R. Sato',
    timestamp: '05 OCT · 17:04',
    status: 'REJECTED',
    incidentId: 'inc-11'
  },
  {
    id: 'hist-04',
    woId: 'WO-2026-0409',
    roadName: 'Hosur Road (Silk Board)',
    amount: 36120,
    inspector: 'Chief Auditor Mara',
    timestamp: '05 OCT · 15:32',
    status: 'APPROVED',
    incidentId: 'inc-02'
  },
  {
    id: 'hist-05',
    woId: 'WO-2026-0408',
    roadName: 'Sarjapur Main Road',
    amount: 24482,
    inspector: 'Exec Engg Devin',
    timestamp: '05 OCT · 14:48',
    status: 'NEEDS DETAIL',
    incidentId: 'inc-12'
  }
];

const INITIAL_ESCALATIONS: EscalationItem[] = [
  {
    id: 'esc-01',
    incidentId: 'inc-01',
    roadName: 'Outer Ring Road (Bellandur)',
    amount: 48920,
    slaNotice: '+52H PAST SLA',
    stuckAt: 'Executive Engineer Tenders',
    severity: 'CRITICAL',
    status: 'PENDING'
  },
  {
    id: 'esc-02',
    incidentId: 'inc-09',
    roadName: 'Bannerghatta Road (Meenakshi)',
    amount: 31200,
    slaNotice: '+18H PAST SLA',
    stuckAt: 'Quality Auditor Lab Core',
    severity: 'CRITICAL',
    status: 'PENDING'
  },
  {
    id: 'esc-03',
    incidentId: 'inc-10',
    roadName: 'Old Madras Road (Swami Vivekananda)',
    amount: 61440,
    slaNotice: '+71H PAST SLA',
    stuckAt: 'Zonal Commissioner Sanction',
    severity: 'CRITICAL',
    status: 'PENDING'
  }
];

export const getIncidentWorkOrderId = (inc: PotholeIncident): string => {
  if (inc.id === 'inc-01' || inc.roadName.includes('Outer Ring Road (Bellandur)')) return 'WO-2026-0418';
  if (inc.id === 'inc-05' || inc.roadName.includes('100ft Road')) return 'WO-2026-0416';
  if (inc.id === 'inc-02' || inc.roadName.includes('Hosur Road')) return 'WO-2026-0409';
  if (inc.id === 'inc-09' || inc.roadName.includes('Bannerghatta Road')) return 'WO-2026-0422';
  if (inc.id === 'inc-10' || inc.roadName.includes('Old Madras Road')) return 'WO-2026-0425';
  if (inc.id === 'inc-11' || inc.roadName.includes('Mysore Road')) return 'WO-2026-0412';
  if (inc.id === 'inc-12' || inc.roadName.includes('Sarjapur')) return 'WO-2026-0408';
  const numPart = inc.code.replace(/\D/g, '').slice(-4) || '0418';
  return `WO-2026-${numPart.padStart(4, '0')}`;
};

export const getIncidentWorkOrderCost = (inc: PotholeIncident): number => {
  if (inc.id === 'inc-01' || inc.roadName.includes('Outer Ring Road (Bellandur)')) return 48920;
  if (inc.id === 'inc-05' || inc.roadName.includes('100ft Road')) return 18440;
  if (inc.id === 'inc-02' || inc.roadName.includes('Hosur Road')) return 36120;
  if (inc.id === 'inc-09' || inc.roadName.includes('Bannerghatta Road')) return 31200;
  if (inc.id === 'inc-10' || inc.roadName.includes('Old Madras Road')) return 61440;
  if (inc.id === 'inc-11' || inc.roadName.includes('Mysore Road')) return 82250;
  if (inc.id === 'inc-12' || inc.roadName.includes('Sarjapur')) return 24482;
  return Math.max(12000, Math.round((inc.depthCm * 1800) + (inc.surfaceAreaSqM * 6500)));
};

export const PriorityQueuePage: React.FC = () => {
  const {
    filteredIncidents,
    selectedIncident,
    setSelectedIncident,
    roads,
    addToast,
    updateIncidentStatus
  } = useApp();

  // Active top tab matching Approva: Inbox | Escalations | History | Workflow Builder
  const [activeTab, setActiveTab] = useState<'INBOX' | 'ESCALATIONS' | 'HISTORY' | 'WORKFLOW'>('INBOX');

  // Sub-filter: ALL | ARTERIAL | CRITICAL | UNDER WARRANTY
  const [subFilter, setSubFilter] = useState<'ALL' | 'ARTERIAL' | 'CRITICAL' | 'WARRANTY'>('ALL');

  // Escalation items state
  const [escalations, setEscalations] = useState<EscalationItem[]>(INITIAL_ESCALATIONS);

  // History ledger state
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(INITIAL_HISTORY);

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

  // Calculate canonical work order cost
  const getEstimatedCost = (inc: PotholeIncident): number => {
    return getIncidentWorkOrderCost(inc);
  };

  const activeCost = activeItem ? getEstimatedCost(activeItem) : 48920;
  const activeWoId = activeItem ? getIncidentWorkOrderId(activeItem) : 'WO-2026-0418';

  // Exact arithmetic line items adding up to activeCost
  const lineItem1 = Math.round(activeCost * 0.44);
  const lineItem2 = Math.round(activeCost * 0.16);
  const lineItem3 = Math.round(activeCost * 0.18);
  const activeSubtotal = Math.round(activeCost * 0.84);
  const lineItem4 = activeSubtotal - (lineItem1 + lineItem2 + lineItem3);
  const activeGst = activeCost - activeSubtotal;

  // Handle dropping stamp
  const triggerStamp = useCallback((label: 'APPROVED' | 'REJECTED' | 'NEEDS DETAIL', color: string) => {
    if (!activeItem) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCurrentStamp({
      label,
      color,
      time: timeStr
    });

    const woId = getIncidentWorkOrderId(activeItem);
    const cost = getIncidentWorkOrderCost(activeItem);
    const dateStr = '06 OCT · ' + timeStr;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z';
    const newLog = `${timestamp}  STAMPED    chief.auditor@bbmp.gov.in         ${label} · ${woId} · final decision issued`;
    setAuditLogs((prev) => [newLog, ...prev]);

    // Prepend newly decided entry to audit ledger
    const newRecord: HistoryRecord = {
      id: `hist-${Date.now()}`,
      woId,
      roadName: activeItem.roadName,
      amount: cost,
      inspector: 'Chief Auditor Mara',
      timestamp: dateStr,
      status: label,
      incidentId: activeItem.id
    };
    setHistoryRecords((prev) => [newRecord, ...prev]);

    // Mark escalation as decided if matching
    setEscalations((prev) =>
      prev.map((esc) => {
        if (esc.incidentId === activeItem.id || esc.roadName.toLowerCase().includes(activeItem.roadName.toLowerCase().split(' ')[0])) {
          return { ...esc, status: 'DECIDED', decidedStatus: label };
        }
        return esc;
      })
    );

    // Update incident status in global app context
    const nextStatus = label === 'APPROVED' ? 'TENDER_ASSIGNED' : 'TRIAGED';
    updateIncidentStatus(activeItem.id, nextStatus);

    if (label === 'APPROVED') {
      addToast(
        'Municipal Work Order Approved & Dispatched',
        `Dispatched rapid hot-mix repair crew for ${activeItem.roadName} (${woId}) · ₹${cost.toLocaleString('en-IN')}`,
        'success'
      );
    } else if (label === 'REJECTED') {
      addToast(
        'Work Order Disputed & Rejected',
        `Notice dispatched to contractor regarding warranty non-compliance for ${woId}.`,
        'error'
      );
    } else {
      addToast(
        'Clarification & Re-inspection Requested',
        `Returned ${woId} to BBMP Ward Engineer for core-sample depth verification.`,
        'warning'
      );
    }
  }, [activeItem, addToast, updateIncidentStatus]);

  // Action: Take decision on an escalation card
  const handleTakeEscalationDecision = (esc: EscalationItem) => {
    const matched = filteredIncidents.find(i => i.id === esc.incidentId || i.roadName.toLowerCase().includes(esc.roadName.toLowerCase().split(' ')[0])) || filteredIncidents[0];
    if (matched) {
      setSelectedIncident(matched);
    }
    if (esc.status === 'DECIDED' && esc.decidedStatus) {
      const stampColor = esc.decidedStatus === 'APPROVED' ? '#2E8C42' : esc.decidedStatus === 'REJECTED' ? '#C03A3A' : '#E8A030';
      setCurrentStamp({
        label: esc.decidedStatus,
        color: stampColor,
        time: 'STAMPED'
      });
    } else {
      setCurrentStamp(null);
    }
    setActiveTab('INBOX');
    addToast(
      'Escalation Docket Loaded',
      `Loaded ${esc.roadName} (₹${esc.amount.toLocaleString('en-IN')}) into Hazard Inbox for immediate sanction`,
      'warning'
    );
  };

  // Action: Load history work order into Inbox document pane
  const handleSelectHistoryRecord = (rec: HistoryRecord) => {
    const matched = filteredIncidents.find(i => i.id === rec.incidentId || i.roadName.toLowerCase().includes(rec.roadName.toLowerCase().split(' ')[0])) || filteredIncidents[0];
    if (matched) {
      setSelectedIncident(matched);
    }
    const stampColor = rec.status === 'APPROVED' ? '#2E8C42' : rec.status === 'REJECTED' ? '#C03A3A' : '#E8A030';
    setCurrentStamp({
      label: rec.status,
      color: stampColor,
      time: rec.timestamp
    });
    setActiveTab('INBOX');
    addToast(
      `Audit Ledger: ${rec.woId}`,
      `Inspecting stamped work order for ${rec.roadName} (${rec.status})`,
      'info'
    );
  };

  // Pending escalations count
  const pendingEscalationsCount = escalations.filter(e => e.status === 'PENDING').length;

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
    <div className="space-y-0 text-left -mx-3 sm:-mx-5 lg:-mx-6">
      {/* Approva Brutalist Tabs Bar */}
      <div className="px-4 lg:px-6 pt-3 flex gap-0 border-b-[3px] border-[#121210] bg-[#CFE8D6] overflow-x-auto">
        <button
          onClick={() => setActiveTab('INBOX')}
          className={`font-display font-extrabold text-sm sm:text-base px-6 py-2.5 border-[3px] border-[#121210] border-b-0 -mb-[3px] cursor-pointer transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'INBOX' ? 'tab-active' : 'bg-white text-[#121210] hover:bg-zinc-50'
          }`}
        >
          <Inbox className="w-4 h-4 stroke-[2.5]" />
          <span>Hazard Inbox</span>
        </button>

        <button
          onClick={() => setActiveTab('ESCALATIONS')}
          className={`font-display font-extrabold text-sm sm:text-base px-6 py-2.5 border-[3px] border-[#121210] border-l-0 border-b-0 -mb-[3px] cursor-pointer transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'ESCALATIONS' ? 'tab-active' : 'bg-white text-[#121210] hover:bg-zinc-50'
          }`}
        >
          <Flame className="w-4 h-4 stroke-[2.5] text-[#C03A3A]" />
          <span>Escalations ({pendingEscalationsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`font-display font-extrabold text-sm sm:text-base px-6 py-2.5 border-[3px] border-[#121210] border-l-0 border-b-0 -mb-[3px] cursor-pointer transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'HISTORY' ? 'tab-active' : 'bg-white text-[#121210] hover:bg-zinc-50'
          }`}
        >
          <Archive className="w-4 h-4 stroke-[2.5]" />
          <span>Audit History</span>
        </button>

        <button
          onClick={() => setActiveTab('WORKFLOW')}
          className={`font-display font-extrabold text-sm sm:text-base px-6 py-2.5 border-[3px] border-[#121210] border-l-0 border-b-0 -mb-[3px] cursor-pointer transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'WORKFLOW' ? 'tab-active' : 'bg-white text-[#121210] hover:bg-zinc-50'
          }`}
        >
          <GitMerge className="w-4 h-4 stroke-[2.5]" />
          <span>Workflow Builder</span>
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'INBOX' && (
        <div className="flex flex-col xl:flex-row min-h-[calc(100vh-140px)]">
          {/* LEFT COLUMN: Request Queue (42% width) */}
          <section className="w-full xl:w-[42%] border-b-[3px] xl:border-b-0 xl:border-r-[3px] border-[#121210] p-4 sm:p-5 space-y-4 bg-[#CFE8D6] overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Filter pills & sort status */}
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setSubFilter('ALL')}
                  className={`px-2.5 py-1 border-2 border-[#121210] transition-colors cursor-pointer ${
                    subFilter === 'ALL' ? 'bg-[#121210] text-white' : 'bg-white text-[#121210]'
                  }`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setSubFilter('ARTERIAL')}
                  className={`px-2.5 py-1 border-2 border-[#121210] transition-colors cursor-pointer ${
                    subFilter === 'ARTERIAL' ? 'bg-[#121210] text-white' : 'bg-white text-[#121210]'
                  }`}
                >
                  ARTERIAL
                </button>
                <button
                  onClick={() => setSubFilter('CRITICAL')}
                  className={`px-2.5 py-1 border-2 border-[#121210] transition-colors cursor-pointer ${
                    subFilter === 'CRITICAL' ? 'bg-[#121210] text-white' : 'bg-white text-[#121210]'
                  }`}
                >
                  CRITICAL
                </button>
                <button
                  onClick={() => setSubFilter('WARRANTY')}
                  className={`px-2.5 py-1 border-2 border-[#121210] transition-colors cursor-pointer ${
                    subFilter === 'WARRANTY' ? 'bg-[#121210] text-white' : 'bg-white text-[#121210]'
                  }`}
                >
                  DLP WARRANTY
                </button>
              </div>
              <span className="text-[#121210]/60 hidden sm:inline">SORT: RISK SCORE ↓</span>
            </div>

            {/* Request Cards Stream */}
            <div className="space-y-4">
              {displayItems.map((inc, index) => {
                const cost = getEstimatedCost(inc);
                const woId = getIncidentWorkOrderId(inc);
                const isSelected = activeItem?.id === inc.id;
                const isEscalated = inc.severity === 'CRITICAL';

                return (
                  <article
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setCurrentStamp(null);
                    }}
                    className={`brut-card p-4 relative cursor-pointer select-none transition-all ${
                      isSelected
                        ? 'ring-3 ring-[#121210] translate-x-1 -translate-y-1 bg-[#FFFFFF]'
                        : 'bg-[#FFFFFF] hover:bg-[#F9FCFA]'
                    }`}
                  >
                    {/* Top ID Badge */}
                    <span
                      className={`absolute -top-2.5 -left-2 px-2 py-0.5 text-[10px] font-mono font-bold border-2 border-[#121210] ${
                        isEscalated
                          ? 'bg-[#C03A3A] text-white'
                          : index === 0
                          ? 'bg-[#E8A030] text-[#121210]'
                          : 'bg-white text-[#121210]'
                      }`}
                    >
                      {isEscalated ? `⚠ ${woId}` : woId}
                    </span>

                    {/* Title + Amount */}
                    <div className="flex justify-between items-start gap-2 pt-1">
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-extrabold text-lg sm:text-xl leading-tight text-[#121210] truncate">
                          {inc.roadName}
                        </div>
                        <div className="text-xs text-[#121210]/70 mt-0.5 font-body truncate">
                          {inc.landmark} · {inc.depthCm}cm depth · {inc.surfaceAreaSqM}m² area
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-xl sm:text-2xl text-[#121210]">
                          ₹{cost.toLocaleString('en-IN')}.00
                        </div>
                        <div className="text-[10px] font-mono text-[#121210]/60 font-bold">
                          INR · PWD TENDER
                        </div>
                      </div>
                    </div>

                    {/* Approva Brutalist Tags */}
                    {(() => {
                      const { category, surfaceType } = getRoadInfo(inc);
                      return (
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className="tag bg-[#CFE8D6]">{category}</span>
                          <span className="tag bg-white">{surfaceType}</span>
                          {inc.isUnderWarranty && (
                            <span className="tag bg-[#2E8C42] text-white">DLP WARRANTY</span>
                          )}
                          {isEscalated ? (
                            <span className="tag bg-[#C03A3A] text-white">
                              <Flame className="w-3 h-3 stroke-[2.5]" />
                              ESCALATED
                            </span>
                          ) : (
                            <span className="tag bg-[#E8A030] text-[#121210]">
                              <Clock className="w-3 h-3 stroke-[2.5]" />
                              24H SLA
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Submitter Info + Stepper Dots */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t-2 border-[#121210]/15">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 border-2 border-[#121210] bg-[#CFE8D6] flex items-center justify-center font-display font-extrabold text-xs text-[#121210]">
                          {inc.wardNumber % 2 === 0 ? 'DP' : 'LA'}
                        </div>
                        <div className="text-xs leading-tight">
                          <span className="font-display font-bold text-[#121210]">
                            {inc.wardNumber % 2 === 0 ? 'Devin Park' : 'Lena Akhtar'}
                          </span>
                          <br />
                          <span className="font-mono text-[10px] text-[#121210]/60">
                            WARD {inc.wardNumber} · {inc.zone.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Approval chain status pipeline dots */}
                      <div className="flex items-center">
                        <span className="chain-node bg-[#2E8C42] text-white">✓</span>
                        <span className="chain-line"></span>
                        <span className="chain-node bg-[#2E8C42] text-white">✓</span>
                        <span className="chain-line"></span>
                        <span className={`chain-node ${isEscalated ? 'bg-[#C03A3A] text-white' : 'bg-[#E8A030] text-[#121210]'}`}>
                          {isEscalated ? '!' : 'M'}
                        </span>
                        <span className="chain-line"></span>
                        <span className="chain-node bg-white text-[#121210]/40">·</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* RIGHT COLUMN: Document Pane + Action Rail */}
          <section className="flex-1 p-4 sm:p-6 overflow-y-auto grid-paper bg-[#CFE8D6]">
            {activeItem && (
              <div className="document-layout flex flex-col xl:flex-row gap-5 items-start">
                {/* Municipal Work Order / PO Document */}
                <div id="invoice" className="flex-1 w-full bg-white brut-lg p-6 sm:p-8 relative overflow-hidden min-h-[580px]">
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
                  <div className="flex flex-col sm:flex-row justify-between items-start border-b-[3px] border-[#121210] pb-5 gap-4">
                    <div>
                      <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#121210] tracking-tight">
                        MUNICIPAL WORK ORDER
                      </div>
                      <div className="font-mono text-xs font-bold text-[#121210]/70 mt-1">
                        {activeWoId} · ISSUED 06 OCT 2026 · PWD SANCTION
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <div className="font-mono text-[10px] font-bold text-[#121210]/60 tracking-wider">
                        BILL TO / JURISDICTION
                      </div>
                      <div className="font-display font-extrabold text-[#121210] text-sm sm:text-base">
                        Bruhat Bengaluru Mahanagara Palike
                      </div>
                      <div className="font-mono text-[10px] text-[#121210]/60">
                        WARD {activeItem.wardNumber} ({activeItem.wardName}) · {activeItem.zone} ZONE
                      </div>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div>
                      <div className="font-mono text-[10px] font-bold text-[#121210]/60 tracking-widest uppercase">
                        ASSIGNED CONTRACTOR
                      </div>
                      <div className="font-display font-extrabold text-base sm:text-lg text-[#121210] leading-tight mt-0.5">
                        {activeItem.contractorName || 'Star Infratech Pvt Ltd'}
                      </div>
                      <div className="text-xs font-mono text-[#121210]/70 mt-0.5">
                        PWD-ID #4420 · RATING: 4.2/5.0
                      </div>
                    </div>

                    <div>
                      <div className="font-mono text-[10px] font-bold text-[#121210]/60 tracking-widest uppercase">
                        HAZARD SPECIFICATION
                      </div>
                      <div className="font-display font-extrabold text-base sm:text-lg text-[#121210] leading-tight mt-0.5">
                        {activeItem.severity} · {getRoadInfo(activeItem).surfaceType}
                      </div>
                      <div className="text-xs font-mono text-[#121210]/70 mt-0.5">
                        DEPTH: {activeItem.depthCm}cm · AREA: {activeItem.surfaceAreaSqM}m²
                      </div>
                    </div>

                    <div>
                      <div className="font-mono text-[10px] font-bold text-[#121210]/60 tracking-widest uppercase">
                        SLA MANDATE DUE
                      </div>
                      <div className="font-display font-extrabold text-base sm:text-lg text-[#121210] leading-tight mt-0.5">
                        08 OCT 2026 (48H)
                      </div>
                      <div className="text-xs font-mono text-[#121210]/70 mt-0.5">
                        EMERGENCY TRANSIT CORRIDOR
                      </div>
                    </div>
                  </div>

                  {/* Line Items PO Table with exact arithmetic summing to activeCost */}
                  <table className="w-full mt-6 font-mono text-sm">
                    <thead>
                      <tr className="border-y-[3px] border-[#121210]">
                        <th className="text-left py-2 font-bold text-xs tracking-widest text-[#121210]">
                          DESCRIPTION (IRC-SP-100 SPEC)
                        </th>
                        <th className="text-right py-2 font-bold text-xs tracking-widest text-[#121210] w-14 sm:w-16">
                          QTY
                        </th>
                        <th className="text-right py-2 font-bold text-xs tracking-widest text-[#121210] w-24 sm:w-28">
                          UNIT
                        </th>
                        <th className="text-right py-2 font-bold text-xs tracking-widest text-[#121210] w-28 sm:w-32">
                          AMOUNT
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#121210]/20">
                      <tr>
                        <td className="py-2.5">
                          Bituminous Concrete Hot-Mix (Grading II, 50mm compacted)
                        </td>
                        <td className="text-right font-bold">{Math.max(1, Math.round(activeItem.surfaceAreaSqM * 1.5))}</td>
                        <td className="text-right text-xs">₹12,400.00</td>
                        <td className="text-right font-bold">
                          ₹{lineItem1.toLocaleString('en-IN')}.00
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5">
                          Tack coat application with rapid bitumen emulsion (RS-1)
                        </td>
                        <td className="text-right font-bold">{activeItem.depthCm > 8 ? 2 : 1}</td>
                        <td className="text-right text-xs">₹3,450.00</td>
                        <td className="text-right font-bold">
                          ₹{lineItem2.toLocaleString('en-IN')}.00
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5">
                          Pneumatic roller compaction & cold milling crew
                        </td>
                        <td className="text-right font-bold">1</td>
                        <td className="text-right text-xs">₹14,800.00</td>
                        <td className="text-right font-bold">
                          ₹{lineItem3.toLocaleString('en-IN')}.00
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5">
                          Traffic diversion barriers & IRC retro-reflective beacons
                        </td>
                        <td className="text-right font-bold">1</td>
                        <td className="text-right text-xs">₹4,200.00</td>
                        <td className="text-right font-bold">
                          ₹{lineItem4.toLocaleString('en-IN')}.00
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="text-right py-2 text-xs text-[#121210]/70">
                          Subtotal (Base Work Order Estimate)
                        </td>
                        <td className="text-right font-bold text-sm">
                          ₹{activeSubtotal.toLocaleString('en-IN')}.00
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="text-right py-1 text-xs text-[#121210]/70">
                          GST / Infrastructure Cess (16%)
                        </td>
                        <td className="text-right font-bold text-sm">
                          ₹{activeGst.toLocaleString('en-IN')}.00
                        </td>
                      </tr>
                      <tr className="border-t-[3px] border-[#121210]">
                        <td colSpan={3} className="text-right py-2 font-display font-extrabold text-base text-[#121210]">
                          TOTAL SANCTION AMOUNT (INR)
                        </td>
                        <td className="text-right font-mono font-extrabold text-xl sm:text-2xl text-[#121210]">
                          ₹{activeCost.toLocaleString('en-IN')}.00
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Approval Chain Stepper */}
                  <div className="mt-8 border-t-[3px] border-[#121210] pt-4">
                    <div className="font-mono text-[10px] font-bold text-[#121210]/60 tracking-widest uppercase mb-3">
                      APPROVAL CHAIN · PWD AUDIT PROTOCOL
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="brut-sm bg-[#2E8C42] text-white px-3 py-2 text-xs">
                        <div className="font-display font-extrabold">Citizen Submitter</div>
                        <div className="font-mono text-[10px] opacity-80">Reported · 08:11</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#121210]" />
                      <div className="brut-sm bg-[#2E8C42] text-white px-3 py-2 text-xs">
                        <div className="font-display font-extrabold">Ward Engg ✓</div>
                        <div className="font-mono text-[10px] opacity-80">Verified · 08:18</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#121210]" />
                      <div className="brut-sm bg-[#2E8C42] text-white px-3 py-2 text-xs">
                        <div className="font-display font-extrabold">Exec Engg ✓</div>
                        <div className="font-mono text-[10px] opacity-80">Tender · 08:24</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#121210]" />
                      <div className="brut-sm bg-[#E8A030] text-[#121210] px-3 py-2 text-xs">
                        <div className="font-display font-extrabold">YOU (Chief Auditor)</div>
                        <div className="font-mono text-[10px] font-bold">Action Pending</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#121210]/40" />
                      <div className="border-2 border-dashed border-[#121210]/40 px-3 py-2 text-xs opacity-60">
                        <div className="font-display font-bold">Zonal Commissioner</div>
                        <div className="font-mono text-[10px]">Cond. ≥ ₹50k</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action Rail ("DECIDE") */}
                <div className="document-actions w-full xl:w-48 shrink-0 sticky top-4 space-y-4">
                  <div className="font-mono text-[10px] font-bold tracking-widest text-[#121210]/60 uppercase">
                    DECIDE
                  </div>

                  {/* APPROVE Button */}
                  <button
                    id="btn-approve"
                    onClick={() => triggerStamp('APPROVED', '#2E8C42')}
                    className="stamp-btn w-full bg-[#2E8C42] text-white hover:bg-[#257335]"
                  >
                    <Check className="w-7 h-7 stroke-[3]" />
                    <span className="text-sm">APPROVE</span>
                    <span className="font-mono text-[10px] opacity-80 normal-case tracking-normal font-normal">
                      ⌘ + ↵
                    </span>
                  </button>

                  {/* REJECT Button */}
                  <button
                    id="btn-reject"
                    onClick={() => triggerStamp('REJECTED', '#C03A3A')}
                    className="stamp-btn w-full bg-[#C03A3A] text-white hover:bg-[#a62e2e]"
                  >
                    <X className="w-7 h-7 stroke-[3]" />
                    <span className="text-sm">REJECT</span>
                    <span className="font-mono text-[10px] opacity-80 normal-case tracking-normal font-normal">
                      ⌘ + ⌫
                    </span>
                  </button>

                  {/* NEEDS DETAIL Button */}
                  <button
                    id="btn-detail"
                    onClick={() => triggerStamp('NEEDS DETAIL', '#E8A030')}
                    className="stamp-btn w-full bg-[#E8A030] text-[#121210] hover:bg-[#d69022]"
                  >
                    <Info className="w-7 h-7 stroke-[3]" />
                    <span className="text-sm">NEEDS DETAIL</span>
                    <span className="font-mono text-[10px] opacity-80 normal-case tracking-normal font-normal">
                      ⌘ + D
                    </span>
                  </button>

                  {/* Policy Check Card */}
                  <div className="brut bg-white p-3.5 mt-4">
                    <div className="font-mono text-[10px] font-bold tracking-widest text-[#121210]/60 uppercase border-b-2 border-[#121210]/20 pb-1 mb-2">
                      POLICY CHECK
                    </div>
                    <div className="text-xs font-mono flex justify-between py-1">
                      <span>IRC-SP-100</span>
                      <span className="text-[#2E8C42] font-extrabold">PASS</span>
                    </div>
                    <div className="text-xs font-mono flex justify-between py-1">
                      <span>Budget · PWD</span>
                      <span className="text-[#2E8C42] font-extrabold">62%</span>
                    </div>
                    <div className="text-xs font-mono flex justify-between py-1">
                      <span>Contractor DLP</span>
                      <span className="text-[#2E8C42] font-extrabold">ACTIVE</span>
                    </div>
                    <div className="text-xs font-mono flex justify-between py-1">
                      <span>SLA Risk</span>
                      <span className="text-[#E8A030] font-extrabold">HIGH (24H)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIT LOG matching Approva */}
            <div className="mt-6 brut bg-[#121210] text-[#FFFFFF] p-5">
              <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2">
                <div className="font-display font-extrabold text-base sm:text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-white" />
                  <span>AUDIT LOG</span>
                </div>
                <span className="font-mono text-[10px] text-white/60">
                  IMMUTABLE · BBMP PWD LEDGER
                </span>
              </div>
              <pre className="font-mono text-xs leading-6 whitespace-pre-wrap text-white/90 overflow-x-auto">
                {auditLogs.join('\n')}
              </pre>
            </div>

            {/* RECENTLY STAMPED MINI TABLE */}
            <div className="mt-6 brut bg-white overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b-[3px] border-[#121210] bg-white">
                <div className="font-display font-extrabold text-base sm:text-lg flex items-center gap-2 text-[#121210]">
                  <Archive className="w-5 h-5" />
                  <span>RECENTLY STAMPED WORK ORDERS</span>
                </div>
                <button
                  onClick={() => setActiveTab('HISTORY')}
                  className="text-xs font-mono font-bold underline cursor-pointer text-[#121210]"
                >
                  VIEW ALL DISPATCHES →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="history-table w-full font-mono text-sm">
                  <thead className="bg-[#CFE8D6]">
                    <tr className="border-b-[3px] border-[#121210]">
                      <th className="text-left p-3 text-xs tracking-widest text-[#121210]">WO ID</th>
                      <th className="text-left p-3 text-xs tracking-widest text-[#121210]">ROAD / CORRIDOR</th>
                      <th className="text-right p-3 text-xs tracking-widest text-[#121210]">AMOUNT</th>
                      <th className="text-left p-3 text-xs tracking-widest text-[#121210]">ACTOR</th>
                      <th className="text-left p-3 text-xs tracking-widest text-[#121210]">TIMESTAMP</th>
                      <th className="text-right p-3 text-xs tracking-widest text-[#121210] min-w-[140px]">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#121210]/20">
                    {historyRecords.slice(0, 4).map((rec) => {
                      const stampColor = rec.status === 'APPROVED' ? '#2E8C42' : rec.status === 'REJECTED' ? '#C03A3A' : '#E8A030';
                      return (
                        <tr
                          key={rec.id}
                          onClick={() => handleSelectHistoryRecord(rec)}
                          className="cursor-pointer hover:bg-[#CFE8D6]/40 transition-colors group"
                          title="Click to view work order dossier in inbox"
                        >
                          <td className="p-3 font-bold group-hover:underline">{rec.woId}</td>
                          <td className="p-3 font-medium">{rec.roadName}</td>
                          <td className="text-right p-3 font-bold">₹{rec.amount.toLocaleString('en-IN')}.00</td>
                          <td className="p-3 text-[#121210]/80">{rec.inspector}</td>
                          <td className="p-3 text-[#121210]/70">{rec.timestamp}</td>
                          <td className="text-right p-3 min-w-[140px] whitespace-nowrap">
                            <span className="stamp text-[10px]" style={{ color: stampColor }}>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ESCALATIONS TAB matching Approva */}
      {activeTab === 'ESCALATIONS' && (
        <div className="p-6 space-y-6">
          <div className="brut overflow-hidden stripes-amber p-1.5">
            <div className="bg-[#CFE8D6] p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="font-display font-extrabold text-xl flex items-center gap-2 text-[#121210]">
                  <AlertTriangle className="w-6 h-6 text-[#C03A3A] stroke-[2.5]" />
                  <span>ESCALATION QUEUE · {pendingEscalationsCount} PAST SLA</span>
                </div>
                <span className="font-mono text-xs font-bold text-[#121210]/60">
                  AUTO-ESCALATES TO ZONAL COMMISSIONER AT +24H
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {escalations.map((esc) => {
                  const isDecided = esc.status === 'DECIDED';
                  const badgeColor = esc.severity === 'CRITICAL' ? 'bg-[#C03A3A] text-white' : 'bg-[#E8A030] text-[#121210]';
                  const cardBorder = isDecided ? 'border-[#2E8C42]' : esc.severity === 'CRITICAL' ? 'border-[#C03A3A]' : 'border-[#E8A030]';

                  return (
                    <div key={esc.id} className={`brut bg-white p-4 ${cardBorder}`}>
                      <div className="flex justify-between items-start">
                        <span className={`tag ${badgeColor}`}>{esc.slaNotice}</span>
                        {isDecided ? (
                          <span className="tag bg-[#2E8C42] text-white font-bold">DECIDED</span>
                        ) : (
                          <Flame className="w-5 h-5 text-[#C03A3A]" />
                        )}
                      </div>
                      <div className="font-display font-extrabold text-lg mt-3 text-[#121210]">
                        {esc.roadName}
                      </div>
                      <div className="font-mono font-extrabold text-2xl mt-1 text-[#121210]">
                        ₹{esc.amount.toLocaleString('en-IN')}.00
                      </div>
                      <div className="text-xs font-mono text-[#121210]/60 mt-1">
                        {isDecided ? (
                          <span className="text-[#2E8C42] font-bold">Sanction recorded: {esc.decidedStatus}</span>
                        ) : (
                          `Stuck at: ${esc.stuckAt}`
                        )}
                      </div>
                      <button
                        onClick={() => handleTakeEscalationDecision(esc)}
                        className={`mt-4 w-full py-1.5 brut-sm font-display font-bold text-xs transition-colors cursor-pointer ${
                          isDecided
                            ? 'bg-[#121210] text-white hover:bg-zinc-800'
                            : esc.severity === 'CRITICAL'
                            ? 'bg-[#C03A3A] text-white hover:bg-black'
                            : 'bg-[#E8A030] text-[#121210] hover:bg-black hover:text-white'
                        }`}
                      >
                        {isDecided ? 'VIEW SANCTIONED DOCKET →' : 'TAKE DECISION NOW →'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'HISTORY' && (
        <div className="p-6">
          <div className="brut bg-white p-6">
            <div className="flex items-center justify-between border-b-[3px] border-[#121210] pb-4 mb-4 flex-wrap gap-2">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#121210]">
                  MUNICIPAL AUDIT & DISPATCH HISTORY
                </h2>
                <p className="font-mono text-xs text-[#121210]/60 mt-0.5">
                  Complete immutable ledger of 2,481 approved, rejected, and clarified road repair work orders. Click any entry to inspect or reopen the work order docket.
                </p>
              </div>
              <span className="tag bg-[#CFE8D6]">
                {2481 + (historyRecords.length - INITIAL_HISTORY.length)} TOTAL AUDITS
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="history-table w-full font-mono text-sm">
                <thead className="bg-[#CFE8D6]">
                  <tr className="border-b-[3px] border-[#121210]">
                    <th className="text-left p-3 text-xs tracking-widest text-[#121210]">WO ID</th>
                    <th className="text-left p-3 text-xs tracking-widest text-[#121210]">ROAD / CORRIDOR</th>
                    <th className="text-right p-3 text-xs tracking-widest text-[#121210]">AMOUNT (INR)</th>
                    <th className="text-left p-3 text-xs tracking-widest text-[#121210]">INSPECTOR / AUDITOR</th>
                    <th className="text-left p-3 text-xs tracking-widest text-[#121210]">TIMESTAMP</th>
                    <th className="text-right p-3 text-xs tracking-widest text-[#121210] min-w-[150px] pr-4">STAMPED DECISION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121210]/20">
                  {historyRecords.map((rec) => {
                    const stampColor = rec.status === 'APPROVED' ? '#2E8C42' : rec.status === 'REJECTED' ? '#C03A3A' : '#E8A030';
                    return (
                      <tr
                        key={rec.id}
                        onClick={() => handleSelectHistoryRecord(rec)}
                        className="cursor-pointer hover:bg-[#CFE8D6]/40 transition-colors group"
                        title="Click to inspect this work order in Hazard Inbox"
                      >
                        <td className="p-3 font-bold group-hover:underline">{rec.woId}</td>
                        <td className="p-3 font-display font-bold">{rec.roadName}</td>
                        <td className="text-right p-3 font-bold">₹{rec.amount.toLocaleString('en-IN')}.00</td>
                        <td className="p-3">{rec.inspector}</td>
                        <td className="p-3 text-[#121210]/70">{rec.timestamp}</td>
                        <td className="text-right p-3 min-w-[150px] whitespace-nowrap pr-4">
                          <span className="stamp text-[10px]" style={{ color: stampColor }}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WORKFLOW BUILDER TAB matching Approva */}
      {activeTab === 'WORKFLOW' && (
        <div className="p-6">
          <div className="brut bg-white overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b-[3px] border-[#121210]">
              <div>
                <div className="font-display font-extrabold text-xl flex items-center gap-2 text-[#121210]">
                  <GitMerge className="w-5 h-5" />
                  <span>WORKFLOW BUILDER — "Arterial Road High-Hazard ≥ Score 80"</span>
                </div>
                <div className="text-xs font-mono text-[#121210]/60 mt-1">
                  Drag stages to reorder · 4 active stages · governing 142 live Bengaluru repair requests
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addToast('Stage Created', 'Added conditional stage to civic approval pipeline', 'info')}
                  className="brut-sm bg-white px-3.5 py-1.5 text-xs font-display font-extrabold hover:bg-zinc-100 cursor-pointer"
                >
                  + STAGE
                </button>
                <button
                  onClick={() => addToast('Workflow Published', 'New PWD sanction protocol synced to all zonal engineers', 'success')}
                  className="brut-sm bg-[#2E8C42] text-white px-3.5 py-1.5 text-xs font-display font-extrabold hover:bg-black cursor-pointer"
                >
                  PUBLISH
                </button>
              </div>
            </div>

            <div className="polka p-8 bg-[#CFE8D6]/30">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="brut bg-[#CFE8D6] px-5 py-4 cursor-grab">
                  <div className="font-mono text-[10px] font-bold text-[#121210]/60 uppercase">TRIGGER</div>
                  <div className="font-display font-extrabold text-[#121210]">Citizen Pothole Report</div>
                  <div className="text-[10px] font-mono text-[#121210]/60 mt-0.5">AI Verified &gt; 80%</div>
                </div>

                <div className="flex items-center">
                  <div className="w-6 h-1 bg-[#121210]"></div>
                  <div className="w-0 h-0" style={{ borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '8px solid #121210' }}></div>
                </div>

                <div className="brut bg-white px-5 py-4 cursor-grab">
                  <div className="font-mono text-[10px] font-bold text-[#121210]/60 uppercase">STAGE 1 · WARD</div>
                  <div className="font-display font-extrabold text-[#121210]">Ward Junior Engineer</div>
                  <div className="text-[10px] font-mono text-[#121210]/60 mt-0.5">SLA: 24h</div>
                </div>

                <div className="flex items-center">
                  <div className="w-6 h-1 bg-[#121210]"></div>
                  <div className="w-0 h-0" style={{ borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '8px solid #121210' }}></div>
                </div>

                <div className="brut bg-white px-5 py-4 cursor-grab">
                  <div className="font-mono text-[10px] font-bold text-[#121210]/60 uppercase">STAGE 2 · TENDER</div>
                  <div className="font-display font-extrabold text-[#121210]">Executive Engineer (EE)</div>
                  <div className="text-[10px] font-mono text-[#121210]/60 mt-0.5">SLA: 48h · KTPP Act</div>
                </div>

                <div className="flex items-center">
                  <div className="w-6 h-1 bg-[#121210]"></div>
                  <div className="w-0 h-0" style={{ borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '8px solid #121210' }}></div>
                </div>

                <div className="brut bg-[#E8A030] px-5 py-4 cursor-grab">
                  <div className="font-mono text-[10px] font-bold text-[#121210]/80 uppercase">STAGE 3 · AUDIT</div>
                  <div className="font-display font-extrabold text-[#121210]">Chief Quality Auditor</div>
                  <div className="text-[10px] font-mono text-[#121210] font-bold mt-0.5">SLA: 72h · IRC-SP-100</div>
                </div>

                <div className="flex items-center">
                  <div className="w-6 h-1 bg-[#121210]"></div>
                  <div className="w-0 h-0" style={{ borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '8px solid #121210' }}></div>
                </div>

                <div className="brut bg-white px-5 py-4 cursor-grab border-dashed">
                  <div className="font-mono text-[10px] font-bold text-[#121210]/60 uppercase">STAGE 4 · COND.</div>
                  <div className="font-display font-extrabold text-[#121210]">Zonal Comm. (≥ ₹50k)</div>
                  <div className="text-[10px] font-mono text-[#121210]/60 mt-0.5">Financial Sanction</div>
                </div>

                <div className="flex items-center">
                  <div className="w-6 h-1 bg-[#121210]"></div>
                  <div className="w-0 h-0" style={{ borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '8px solid #2E8C42' }}></div>
                </div>

                <div className="brut bg-[#2E8C42] text-white px-5 py-4">
                  <div className="font-mono text-[10px] font-bold opacity-80 uppercase">OUTCOME</div>
                  <div className="font-display font-extrabold">Dispatch Work Order & Pay</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
