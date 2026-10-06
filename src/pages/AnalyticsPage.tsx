import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Building2,
  AlertTriangle,
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

// ── Steep Minimal Bar Chart ──────────────────────────────────────────────────────────
const BarChart: React.FC<{
  data: { label: string; value: number; max: number; color: string; secondValue?: number; secondColor?: string }[];
  height?: number;
}> = ({ data, height = 120 }) => {
  const maxVal = Math.max(...data.map(d => d.max), 1);
  return (
    <div className="flex items-end gap-3 w-full pt-4" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <div className="w-full flex flex-col items-center gap-1 justify-end" style={{ height: height - 28 }}>
            {d.secondValue !== undefined && (
              <div
                className={`w-full rounded-t-sm ${d.secondColor ?? 'bg-[#17191c]'}`}
                style={{ height: `${(d.secondValue / maxVal) * (height - 28)}px` }}
              />
            )}
            <div
              className={`w-full rounded-t-sm ${d.color}`}
              style={{ height: `${(d.value / maxVal) * (height - 28)}px` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#777b86] text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Steep Donut-style ring ────────────────────────────────────────────────────────
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
    <div className="flex flex-col items-center gap-2 p-2">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#f2f2f3" strokeWidth="6" />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xs font-medium text-[#17191c]">{value}</span>
          <span className="text-[10px] text-[#777b86] font-mono">{pct}%</span>
        </div>
      </div>
      <span className="text-[11px] text-[#777b86] font-mono text-center leading-tight">{label}</span>
    </div>
  );
};

// ── Steep Metric Card ─────────────────────────────────────────────────────────────
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  subColor?: string;
}> = ({ icon, label, value, sub, subColor = 'text-[#777b86]' }) => (
  <div className="rounded-[20px] bg-white border border-[#17191c]/8 p-5 space-y-2 shadow-sm">
    <div className="flex items-center justify-between text-[11px] font-mono text-[#979799] uppercase tracking-wider">
      <span>{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-medium text-[#17191c] font-mono">{value}</div>
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

  const severityData = [
    { label: 'CRIT', value: criticalCount, max: criticalCount + 2, color: 'bg-[#5d2a1a]' },
    { label: 'HIGH', value: highCount, max: criticalCount + 2, color: 'bg-[#17191c]' },
    { label: 'MED', value: mediumCount, max: criticalCount + 2, color: 'bg-[#777b86]' },
    { label: 'LOW', value: lowCount, max: criticalCount + 2, color: 'bg-[#a3a6af]' },
  ];

  const tabs = [
    { key: 'OVERVIEW', label: 'Overview' },
    { key: 'WARDS', label: 'Ward Audit' },
    { key: 'TRENDS', label: 'Resolution Trends' },
    { key: 'CONTRACTORS', label: 'Contractor Matrix' },
  ] as const;

  return (
    <div className="space-y-6 pb-20 max-w-[1200px] mx-auto text-left">
      {/* Header in Steep Style */}
      <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[#17191c]/8 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-mono text-[#17191c] bg-[#f2f2f3] px-3 py-1 rounded-full">
                Municipal Telemetry
              </span>
              <span className="text-[11px] font-mono text-[#5d2a1a] bg-[#fbe1d1] px-3 py-1 rounded-full">
                CAG & PWD Audit Standard
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#17191c] tracking-[-0.015em]">
              Bengaluru City <em className="italic">Infrastructure Analytics</em>
            </h1>
            <p className="text-xs sm:text-sm text-[#777b86] mt-1.5 max-w-2xl leading-relaxed">
              Forensic metrics on road hazard resolution, contractor liability enforcement, ward-level risk distribution, and AI audit accuracy.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1.5 text-xs font-mono flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#17191c] text-white font-medium'
                    : 'bg-[#f2f2f3] text-[#777b86] hover:text-[#17191c]'
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
              icon={<AlertTriangle className="w-4 h-4 text-[#5d2a1a]" />}
              label="Active Potholes"
              value={CITY_METRICS.activePotholes.toLocaleString()}
              sub={`${CITY_METRICS.criticalIssues} past 24h SLA`}
              subColor="text-[#5d2a1a]"
            />
            <MetricCard
              icon={<CheckCircle2 className="w-4 h-4 text-[#17191c]" />}
              label="Resolved Month"
              value={CITY_METRICS.resolvedThisMonth.toLocaleString()}
              sub={`${CITY_METRICS.aiVerifiedRepairs} AI-verified`}
              subColor="text-[#17191c]"
            />
            <MetricCard
              icon={<Clock className="w-4 h-4 text-[#777b86]" />}
              label="Avg Resolution"
              value={`${CITY_METRICS.avgResolutionTimeHours}h`}
              sub="↓ 34% via AI auto-triage"
              subColor="text-[#17191c]"
            />
            <MetricCard
              icon={<Cpu className="w-4 h-4 text-[#777b86]" />}
              label="Audit Precision"
              value={`${CITY_METRICS.aiPrecisionRate}%`}
              sub="Visual + depth verified"
              subColor="text-[#777b86]"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <MetricCard
              icon={<Copy className="w-4 h-4 text-[#777b86]" />}
              label="Duplicates Merged"
              value={CITY_METRICS.duplicateReportsMerged.toLocaleString()}
              sub="Cluster deduplication"
            />
            <MetricCard
              icon={<ShieldCheck className="w-4 h-4 text-[#5d2a1a]" />}
              label="Taxpayer Savings"
              value={formatINR(CITY_METRICS.taxpayerSavingsINR)}
              sub="Enforced contractor DLP"
              subColor="text-[#5d2a1a]"
            />
            <MetricCard
              icon={<MapPin className="w-4 h-4 text-[#5d2a1a]" />}
              label="Roads at Risk"
              value={`${CITY_METRICS.roadsAtRisk}`}
              sub="Arterial corridors critical"
              subColor="text-[#5d2a1a]"
            />
            <MetricCard
              icon={<Activity className="w-4 h-4 text-[#777b86]" />}
              label="Reports Today"
              value={CITY_METRICS.reportsToday.toString()}
              sub="Live citizen intake"
            />
          </div>

          {/* Severity distribution + resolution donuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Severity bar chart */}
            <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 sm:p-7 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono text-[#17191c] uppercase border-b border-[#17191c]/8 pb-3">
                <BarChart3 className="w-4 h-4 text-[#777b86]" />
                <span>Potholes by Severity Level</span>
              </div>
              <BarChart data={severityData} height={150} />
              <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center pt-3 border-t border-[#17191c]/8">
                {[
                  { label: 'Critical', val: criticalCount, c: 'text-[#5d2a1a]' },
                  { label: 'High', val: highCount, c: 'text-[#17191c]' },
                  { label: 'Medium', val: mediumCount, c: 'text-[#777b86]' },
                  { label: 'Low', val: lowCount, c: 'text-[#979799]' },
                ].map(s => (
                  <div key={s.label}>
                    <div className={`font-medium text-lg ${s.c}`}>{s.val}</div>
                    <div className="text-[10px] text-[#979799]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution donut rings */}
            <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 sm:p-7 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono text-[#17191c] uppercase border-b border-[#17191c]/8 pb-3">
                <TrendingUp className="w-4 h-4 text-[#777b86]" />
                <span>Resolution & Quality Audit Rates</span>
              </div>
              <div className="flex justify-around pt-3">
                <DonutRing
                  pct={Math.round((resolvedCount / incidents.length) * 100)}
                  color="#17191c"
                  label="AI Verified"
                  value={`${resolvedCount}/${incidents.length}`}
                />
                <DonutRing
                  pct={Math.round((CITY_METRICS.resolvedThisMonth / CITY_METRICS.activePotholes) * 100)}
                  color="#5d2a1a"
                  label="Monthly Rate"
                  value={`${CITY_METRICS.resolvedThisMonth}`}
                />
                <DonutRing
                  pct={Math.round((CITY_METRICS.aiVerifiedRepairs / CITY_METRICS.resolvedThisMonth) * 100)}
                  color="#777b86"
                  label="Pass Rate"
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
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-mono text-[#17191c] uppercase border-b border-[#17191c]/8 pb-3">
              <MapPin className="w-4 h-4 text-[#777b86]" />
              <span>Ward Density & Municipal Budget Utilization</span>
            </div>

            <div className="space-y-3">
              {wards.sort((a, b) => b.riskIndex - a.riskIndex).map(ward => {
                const budgetPct = Math.round((ward.budgetUtilizedLakhs / ward.budgetAllocatedLakhs) * 100);
                const densityPct = Math.min(100, Math.round((ward.activePotholesCount / 50) * 100));

                return (
                  <div key={ward.id} className="p-5 rounded-[20px] bg-[#fafafb] border border-[#17191c]/5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base text-[#17191c]">
                            Ward {ward.number} — {ward.name}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            ward.riskIndex > 85 ? 'bg-[#fbe1d1] text-[#5d2a1a]' : 'bg-[#f2f2f3] text-[#17191c]'
                          }`}>
                            Risk: {ward.riskIndex}
                          </span>
                        </div>
                        <span className="text-xs text-[#777b86] font-mono">{ward.zone} Zone</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-xs text-[#777b86]">
                        <span>Active: <strong className="text-[#17191c]">{ward.activePotholesCount}</strong></span>
                        <span>Critical: <strong className="text-[#5d2a1a]">{ward.criticalPotholesCount}</strong></span>
                        <span>Resolved: <strong className="text-[#17191c]">{ward.resolvedThisMonth}</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                      <div>
                        <div className="flex justify-between text-[10px] text-[#777b86] mb-1.5">
                          <span>POTHOLE DENSITY</span>
                          <span>{ward.activePotholesCount} ACTIVE</span>
                        </div>
                        <div className="w-full bg-[#f2f2f3] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${ward.riskIndex > 85 ? 'bg-[#5d2a1a]' : 'bg-[#17191c]'}`}
                            style={{ width: `${densityPct}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-[#777b86] mb-1.5">
                          <span>BUDGET UTILIZED</span>
                          <span>₹{ward.budgetUtilizedLakhs}L / ₹{ward.budgetAllocatedLakhs}L</span>
                        </div>
                        <div className="w-full bg-[#f2f2f3] h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#17191c] rounded-full"
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
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#17191c] uppercase">
                <TrendingUp className="w-4 h-4 text-[#777b86]" />
                <span>Monthly Reports vs Resolved Trends</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono text-[#777b86]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#17191c]" />Reported</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#5d2a1a]" />Resolved</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#a3a6af]" />AI Verified</span>
              </div>
            </div>

            <div className="flex items-end gap-4 w-full pt-6" style={{ height: 180 }}>
              {MONTHLY_TRENDS.map((m, i) => {
                const maxVal = Math.max(...MONTHLY_TRENDS.map(t => t.reported));
                const reportedH = (m.reported / maxVal) * 140;
                const resolvedH = (m.resolved / maxVal) * 140;
                const verifiedH = (m.aiVerified / maxVal) * 140;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 justify-end" style={{ height: 180 }}>
                    <div className="flex items-end gap-1 w-full justify-center" style={{ height: 140 }}>
                      <div className="flex-1 bg-[#17191c] rounded-t-sm" style={{ height: reportedH }} />
                      <div className="flex-1 bg-[#5d2a1a] rounded-t-sm" style={{ height: resolvedH }} />
                      <div className="flex-1 bg-[#a3a6af] rounded-t-sm" style={{ height: verifiedH }} />
                    </div>
                    <span className="text-[11px] font-mono text-[#777b86]">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── CONTRACTORS MATRIX ── */}
      {activeTab === 'CONTRACTORS' && (
        <div className="rounded-[24px] bg-white border border-[#17191c]/8 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[#17191c]/8 bg-white">
            <div className="flex items-center gap-2 text-xs font-mono text-[#17191c] uppercase">
              <Building2 className="w-4 h-4 text-[#777b86]" />
              <span>Contractor Matrix: Defect Rate vs Quality Rating</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fafafb] text-[#777b86]">
                <tr className="border-b border-[#17191c]/8">
                  <th className="p-3.5 text-left text-xs font-medium">Contractor</th>
                  <th className="p-3.5 text-left text-xs font-medium">Class</th>
                  <th className="p-3.5 text-left text-xs font-medium">Paved</th>
                  <th className="p-3.5 text-left text-xs font-medium">Defect Rate</th>
                  <th className="p-3.5 text-left text-xs font-medium">Quality</th>
                  <th className="p-3.5 text-left text-xs font-medium">Open Cases</th>
                  <th className="p-3.5 text-right text-xs font-medium">Penalties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17191c]/5 text-[#17191c]">
                {contractors.map(c => (
                  <tr key={c.id} className="hover:bg-[#fafafb] transition-colors">
                    <td className="p-3.5 font-serif text-base text-[#17191c]">
                      {c.name}
                      {c.blacklistedStatus && (
                        <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#fbe1d1] text-[#5d2a1a]">Blacklisted</span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs font-mono text-[#777b86]">{c.classRating}</td>
                    <td className="p-3.5 text-xs font-mono font-medium">{c.totalKmsPaved} km</td>
                    <td className={`p-3.5 text-xs font-mono font-medium ${c.warrantyDefectRate > 15 ? 'text-[#5d2a1a]' : 'text-[#17191c]'}`}>
                      {c.warrantyDefectRate}%
                    </td>
                    <td className="p-3.5">
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#17191c]">
                        {c.qualityScore} / 100
                      </span>
                    </td>
                    <td className="p-3.5 text-xs font-mono font-medium">{c.openIncidents ?? 14}</td>
                    <td className="p-3.5 text-right text-xs font-mono font-medium text-[#5d2a1a]">{formatINR(c.penaltiesLeviedINR)}</td>
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

