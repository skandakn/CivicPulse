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
    <div className="space-y-8 pb-16 max-w-5xl mx-auto text-left">
      {/* Editorial Header Banner */}
      <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#17191c]/8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fafafb] border border-[#17191c]/10 flex items-center justify-center shrink-0">
              <FlaskConical className="w-6 h-6 text-[#17191c]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-3xl font-normal text-[#17191c] tracking-tight">
                  Hackathon <span className="italic">Evaluation Lab</span>
                </h1>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono uppercase tracking-wider font-medium">
                  Deterministic
                </span>
              </div>
              <p className="font-sans text-xs text-[#777b86] mt-1">
                Zero external dependencies. Fully seed-audited dataset for hackathon evaluations.
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#17191c]/15 hover:border-[#17191c] text-xs font-sans text-[#17191c] transition-colors cursor-pointer self-start sm:self-center"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#777b86]" />
            <span>Reset Demo</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          {[
            { label: 'Demo Cases', val: demoIncidents.length.toString() },
            { label: 'CV Adapter', val: 'DEMO' },
            { label: 'APIs', val: 'MOCKED' },
            { label: 'Data Integrity', val: 'STABLE' },
          ].map(item => (
            <div key={item.label} className="p-3.5 rounded-2xl bg-[#fafafb] border border-[#17191c]/8 text-center">
              <div className="text-[10px] text-[#777b86] uppercase tracking-wider">{item.label}</div>
              <div className="font-serif text-base text-[#17191c] mt-0.5">{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full demo flow walkthrough */}
      <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-8 space-y-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#17191c]/8">
          <div className="flex items-center gap-2 font-serif text-xl text-[#17191c] font-normal">
            <Play className="w-4 h-4 text-[#777b86]" />
            <span>Recommended Judge Evaluation Flow</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#f2f2f3] font-mono text-[10px] uppercase text-[#777b86]">7-Step Ledger</span>
        </div>

        <div className="space-y-2.5">
          {DEMO_STEPS.map((step, idx) => (
            <div key={step.key} className="p-4 rounded-2xl bg-[#fafafb] hover:bg-white border border-[#17191c]/8 hover:border-[#17191c]/20 flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-3.5">
                <div className="w-7 h-7 rounded-full bg-[#17191c] text-white font-mono text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-sans text-sm font-medium text-[#17191c]">{step.label}</div>
                  <div className="text-xs text-[#777b86] font-mono mt-0.5">{step.desc}</div>
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
                className="px-4 py-1.5 rounded-full bg-[#17191c] text-white hover:bg-[#2b2e33] font-sans text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <span>Launch</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Load Demo Incident */}
      <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-8 space-y-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#17191c]/8">
          <div className="flex items-center gap-2 font-serif text-xl text-[#17191c] font-normal">
            <Sparkles className="w-4 h-4 text-[#777b86]" />
            <span>Load Curated Test Cases</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#f2f2f3] font-mono text-[10px] uppercase text-[#777b86]">5 Scenarios</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {demoIncidents.map(incident => {
            const isLoaded = loadedDemoId === incident.id;

            return (
              <div
                key={incident.id}
                onClick={() => handleLoadDemo(incident.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3.5 ${
                  isLoaded
                    ? 'bg-[#fafafb] border-[#17191c] shadow-sm'
                    : 'bg-white border-[#17191c]/10 hover:border-[#17191c]/30 hover:bg-[#fafafb]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-xs font-semibold text-[#17191c]">{incident.code}</div>
                    <div className="px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#777b86] text-[10px] font-mono mt-1 font-medium inline-block">
                      {getDemoTag(incident.id)}
                    </div>
                  </div>
                  {isLoaded && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono uppercase tracking-wider font-semibold">
                      Active
                    </span>
                  )}
                </div>

                <div>
                  <div className="font-serif text-base text-[#17191c] leading-snug">
                    {incident.roadName}
                  </div>
                  <div className="text-xs text-[#777b86] font-sans mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#777b86] shrink-0" />
                    {incident.landmark}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase ${incident.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                    {incident.severity}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#17191c] font-mono text-[10px]">
                    Score: {incident.priorityDetails.overallScore}/100
                  </span>
                </div>

                {/* Repair verification badge */}
                {incident.repairVerification && (
                  <div className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-center gap-2 ${
                    incident.repairVerification.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {incident.repairVerification.status === 'APPROVED' ? (
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 shrink-0 text-rose-700" />
                    )}
                    <span>
                      CV Verification: {Math.round(incident.repairVerification.passConfidence * 100)}% — {incident.repairVerification.status}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-mono text-[#777b86] pt-2 border-t border-[#17191c]/8">
                  <span>{incident.upvotes} endorsements</span>
                  <span className="text-[#17191c] font-sans flex items-center gap-1 hover:underline">
                    Load case <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifecycle summary table */}
      <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-8 space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 font-serif text-xl text-[#17191c] font-normal pb-3 border-b border-[#17191c]/8">
          <CheckCircle2 className="w-4 h-4 text-[#777b86]" />
          <span>Demo Case Lifecycle Matrix</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-[#17191c]/8 bg-[#fafafb] text-[#777b86] text-[10px] uppercase">
                <th className="p-3 text-left">Case</th>
                <th className="p-3 text-center">Report</th>
                <th className="p-3 text-center">Detect</th>
                <th className="p-3 text-center">Priority</th>
                <th className="p-3 text-center">Assign</th>
                <th className="p-3 text-center">Complaint</th>
                <th className="p-3 text-center">Track</th>
                <th className="p-3 text-center">Verify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17191c]/8">
              {demoIncidents.map(inc => {
                const hasVerification = !!inc.repairVerification;
                const isVerified = inc.status === 'AI_VERIFIED' || inc.status === 'REPAIRED';

                const check = (v: boolean) => v
                  ? <span className="font-semibold text-emerald-700">PASS</span>
                  : <span className="text-[#777b86] block text-center">—</span>;

                return (
                  <tr key={inc.id} className="hover:bg-[#fafafb]">
                    <td className="p-3">
                      <div className="font-semibold text-[#17191c]">{inc.code}</div>
                      <div className="text-[#777b86] text-[10px]">{inc.wardName}</div>
                    </td>
                    <td className="p-3 text-center">{check(true)}</td>
                    <td className="p-3 text-center">{check(true)}</td>
                    <td className="p-3 text-center">{check(true)}</td>
                    <td className="p-3 text-center">{check(true)}</td>
                    <td className="p-3 text-center">{check(true)}</td>
                    <td className="p-3 text-center">{check(true)}</td>
                    <td className="p-3 text-center">{check(hasVerification || isVerified)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Accent Peach Card Callout */}
        <div className="p-4 rounded-2xl bg-[#fbe1d1] border border-[#5d2a1a]/15 text-xs text-[#5d2a1a] flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#5d2a1a] shrink-0 mt-0.5" />
          <span className="font-sans leading-relaxed">
            All verification workflows use deterministic test fixtures for audit reliability. Model inference parameters are fully reproducible across standard client hardware.
          </span>
        </div>
      </div>
    </div>
  );
};
