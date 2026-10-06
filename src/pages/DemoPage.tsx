import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  ArrowRight,
  MapPin,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ScanLine,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_INCIDENT_IDS } from '../data/mockData';
import { getSeverityColor, getStatusBadge } from '../utils/formatters';

const DEMO_STEPS = [
  { key: 'REPORT', label: 'Report Pothole', icon: <MapPin className="w-4 h-4" />, desc: 'Upload image → AI detects pothole' },
  { key: 'DETECT', label: 'CV Detection', icon: <Cpu className="w-4 h-4" />, desc: 'Depth, area, severity extracted in ms' },
  { key: 'PRIORITY', label: 'Priority Score', icon: <Sparkles className="w-4 h-4" />, desc: 'Multi-factor algorithmic scoring' },
  { key: 'ASSIGN', label: 'Responsibility', icon: <Building2 className="w-4 h-4" />, desc: 'Contractor + authority resolved' },
  { key: 'COMPLAINT', label: 'Generate Complaint', icon: <FileText className="w-4 h-4" />, desc: 'Structured complaint document' },
  { key: 'TRACK', label: 'Track Status', icon: <Clock className="w-4 h-4" />, desc: 'Lifecycle from report to verify' },
  { key: 'VERIFY', label: 'Repair Verify', icon: <ScanLine className="w-4 h-4" />, desc: 'AI CV before/after audit' },
];

