import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  CloudRain,
  ShieldCheck,
  Building2,
  DollarSign,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CITY_METRICS } from '../data/mockData';
import { formatINR } from '../utils/formatters';

export const AnalyticsPage: React.FC = () => {
  const { wards, contractors } = useApp();

  const [activeMetricTab, setActiveMetricTab] = useState<'WARDS' | 'MONSOON' | 'CONTRACTORS'>('WARDS');

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>MUNICIPAL INTELLIGENCE & AUDITING</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Bengaluru City Infrastructure Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Correlating rainfall precipitation patterns, contractor asphalt mix quality, and BBMP budget deployment efficiency.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-white/5 rounded-xl p-1 text-xs font-mono">
          <button
            onClick={() => setActiveMetricTab('WARDS')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeMetricTab === 'WARDS' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Ward Heatmap
          </button>
          <button
            onClick={() => setActiveMetricTab('MONSOON')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeMetricTab === 'MONSOON' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Monsoon Impact
          </button>
          <button
            onClick={() => setActiveMetricTab('CONTRACTORS')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeMetricTab === 'CONTRACTORS' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Contractor Defect Rates
          </button>
        </div>
      </div>

      {/* Top Level Strategic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#090C16] border border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>CITY RESOLUTION SPEED (MTTR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-2">
            42.5 hrs
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-mono">
            ↓ 34% faster via AI auto-triaging
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#090C16] border border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TAXPAYER FUNDS SAVED</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-2">
            {formatINR(CITY_METRICS.taxpayerSavingsINR)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Enforced via Defect Liability Periods
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#090C16] border border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>AI REPAIR AUDIT PASS RATE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-2">
            95.1%
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Zero visual/thermal defects on re-scan
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#090C16] border border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>HIGH-RISK ARTERIAL RATIO</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono mt-2">
            18.2%
          </div>
          <p className="text-[11px] text-amber-400 mt-1 font-mono">
            ORR, Silk Board, Whitefield corridors
          </p>
        </div>
      </div>

      {/* Main Tab Panels */}
      {activeMetricTab === 'WARDS' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Ward Pothole Density & Budget Utilization (Lakhs INR)</span>
            </h3>

            {/* Ward Bar Visualizer */}
            <div className="space-y-3 pt-2">
              {wards.map((ward) => {
                const ratio = Math.min(100, Math.round((ward.activePotholesCount / 50) * 100));

                return (
                  <div key={ward.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div>
                        <strong className="text-white">Ward {ward.number} - {ward.name}</strong>
                        <span className="text-slate-500 ml-2">({ward.zone} Zone)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">
                          Active: <strong className="text-red-400">{ward.activePotholesCount}</strong>
                        </span>
                        <span className="text-slate-400">
                          Resolved: <strong className="text-emerald-400">{ward.resolvedThisMonth}</strong>
                        </span>
                        <span className="text-slate-400">
                          Budget: <strong className="text-cyan-400">₹{ward.budgetUtilizedLakhs}L</strong> / ₹{ward.budgetAllocatedLakhs}L
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${ward.riskIndex > 85 ? 'bg-red-500 shadow-[0_0_10px_#EF4444]' : ward.riskIndex > 70 ? 'bg-amber-500' : 'bg-cyan-400'}`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeMetricTab === 'MONSOON' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              <span>Precipitation vs Pothole Emergence Correlation</span>
            </h3>

            <p className="text-xs text-slate-400">
              Correlating IMD Bengaluru Doppler radar rainfall indices with pothole surge on asphalt vs white-topped concrete roads.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span>June (Pre-monsoon bursts)</span>
                <span className="text-amber-400 font-bold">+18% pothole surge</span>
              </div>
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 flex justify-between items-center">
                <span>July - August (Peak SW Monsoon)</span>
                <span className="text-red-400 font-bold">+64% crater expansion surge</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span>September - October (NE Retreating Monsoon)</span>
                <span className="text-amber-400 font-bold">+42% waterlogging sinkages</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>White-Topped Concrete vs Bitumen Asphalt Resiliency</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-white font-bold">White-Topped Concrete Roads (e.g. Malleshwaram)</span>
                  <span className="text-emerald-400 font-bold">0.8 defects/km</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-white font-bold">Standard Asphalt Roads (e.g. Bellandur ORR, Hosur Rd)</span>
                  <span className="text-red-400 font-bold">6.4 defects/km</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMetricTab === 'CONTRACTORS' && (
        <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Contractor Defect Rate vs Paved Road Length Matrix</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-[11px]">
                  <th className="pb-3">CONTRACTOR NAME</th>
                  <th className="pb-3">CLASS</th>
                  <th className="pb-3">PAVED KM</th>
                  <th className="pb-3">DEFECT RATE</th>
                  <th className="pb-3">QUALITY SCORE</th>
                  <th className="pb-3">PENALTIES LEVIED</th>
                  <th className="pb-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contractors.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-sans font-semibold text-white">{c.name}</td>
                    <td className="py-3 text-slate-400">{c.classRating}</td>
                    <td className="py-3 text-slate-200">{c.totalKmsPaved} km</td>
                    <td className={`py-3 font-bold ${c.warrantyDefectRate > 15 ? 'text-red-400' : 'text-slate-200'}`}>
                      {c.warrantyDefectRate}%
                    </td>
                    <td className="py-3 text-cyan-400 font-bold">{c.qualityScore}/100</td>
                    <td className="py-3 text-red-300">{formatINR(c.penaltiesLeviedINR)}</td>
                    <td className="py-3">
                      {c.blacklistedStatus ? (
                        <span className="text-[10px] text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-500/40">
                          BLACKLISTED
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                          ELIGIBLE
                        </span>
                      )}
                    </td>
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
