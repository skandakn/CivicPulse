import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  MapPin,
  Building2,
  FileText,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    incidents,
    roads,
    contractors,
    complaints,
    selectIncidentById,
    setCurrentView
  } = useApp();

  const [term, setTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const closeModal = () => {
    setTerm('');
    setIsSearchOpen(false);
  };

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = term.toLowerCase().trim();

  const matchedIncidents = q ? incidents.filter(i =>
    i.code.toLowerCase().includes(q) ||
    i.roadName.toLowerCase().includes(q) ||
    i.wardName.toLowerCase().includes(q) ||
    i.landmark.toLowerCase().includes(q) ||
    i.sahayaTicketNo.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedRoads = q ? roads.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.code.toLowerCase().includes(q) ||
    r.criticalFacilitiesNearby.some(f => f.toLowerCase().includes(q))
  ).slice(0, 3) : [];

  const matchedContractors = q ? contractors.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.registrationNumber.toLowerCase().includes(q) ||
    c.activeWards.some(w => w.toLowerCase().includes(q))
  ).slice(0, 3) : [];

  const matchedComplaints = q ? complaints.filter(c =>
    c.sahayaTicketNo.toLowerCase().includes(q) ||
    c.citizenName.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const hasResults = matchedIncidents.length > 0 || matchedRoads.length > 0 || matchedContractors.length > 0 || matchedComplaints.length > 0;

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div
        className="w-full max-w-2xl bg-[#0C101A] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-[#090C14]">
          <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search Bengaluru potholes, roads, BBMP Sahaya tickets, contractors..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          {term && (
            <button
              onClick={() => setTerm('')}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeModal}
            className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-white bg-white/5 rounded border border-white/10"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!term && (
            <div className="py-8 text-center text-slate-500 text-xs">
              <p className="font-mono text-cyan-400 mb-2">QUICK SUGGESTIONS</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                {['Outer Ring Road', 'Silk Board', 'Star Infratech', 'Ward 150', 'BLR-POT-2026-0842', 'BBMP-SHY-2026'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setTerm(tag)}
                    className="px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/5 text-xs transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {term && !hasResults && (
            <div className="py-10 text-center text-slate-400 text-xs font-mono">
              No matching intelligence entities found for "{term}". Try searching by road name or ward number.
            </div>
          )}

          {/* Matched Incidents */}
          {matchedIncidents.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
                Pothole Incidents ({matchedIncidents.length})
              </div>
              <div className="space-y-1.5">
                {matchedIncidents.map(inc => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      selectIncidentById(inc.id, 'INCIDENT_DETAIL');
                      closeModal();
                    }}
                    className="p-2.5 rounded-lg bg-white/[0.03] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-100">{inc.code}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {inc.severity} • {inc.priorityDetails.overallScore}/100
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">{inc.roadName}</div>
                      <div className="text-[11px] text-slate-500">{inc.landmark} • Ward {inc.wardNumber} ({inc.wardName})</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Roads */}
          {matchedRoads.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Bengaluru Road Corridors ({matchedRoads.length})
              </div>
              <div className="space-y-1.5">
                {matchedRoads.map(road => (
                  <div
                    key={road.id}
                    onClick={() => {
                      setCurrentView('GODS_EYE');
                      closeModal();
                    }}
                    className="p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{road.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {road.category} • {road.lengthKm} km • Active Potholes: {road.activePotholesCount}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      View on Map
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Contractors */}
          {matchedContractors.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Contractors & Tender Intelligence ({matchedContractors.length})
              </div>
              <div className="space-y-1.5">
                {matchedContractors.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setCurrentView('CONTRACTORS');
                      closeModal();
                    }}
                    className="p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{c.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.registrationNumber} • Quality Score: {c.qualityScore}/100 • Defect Rate: {c.warrantyDefectRate}%
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                      Scorecard
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Complaints */}
          {matchedComplaints.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                BBMP Sahaya Grievances ({matchedComplaints.length})
              </div>
              <div className="space-y-1.5">
                {matchedComplaints.map(cmp => (
                  <div
                    key={cmp.id}
                    onClick={() => {
                      setCurrentView('COMPLAINTS');
                      closeModal();
                    }}
                    className="p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-amber-300">{cmp.sahayaTicketNo}</div>
                      <div className="text-[11px] text-slate-400">
                        Citizen: {cmp.citizenName} • Status: {cmp.status} • Upvotes: {cmp.upvotes}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                      Track SLA
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#080A10] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Search indexed across 198 BBMP Wards & Realtime AI Feeds</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