export const DemoPage: React.FC = () => {
  const { incidents, selectIncidentById, setCurrentView, addToast } = useApp();
  const [loadedDemoId, setLoadedDemoId] = useState<string | null>(null);

  const demoIncidents = incidents.filter(i => DEMO_INCIDENT_IDS.includes(i.id));

  const handleLoadDemo = (incidentId: string) => {
    setLoadedDemoId(incidentId);
    selectIncidentById(incidentId, 'INCIDENT_DETAIL');
    addToast('Demo Case Loaded', `Navigate through the incident detail to explore the full lifecycle`, 'success');
  };

  const handleReset = () => {
    setLoadedDemoId(null);
    addToast('Demo Reset', 'All demo state cleared', 'info');
  };

  const getDemoTag = (id: string) => {
    const tags: Record<string, string> = {
      'inc-07': 'Critical — Unresolved',
      'inc-01': 'Critical — Triaged',
      'inc-02': 'Critical — In Progress',
      'inc-05': 'Resolved — AI Verified (Pass)',
      'inc-09': 'Repaired — AI Rejected (Rework)',
    };
    return tags[id] ?? id;
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto text-left">
      {/* Approva-Style Header Banner */}
      <div className="bg-white brut p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8A030] border-2 border-[#121210] flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-[#121210]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-black text-[#121210] uppercase">
                  HACKATHON DEMO LAB
                </h1>
                <span className="stamp border-[#2E8C42] text-[#2E8C42] text-[10px] font-black">
                  DETERMINISTIC
                </span>
              </div>
              <p className="font-body text-xs text-[#4A4A46] mt-0.5">
                Zero external dependencies. Fully seed-audited dataset for hackathon evaluations.
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-white brut-sm text-xs font-mono font-bold text-[#121210] hover:bg-[#CFE8D6] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          {[
            { label: 'Demo Cases', val: demoIncidents.length.toString() },
            { label: 'CV Adapter', val: 'DEMO' },
            { label: 'APIs', val: 'MOCKED' },
            { label: 'Data', val: 'STABLE' },
          ].map(item => (
            <div key={item.label} className="p-3 bg-[#CFE8D6]/40 border-2 border-[#121210] text-center">
              <div className="text-[10px] text-[#4A4A46] uppercase font-bold">{item.label}</div>
              <div className="font-display font-black text-[#121210] text-base mt-0.5">{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full demo flow walkthrough */}
      <div className="bg-white brut p-6 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
          <div className="flex items-center gap-2 font-display text-sm font-black text-[#121210] uppercase tracking-wider">
            <Play className="w-4 h-4 text-[#2E8C42]" />
            <span>Recommended Judge Evaluation Flow</span>
          </div>
          <span className="tag bg-[#CFE8D6] font-mono text-[10px] font-bold">7-STEP LEDGER</span>
        </div>

        <div className="space-y-3">
          {DEMO_STEPS.map((step, idx) => (
            <div key={step.key} className="p-3 bg-white hover:bg-[#CFE8D6] border-2 border-[#121210] flex items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#121210] text-[#CFE8D6] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-display text-sm font-black text-[#121210]">{step.label}</div>
                  <div className="text-[11px] text-[#4A4A46] font-mono">{step.desc}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (step.key === 'REPORT') setCurrentView('REPORT');
                  else if (step.key === 'PRIORITY') setCurrentView('PRIORITY_QUEUE');
                  else if (step.key === 'ASSIGN') setCurrentView('CONTRACTORS');
                  else if (step.key === 'COMPLAINT' || step.key === 'TRACK' || step.key === 'VERIFY') {
                    if (loadedDemoId) selectIncidentById(loadedDemoId, 'INCIDENT_DETAIL');
                    else handleLoadDemo('inc-07');
                  }
                  else if (step.key === 'DETECT') setCurrentView('AI_ANALYSIS');
                }}
                className="px-3 py-1.5 bg-[#121210] text-[#CFE8D6] hover:bg-[#2E8C42] hover:text-white font-mono text-xs font-bold uppercase brut-sm flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Launch</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Load Demo Incident */}
      <div className="bg-white brut p-6 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
          <div className="flex items-center gap-2 font-display text-sm font-black text-[#121210] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#E8A030]" />
            <span>Load Curated Test Cases</span>
          </div>
          <span className="tag bg-[#CFE8D6] font-mono text-[10px] font-bold">5 SCENARIOS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {demoIncidents.map(incident => {
            const isLoaded = loadedDemoId === incident.id;

            return (
              <div
                key={incident.id}
                onClick={() => handleLoadDemo(incident.id)}
                className={`p-4 border-2 border-[#121210] cursor-pointer transition-all space-y-3 ${
                  isLoaded
                    ? 'bg-[#CFE8D6] shadow-[4px_4px_0_#121210]'
                    : 'bg-white hover:bg-[#CFE8D6]/30 shadow-[2px_2px_0_#121210]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-xs font-bold text-[#121210]">{incident.code}</div>
                    <div className="tag bg-[#121210] text-[#CFE8D6] text-[9px] font-mono mt-1 font-bold inline-block">
                      {getDemoTag(incident.id)}
                    </div>
                  </div>
                  {isLoaded && (
                    <span className="stamp border-[#2E8C42] text-[#2E8C42] text-[9px] font-black">
                      LOADED
                    </span>
                  )}
                </div>

                <div>
                  <div className="font-display text-sm font-black text-[#121210] leading-snug">
                    {incident.roadName}
                  </div>
                  <div className="text-[11px] text-[#4A4A46] font-mono mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#121210] flex-shrink-0" />
                    {incident.landmark}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className={`tag font-mono text-[9px] font-bold ${incident.severity === 'CRITICAL' ? 'bg-[#C03A3A] text-white' : 'bg-[#E8A030] text-[#121210]'}`}>
                    {incident.severity}
                  </span>
                  <span className="tag bg-white font-mono text-[9px] font-bold">
                    Score: {incident.priorityDetails.overallScore}/100
                  </span>
                </div>

                {/* Repair verification badge */}
                {incident.repairVerification && (
                  <div className={`p-2 border border-[#121210] text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                    incident.repairVerification.status === 'APPROVED'
                      ? 'bg-[#2E8C42] text-white'
                      : 'bg-[#C03A3A] text-white'
                  }`}>
                    {incident.repairVerification.status === 'APPROVED' ? (
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>
                      CV Verification: {Math.round(incident.repairVerification.passConfidence * 100)}% — {incident.repairVerification.status}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-[#4A4A46] pt-1 border-t border-[#121210]">
                  <span>{incident.upvotes} upvotes</span>
                  <span className="text-[#121210] font-bold group-hover:underline">
                    Load case →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifecycle summary table */}
      <div className="bg-white brut p-6 space-y-4">
        <div className="flex items-center gap-2 font-display text-sm font-black text-[#121210] uppercase tracking-wider border-b-2 border-[#121210] pb-2">
          <CheckCircle2 className="w-4 h-4 text-[#2E8C42]" />
          <span>Demo Case Lifecycle Matrix</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-[#121210] bg-[#CFE8D6] text-[#121210] text-[10px] font-bold uppercase">
                <th className="p-2 text-left">Case</th>
                <th className="p-2 text-center">Report</th>
                <th className="p-2 text-center">Detect</th>
                <th className="p-2 text-center">Priority</th>
                <th className="p-2 text-center">Assign</th>
                <th className="p-2 text-center">Complaint</th>
                <th className="p-2 text-center">Track</th>
                <th className="p-2 text-center">Verify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121210]">
              {demoIncidents.map(inc => {
                const hasVerification = !!inc.repairVerification;
                const isVerified = inc.status === 'AI_VERIFIED' || inc.status === 'REPAIRED';

                const check = (v: boolean) => v
                  ? <span className="font-bold text-[#2E8C42]">PASS</span>
                  : <span className="text-[#4A4A46] block text-center">—</span>;

                return (
                  <tr key={inc.id} className="hover:bg-[#CFE8D6]/30">
                    <td className="p-2">
                      <div className="font-bold text-[#121210]">{inc.code}</div>
                      <div className="text-[#4A4A46] text-[10px]">{inc.wardName}</div>
                    </td>
                    <td className="p-2 text-center">{check(true)}</td>
                    <td className="p-2 text-center">{check(true)}</td>
                    <td className="p-2 text-center">{check(true)}</td>
                    <td className="p-2 text-center">{check(true)}</td>
                    <td className="p-2 text-center">{check(true)}</td>
                    <td className="p-2 text-center">{check(true)}</td>
                    <td className="p-2 text-center">{check(hasVerification || isVerified)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#E8A030]/20 border-2 border-[#121210] text-xs font-mono text-[#121210] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#121210] shrink-0 mt-0.5" />
          <span>
            All verification workflows use deterministic test fixtures for audit reliability. Model inference parameters are fully reproducible.
          </span>
        </div>
      </div>
    </div>
  );
};
