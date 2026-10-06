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
    <div className="space-y-6 pb-16 text-left max-w-[1200px] mx-auto">
      {/* Top Metrics Row in Steep Style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-[20px] bg-white border border-[#17191c]/8 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#979799] uppercase">Active Potholes</span>
            <div className="w-2 h-2 rounded-full bg-[#17191c]" />
          </div>
          <div className="text-2xl font-medium text-[#17191c] font-mono mt-2">
            {CITY_METRICS.activePotholes.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#777b86] mt-1 font-mono">
            +{activeCount} live in feed
          </div>
        </div>

        <div className="rounded-[20px] bg-[#fbe1d1] border border-[#5d2a1a]/15 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#5d2a1a]/70 uppercase font-semibold">Critical Hazards</span>
            <Flame className="w-3.5 h-3.5 text-[#5d2a1a]" />
          </div>
          <div className="text-2xl font-medium text-[#5d2a1a] font-mono mt-2">
            {CITY_METRICS.criticalIssues}
          </div>
          <div className="text-[11px] text-[#5d2a1a]/85 mt-1 font-mono">
            {criticalCount} in current queue
          </div>
        </div>

        <div className="rounded-[20px] bg-white border border-[#17191c]/8 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#979799] uppercase">Reports Today</span>
            <Clock className="w-3.5 h-3.5 text-[#777b86]" />
          </div>
          <div className="text-2xl font-medium text-[#17191c] font-mono mt-2">
            {CITY_METRICS.reportsToday}
          </div>
          <div className="text-[11px] text-[#777b86] mt-1 font-mono">
            4.2 / hr intake rate
          </div>
        </div>

        <div className="rounded-[20px] bg-[#f2f2f3] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#979799] uppercase">Resolved (Month)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#17191c]" />
          </div>
          <div className="text-2xl font-medium text-[#17191c] font-mono mt-2">
            {CITY_METRICS.resolvedThisMonth.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#777b86] mt-1 font-mono">
            MTTR: 42.5 hours
          </div>
        </div>

        <div className="rounded-[20px] bg-white border border-[#17191c]/8 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#979799] uppercase">AI Verified</span>
            <Zap className="w-3.5 h-3.5 text-[#17191c]" />
          </div>
          <div className="text-2xl font-medium text-[#17191c] font-mono mt-2">
            {CITY_METRICS.aiVerifiedRepairs.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#777b86] mt-1 font-mono">
            95.1% first audit pass
          </div>
        </div>
      </div>

      {/* Filter and Control Bar with Pill Geometry */}
      <div className="rounded-[20px] bg-white border border-[#17191c]/8 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#777b86] mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-mono uppercase text-[11px]">Severity:</span>
          </div>

          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                severityFilter === sev
                  ? sev === 'CRITICAL'
                    ? 'bg-[#fbe1d1] text-[#5d2a1a] font-medium'
                    : 'bg-[#17191c] text-white font-medium'
                  : 'bg-[#f2f2f3] text-[#17191c] hover:bg-[#e8e8ea]'
              }`}
            >
              {sev === 'ALL' ? 'All Severities' : sev}
            </button>
          ))}

          <button
            onClick={() => setWarrantyFilterOnly(!warrantyFilterOnly)}
            className={`ml-2 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              warrantyFilterOnly
                ? 'bg-[#17191c] text-white font-medium'
                : 'bg-[#f2f2f3] text-[#17191c] hover:bg-[#e8e8ea]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Contractor Warranty Only ({underWarrantyCount})</span>
          </button>
        </div>

        <div className="text-xs text-[#777b86] font-mono flex items-center gap-2">
          <span>{displayedIncidents.length} of {filteredIncidents.length} Hotspots</span>
          <button
            onClick={() => {
              setSeverityFilter('ALL');
              setWarrantyFilterOnly(false);
              addToast('Filters Reset', 'Displaying all Bengaluru road incidents', 'info');
            }}
            className="p-1.5 rounded-full hover:bg-[#f2f2f3] text-[#777b86] hover:text-[#17191c] transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Command Center Layout: Map + Side Priority Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[660px]">
        {/* Center: Large Bengaluru Map */}
        <div className="lg:col-span-8 flex flex-col rounded-[24px] bg-white border border-[#17191c]/8 overflow-hidden relative shadow-sm">
          {/* Map Top Bar with 5 Modes */}
          <div className="p-4 bg-[#fafafb] border-b border-[#17191c]/8 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#777b86]" />
              <span className="font-serif text-base font-normal text-[#17191c]">
                Bengaluru Geospatial <em className="italic">Radar</em>
              </span>
            </div>

            {/* 5 Map Mode Switcher Pills */}
            <div className="flex flex-wrap gap-1 text-xs">
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
                    addToast('Map Layer Switched', `${m.label} active`, 'info');
                  }}
                  className={`px-3 py-1 rounded-full font-mono text-xs cursor-pointer transition-colors ${
                    mapMode === m.id
                      ? 'bg-[#17191c] text-white font-medium'
                      : 'bg-white text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] border border-[#17191c]/8'
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
            <div className="absolute top-4 left-4 z-10 pointer-events-none p-3 rounded-[16px] border border-[#17191c]/8 bg-white/95 backdrop-blur-sm text-[11px] font-mono text-[#17191c] shadow-sm">
              <div className="text-[#979799]">BBMP GIS Grid: 12.9716° N / 77.5946° E</div>
              <div className="text-[#17191c] font-medium mt-0.5">198 Wards Active Telemetry</div>
            </div>
          </div>
        </div>

        {/* Right Side Panel: AI Priority Queue & Incident Peek */}
        <div className="lg:col-span-4 flex flex-col rounded-[24px] bg-[#fafafb] border border-[#17191c]/8 overflow-hidden shadow-sm">
          {/* Panel Header & Tabs */}
          <div className="p-4 border-b border-[#17191c]/8 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#777b86]" />
              <span className="font-serif text-base font-normal text-[#17191c]">
                Radar Stream
              </span>
            </div>

            <div className="flex gap-1.5 text-xs font-mono">
              <button
                onClick={() => setActiveTab('QUEUE')}
                className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                  activeTab === 'QUEUE' ? 'bg-[#17191c] text-white font-medium' : 'bg-[#f2f2f3] text-[#777b86] hover:text-[#17191c]'
                }`}
              >
                Queue ({sortedQueue.length})
              </button>
              <button
                onClick={() => setActiveTab('DETAILS')}
                className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                  activeTab === 'DETAILS' ? 'bg-[#17191c] text-white font-medium' : 'bg-[#f2f2f3] text-[#777b86] hover:text-[#17191c]'
                }`}
              >
                Inspect
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[620px]">
            {activeTab === 'QUEUE' ? (
              sortedQueue.length === 0 ? (
                <div className="py-12 text-center text-[#777b86] text-xs font-mono">
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
                      className={`p-4 rounded-[16px] text-xs cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[#ffffff] border-[#17191c] shadow-md ring-1 ring-[#17191c]'
                          : 'bg-white border-[#17191c]/8 hover:border-[#17191c]/20 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#f2f2f3] flex items-center justify-center font-mono text-[10px] text-[#17191c] font-medium">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-[#777b86] text-[11px]">{incident.code}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                            incident.severity === 'CRITICAL' ? 'bg-[#fbe1d1] text-[#5d2a1a]' : 'bg-[#f2f2f3] text-[#17191c]'
                          }`}>
                            {incident.severity}
                          </span>
                          <span className="font-mono font-medium bg-[#17191c] text-white px-2 py-0.5 rounded-full text-[10px]">
                            {incident.priorityDetails.overallScore}
                          </span>
                        </div>
                      </div>

                      <div className="font-serif text-sm font-normal text-[#17191c] truncate">
                        {incident.roadName}
                      </div>

                      <div className="text-[11px] text-[#777b86] truncate mt-0.5">
                        {incident.landmark}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#17191c]/5 text-[11px] font-mono text-[#777b86]">
                        <span>Depth: <strong className="text-[#17191c]">{incident.depthCm}cm</strong></span>
                        <span>Ward {incident.wardNumber}</span>
                        {incident.isUnderWarranty ? (
                          <span className="text-[#5d2a1a] font-medium">DLP Warranty</span>
                        ) : (
                          <span>PWD General</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              selectedIncident ? (
                <div className="space-y-4 bg-white p-5 rounded-[20px] border border-[#17191c]/8 shadow-sm">
                  <div className="overflow-hidden rounded-[16px] relative h-44">
                    <img
                      src={selectedIncident.images.original}
                      alt={selectedIncident.roadName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 justify-between">
                      <span className="text-xs font-mono text-white bg-[#17191c]/90 px-2.5 py-1 rounded-full">
                        {selectedIncident.code}
                      </span>
                      <span className="text-xs font-mono font-medium bg-[#fbe1d1] text-[#5d2a1a] px-2.5 py-1 rounded-full">
                        Score: {selectedIncident.priorityDetails.overallScore}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-normal text-[#17191c]">{selectedIncident.roadName}</h3>
                    <p className="text-xs text-[#777b86] mt-0.5">{selectedIncident.landmark}</p>
                    <div className="text-[11px] text-[#979799] font-mono mt-1">
                      Ward {selectedIncident.wardNumber}: {selectedIncident.wardName} ({selectedIncident.zone} Zone)
                    </div>
                  </div>

                  {/* Physical Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-[#fafafb] p-3 rounded-[16px] font-mono text-center text-xs border border-[#17191c]/5">
                    <div>
                      <span className="text-[10px] text-[#979799] block uppercase">Depth</span>
                      <span className="font-medium text-[#17191c] mt-0.5 block">{selectedIncident.depthCm} cm</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#979799] block uppercase">Surface</span>
                      <span className="font-medium text-[#17191c] mt-0.5 block">{selectedIncident.surfaceAreaSqM} m²</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#979799] block uppercase">Volume</span>
                      <span className="font-medium text-[#17191c] mt-0.5 block">{selectedIncident.estimatedVolumeLiters} L</span>
                    </div>
                  </div>

                  {/* Contractor Accountability */}
                  <div className="p-3.5 rounded-[16px] bg-[#fafafb] space-y-1 text-xs border border-[#17191c]/5">
                    <div className="text-[10px] font-mono text-[#979799] uppercase flex items-center justify-between">
                      <span>Responsible Entity</span>
                      <span className="text-[#5d2a1a] font-medium">
                        {selectedIncident.isUnderWarranty ? 'DLP Warranty (24mo)' : 'Public Tender'}
                      </span>
                    </div>
                    <div className="font-medium text-[#17191c] pt-0.5">{selectedIncident.contractorName}</div>
                    <div className="text-[11px] font-mono text-[#777b86]">
                      Sahaya Ticket: #{selectedIncident.sahayaTicketNo}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => selectIncidentById(selectedIncident.id, 'INCIDENT_DETAIL')}
                      className="w-full py-3 px-4 rounded-full bg-[#17191c] text-white hover:bg-black text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Full Investigation Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-[#777b86] text-xs font-mono">
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

