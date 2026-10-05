import React, { useState } from 'react';
import {
  Eye,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  ShieldAlert,
  Zap,
  Flame,
  RotateCcw
} from 'lucide-react';
import { BengaluruMap } from '../components/map/BengaluruMap';
import { useApp } from '../context/AppContext';
import { SeverityLevel, MapMode } from '../types';
import { CITY_METRICS } from '../data/mockData';
import { getSeverityColor } from '../utils/formatters';

export const GodsEyePage: React.FC = () => {
  const {
    filteredIncidents,
    selectedIncident,
    setSelectedIncident,
    selectIncidentById,
    addToast
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'ALL'>('ALL');
  const [warrantyFilterOnly, setWarrantyFilterOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'DETAILS'>('QUEUE');
  const [mapMode, setMapMode] = useState<MapMode>('INCIDENTS');

  // Filtered list based on local UI controls
  const displayedIncidents = filteredIncidents.filter((inc) => {
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    if (warrantyFilterOnly && !inc.isUnderWarranty) return false;
    return true;
  });

  // Sort by priority score descending
  const sortedQueue = [...displayedIncidents].sort(
    (a, b) => b.priorityDetails.overallScore - a.priorityDetails.overallScore
  );

  const activeCount = filteredIncidents.length;
  const criticalCount = filteredIncidents.filter(i => i.severity === 'CRITICAL').length;
  const underWarrantyCount = filteredIncidents.filter(i => i.isUnderWarranty).length;

  return (
    <div className="space-y-6 pb-12 text-left animate-in fade-in duration-300">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Active Potholes */}
        <div className="p-4 rounded-2xl bg-[#0B0E1A] border border-white/10 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">ACTIVE POTHOLES</span>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {activeCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 font-mono">
            <span>Live in feed</span>
          </div>
        </div>

        {/* Metric 2: Critical Issues */}
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 relative overflow-hidden group hover:border-red-500/50 transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-red-300">CRITICAL HAZARDS</span>
            <Flame className="w-4 h-4 text-red-400 animate-bounce" />
          </div>
          <div className="text-2xl font-extrabold text-red-400 font-mono mt-1">
            {criticalCount}
          </div>
          <div className="text-[11px] text-red-300 mt-1 flex items-center gap-1 font-mono">
            <span>In active queue</span>
          </div>
        </div>

        {/* Metric 3: Reports Today */}
        <div className="p-4 rounded-2xl bg-[#0B0E1A] border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">TOTAL REPORTS</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {filteredIncidents.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Incidents tracked
          </div>
        </div>

        {/* Metric 4: Resolved This Month */}
        <div className="p-4 rounded-2xl bg-[#0B0E1A] border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">CV VERIFIED REPAIRS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {filteredIncidents.filter(i => i.status === 'AI_VERIFIED').length.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Successfully closed
          </div>
        </div>

        {/* Metric 5: AI Verified Repairs */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 relative overflow-hidden group hover:border-cyan-500/50 transition-all shadow-[0_0_20px_rgba(0,240,255,0.1)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-300">WARRANTY CLAIMS</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
            {underWarrantyCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-300 mt-1 font-mono">
            95.1% pass rate on first audit
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#090C16] border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>SEVERITY:</span>
          </div>

          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all
                ${severityFilter === sev
                  ? sev === 'CRITICAL'
                    ? 'bg-red-500 text-slate-950 shadow-[0_0_12px_#EF4444]'
                    : sev === 'HIGH'
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_#F59E0B]'
                    : sev === 'MEDIUM'
                    ? 'bg-yellow-500 text-slate-950 shadow-[0_0_12px_#EAB308]'
                    : 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_#00F0FF]'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }
              `}
            >
              {sev === 'ALL' ? 'All Severities' : sev}
            </button>
          ))}

          <button
            onClick={() => setWarrantyFilterOnly(!warrantyFilterOnly)}
            className={`ml-2 px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border
              ${warrantyFilterOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-white/[0.04] text-slate-400 border-transparent hover:text-white'
              }
            `}
          >
            <ShieldAlert className="w-3 h-3 text-emerald-400" />
            <span>Contractor Warranty Only ({underWarrantyCount})</span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>Displaying {displayedIncidents.length} of {filteredIncidents.length} hotspots</span>
          <button
            onClick={() => {
              setSeverityFilter('ALL');
              setWarrantyFilterOnly(false);
              addToast('Filters Reset', 'Displaying all Bengaluru road incidents', 'info');
            }}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-white/5"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Command Center Layout: Large Map + Side Priority Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[680px]">
        {/* Center: Large Bengaluru Map */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-white/10 bg-[#090C16] overflow-hidden shadow-2xl relative">
          {/* Map Top Bar with 5 Modes */}
          <div className="p-3 bg-[#070910] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="font-mono font-bold text-white uppercase tracking-wider hidden sm:inline">
                Bengaluru Spatial Canvas
              </span>
            </div>

            {/* 5 Map Mode Switcher Tabs */}
            <div className="flex flex-wrap bg-white/5 rounded-xl p-1 gap-1 text-xs font-mono">
              {[
                { id: 'INCIDENTS', label: 'Incidents' },
                { id: 'HEATMAP', label: 'Heatmap' },
                { id: 'ROAD_HEALTH', label: 'Road Health' },
                { id: 'PRIORITY_ZONES', label: 'Priority Zones' },
                { id: 'CONTRACTORS', label: 'Contractors' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMapMode(m.id as MapMode);
                    addToast('Map Mode Changed', `${m.label} Layer Active`, 'info');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
                    mapMode === m.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Severity Legend */}
            <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
                Critical
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                High
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                Verified
              </span>
            </div>
          </div>

          {/* Actual Leaflet Map */}
          <div className="flex-1 w-full relative min-h-[500px]">
            <BengaluruMap
              incidents={displayedIncidents}
              selectedIncidentId={selectedIncident?.id}
              mapMode={mapMode}
              onSelectIncident={(inc) => {
                setSelectedIncident(inc);
                setActiveTab('DETAILS');
              }}
              height="100%"
            />

            {/* Subtle Map Overlay Watermark */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none p-2 rounded-lg bg-[#070912]/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-400 space-y-0.5">
              <div>BBMP GIS GRID: 12.9716° N / 77.5946° E</div>
              <div className="text-cyan-400">CARTOGRAPHY: DARK MATTER HYPER-RES</div>
            </div>
          </div>
        </div>

        {/* Right Side Panel: AI Priority Queue & Incident Peek */}
        <div className="lg:col-span-4 flex flex-col rounded-2xl border border-white/10 bg-[#090C16] overflow-hidden">
          {/* Panel Header & Tabs */}
          <div className="p-3 bg-[#070910] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                AI Priority Queue
              </span>
            </div>

            <div className="flex bg-white/5 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setActiveTab('QUEUE')}
                className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'QUEUE' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Queue ({sortedQueue.length})
              </button>
              <button
                onClick={() => setActiveTab('DETAILS')}
                className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'DETAILS' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Inspect
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[620px]">
            {activeTab === 'QUEUE' ? (
              sortedQueue.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  No potholes match the selected filters.
                </div>
              ) : (
                sortedQueue.map((incident, idx) => {
                  const isSelected = selectedIncident?.id === incident.id;
                  const sevColor = getSeverityColor(incident.severity);

                  return (
                    <div
                      key={incident.id}
                      onClick={() => {
                        setSelectedIncident(incident);
                        setActiveTab('DETAILS');
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all relative group
                        ${isSelected
                          ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px]
                            ${idx === 0 ? 'bg-red-500 text-slate-950' : idx === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}
                          `}>
                            #{idx + 1}
                          </span>
                          <span className="font-mono text-slate-300 font-bold text-[11px]">{incident.code}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${sevColor.bg} ${sevColor.text} border ${sevColor.border}`}>
                            {incident.severity}
                          </span>
                          <span className="text-xs font-mono font-extrabold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                            {incident.priorityDetails.overallScore}
                          </span>
                        </div>
                      </div>

                      <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {incident.roadName}
                      </div>

                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {incident.landmark}
                      </div>

                      {/* Quick Meta Footer */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-400">
                        <span>Depth: <strong className="text-slate-200">{incident.depthCm}cm</strong></span>
                        <span>Ward {incident.wardNumber}: {incident.wardName}</span>
                        {incident.isUnderWarranty ? (
                          <span className="text-emerald-400 font-semibold">Under DLP</span>
                        ) : (
                          <span className="text-slate-500">BBMP PWD</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              // Details Peek Tab
              selectedIncident ? (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-white/10 relative h-40">
                    <img
                      src={selectedIncident.images.original}
                      alt={selectedIncident.roadName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 justify-between">
                      <span className="text-xs font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded border border-white/20">
                        {selectedIncident.code}
                      </span>
                      <span className="text-xs font-mono font-extrabold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                        SCORE: {selectedIncident.priorityDetails.overallScore}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedIncident.roadName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedIncident.landmark}</p>
                    <div className="text-[11px] text-slate-500 font-mono mt-1">
                      Ward {selectedIncident.wardNumber}: {selectedIncident.wardName} ({selectedIncident.zone} Zone)
                    </div>
                  </div>

                  {/* Physical Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 font-mono text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">DEPTH</span>
                      <span className="font-bold text-red-400">{selectedIncident.depthCm} cm</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">SURFACE</span>
                      <span className="font-bold text-slate-200">{selectedIncident.surfaceAreaSqM} m²</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">FILL REQ.</span>
                      <span className="font-bold text-cyan-400">{selectedIncident.estimatedVolumeLiters} L</span>
                    </div>
                  </div>

                  {/* Contractor Accountability Status */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Responsible Entity</span>
                      <span className="text-emerald-400">
                        {selectedIncident.isUnderWarranty ? 'Warranty Active' : 'Public Tender'}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-200">{selectedIncident.contractorName}</div>
                    <div className="text-[11px] text-slate-400">
                      BBMP Sahaya Ref: <span className="font-mono text-amber-300">{selectedIncident.sahayaTicketNo}</span>
                    </div>
                  </div>

                  {/* AI Factor Explanations */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                      AI Priority Factors
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {selectedIncident.priorityDetails.explanation.map((exp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-cyan-400">•</span>
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>

                    {selectedIncident.priorityDetails.shortExplanation && (
                      <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20 text-[11px] font-sans text-slate-300 mt-2">
                        <strong className="text-cyan-300 font-mono">Why priority {selectedIncident.priorityDetails.overallScore}?</strong> {selectedIncident.priorityDetails.shortExplanation}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => selectIncidentById(selectedIncident.id, 'INCIDENT_DETAIL')}
                      className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Full Incident Investigation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => selectIncidentById(selectedIncident.id, 'AI_ANALYSIS')}
                      className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-colors cursor-pointer"
                    >
                      View AI Computer Vision Breakdown
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  Select a pothole from the map or queue to view detailed diagnostics.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
