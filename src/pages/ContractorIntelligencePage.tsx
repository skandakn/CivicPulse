import React, { useState } from 'react';
import {
  Building2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Ban,
  Briefcase,
  TrendingDown,
  TrendingUp,
  MapPin,
  Clock,
  FileText,
  Star,
  Calendar,
  Mail,
  Phone,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Contractor } from '../types';
import { formatINR } from '../utils/formatters';

const QualityRing: React.FC<{ score: number }> = ({ score }) => {
  const color =
    score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
  const ringColor =
    score >= 80
      ? 'border-emerald-500/60 shadow-[0_0_16px_rgba(16,185,129,0.3)]'
      : score >= 60
      ? 'border-amber-500/60'
      : 'border-red-500/60 shadow-[0_0_16px_rgba(239,68,68,0.3)]';
  return (
    <div
      className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center flex-shrink-0 ${ringColor}`}
    >
      <span className={`font-mono text-lg font-extrabold ${color}`}>{score}</span>
      <span className="text-[9px] text-slate-500 font-mono">/ 100</span>
    </div>
  );
};

export const ContractorIntelligencePage: React.FC = () => {
  const { contractors, incidents, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContractor, setSelectedContractor] = useState<Contractor>(contractors[0]);

  const filtered = contractors.filter(
    c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Count incidents per contractor
  const incidentsByContractor = (contractorId: string) =>
    incidents.filter(i => i.contractorId === contractorId);

  const handleIssueNotice = (contractor: Contractor) => {
    addToast(
      'Defect Liability Notice Dispatched',
      `Legal notice issued to ${contractor.name} under Karnataka Transparency in Public Procurements Act`,
      'warning',
    );
  };

  const totalPenalties = contractors.reduce((s, c) => s + c.penaltiesLeviedINR, 0);
  const avgQuality = Math.round(contractors.reduce((s, c) => s + c.qualityScore, 0) / contractors.length);
  const blacklisted = contractors.filter(c => c.blacklistedStatus).length;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-xs font-mono text-purple-300 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>CONTRACTOR AUDIT & ACCOUNTABILITY</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Bengaluru Contractor Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Neutral accountability view of road contractors associated with BBMP projects.
            All claims reflect public contract records and AI-measured defect rates — not editorial judgments.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 w-full md:w-72">
          <Search className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search contractor or reg #..."
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
          />
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#090C16] border border-white/10 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Monitored Roads</div>
          <div className="text-2xl font-extrabold text-white font-mono">1,420 km</div>
          <div className="text-[11px] text-cyan-400 font-mono">198 BBMP Wards</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <div className="text-[10px] font-mono text-emerald-300 uppercase">Warranty Savings</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">₹4.85 Cr</div>
          <div className="text-[11px] text-emerald-400/70 font-mono">Zero-cost DLP reworks</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#090C16] border border-white/10 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Penalties Levied</div>
          <div className="text-2xl font-extrabold text-red-400 font-mono">{formatINR(totalPenalties)}</div>
          <div className="text-[11px] text-slate-400 font-mono">Avg quality: {avgQuality}/100</div>
        </div>
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-1">
          <div className="text-[10px] font-mono text-red-300 uppercase">Blacklisted</div>
          <div className="text-2xl font-extrabold text-red-400 font-mono">{blacklisted}</div>
          <div className="text-[11px] text-red-300/70 font-mono">of {contractors.length} contractors</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contractor List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Registered PWD Contractors ({filtered.length})
          </span>

          <div className="space-y-2.5">
            {filtered.map(contractor => {
              const isSelected = selectedContractor.id === contractor.id;
              const contractorIncidents = incidentsByContractor(contractor.id);
              const criticalCount = contractorIncidents.filter(i => i.severity === 'CRITICAL').length;

              return (
                <div
                  key={contractor.id}
                  onClick={() => setSelectedContractor(contractor)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all group
                    ${isSelected
                      ? 'bg-cyan-950/25 border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]'
                      : 'bg-[#090C16] border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <QualityRing score={contractor.qualityScore} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {contractor.name}
                          </h3>
                          {contractor.blacklistedStatus && (
                            <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-0.5 flex-shrink-0">
                              <Ban className="w-2.5 h-2.5" /> BLACKLISTED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {contractor.registrationNumber} • {contractor.classRating}
                        </div>

                        <div className="grid grid-cols-3 gap-x-3 gap-y-1 mt-2 text-[11px] font-mono">
                          <div>
                            <span className="text-slate-500 block text-[9px]">PAVED</span>
                            <span className="text-slate-200">{contractor.totalKmsPaved} km</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px]">DEFECT RATE</span>
                            <span className={contractor.warrantyDefectRate > 15 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                              {contractor.warrantyDefectRate}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px]">OPEN CASES</span>
                            <span className={criticalCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                              {contractor.openIncidents ?? contractorIncidents.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ward tags */}
                  <div className="pt-2 mt-2 border-t border-white/5 flex flex-wrap gap-1">
                    {contractor.activeWards.map((w, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono text-[9px]">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail / Scorecard */}
        <div className="lg:col-span-7 space-y-5">
          {/* Profile header */}
          <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedContractor.name}</h2>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    {selectedContractor.registrationNumber}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] border bg-purple-500/10 text-purple-300 border-purple-500/30">
                      {selectedContractor.classRating}
                    </span>
                    {selectedContractor.blacklistedStatus ? (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                        <Ban className="w-3 h-3" /> BLACKLISTED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ELIGIBLE
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <QualityRing score={selectedContractor.qualityScore} />
            </div>

            {/* Accountability disclaimer */}
            <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-[11px] text-blue-300/80 font-mono flex items-start gap-2">
              <Award className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-400" />
              <span>
                This contractor is <em>associated with this road project</em> per BBMP contract records.
                Metrics reflect measured road conditions, not editorial claims of fault.
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[9px] text-slate-500 uppercase">Projects Done</div>
                <div className="text-xl font-extrabold text-white">{selectedContractor.totalProjectsCompleted ?? '—'}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[9px] text-slate-500 uppercase">Open Incidents</div>
                <div className={`text-xl font-extrabold ${(selectedContractor.openIncidents ?? 0) > 15 ? 'text-red-400' : 'text-amber-400'}`}>
                  {selectedContractor.openIncidents ?? '—'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[9px] text-slate-500 uppercase">Resolved</div>
                <div className="text-xl font-extrabold text-emerald-400">{selectedContractor.resolvedIncidents ?? '—'}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[9px] text-slate-500 uppercase">Avg Resolution</div>
                <div className={`text-xl font-extrabold ${(selectedContractor.avgResolutionTimeDays ?? 0) > 14 ? 'text-red-400' : 'text-slate-200'}`}>
                  {selectedContractor.avgResolutionTimeDays ?? '—'}d
                </div>
              </div>
            </div>

            {/* Quality meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">CivicPulse Paving Quality Index</span>
                <span className={selectedContractor.qualityScore >= 80 ? 'text-emerald-400 font-bold' : selectedContractor.qualityScore >= 60 ? 'text-amber-400 font-bold' : 'text-red-400 font-bold'}>
                  {selectedContractor.qualityScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${selectedContractor.qualityScore >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_#10B981]' : selectedContractor.qualityScore >= 60 ? 'bg-amber-500' : 'bg-red-500 shadow-[0_0_10px_#EF4444]'}`}
                  style={{ width: `${selectedContractor.qualityScore}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Computed from surface roughness post-12-months, water seepage rate, and pothole emergence density (IRC-SP-100).
              </p>
            </div>
          </div>

          {/* Active roads */}
          {selectedContractor.activeRoads && selectedContractor.activeRoads.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#090C16] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Roads Associated with this Contractor</span>
              </div>
              <div className="space-y-1.5">
                {selectedContractor.activeRoads.map((road, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                    <span className="text-slate-300">{road}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Penalties ledger */}
          <div className="p-5 rounded-2xl bg-[#090C16] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Financial Accountability Ledger</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 space-y-1">
                <div className="text-[10px] text-red-400 uppercase">Penalties Levied</div>
                <div className="text-xl font-extrabold text-red-300">
                  {formatINR(selectedContractor.penaltiesLeviedINR)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">Penalties Recovered</div>
                <div className="text-xl font-extrabold text-emerald-400">
                  {formatINR(selectedContractor.penaltiesPaidINR)}
                </div>
              </div>
            </div>

            {selectedContractor.penaltiesLeviedINR > selectedContractor.penaltiesPaidINR && (
              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  Outstanding: <strong>{formatINR(selectedContractor.penaltiesLeviedINR - selectedContractor.penaltiesPaidINR)}</strong> — recovery proceedings may be initiated under KTPP Act.
                </span>
              </div>
            )}
          </div>

          {/* Company info */}
          <div className="p-5 rounded-2xl bg-[#090C16] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Company Profile</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {selectedContractor.directorName && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Director / Principal</div>
                  <div className="text-slate-200">{selectedContractor.directorName}</div>
                </div>
              )}
              {selectedContractor.incorporatedYear && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Incorporated</div>
                  <div className="text-slate-200">{selectedContractor.incorporatedYear}</div>
                </div>
              )}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Active Tenders</div>
                <div className="text-cyan-400 font-bold">{selectedContractor.activeContractsCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Total Paved</div>
                <div className="text-slate-200">{selectedContractor.totalKmsPaved} km</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
              <div className="text-[9px] font-mono text-slate-500 uppercase">Official Communications</div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3 h-3 text-cyan-400" />
                <span>{selectedContractor.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-mono">
                <Phone className="w-3 h-3 text-cyan-400" />
                <span>{selectedContractor.contactPhone}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => handleIssueNotice(selectedContractor)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Issue Defect Liability Notice (DLP Clause 45.2)</span>
            </button>
            <button
              onClick={() =>
                addToast('Audit Dossier Exported', `PDF generated for ${selectedContractor.name}`, 'info')
              }
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Download Comprehensive Audit Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
