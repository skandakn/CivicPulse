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
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#121210]/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        className="w-full max-w-2xl bg-white brut shadow-[8px_8px_0_#121210] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b-2 border-[#121210] bg-[#CFE8D6]">
          <Search className="w-5 h-5 text-[#121210] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search vendor, PO#, requester, ward, or contractor..."
            className="flex-1 bg-transparent text-sm font-mono font-bold text-[#121210] placeholder-[#4A4A46] outline-none"
          />
          {term && (
            <button
              onClick={() => setTerm('')}
              className="p-1 text-[#121210] hover:bg-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeModal}
            className="px-2 py-1 text-[11px] font-mono font-bold text-[#121210] bg-white border border-[#121210] cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-left">
          {!term && (
            <div className="py-8 text-center text-xs">
              <p className="font-mono font-bold text-[#121210] mb-2 uppercase">INDEXED QUICK SUGGESTIONS</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                {['Outer Ring Road', 'Silk Board', 'Star Infratech', 'Ward 150', 'BLR-POT-2026-0842', 'BBMP-SHY-2026'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setTerm(tag)}
                    className="tag bg-[#CFE8D6] text-[#121210] hover:bg-[#121210] hover:text-[#CFE8D6] font-mono text-xs cursor-pointer transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {term && !hasResults && (
            <div className="py-10 text-center text-[#4A4A46] text-xs font-mono">
              No matching intelligence entities found for "{term}". Try searching by road name or ward number.
            </div>
          )}

          {/* Matched Incidents */}
          {matchedIncidents.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#121210] mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#C03A3A]" />
                Pothole Hazard Queue ({matchedIncidents.length})
              </div>
              <div className="space-y-1.5">
                {matchedIncidents.map(inc => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      selectIncidentById(inc.id, 'INCIDENT_DETAIL');
                      closeModal();
                    }}
                    className="p-3 bg-white hover:bg-[#CFE8D6] border-2 border-[#121210] flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#121210]">{inc.code}</span>
                        <span className={`tag font-mono text-[10px] font-bold ${inc.severity === 'CRITICAL' ? 'bg-[#C03A3A] text-white' : 'bg-[#E8A030] text-[#121210]'}`}>
                          {inc.severity} · {inc.priorityDetails.overallScore}/100
                        </span>
                      </div>
                      <div className="font-display text-xs font-bold text-[#121210] mt-0.5">{inc.roadName}</div>
                      <div className="text-[11px] text-[#4A4A46] font-mono">{inc.landmark} · Ward {inc.wardNumber} ({inc.wardName})</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#121210] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Roads */}
          {matchedRoads.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#121210] mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2E8C42]" />
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
                    className="p-3 bg-white hover:bg-[#CFE8D6] border-2 border-[#121210] flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="font-display text-xs font-bold text-[#121210]">{road.name}</div>
                      <div className="text-[11px] text-[#4A4A46] font-mono">
                        {road.category} · {road.lengthKm} km · Active Potholes: {road.activePotholesCount}
                      </div>
                    </div>
                    <span className="tag bg-[#121210] text-[#CFE8D6] font-mono text-[10px] font-bold">
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
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#121210] mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#E8A030]" />
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
                    className="p-3 bg-white hover:bg-[#CFE8D6] border-2 border-[#121210] flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="font-display text-xs font-bold text-[#121210]">{c.name}</div>
                      <div className="text-[11px] text-[#4A4A46] font-mono">
                        {c.registrationNumber} · Quality: {c.qualityScore}/100 · Defect Rate: {c.warrantyDefectRate}%
                      </div>
                    </div>
                    <span className="tag bg-[#2E8C42] text-white font-mono text-[10px] font-bold">
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
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#121210] mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#2E8C42]" />
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
                    className="p-3 bg-white hover:bg-[#CFE8D6] border-2 border-[#121210] flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-[#121210]">{cmp.sahayaTicketNo}</div>
                      <div className="text-[11px] text-[#4A4A46] font-mono">
                        Citizen: {cmp.citizenName} · Status: {cmp.status} · Upvotes: {cmp.upvotes}
                      </div>
                    </div>
                    <span className="tag bg-[#E8A030] text-[#121210] font-mono text-[10px] font-bold">
                      Track SLA
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#CFE8D6]/40 border-t-2 border-[#121210] flex items-center justify-between text-[11px] text-[#4A4A46] font-mono">
          <span>Search indexed across 198 BBMP Wards & Realtime Ledger</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
