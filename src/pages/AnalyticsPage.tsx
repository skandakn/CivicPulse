import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CloudRain,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Clock,
  MapPin,
  Cpu,
  Copy,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CITY_METRICS, MONTHLY_TRENDS } from '../data/mockData';
import { formatINR } from '../utils/formatters';

// ── Mini bar chart ──────────────────────────────────────────────────────────
const BarChart: React.FC<{
  data: { label: string; value: number; max: number; color: string; secondValue?: number; secondColor?: string }[];
  height?: number;
}> = ({ data, height = 120 }) => {
  const maxVal = Math.max(...data.map(d => d.max));
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <div className="w-full flex flex-col items-center gap-0.5 justify-end" style={{ height: height - 20 }}>
            {d.secondValue !== undefined && (
              <div
                className={`w-full rounded-t-sm transition-all duration-700 ${d.secondColor ?? 'bg-emerald-500/60'}`}
                style={{ height: `${(d.secondValue / maxVal) * (height - 20)}px` }}
              />
            )}
            <div
              className={`w-full rounded-t-sm transition-all duration-700 ${d.color}`}
              style={{ height: `${(d.value / maxVal) * (height - 20)}px` }}
            />
          </div>
          <span className="text-[9px] font-mono text-slate-500 text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Donut-style ring ────────────────────────────────────────────────────────
const DonutRing: React.FC<{ pct: number; color: string; label: string; value: string }> = ({
  pct,
  color,
  label,
  value,
}) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-sm font-extrabold text-white">{value}</span>
          <span className="text-[9px] text-slate-500 font-mono">{pct}%</span>
        </div>
      </div>
      <span className="text-[10px] text-slate-400 font-mono text-center leading-tight">{label}</span>
    </div>
  );
};

// ── Metric card ─────────────────────────────────────────────────────────────
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  subColor?: string;
}> = ({ icon, label, value, sub, subColor = 'text-slate-400' }) => (
  <div className="p-5 rounded-2xl bg-[#090C16] border border-white/10 space-y-2">
    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
      <span>{label}</span>
      {icon}
    </div>
    <div className="text-3xl font-extrabold text-white font-mono">{value}</div>
    <p className={`text-[11px] font-mono ${subColor}`}>{sub}</p>
  </div>
);

