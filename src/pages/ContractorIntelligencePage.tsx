import React, { useState } from 'react';
import {
  Building2,
  ShieldAlert,
  Search,
  Ban
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Contractor } from '../types';
import { formatINR } from '../utils/formatters';

export const ContractorIntelligencePage: React.FC = () => {
  const { contractors, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContractor, setSelectedContractor] = useState<Contractor>(contractors[0]);

  const filtered = contractors.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIssueNotice = (contractor: Contractor) => {
    addToast(
      'Defect Liability Notice Dispatched',
      `Legal notice issued to ${contractor.name} under Karnataka Transparency in Public Procurements Act`,
      'warning'
    );
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-xs font-mono text-purple-300 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>CONTRACTOR AUDIT & TENDER REPUTATION</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Bengaluru Contractor Accountability
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Tracking road paving quality, Defect Liability Periods (DLP), and warranty enforcement across BBMP tenders to ensure public funds are never wasted on premature repairs.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 w-full md:w-72">
          <Search className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contractor or reg #..."
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
          />
        </div>
      </div>

      {/* Quick Accountability KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#090C16] border border-white/10">
          <span className="text-xs font-mono text-slate-400">TOTAL MONITORED ROADS</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">1,420 km</div>
          <span className="text-[11px] text-cyan-400 font-mono">198 BBMP Wards</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
          <span className="text-xs font-mono text-emerald-300">WARRANTY SAVINGS</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">₹4.85 Cr</div>
          <span className="text-[11px] text-emerald-400 font-mono">Zero tender cost reworks</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#090C16] border border-white/10">
          <span className="text-xs font-mono text-slate-400">AVG DEFECT RATE</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">11.4%</div>
          <span className="text-[11px] text-slate-400 font-mono">Within 24-month warranty</span>
        </div>

        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30">
          <span className="text-xs font-mono text-red-300">PENALTIES LEVIED</span>
          <div className="text-2xl font-extrabold text-red-400 font-mono mt-1">₹2.36 Cr</div>
          <span className="text-[11px] text-red-300 font-mono">Against repeat defaulters</span>
        </div>
      </div>

      {/* Main Grid: Contractor Table + Selected Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Contractors List */}
        <div className="lg:col-span-7 space-y-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
            Registered Municipal PWD Contractors ({filtered.length})
          </span>

          <div className="space-y-2.5">
            {filtered.map((contractor) => {
              const isSelected = selectedContractor.id === contractor.id;

              return (
                <div
                  key={contractor.id}
                  onClick={() => setSelectedContractor(contractor)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all relative group
                    ${isSelected
                      ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                      : 'bg-[#090C16] border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {contractor.name}
                        </h3>
                        {contractor.blacklistedStatus && (
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                            <Ban className="w-3 h-3" /> BLACKLISTED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {contractor.registrationNumber} • {contractor.classRating}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-500 block">QUALITY SCORE</span>
                      <span className={`text-base font-extrabold ${contractor.qualityScore >= 80 ? 'text-emerald-400' : contractor.qualityScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {contractor.qualityScore}/100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-white/5 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">PAVED LENGTH</span>
                      <span className="text-slate-200 font-semibold">{contractor.totalKmsPaved} km</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">DEFECT RATE</span>
                      <span className={`font-semibold ${contractor.warrantyDefectRate > 15 ? 'text-red-400' : 'text-slate-200'}`}>
                        {contractor.warrantyDefectRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">ACTIVE TENDERS</span>
                      <span className="text-cyan-400 font-semibold">{contractor.activeContractsCount} contracts</span>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 flex flex-wrap gap-1">
                    <span className="text-slate-500">Key Wards:</span>
                    {contractor.activeWards.map((w, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-mono text-[10px]">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 cols: Deep Scorecard & Enforcement Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Contractor Diagnostic Dossier
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                {selectedContractor.classRating}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">{selectedContractor.name}</h2>
              <div className="text-xs font-mono text-slate-400 mt-1">
                Registry ID: {selectedContractor.registrationNumber}
              </div>
            </div>

            {/* Quality Score Meter */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">CivicPulse Paving Quality Index:</span>
                <span className={`font-bold ${selectedContractor.qualityScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedContractor.qualityScore} / 100
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${selectedContractor.qualityScore >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_#10B981]' : selectedContractor.qualityScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${selectedContractor.qualityScore}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Computed from surface roughness post-12-months, water seepage rate, and pothole emergence density.
              </p>
            </div>

            {/* Penalties Ledger */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30">
                <span className="text-[10px] text-red-400 block">PENALTIES LEVIED</span>
                <span className="text-base font-extrabold text-red-300">
                  {formatINR(selectedContractor.penaltiesLeviedINR)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-500 block">PENALTIES RECOVERED</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {formatINR(selectedContractor.penaltiesPaidINR)}
                </span>
              </div>
            </div>

            {/* Contact Coordinates */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-xs">
              <div className="text-[10px] font-mono text-slate-500 uppercase">OFFICIAL COMMUNICATIONS</div>
              <div className="text-slate-300">{selectedContractor.contactEmail}</div>
              <div className="text-slate-400 font-mono">{selectedContractor.contactPhone}</div>
            </div>

            {/* Legal Notice Action Button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleIssueNotice(selectedContractor)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Issue Defect Liability Notice (DLP Clause 45)</span>
              </button>

              <button
                onClick={() => {
                  addToast('Full Audit Dossier Exported', `Generated PDF for ${selectedContractor.name}`, 'info');
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Download Comprehensive Audit Dossier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
