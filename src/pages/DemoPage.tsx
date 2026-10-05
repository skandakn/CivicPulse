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
  Wrench,
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
      'inc-07': '🔴 Critical — Unresolved',
      'inc-01': '🟠 Critical — Triaged',
      'inc-02': '🟡 Critical — In Progress',
      'inc-05': '🟢 Resolved — AI Verified (Pass)',
      'inc-09': '🔵 Repaired — AI Rejected (Rework)',
    };
    return tags[id] ?? id;
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/10 p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">CivicPulse Walkthrough</h1>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                INTERACTIVE
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Full incident lifecycle from citizen capture to contractor accountability and AI-verified repair.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          {[
            { label: 'Incidents', val: demoIncidents.length.toString() },
            { label: 'CV Engine', val: 'Prototype' },
            { label: 'Mode', val: 'Offline-Safe' },
            { label: 'Data', val: 'Structured' },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
              <div className="text-[10px] text-slate-400 uppercase">{item.label}</div>
              <div className="font-bold text-cyan-400 text-base mt-0.5">{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full demo flow walkthrough */}
      <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
          <Play className="w-4 h-4 text-cyan-400" />
          <span>Recommended Judge Demo Flow</span>
        </div>
        <div className="relative">
          {/* Connector */}
          <div className="absolute top-5 left-5 bottom-5 w-0.5 bg-white/5" />
          <div className="space-y-3">
            {DEMO_STEPS.map((step, idx) => (
              <div key={step.key} className="relative pl-10">
                <div className="absolute left-3 top-3.5 w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center z-10">
                  <span className="text-[8px] font-mono font-bold text-cyan-400">{idx + 1}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400">{step.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{step.label}</div>
                      <div className="text-[11px] text-slate-400">{step.desc}</div>
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
                    className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>Go</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Load Demo Incident */}
      <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Load Demo Incident</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {demoIncidents.map(incident => {
            const sevColor = getSeverityColor(incident.severity);
            const statusInfo = getStatusBadge(incident.status);
            const isLoaded = loadedDemoId === incident.id;

            return (
              <div
                key={incident.id}
                onClick={() => handleLoadDemo(incident.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all group space-y-3 ${
                  isLoaded
                    ? 'bg-cyan-950/25 border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.12)]'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-xs font-bold text-white">{incident.code}</div>
                    <div className={`text-[10px] font-mono mt-1`}>{getDemoTag(incident.id)}</div>
                  </div>
                  {isLoaded && (
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      LOADED
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    {incident.roadName}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    {incident.landmark}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${sevColor.bg} ${sevColor.text} ${sevColor.border}`}>
                    {incident.severity}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[9px] border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-white/5 text-slate-400 border border-white/5">
                    Score: {incident.priorityDetails.overallScore}/100
                  </span>
                </div>

                {/* Repair verification badge */}
                {incident.repairVerification && (
                  <div className={`flex items-center gap-1.5 p-2 rounded-lg text-[10px] font-mono border ${
                    incident.repairVerification.status === 'APPROVED'
                      ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                      : 'bg-red-950/20 border-red-500/20 text-red-400'
                  }`}>
                    {incident.repairVerification.status === 'APPROVED' ? (
                      <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                    )}
                    <span>
                      CV Verification: {Math.round(incident.repairVerification.passConfidence * 100)}% —{' '}
                      {incident.repairVerification.status === 'APPROVED' ? 'APPROVED' : 'REWORK NEEDED'}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                  <span>{incident.upvotes} upvotes</span>
                  <span className="text-cyan-400 group-hover:text-cyan-300">
                    Load case <ArrowRight className="inline w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifecycle summary table */}
      <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Demo Case Lifecycle Coverage</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-[11px]">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-[10px]">
                <th className="pb-2 text-left pr-3">Case</th>
                <th className="pb-2 text-center px-2">Report</th>
                <th className="pb-2 text-center px-2">Detect</th>
                <th className="pb-2 text-center px-2">Priority</th>
                <th className="pb-2 text-center px-2">Assign</th>
                <th className="pb-2 text-center px-2">Complaint</th>
                <th className="pb-2 text-center px-2">Track</th>
                <th className="pb-2 text-center px-2">Verify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {demoIncidents.map(inc => {
                const hasVerification = !!inc.repairVerification;
                const isVerified = inc.status === 'AI_VERIFIED' || inc.status === 'REPAIRED';

                const check = (v: boolean) => v
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                  : <span className="text-slate-600 block text-center">—</span>;

                return (
                  <tr key={inc.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-3">
                      <div className="text-white font-semibold">{inc.code}</div>
                      <div className="text-slate-500 text-[9px]">{inc.wardName}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center">{check(true)}</td>
                    <td className="py-2.5 px-2 text-center">{check(true)}</td>
                    <td className="py-2.5 px-2 text-center">{check(true)}</td>
                    <td className="py-2.5 px-2 text-center">{check(true)}</td>
                    <td className="py-2.5 px-2 text-center">{check(true)}</td>
                    <td className="py-2.5 px-2 text-center">{check(true)}</td>
                    <td className="py-2.5 px-2 text-center">{check(hasVerification || isVerified)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            All verification workflows use a demo adapter. Production deployment would use real CV model inference endpoints.
            Demo mode is clearly labelled throughout the application.
          </span>
        </div>
      </div>
    </div>
  );
};