export const AnalyticsPage: React.FC = () => {
  const { wards, contractors, incidents } = useApp();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WARDS' | 'TRENDS' | 'CONTRACTORS'>('OVERVIEW');

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const highCount = incidents.filter(i => i.severity === 'HIGH').length;
  const mediumCount = incidents.filter(i => i.severity === 'MEDIUM').length;
  const lowCount = incidents.filter(i => i.severity === 'LOW').length;
  const resolvedCount = incidents.filter(i => i.status === 'AI_VERIFIED').length;
  const unresolvedCount = incidents.filter(i => i.status !== 'AI_VERIFIED').length;

  const severityData = [
    { label: 'Critical', value: criticalCount, max: criticalCount + 2, color: 'bg-red-500 shadow-[0_0_8px_#EF4444]' },
    { label: 'High', value: highCount, max: criticalCount + 2, color: 'bg-amber-500' },
    { label: 'Medium', value: mediumCount, max: criticalCount + 2, color: 'bg-yellow-500' },
    { label: 'Low', value: lowCount, max: criticalCount + 2, color: 'bg-cyan-500' },
  ];

  const tabs = [
    { key: 'OVERVIEW', label: 'Overview' },
    { key: 'WARDS', label: 'Ward Heatmap' },
    { key: 'TRENDS', label: 'Resolution Trends' },
    { key: 'CONTRACTORS', label: 'Contractor Matrix' },
  ] as const;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>MUNICIPAL INTELLIGENCE & AUDITING</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Bengaluru City Infrastructure Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time metrics on pothole resolution, contractor performance, ward-level risk distribution, and AI audit accuracy.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/5 rounded-xl p-1 text-xs font-mono flex-wrap gap-0.5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Top KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
              label="Total Active Potholes"
              value={CITY_METRICS.activePotholes.toLocaleString()}
              sub={`${CITY_METRICS.criticalIssues} critical — live`}
              subColor="text-red-400"
            />
            <MetricCard
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              label="Resolved This Month"
              value={CITY_METRICS.resolvedThisMonth.toLocaleString()}
              sub={`${CITY_METRICS.aiVerifiedRepairs} AI-verified repairs`}
              subColor="text-emerald-400"
            />
            <MetricCard
              icon={<Clock className="w-4 h-4 text-cyan-400" />}
              label="Avg Resolution Time"
              value={`${CITY_METRICS.avgResolutionTimeHours}h`}
              sub="↓ 34% faster via AI auto-triaging"
              subColor="text-emerald-400"
            />
            <MetricCard
              icon={<Cpu className="w-4 h-4 text-cyan-400" />}
              label="AI Audit Precision"
              value={`${CITY_METRICS.aiPrecisionRate}%`}
              sub="Visual + thermal audit combined"
              subColor="text-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={<Copy className="w-4 h-4 text-blue-400" />}
              label="Duplicate Reports Merged"
              value={CITY_METRICS.duplicateReportsMerged.toLocaleString()}
              sub="Spatial cluster deduplication"
              subColor="text-blue-400"
            />
            <MetricCard
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
              label="Taxpayer Savings"
              value={formatINR(CITY_METRICS.taxpayerSavingsINR)}
              sub="Enforced via Contractor DLP warranties"
              subColor="text-emerald-400"
            />
            <MetricCard
              icon={<MapPin className="w-4 h-4 text-red-400" />}
              label="Roads at Risk"
              value={`${CITY_METRICS.roadsAtRisk}`}
              sub="Arterial corridors above risk threshold"
              subColor="text-amber-400"
            />
            <MetricCard
              icon={<Activity className="w-4 h-4 text-purple-400" />}
              label="Reports Today"
              value={CITY_METRICS.reportsToday.toString()}
              sub="Live ingestion pipeline active"
              subColor="text-purple-400"
            />
          </div>

          {/* Severity distribution + resolution donuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Severity bar chart */}
            <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Potholes by Severity</span>
              </div>
              <BarChart data={severityData} height={140} />
              <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-center">
                {[
                  { label: 'Critical', val: criticalCount, c: 'text-red-400' },
                  { label: 'High', val: highCount, c: 'text-amber-400' },
                  { label: 'Medium', val: mediumCount, c: 'text-yellow-400' },
                  { label: 'Low', val: lowCount, c: 'text-cyan-400' },
                ].map(s => (
                  <div key={s.label}>
                    <div className={`font-extrabold text-sm ${s.c}`}>{s.val}</div>
                    <div className="text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution donut rings */}
            <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Resolution & Verification Rates</span>
              </div>
              <div className="flex justify-around pt-2">
                <DonutRing
                  pct={Math.round((resolvedCount / incidents.length) * 100)}
                  color="#10B981"
                  label="AI Verified"
                  value={`${resolvedCount}/${incidents.length}`}
                />
                <DonutRing
                  pct={Math.round((CITY_METRICS.resolvedThisMonth / CITY_METRICS.activePotholes) * 100)}
                  color="#00F0FF"
                  label="Monthly Resolution"
                  value={`${CITY_METRICS.resolvedThisMonth}`}
                />
                <DonutRing
                  pct={Math.round((CITY_METRICS.aiVerifiedRepairs / CITY_METRICS.resolvedThisMonth) * 100)}
                  color="#8B5CF6"
                  label="AI Audit Pass"
                  value={`95.1%`}
                />
              </div>
            </div>
          </div>

          {/* Priority distribution */}
          <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Priority Score Distribution</span>
            </div>
            <div className="space-y-2.5">
              {[
                { range: '90–100', label: 'Extreme Hazard', count: incidents.filter(i => i.priorityDetails.overallScore >= 90).length, color: 'bg-red-500 shadow-[0_0_8px_#EF4444]', text: 'text-red-400' },
                { range: '75–89', label: 'High Priority', count: incidents.filter(i => i.priorityDetails.overallScore >= 75 && i.priorityDetails.overallScore < 90).length, color: 'bg-amber-500', text: 'text-amber-400' },
                { range: '55–74', label: 'Medium Priority', count: incidents.filter(i => i.priorityDetails.overallScore >= 55 && i.priorityDetails.overallScore < 75).length, color: 'bg-yellow-500', text: 'text-yellow-400' },
                { range: '0–54', label: 'Low Priority', count: incidents.filter(i => i.priorityDetails.overallScore < 55).length, color: 'bg-cyan-500', text: 'text-cyan-400' },
              ].map(row => (
                <div key={row.range} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-slate-400 w-14 flex-shrink-0">{row.range}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color} transition-all duration-700`}
                      style={{ width: `${(row.count / incidents.length) * 100}%` }}
                    />
                  </div>
                  <span className={`font-mono font-bold w-6 text-right ${row.text}`}>{row.count}</span>
                  <span className="text-slate-500 w-28 flex-shrink-0">{row.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── WARDS ── */}
      {activeTab === 'WARDS' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Ward Pothole Density & Budget Utilization</span>
            </div>

            <div className="space-y-3">
              {wards.sort((a, b) => b.riskIndex - a.riskIndex).map(ward => {
                const budgetPct = Math.round((ward.budgetUtilizedLakhs / ward.budgetAllocatedLakhs) * 100);
                const densityPct = Math.min(100, Math.round((ward.activePotholesCount / 50) * 100));

                return (
                  <div key={ward.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">Ward {ward.number} — {ward.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${ward.riskIndex > 85 ? 'bg-red-500/10 text-red-400 border-red-500/30' : ward.riskIndex > 70 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                            Risk: {ward.riskIndex}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">{ward.zone} Zone</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-xs">
                        <span className="text-slate-400">Active: <strong className="text-red-400">{ward.activePotholesCount}</strong></span>
                        <span className="text-slate-400">Critical: <strong className="text-amber-400">{ward.criticalPotholesCount}</strong></span>
                        <span className="text-slate-400">Resolved: <strong className="text-emerald-400">{ward.resolvedThisMonth}</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Pothole Density</span>
                          <span>{ward.activePotholesCount} active</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${ward.riskIndex > 85 ? 'bg-red-500 shadow-[0_0_6px_#EF4444]' : ward.riskIndex > 70 ? 'bg-amber-500' : 'bg-cyan-400'}`}
                            style={{ width: `${densityPct}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Budget Used</span>
                          <span>₹{ward.budgetUtilizedLakhs}L / ₹{ward.budgetAllocatedLakhs}L</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${budgetPct > 85 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${budgetPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Road health distribution */}
          <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Road Health Distribution</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'At Risk', val: CITY_METRICS.roadsAtRisk, pct: Math.round((CITY_METRICS.roadsAtRisk / CITY_METRICS.totalBangaloreRoadsMonitoredKm * 10)), color: '#EF4444' },
                { label: 'Monitored — OK', val: Math.round(CITY_METRICS.totalBangaloreRoadsMonitoredKm * 0.8), pct: 80, color: '#10B981' },
                { label: 'Under Repair', val: 18, pct: Math.round(18 / CITY_METRICS.totalBangaloreRoadsMonitoredKm * 100), color: '#F59E0B' },
              ].map(item => (
                <DonutRing key={item.label} pct={item.pct} color={item.color} label={item.label} value={`${item.val}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TRENDS ── */}
      {activeTab === 'TRENDS' && (
        <div className="space-y-6">
          {/* Reports vs Resolved bar chart */}
          <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Monthly Reports vs Resolved</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyan-500" />Reported</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" />Resolved</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-purple-500" />AI Verified</span>
              </div>
            </div>

            {/* Grouped bars */}
            <div className="flex items-end gap-3 w-full" style={{ height: 160 }}>
              {MONTHLY_TRENDS.map((m, i) => {
                const maxVal = Math.max(...MONTHLY_TRENDS.map(t => t.reported));
                const reportedH = (m.reported / maxVal) * 120;
                const resolvedH = (m.resolved / maxVal) * 120;
                const verifiedH = (m.aiVerified / maxVal) * 120;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 justify-end" style={{ height: 160 }}>
                    <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: 130 }}>
                      <div className="flex-1 bg-cyan-500/80 rounded-t-sm transition-all duration-700" style={{ height: reportedH }} />
                      <div className="flex-1 bg-emerald-500/80 rounded-t-sm transition-all duration-700" style={{ height: resolvedH }} />
                      <div className="flex-1 bg-purple-500/80 rounded-t-sm transition-all duration-700" style={{ height: verifiedH }} />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">{m.month}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 font-mono text-center">
              Peak Jul–Aug coincides with SW Monsoon season. Resolution rate improving month-over-month since AI triage deployment.
            </p>
          </div>

          {/* Monsoon impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                <span>Precipitation vs Pothole Surge</span>
              </div>
              <div className="space-y-2.5 font-mono text-xs">
                {[
                  { label: 'Jun (Pre-monsoon bursts)', surge: '+18%', color: 'text-amber-400', barW: '25%', barC: 'bg-amber-500' },
                  { label: 'Jul–Aug (Peak SW Monsoon)', surge: '+64%', color: 'text-red-400', barW: '78%', barC: 'bg-red-500 shadow-[0_0_8px_#EF4444]' },
                  { label: 'Sep–Oct (NE Retreating)', surge: '+42%', color: 'text-amber-400', barW: '52%', barC: 'bg-amber-500' },
                ].map(row => (
                  <div key={row.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-[11px]">{row.label}</span>
                      <span className={`font-bold ${row.color}`}>{row.surge}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className={`h-full rounded-full ${row.barC}`} style={{ width: row.barW }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>White-Top vs Asphalt Resiliency</span>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { label: 'White-Topped Concrete (e.g. Malleshwaram)', val: '0.8 defects/km', pct: 12, color: 'bg-emerald-500' },
                  { label: 'Standard Asphalt (e.g. ORR, Hosur Rd)', val: '6.4 defects/km', pct: 78, color: 'bg-red-500' },
                ].map(item => (
                  <div key={item.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-200 text-[11px]">{item.label}</span>
                      <span className={`font-bold text-[11px] ${item.pct > 50 ? 'text-red-400' : 'text-emerald-400'}`}>{item.val}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTRACTORS ── */}
      {activeTab === 'CONTRACTORS' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Contractor Defect Rate vs Quality Matrix</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-[10px]">
                    <th className="pb-3 pr-4">Contractor</th>
                    <th className="pb-3 pr-4">Class</th>
                    <th className="pb-3 pr-4">Paved</th>
                    <th className="pb-3 pr-4">Defect Rate</th>
                    <th className="pb-3 pr-4">Quality</th>
                    <th className="pb-3 pr-4">Open Cases</th>
                    <th className="pb-3 pr-4">Avg Fix</th>
                    <th className="pb-3">Penalties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {contractors.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-sans font-semibold text-white">{c.name}</div>
                        {c.blacklistedStatus && (
                          <span className="text-[9px] text-red-400 font-mono">⛔ BLACKLISTED</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-400">{c.classRating}</td>
                      <td className="py-3 pr-4 text-slate-200">{c.totalKmsPaved} km</td>
                      <td className={`py-3 pr-4 font-bold ${c.warrantyDefectRate > 15 ? 'text-red-400' : 'text-slate-200'}`}>
                        {c.warrantyDefectRate}%
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${c.qualityScore >= 80 ? 'bg-emerald-500' : c.qualityScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${c.qualityScore}%` }}
                            />
                          </div>
                          <span className={`font-bold ${c.qualityScore >= 80 ? 'text-emerald-400' : c.qualityScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                            {c.qualityScore}
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 pr-4 font-bold ${(c.openIncidents ?? 0) > 20 ? 'text-red-400' : 'text-slate-300'}`}>
                        {c.openIncidents ?? '—'}
                      </td>
                      <td className={`py-3 pr-4 ${(c.avgResolutionTimeDays ?? 0) > 14 ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                        {c.avgResolutionTimeDays ?? '—'}d
                      </td>
                      <td className="py-3 text-red-300">{formatINR(c.penaltiesLeviedINR)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Defect rate bar chart */}
          <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span>Defect Rate Comparison</span>
            </div>
            <div className="space-y-3">
              {contractors.map(c => (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300 truncate max-w-xs">{c.name}</span>
                    <span className={`font-bold ${c.warrantyDefectRate > 15 ? 'text-red-400' : 'text-slate-200'}`}>
                      {c.warrantyDefectRate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${c.warrantyDefectRate > 20 ? 'bg-red-500 shadow-[0_0_8px_#EF4444]' : c.warrantyDefectRate > 12 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${(c.warrantyDefectRate / 30) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


