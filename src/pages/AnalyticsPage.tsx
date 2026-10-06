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
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CITY_METRICS, MONTHLY_TRENDS } from '../data/mockData';
import { formatINR } from '../utils/formatters';

// ── Brutalist Mini bar chart ──────────────────────────────────────────────────────────
const BarChart: React.FC<{
  data: { label: string; value: number; max: number; color: string; secondValue?: number; secondColor?: string }[];
  height?: number;
}> = ({ data, height = 120 }) => {
  const maxVal = Math.max(...data.map(d => d.max), 1);
  return (
    <div className="flex items-end gap-2 w-full pt-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <div className="w-full flex flex-col items-center gap-0.5 justify-end" style={{ height: height - 24 }}>
            {d.secondValue !== undefined && (
              <div
                className={`w-full border-2 border-[#121210] ${d.secondColor ?? 'bg-[#2E8C42]'}`}
                style={{ height: `${(d.secondValue / maxVal) * (height - 24)}px` }}
              />
            )}
            <div
              className={`w-full border-2 border-[#121210] ${d.color}`}
              style={{ height: `${(d.value / maxVal) * (height - 24)}px` }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-[#121210] text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Brutalist Donut-style ring ────────────────────────────────────────────────────────
const DonutRing: React.FC<{ pct: number; color: string; label: string; value: string }> = ({
  pct,
  color,
  label,
  value,
}) => {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5 p-2">
      <div className="relative w-22 h-22">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#E2ECE5" strokeWidth="10" />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-sm font-extrabold text-[#121210]">{value}</span>
          <span className="text-[9px] text-[#121210]/60 font-mono font-bold">{pct}%</span>
        </div>
      </div>
      <span className="text-[10px] text-[#121210] font-mono font-bold text-center leading-tight">{label}</span>
    </div>
  );
};

// ── Brutalist Metric card ─────────────────────────────────────────────────────────────
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  subColor?: string;
}> = ({ icon, label, value, sub, subColor = 'text-[#121210]/70' }) => (
  <div className="brut bg-white p-4 space-y-1.5">
    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#121210]/60 uppercase tracking-wider">
      <span>{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-extrabold text-[#121210] font-mono">{value}</div>
    <p className={`text-[11px] font-mono font-bold ${subColor}`}>{sub}</p>
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

  const severityData = [
    { label: 'CRIT', value: criticalCount, max: criticalCount + 2, color: 'bg-[#C03A3A]' },
    { label: 'HIGH', value: highCount, max: criticalCount + 2, color: 'bg-[#E8A030]' },
    { label: 'MED', value: mediumCount, max: criticalCount + 2, color: 'bg-[#F4D89A]' },
    { label: 'LOW', value: lowCount, max: criticalCount + 2, color: 'bg-[#CFE8D6]' },
  ];

  const tabs = [
    { key: 'OVERVIEW', label: 'OVERVIEW' },
    { key: 'WARDS', label: 'WARD AUDIT' },
    { key: 'TRENDS', label: 'RESOLUTION TRENDS' },
    { key: 'CONTRACTORS', label: 'CONTRACTOR MATRIX' },
  ] as const;

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto text-left">
      {/* Header matching Approva */}
      <div className="brut-lg bg-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-[3px] border-[#121210] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="tag bg-[#2E8C42] text-white">
                <BarChart3 className="w-3.5 h-3.5 stroke-[3]" />
                MUNICIPAL TELEMETRY
              </span>
              <span className="tag bg-[#CFE8D6] text-[#121210]">
                CAG & PWD AUDIT
              </span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-[#121210] tracking-tight">
              Bengaluru City Infrastructure Analytics
            </h1>
            <p className="text-sm font-body text-[#121210]/70 mt-1 max-w-2xl">
              Forensic metrics on pothole resolution, contractor performance, ward-level risk distribution, and AI audit accuracy.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 font-mono text-xs font-bold flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 border-2 border-[#121210] transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#121210] text-white'
                    : 'bg-white text-[#121210] hover:bg-[#CFE8D6]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Top KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <MetricCard
              icon={<AlertTriangle className="w-4 h-4 text-[#C03A3A]" />}
              label="Active Potholes"
              value={CITY_METRICS.activePotholes.toLocaleString()}
              sub={`${CITY_METRICS.criticalIssues} CRITICAL SLA`}
              subColor="text-[#C03A3A]"
            />
            <MetricCard
              icon={<CheckCircle2 className="w-4 h-4 text-[#2E8C42]" />}
              label="Resolved Month"
              value={CITY_METRICS.resolvedThisMonth.toLocaleString()}
              sub={`${CITY_METRICS.aiVerifiedRepairs} AI-VERIFIED`}
              subColor="text-[#2E8C42]"
            />
            <MetricCard
              icon={<Clock className="w-4 h-4 text-[#121210]" />}
              label="Avg Resolution"
              value={`${CITY_METRICS.avgResolutionTimeHours}h`}
              sub="↓ 34% FASTER VIA AI AUTO-TRIAGE"
              subColor="text-[#2E8C42]"
            />
            <MetricCard
              icon={<Cpu className="w-4 h-4 text-[#121210]" />}
              label="Audit Precision"
              value={`${CITY_METRICS.aiPrecisionRate}%`}
              sub="VISUAL + THERMAL VERIFIED"
              subColor="text-[#121210]"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <MetricCard
              icon={<Copy className="w-4 h-4 text-[#121210]" />}
              label="Duplicates Merged"
              value={CITY_METRICS.duplicateReportsMerged.toLocaleString()}
              sub="CLUSTER DEDUPLICATION"
            />
            <MetricCard
              icon={<ShieldCheck className="w-4 h-4 text-[#2E8C42]" />}
              label="Taxpayer Savings"
              value={formatINR(CITY_METRICS.taxpayerSavingsINR)}
              sub="ENFORCED CONTRACTOR DLP"
              subColor="text-[#2E8C42]"
            />
            <MetricCard
              icon={<MapPin className="w-4 h-4 text-[#C03A3A]" />}
              label="Roads at Risk"
              value={`${CITY_METRICS.roadsAtRisk}`}
              sub="ARTERIAL CORRIDORS EXCEEDING RISK"
              subColor="text-[#C03A3A]"
            />
            <MetricCard
              icon={<Activity className="w-4 h-4 text-[#121210]" />}
              label="Reports Today"
              value={CITY_METRICS.reportsToday.toString()}
              sub="LIVE CITIZEN INGESTION"
            />
          </div>

          {/* Severity distribution + resolution donuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Severity bar chart */}
            <div className="brut bg-white p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#121210] uppercase border-b-2 border-[#121210] pb-2">
                <BarChart3 className="w-4 h-4" />
                <span>Potholes by Severity Level</span>
              </div>
              <BarChart data={severityData} height={150} />
              <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center pt-2 border-t-2 border-[#121210]/15">
                {[
                  { label: 'CRITICAL', val: criticalCount, c: 'text-[#C03A3A]' },
                  { label: 'HIGH', val: highCount, c: 'text-[#E8A030]' },
                  { label: 'MEDIUM', val: mediumCount, c: 'text-[#121210]' },
                  { label: 'LOW', val: lowCount, c: 'text-[#2E8C42]' },
                ].map(s => (
                  <div key={s.label}>
                    <div className={`font-extrabold text-base ${s.c}`}>{s.val}</div>
                    <div className="text-[10px] text-[#121210]/60 font-bold">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution donut rings */}
            <div className="brut bg-white p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#121210] uppercase border-b-2 border-[#121210] pb-2">
                <TrendingUp className="w-4 h-4 text-[#2E8C42]" />
                <span>Resolution & Quality Rates</span>
              </div>
              <div className="flex justify-around pt-2">
                <DonutRing
                  pct={Math.round((resolvedCount / incidents.length) * 100)}
                  color="#2E8C42"
                  label="AI VERIFIED"
                  value={`${resolvedCount}/${incidents.length}`}
                />
                <DonutRing
                  pct={Math.round((CITY_METRICS.resolvedThisMonth / CITY_METRICS.activePotholes) * 100)}
                  color="#121210"
                  label="MONTH RESOLUTION"
                  value={`${CITY_METRICS.resolvedThisMonth}`}
                />
                <DonutRing
                  pct={Math.round((CITY_METRICS.aiVerifiedRepairs / CITY_METRICS.resolvedThisMonth) * 100)}
                  color="#E8A030"
                  label="AUDIT PASS RATE"
                  value={`95.1%`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── WARDS ── */}
      {activeTab === 'WARDS' && (
        <div className="space-y-6">
          <div className="brut bg-white p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#121210] uppercase border-b-2 border-[#121210] pb-2">
              <MapPin className="w-4 h-4" />
              <span>Ward Density & Municipal Budget Utilization</span>
            </div>

            <div className="space-y-3">
              {wards.sort((a, b) => b.riskIndex - a.riskIndex).map(ward => {
                const budgetPct = Math.round((ward.budgetUtilizedLakhs / ward.budgetAllocatedLakhs) * 100);
                const densityPct = Math.min(100, Math.round((ward.activePotholesCount / 50) * 100));

                return (
                  <div key={ward.id} className="p-4 border-2 border-[#121210] bg-[#CFE8D6]/20 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-extrabold text-[#121210] text-sm">
                            Ward {ward.number} — {ward.name}
                          </span>
                          <span className={`tag ${ward.riskIndex > 85 ? 'bg-[#C03A3A] text-white' : ward.riskIndex > 70 ? 'bg-[#E8A030] text-[#121210]' : 'bg-[#2E8C42] text-white'}`}>
                            RISK: {ward.riskIndex}
                          </span>
                        </div>
                        <span className="text-xs text-[#121210]/60 font-mono font-bold">{ward.zone} Zone</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-xs">
                        <span>Active: <strong className="text-[#C03A3A]">{ward.activePotholesCount}</strong></span>
                        <span>Critical: <strong className="text-[#E8A030]">{ward.criticalPotholesCount}</strong></span>
                        <span>Resolved: <strong className="text-[#2E8C42]">{ward.resolvedThisMonth}</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                      <div>
                        <div className="flex justify-between text-[10px] text-[#121210]/70 font-bold mb-1">
                          <span>POTHOLE DENSITY</span>
                          <span>{ward.activePotholesCount} ACTIVE</span>
                        </div>
                        <div className="w-full bg-white border-2 border-[#121210] h-2.5 overflow-hidden">
                          <div
                            className={`h-full ${ward.riskIndex > 85 ? 'bg-[#C03A3A]' : 'bg-[#E8A030]'}`}
                            style={{ width: `${densityPct}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-[#121210]/70 font-bold mb-1">
                          <span>BUDGET UTILIZED</span>
                          <span>₹{ward.budgetUtilizedLakhs}L / ₹{ward.budgetAllocatedLakhs}L</span>
                        </div>
                        <div className="w-full bg-white border-2 border-[#121210] h-2.5 overflow-hidden">
                          <div
                            className="h-full bg-[#2E8C42]"
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
        </div>
      )}

      {/* ── TRENDS ── */}
      {activeTab === 'TRENDS' && (
        <div className="space-y-6">
          <div className="brut bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#121210] uppercase">
                <TrendingUp className="w-4 h-4 text-[#2E8C42]" />
                <span>Monthly Reports vs Resolved Trends</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono font-bold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#121210]" />REPORTED</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#2E8C42]" />RESOLVED</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#E8A030]" />AI VERIFIED</span>
              </div>
            </div>

            <div className="flex items-end gap-3 w-full pt-4" style={{ height: 160 }}>
              {MONTHLY_TRENDS.map((m, i) => {
                const maxVal = Math.max(...MONTHLY_TRENDS.map(t => t.reported));
                const reportedH = (m.reported / maxVal) * 120;
                const resolvedH = (m.resolved / maxVal) * 120;
                const verifiedH = (m.aiVerified / maxVal) * 120;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 justify-end" style={{ height: 160 }}>
                    <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: 130 }}>
                      <div className="flex-1 bg-[#121210] border border-[#121210]" style={{ height: reportedH }} />
                      <div className="flex-1 bg-[#2E8C42] border border-[#121210]" style={{ height: resolvedH }} />
                      <div className="flex-1 bg-[#E8A030] border border-[#121210]" style={{ height: verifiedH }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#121210]">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── CONTRACTORS MATRIX ── */}
      {activeTab === 'CONTRACTORS' && (
        <div className="brut bg-white overflow-hidden">
          <div className="p-5 border-b-[3px] border-[#121210] bg-[#CFE8D6]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#121210] uppercase">
              <Building2 className="w-4 h-4" />
              <span>Contractor Matrix: Defect Rate vs Quality Rating</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="history-table w-full font-mono text-sm">
              <thead className="bg-[#CFE8D6]/50">
                <tr className="border-b-[3px] border-[#121210] text-[#121210]">
                  <th className="p-3 text-left">CONTRACTOR</th>
                  <th className="p-3 text-left">CLASS</th>
                  <th className="p-3 text-left">PAVED</th>
                  <th className="p-3 text-left">DEFECT RATE</th>
                  <th className="p-3 text-left">QUALITY</th>
                  <th className="p-3 text-left">OPEN DEFECTS</th>
                  <th className="p-3 text-right">PENALTIES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#121210]/20">
                {contractors.map(c => (
                  <tr key={c.id} className="hover:bg-[#CFE8D6]/20">
                    <td className="p-3 font-bold font-display text-[#121210]">
                      {c.name}
                      {c.blacklistedStatus && (
                        <span className="ml-2 tag bg-[#C03A3A] text-white py-0.2 px-1 text-[9px]">BLACKLISTED</span>
                      )}
                    </td>
                    <td className="p-3">{c.classRating}</td>
                    <td className="p-3 font-bold">{c.totalKmsPaved} km</td>
                    <td className={`p-3 font-bold ${c.warrantyDefectRate > 15 ? 'text-[#C03A3A]' : 'text-[#2E8C42]'}`}>
                      {c.warrantyDefectRate}%
                    </td>
                    <td className="p-3">
                      <span className={`tag ${c.qualityScore >= 80 ? 'bg-[#2E8C42] text-white' : 'bg-[#E8A030] text-[#121210]'}`}>
                        {c.qualityScore}/100
                      </span>
                    </td>
                    <td className="p-3 font-bold">{c.openIncidents ?? 14}</td>
                    <td className="p-3 text-right font-bold text-[#C03A3A]">{formatINR(c.penaltiesLeviedINR)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
