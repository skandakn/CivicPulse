import React, { useState } from 'react';
import {
  ListOrdered,
  SlidersHorizontal,
  Flame,
  AlertTriangle,
  Building2,
  ArrowRight,
  Send,
  Download,
  Filter,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSeverityColor } from '../utils/formatters';

export const PriorityQueuePage: React.FC = () => {
  const {
    filteredIncidents,
    selectIncidentById,
    addToast
  } = useApp();

  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [trafficWeight, setTrafficWeight] = useState<number>(25);
  const [hospitalWeight, setHospitalWeight] = useState<number>(20);
  const [monsoonWeight, setMonsoonWeight] = useState<number>(15);

  const zones = ['ALL', 'Mahadevapura', 'East', 'South', 'Bommanahalli', 'West'];

  // Dynamically compute adjusted priority score based on slider weights
  const queueItems = filteredIncidents
    .filter(inc => selectedZone === 'ALL' || inc.zone === selectedZone)
    .map(inc => {
      const b = inc.priorityDetails.breakdown;
      const computedScore = Math.round(
        (b.depthRisk * 0.35) +
        (b.trafficVolumeImpact * (trafficWeight / 100)) +
        (b.schoolHospitalProximity * (hospitalWeight / 100)) +
        (b.monsoonFloodingVulnerability * (monsoonWeight / 100)) +
        (b.citizenUpvotesWeight * 0.05)
      );

      return {
        ...inc,
        dynamicScore: Math.min(100, Math.max(1, computedScore))
      };
    })
    .sort((a, b) => b.dynamicScore - a.dynamicScore);

  const handleBulkDispatch = () => {
    addToast(
      'Bulk Dispatch Order Transmitted',
      `Sent emergency work orders to BBMP Zonal Engineers for top ${Math.min(3, queueItems.length)} critical hazards`,
      'success'
    );
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-xs font-mono text-red-300 mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>ALGORITHMIC HAZARD QUEUE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            City Priority Queue & Dispatcher
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Prioritizing city repairs by commuter risk, ambulance routes, and monsoon vulnerability rather than political clout.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              addToast('Export Generated', 'Priority queue exported as BBMP PWD Dispatch Table (CSV/PDF)', 'info');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Work Orders</span>
          </button>
          <button
            onClick={handleBulkDispatch}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Bulk Dispatch Rapid Crews</span>
          </button>
        </div>
      </div>

      {/* Algorithmic Weight Customizer Strip */}
      <div className="p-4 rounded-2xl bg-[#090C16] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
            <SlidersHorizontal className="w-4 h-4" />
            <span>REAL-TIME SCORING WEIGHTS SIMULATION</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Adjusting weights instantly recalculates the municipal queue
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs font-mono">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Traffic Volume Impact:</span>
              <span className="text-cyan-400 font-bold">{trafficWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              value={trafficWeight}
              onChange={(e) => setTrafficWeight(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Emergency/Hospital Routes:</span>
              <span className="text-cyan-400 font-bold">{hospitalWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              value={hospitalWeight}
              onChange={(e) => setHospitalWeight(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Monsoon Waterlogging Index:</span>
              <span className="text-cyan-400 font-bold">{monsoonWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              value={monsoonWeight}
              onChange={(e) => setMonsoonWeight(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Zone Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          BBMP ZONE:
        </span>
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all
              ${selectedZone === zone
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_#00F0FF]'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }
            `}
          >
            {zone === 'ALL' ? 'All Bengaluru Zones' : zone}
          </button>
        ))}
      </div>

      {/* Ranked Queue Cards */}
      <div className="space-y-3">
        {queueItems.map((incident, idx) => {
          const sevColor = getSeverityColor(incident.severity);

          return (
            <div
              key={incident.id}
              onClick={() => selectIncidentById(incident.id, 'INCIDENT_DETAIL')}
              className="p-5 rounded-2xl bg-[#090C16] hover:bg-[#0D1220] border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Rank, Code, Road & Description */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-extrabold flex-shrink-0
                    ${idx === 0
                      ? 'bg-red-500 text-slate-950 shadow-[0_0_20px_#EF4444]'
                      : idx === 1
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_#F59E0B]'
                      : idx === 2
                      ? 'bg-yellow-500 text-slate-950'
                      : 'bg-white/5 text-slate-300 border border-white/10'
                    }
                  `}>
                    <span className="text-[10px] leading-none text-slate-950/70">RANK</span>
                    <span className="text-base leading-none mt-0.5">#{idx + 1}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{incident.code}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${sevColor.bg} ${sevColor.text} border ${sevColor.border}`}>
                        {incident.severity}
                      </span>
                      {incident.isUnderWarranty && (
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                          Warranty DLP Active
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-slate-400">
                        Ward {incident.wardNumber}: {incident.wardName} ({incident.zone})
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {incident.roadName}
                    </h3>
                    <p className="text-xs text-slate-400">{incident.landmark}</p>
                  </div>
                </div>

                {/* Right: Scores, Metrics & Audit Button */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5 font-mono text-xs">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-slate-500 block">AI SCORE</span>
                    <span className="text-2xl font-extrabold text-cyan-400">
                      {incident.dynamicScore}
                      <span className="text-xs text-slate-500 font-normal">/100</span>
                    </span>
                  </div>

                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-slate-500 block">DIMENSIONS</span>
                    <span className="font-bold text-slate-200">{incident.depthCm}cm • {incident.surfaceAreaSqM}m²</span>
                  </div>

                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-slate-500 block">COMMUNITY UPVOTES</span>
                    <span className="font-bold text-amber-300">{incident.upvotes} votes</span>
                  </div>

                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-slate-950 text-cyan-400 font-bold transition-all text-xs border border-cyan-500/30">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
