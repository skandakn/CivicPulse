import React, { useState } from 'react';
import {
  Building2,
  ShieldAlert,
  AlertTriangle,
  Ban,
  FileText,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Contractor } from '../types';
import { formatINR } from '../utils/formatters';

const QualityBadge: React.FC<{ score: number }> = ({ score }) => {
  const bg = score >= 80 ? 'bg-[#2E8C42] text-white' : score >= 60 ? 'bg-[#E8A030] text-[#121210]' : 'bg-[#C03A3A] text-white';
  return (
    <div className={`w-14 h-14 border-2 border-[#121210] flex flex-col items-center justify-center shrink-0 ${bg}`}>
      <span className="font-mono text-base font-extrabold">{score}</span>
      <span className="text-[8px] font-mono uppercase font-bold">/ 100</span>
    </div>
  );
};

export const ContractorIntelligencePage: React.FC = () => {
  const { contractors, incidents, addToast } = useApp();
  const [selectedContractor, setSelectedContractor] = useState<Contractor>(contractors[0]);

  const filtered = contractors;

  const incidentsByContractor = (contractorId: string) =>
    incidents.filter(i => i.contractorId === contractorId);

  const handleIssueNotice = (contractor: Contractor) => {
    addToast(
      'Defect Liability Notice Dispatched',
      `Legal notice issued to ${contractor.name} under Karnataka Transparency in Public Procurements Act (Clause 45.2)`,
      'warning',
    );
  };

  const totalPenalties = contractors.reduce((s, c) => s + c.penaltiesLeviedINR, 0);
  const avgQuality = Math.round(contractors.reduce((s, c) => s + c.qualityScore, 0) / contractors.length);
  const blacklisted = contractors.filter(c => c.blacklistedStatus).length;

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto text-left">
      {/* Header matching Approva */}
      <div className="brut-lg bg-white p-6 sm:p-8">
        <div className="border-b-[3px] border-[#121210] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="tag bg-[#2E8C42] text-white">
                <Building2 className="w-3.5 h-3.5 stroke-[3]" />
                CONTRACTOR DLP AUDIT LEDGER
              </span>
              <span className="tag bg-[#CFE8D6] text-[#121210]">
                KARNATAKA PWD TRANSPARENCY
              </span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-[#121210] tracking-tight">
              Contractor Compliance & Warranty Intelligence
            </h1>
            <p className="text-sm font-body text-[#121210]/70 mt-1 max-w-3xl">
              Objective accountability ledger of road contractors associated with BBMP tenders. Reflects public contract records and measured defect rates under Karnataka PWD Defect Liability Period (Clause 45.2).
            </p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="brut bg-[#CFE8D6]/40 p-3">
            <div className="text-[10px] font-mono font-bold text-[#121210]/60 uppercase">MONITORED ROADS</div>
            <div className="text-2xl font-extrabold text-[#121210] font-mono mt-0.5">1,420 km</div>
            <div className="text-[10px] text-[#121210]/70 font-mono font-bold">198 BBMP WARDS</div>
          </div>

          <div className="brut bg-[#2E8C42] text-white p-3">
            <div className="text-[10px] font-mono font-bold text-white/80 uppercase">WARRANTY SAVINGS</div>
            <div className="text-2xl font-extrabold font-mono mt-0.5">₹4.85 Cr</div>
            <div className="text-[10px] text-white/80 font-mono font-bold">ZERO-COST DLP REWORKS</div>
          </div>

          <div className="brut bg-white p-3">
            <div className="text-[10px] font-mono font-bold text-[#121210]/60 uppercase">PENALTIES LEVIED</div>
            <div className="text-2xl font-extrabold text-[#C03A3A] font-mono mt-0.5">{formatINR(totalPenalties)}</div>
            <div className="text-[10px] text-[#121210]/70 font-mono font-bold">AVG SCORE: {avgQuality}/100</div>
          </div>

          <div className="brut bg-[#C03A3A] text-white p-3">
            <div className="text-[10px] font-mono font-bold text-white/80 uppercase">BLACKLISTED FIRMS</div>
            <div className="text-2xl font-extrabold font-mono mt-0.5">{blacklisted}</div>
            <div className="text-[10px] text-white/80 font-mono font-bold">OF {contractors.length} MONITORED</div>
          </div>
        </div>
      </div>

      {/* Main Grid matching Approva */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contractor List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[10px] font-mono font-bold text-[#121210]/60 uppercase tracking-wider block">
            REGISTERED PWD CONTRACTORS ({filtered.length})
          </span>

          <div className="space-y-3">
            {filtered.map(contractor => {
              const isSelected = selectedContractor.id === contractor.id;
              const contractorIncidents = incidentsByContractor(contractor.id);
              const criticalCount = contractorIncidents.filter(i => i.severity === 'CRITICAL').length;

              return (
                <div
                  key={contractor.id}
                  onClick={() => setSelectedContractor(contractor)}
                  className={`brut-card p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-3 ring-[#121210] bg-[#CFE8D6]/30'
                      : 'bg-white hover:bg-[#F3FAF5]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <QualityBadge score={contractor.qualityScore} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <h3 className="font-display font-extrabold text-sm text-[#121210] truncate">
                            {contractor.name}
                          </h3>
                          {contractor.blacklistedStatus && (
                            <span className="tag bg-[#C03A3A] text-white py-0.2 px-1 text-[9px]">
                              <Ban className="w-2.5 h-2.5" /> BLACKLISTED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#121210]/70 font-mono">
                          {contractor.registrationNumber} · {contractor.classRating}
                        </div>

                        <div className="grid grid-cols-3 gap-x-2 gap-y-1 mt-2 text-xs font-mono">
                          <div>
                            <span className="text-[#121210]/60 block text-[9px] font-bold">PAVED</span>
                            <span className="font-bold text-[#121210]">{contractor.totalKmsPaved} km</span>
                          </div>
                          <div>
                            <span className="text-[#121210]/60 block text-[9px] font-bold">DEFECT RATE</span>
                            <span className={`font-bold ${contractor.warrantyDefectRate > 15 ? 'text-[#C03A3A]' : 'text-[#121210]'}`}>
                              {contractor.warrantyDefectRate}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[#121210]/60 block text-[9px] font-bold">OPEN CASES</span>
                            <span className={`font-bold ${criticalCount > 0 ? 'text-[#C03A3A]' : 'text-[#121210]'}`}>
                              {contractor.openIncidents ?? contractorIncidents.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ward tags */}
                  <div className="pt-2 mt-2 border-t-2 border-[#121210]/15 flex flex-wrap gap-1">
                    {contractor.activeWards.map((w, i) => (
                      <span key={i} className="px-1.5 py-0.5 border border-[#121210] bg-white text-[#121210] font-mono text-[9px] font-bold">
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
        <div className="lg:col-span-7 space-y-4">
          {/* Profile header */}
          <div className="brut bg-white p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-[#121210]">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 border-2 border-[#121210] bg-[#CFE8D6] flex items-center justify-center shrink-0">
                  <Building2 className="w-7 h-7 text-[#121210]" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-extrabold text-[#121210]">{selectedContractor.name}</h2>
                  <div className="text-xs font-mono font-bold text-[#121210]/70 mt-0.5">
                    REG: {selectedContractor.registrationNumber}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="tag bg-[#CFE8D6] text-[#121210]">
                      {selectedContractor.classRating}
                    </span>
                    {selectedContractor.blacklistedStatus ? (
                      <span className="tag bg-[#C03A3A] text-white">
                        <Ban className="w-3 h-3" /> BLACKLISTED
                      </span>
                    ) : (
                      <span className="tag bg-[#2E8C42] text-white">
                        ELIGIBLE BIDDER
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <QualityBadge score={selectedContractor.qualityScore} />
            </div>

            {/* Accountability disclaimer */}
            <div className="p-3 border-2 border-[#121210] bg-[#CFE8D6]/40 text-xs font-mono text-[#121210] flex items-start gap-2">
              <Award className="w-4 h-4 shrink-0 mt-0.5 text-[#121210]" />
              <span>
                Contractor recorded under Karnataka PWD project records. Metrics reflect measured road roughness and defect density.
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 border-2 border-[#121210] bg-white">
                <div className="text-[9px] text-[#121210]/60 uppercase font-bold">PROJECTS DONE</div>
                <div className="text-xl font-extrabold text-[#121210]">{selectedContractor.totalProjectsCompleted ?? '28'}</div>
              </div>
              <div className="p-2.5 border-2 border-[#121210] bg-white">
                <div className="text-[9px] text-[#121210]/60 uppercase font-bold">OPEN DEFECTS</div>
                <div className={`text-xl font-extrabold ${(selectedContractor.openIncidents ?? 0) > 15 ? 'text-[#C03A3A]' : 'text-[#E8A030]'}`}>
                  {selectedContractor.openIncidents ?? '14'}
                </div>
              </div>
              <div className="p-2.5 border-2 border-[#121210] bg-white">
                <div className="text-[9px] text-[#121210]/60 uppercase font-bold">RESOLVED</div>
                <div className="text-xl font-extrabold text-[#2E8C42]">{selectedContractor.resolvedIncidents ?? '42'}</div>
              </div>
              <div className="p-2.5 border-2 border-[#121210] bg-white">
                <div className="text-[9px] text-[#121210]/60 uppercase font-bold">AVG RESOLUTION</div>
                <div className="text-xl font-extrabold text-[#121210]">{selectedContractor.avgResolutionTimeDays ?? '9'}d</div>
              </div>
            </div>

            {/* Quality meter */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span>CivicPulse Paving Quality Index</span>
                <span className={selectedContractor.qualityScore >= 80 ? 'text-[#2E8C42]' : 'text-[#C03A3A]'}>
                  {selectedContractor.qualityScore} / 100
                </span>
              </div>
              <div className="w-full bg-white border-2 border-[#121210] h-3 overflow-hidden flex">
                <div
                  className={`h-full ${selectedContractor.qualityScore >= 80 ? 'bg-[#2E8C42]' : selectedContractor.qualityScore >= 60 ? 'bg-[#E8A030]' : 'bg-[#C03A3A]'}`}
                  style={{ width: `${selectedContractor.qualityScore}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-[#121210]/70">
                Computed from surface roughness post-12-months, water seepage rate, and pothole emergence density (IRC-SP-100).
              </p>
            </div>
          </div>

          {/* Penalties ledger */}
          <div className="brut bg-white p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#121210] uppercase border-b-2 border-[#121210] pb-2">
              <FileText className="w-4 h-4 text-[#121210]" />
              <span>Financial Accountability Ledger</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 border-2 border-[#121210] bg-[#C03A3A] text-white">
                <div className="text-[10px] uppercase font-bold text-white/80">PENALTIES LEVIED</div>
                <div className="text-xl font-extrabold">
                  {formatINR(selectedContractor.penaltiesLeviedINR)}
                </div>
              </div>
              <div className="p-3 border-2 border-[#121210] bg-[#2E8C42] text-white">
                <div className="text-[10px] uppercase font-bold text-white/80">PENALTIES RECOVERED</div>
                <div className="text-xl font-extrabold">
                  {formatINR(selectedContractor.penaltiesPaidINR)}
                </div>
              </div>
            </div>

            {selectedContractor.penaltiesLeviedINR > selectedContractor.penaltiesPaidINR && (
              <div className="p-2.5 border-2 border-[#121210] bg-[#F4D89A] text-xs font-mono text-[#121210] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#121210]" />
                <span>
                  Outstanding: <strong>{formatINR(selectedContractor.penaltiesLeviedINR - selectedContractor.penaltiesPaidINR)}</strong> — recovery proceedings may be initiated under KTPP Act.
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleIssueNotice(selectedContractor)}
              className="w-full py-3.5 brut bg-[#C03A3A] text-white hover:bg-[#a62e2e] font-display font-extrabold text-sm flex items-center justify-center gap-2 btn-press cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>ISSUE DEFECT LIABILITY NOTICE (DLP CLAUSE 45.2)</span>
            </button>
            <button
              onClick={() =>
                addToast('Audit Dossier Exported', `PDF generated for ${selectedContractor.name}`, 'info')
              }
              className="w-full py-2.5 brut bg-white text-[#121210] hover:bg-zinc-100 font-display font-extrabold text-xs btn-press cursor-pointer"
            >
              DOWNLOAD COMPREHENSIVE CONTRACTOR AUDIT DOSSIER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
