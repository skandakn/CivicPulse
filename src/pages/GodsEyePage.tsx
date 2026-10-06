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
    <div className="space-y-6 pb-12 text-left">
      {/* Top Metrics Row matching Approva */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="brut bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#121210]/60 uppercase">ACTIVE POTHOLES</span>
            <div className="w-2.5 h-2.5 bg-[#2E8C42] border border-[#121210]" />
          </div>
          <div className="text-2xl font-extrabold text-[#121210] font-mono mt-1">
            {CITY_METRICS.activePotholes.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#2E8C42] mt-0.5 font-mono font-bold">
            +{activeCount} IN LIVE FEED
          </div>
        </div>

        <div className="brut bg-[#C03A3A] text-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-white/80 uppercase">CRITICAL HAZARDS</span>
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {CITY_METRICS.criticalIssues}
          </div>
          <div className="text-[10px] text-white/80 mt-0.5 font-mono font-bold">
            {criticalCount} LIVE IN QUEUE
          </div>
        </div>

        <div className="brut bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#121210]/60 uppercase">REPORTS TODAY</span>
            <Clock className="w-4 h-4 text-[#121210]" />
          </div>
          <div className="text-2xl font-extrabold text-[#121210] font-mono mt-1">
            {CITY_METRICS.reportsToday}
          </div>
          <div className="text-[10px] text-[#121210]/60 mt-0.5 font-mono">
            INGESTION: 4.2 / HR
          </div>
        </div>

        <div className="brut bg-[#2E8C42] text-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-white/80 uppercase">RESOLVED (MONTH)</span>
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {CITY_METRICS.resolvedThisMonth.toLocaleString()}
          </div>
          <div className="text-[10px] text-white/80 mt-0.5 font-mono">
            MTTR: 42.5 HOURS
          </div>
        </div>

        <div className="brut bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#121210]/60 uppercase">AI VERIFIED REPAIRS</span>
            <Zap className="w-4 h-4 text-[#E8A030]" />
          </div>
          <div className="text-2xl font-extrabold text-[#121210] font-mono mt-1">
            {CITY_METRICS.aiVerifiedRepairs.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#2E8C42] mt-0.5 font-mono font-bold">
            95.1% FIRST-AUDIT PASS
          </div>
        </div>
      </div>

      {/* Filter and Control Bar in Brutalist style */}
      <div className="brut bg-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#121210] mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>SEVERITY:</span>
          </div>

          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 border-2 border-[#121210] text-xs font-mono font-bold transition-all cursor-pointer ${
                severityFilter === sev
                  ? sev === 'CRITICAL'
                    ? 'bg-[#C03A3A] text-white'
                    : sev === 'HIGH'
                    ? 'bg-[#E8A030] text-[#121210]'
                    : sev === 'MEDIUM'
                    ? 'bg-[#F4D89A] text-[#121210]'
                    : 'bg-[#CFE8D6] text-[#121210]'
                  : 'bg-white text-[#121210] hover:bg-zinc-100'
              }`}
            >
              {sev === 'ALL' ? 'ALL SEVERITIES' : sev}
            </button>
          ))}

          <button
            onClick={() => setWarrantyFilterOnly(!warrantyFilterOnly)}
            className={`ml-2 px-3 py-1 border-2 border-[#121210] text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              warrantyFilterOnly
                ? 'bg-[#2E8C42] text-white'
                : 'bg-white text-[#121210] hover:bg-zinc-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>CONTRACTOR WARRANTY ONLY ({underWarrantyCount})</span>
          </button>
        </div>

        <div className="text-xs font-mono font-bold text-[#121210]/70 flex items-center gap-2">
          <span>{displayedIncidents.length} OF {filteredIncidents.length} HOTSPOTS</span>
          <button
            onClick={() => {
              setSeverityFilter('ALL');
              setWarrantyFilterOnly(false);
              addToast('Filters Reset', 'Displaying all Bengaluru road incidents', 'info');
            }}
            className="p-1 brut-sm bg-white hover:bg-zinc-100 cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#121210]" />
          </button>
        </div>
      </div>

      {/* Command Center Layout: Map + Side Priority Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[660px]">
        {/* Center: Large Bengaluru Map */}
        <div className="lg:col-span-8 flex flex-col brut-lg bg-white overflow-hidden relative">
          {/* Map Top Bar with 5 Modes */}
          <div className="p-3 bg-[#CFE8D6] border-b-[3px] border-[#121210] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#121210]" />
              <span className="font-display font-extrabold text-sm text-[#121210] uppercase">
                BENGALURU GEOSPATIAL RADAR
              </span>
            </div>

            {/* 5 Map Mode Switcher Tabs */}
            <div className="flex flex-wrap gap-1 font-mono text-xs">
              {[
                { id: 'INCIDENTS', label: 'INCIDENTS' },
                { id: 'HEATMAP', label: 'HEATMAP' },
                { id: 'ROAD_HEALTH', label: 'ROAD HEALTH' },
                { id: 'PRIORITY_ZONES', label: 'PRIORITY ZONES' },
                { id: 'CONTRACTORS', label: 'CONTRACTORS' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMapMode(m.id as MapMode);
                    addToast('Map Layer Switched', `${m.label} active`, 'info');
                  }}
                  className={`px-2.5 py-1 border-2 border-[#121210] font-bold cursor-pointer transition-colors ${
                    mapMode === m.id
                      ? 'bg-[#121210] text-white'
                      : 'bg-white text-[#121210] hover:bg-[#F3FAF5]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
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

            {/* Map Overlay Watermark */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none p-2 border-2 border-[#121210] bg-white text-[10px] font-mono text-[#121210] font-bold">
              <div>BBMP GIS GRID: 12.9716° N / 77.5946° E</div>
              <div className="text-[#2E8C42]">STATUS: 198 WARDS ACTIVE</div>
            </div>
          </div>
        </div>

        {/* Right Side Panel: AI Priority Queue & Incident Peek */}
        <div className="lg:col-span-4 flex flex-col brut bg-white overflow-hidden">
          {/* Panel Header & Tabs */}
          <div className="p-3 bg-[#CFE8D6] border-b-[3px] border-[#121210] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#121210]" />
              <span className="font-display font-extrabold text-xs text-[#121210] uppercase">
                RADAR STREAM
              </span>
            </div>

            <div className="flex gap-1 text-xs font-mono font-bold">
              <button
                onClick={() => setActiveTab('QUEUE')}
                className={`px-2.5 py-1 border-2 border-[#121210] cursor-pointer transition-colors ${
                  activeTab === 'QUEUE' ? 'bg-[#121210] text-white' : 'bg-white text-[#121210]'
                }`}
              >
                Queue ({sortedQueue.length})
              </button>
              <button
                onClick={() => setActiveTab('DETAILS')}
                className={`px-2.5 py-1 border-2 border-[#121210] cursor-pointer transition-colors ${
                  activeTab === 'DETAILS' ? 'bg-[#121210] text-white' : 'bg-white text-[#121210]'
                }`}
              >
                Inspect
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[620px] bg-[#CFE8D6]/20">
            {activeTab === 'QUEUE' ? (
              sortedQueue.length === 0 ? (
                <div className="py-12 text-center text-[#121210]/60 text-xs font-mono">
                  No potholes match the selected filters.
                </div>
              ) : (
                sortedQueue.map((incident, idx) => {
                  const isSelected = selectedIncident?.id === incident.id;

                  return (
                    <div
                      key={incident.id}
                      onClick={() => {
                        setSelectedIncident(incident);
                        setActiveTab('DETAILS');
                      }}
                      className={`p-3 border-2 border-[#121210] text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#E8A030] text-[#121210] shadow-[3px_3px_0_#121210]'
                          : 'bg-white text-[#121210] hover:bg-[#F3FAF5]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 border border-[#121210] flex items-center justify-center font-mono font-bold text-[10px] ${
                            idx === 0 ? 'bg-[#C03A3A] text-white' : idx === 1 ? 'bg-[#E8A030] text-[#121210]' : 'bg-white text-[#121210]'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="font-mono text-[#121210] font-bold text-[11px]">{incident.code}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`tag py-0.2 px-1 text-[9px] ${incident.severity === 'CRITICAL' ? 'bg-[#C03A3A] text-white' : 'bg-white'}`}>
                            {incident.severity}
                          </span>
                          <span className="font-mono font-extrabold bg-[#121210] text-white px-1.5 py-0.5 text-[10px]">
                            {incident.priorityDetails.overallScore}
                          </span>
                        </div>
                      </div>

                      <div className="font-display font-bold text-[#121210] truncate">
                        {incident.roadName}
                      </div>

                      <div className="text-[11px] font-body text-[#121210]/70 truncate">
                        {incident.landmark}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#121210]/20 text-[10px] font-mono">
                        <span>Depth: <strong>{incident.depthCm}cm</strong></span>
                        <span>Ward {incident.wardNumber}</span>
                        {incident.isUnderWarranty ? (
                          <span className="text-[#2E8C42] font-bold">DLP ACTIVE</span>
                        ) : (
                          <span className="text-[#121210]/60">BBMP PWD</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              selectedIncident ? (
                <div className="space-y-4 bg-white p-3 border-2 border-[#121210]">
                  <div className="overflow-hidden border-2 border-[#121210] relative h-40">
                    <img
                      src={selectedIncident.images.original}
                      alt={selectedIncident.roadName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 justify-between">
                      <span className="text-xs font-mono font-bold text-white bg-[#121210] px-1.5 py-0.5 border border-white">
                        {selectedIncident.code}
                      </span>
                      <span className="text-xs font-mono font-extrabold bg-[#E8A030] text-[#121210] px-1.5 py-0.5 border border-[#121210]">
                        SCORE: {selectedIncident.priorityDetails.overallScore}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-extrabold text-sm text-[#121210]">{selectedIncident.roadName}</h3>
                    <p className="text-xs font-body text-[#121210]/70 mt-0.5">{selectedIncident.landmark}</p>
                    <div className="text-[11px] text-[#121210]/60 font-mono mt-1 font-bold">
                      Ward {selectedIncident.wardNumber}: {selectedIncident.wardName} ({selectedIncident.zone})
                    </div>
                  </div>

                  {/* Physical Metrics Grid */}
                  <div className="grid grid-cols-3 gap-1.5 bg-[#CFE8D6]/30 p-2 border-2 border-[#121210] font-mono text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#121210]/60 block font-bold">DEPTH</span>
                      <span className="font-extrabold text-[#C03A3A]">{selectedIncident.depthCm} cm</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#121210]/60 block font-bold">SURFACE</span>
                      <span className="font-bold text-[#121210]">{selectedIncident.surfaceAreaSqM} m²</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#121210]/60 block font-bold">FILL REQ.</span>
                      <span className="font-bold text-[#121210]">{selectedIncident.estimatedVolumeLiters} L</span>
                    </div>
                  </div>

                  {/* Contractor Accountability */}
                  <div className="p-2.5 border-2 border-[#121210] bg-white space-y-1 text-xs">
                    <div className="text-[10px] font-mono text-[#121210]/60 uppercase font-bold flex items-center justify-between">
                      <span>RESPONSIBLE ENTITY</span>
                      <span className="text-[#2E8C42]">
                        {selectedIncident.isUnderWarranty ? 'DLP WARRANTY' : 'PUBLIC TENDER'}
                      </span>
                    </div>
                    <div className="font-display font-bold text-[#121210]">{selectedIncident.contractorName}</div>
                    <div className="text-[10px] font-mono text-[#121210]/70">
                      SAHAYA REF: {selectedIncident.sahayaTicketNo}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => selectIncidentById(selectedIncident.id, 'INCIDENT_DETAIL')}
                      className="w-full py-2 px-3 brut bg-[#121210] text-white hover:bg-zinc-800 font-display font-extrabold text-xs flex items-center justify-center gap-1.5 btn-press cursor-pointer"
                    >
                      <span>FULL INVESTIGATION DOSSIER</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-[#121210]/60 text-xs font-mono">
                  Select a pothole from the map to inspect.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
