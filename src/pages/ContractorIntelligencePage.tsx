import React, { useState } from 'react';
import {
  Building2,
  ShieldAlert,
  AlertTriangle,
  Search,
  Ban,
  FileText,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Contractor } from '../types';
import { formatINR } from '../utils/formatters';

const QualityBadge: React.FC<{ score: number }> = ({ score }) => {
  const isHigh = score >= 80;
  const isMid = score >= 60;
  return (
    <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center shrink-0 border ${
      isHigh ? 'bg-[#f2f2f3] border-[#17191c]/15 text-[#17191c]' :
      isMid ? 'bg-[#fbe1d1] border-[#5d2a1a]/20 text-[#5d2a1a]' :
      'bg-[#fbe1d1] border-[#5d2a1a]/30 text-[#5d2a1a]'
    }`}>
      <span className="font-mono text-sm font-medium">{score}</span>
      <span className="text-[8px] font-mono uppercase text-[#777b86]">/ 100</span>
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
    <div className="space-y-6 pb-20 max-w-[1200px] mx-auto text-left">
      {/* Header in Steep Style */}
      <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[#17191c]/8 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-mono text-[#17191c] bg-[#f2f2f3] px-3 py-1 rounded-full">
                Contractor DLP Audit Ledger
              </span>
              <span className="text-[11px] font-mono text-[#5d2a1a] bg-[#fbe1d1] px-3 py-1 rounded-full">
                Karnataka PWD Transparency
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#17191c] tracking-[-0.015em]">
              Contractor Compliance & <em className="italic">Warranty Intelligence</em>
            </h1>
            <p className="text-xs sm:text-sm text-[#777b86] mt-1.5 max-w-2xl leading-relaxed">
              Objective accountability ledger of road contractors associated with BBMP tenders. Cross-referenced against statutory Defect Liability Period obligations (Clause 45.2).
            </p>
          </div>

          <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-full flex items-center gap-2.5 px-4 py-2 w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-[#777b86] shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search contractor, reg #…"
              className="bg-transparent text-xs text-[#17191c] placeholder-[#a3a6af] outline-none w-full"
            />
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
          <div className="rounded-[20px] bg-[#fafafb] p-4 border border-[#17191c]/5">
            <div className="text-[10px] font-mono text-[#979799] uppercase">Monitored Roads</div>
            <div className="text-2xl font-medium text-[#17191c] font-mono mt-1">1,420 km</div>
            <div className="text-[11px] text-[#777b86] mt-0.5 font-mono">198 BBMP Wards</div>
          </div>

          <div className="rounded-[20px] bg-[#fbe1d1] p-4 border border-[#5d2a1a]/15">
            <div className="text-[10px] font-mono text-[#5d2a1a]/70 uppercase font-semibold">Warranty Savings</div>
            <div className="text-2xl font-medium text-[#5d2a1a] font-mono mt-1">₹4.85 Cr</div>
            <div className="text-[11px] text-[#5d2a1a]/85 mt-0.5 font-mono">Zero-Cost DLP Reworks</div>
          </div>

          <div className="rounded-[20px] bg-[#fafafb] p-4 border border-[#17191c]/5">
            <div className="text-[10px] font-mono text-[#979799] uppercase">Penalties Levied</div>
            <div className="text-2xl font-medium text-[#17191c] font-mono mt-1">{formatINR(totalPenalties)}</div>
            <div className="text-[11px] text-[#777b86] mt-0.5 font-mono">Avg Score: {avgQuality}/100</div>
          </div>

          <div className="rounded-[20px] bg-[#f2f2f3] p-4">
            <div className="text-[10px] font-mono text-[#979799] uppercase">Blacklisted Firms</div>
            <div className="text-2xl font-medium text-[#17191c] font-mono mt-1">{blacklisted}</div>
            <div className="text-[11px] text-[#777b86] mt-0.5 font-mono">Of {contractors.length} Monitored</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contractor List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[11px] font-mono text-[#979799] uppercase tracking-wider block">
            Registered PWD Contractors ({filtered.length})
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
                  className={`rounded-[20px] p-5 cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-white border-[#17191c] shadow-md ring-1 ring-[#17191c]'
                      : 'bg-white border-[#17191c]/8 hover:border-[#17191c]/20 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <QualityBadge score={contractor.qualityScore} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <h3 className="font-serif text-base font-normal text-[#17191c] truncate">
                            {contractor.name}
                          </h3>
                          {contractor.blacklistedStatus && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#fbe1d1] text-[#5d2a1a] flex items-center gap-1">
                              <Ban className="w-2.5 h-2.5" /> Blacklisted
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#777b86] font-mono">
                          {contractor.registrationNumber} · {contractor.classRating}
                        </div>

                        <div className="grid grid-cols-3 gap-x-2 gap-y-1 mt-3 text-xs font-mono text-[#777b86]">
                          <div>
                            <span className="text-[9px] text-[#979799] block uppercase">Paved</span>
                            <span className="font-medium text-[#17191c]">{contractor.totalKmsPaved} km</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#979799] block uppercase">Defect Rate</span>
                            <span className={`font-medium ${contractor.warrantyDefectRate > 15 ? 'text-[#5d2a1a]' : 'text-[#17191c]'}`}>
                              {contractor.warrantyDefectRate}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#979799] block uppercase">Open Cases</span>
                            <span className={`font-medium ${criticalCount > 0 ? 'text-[#5d2a1a]' : 'text-[#17191c]'}`}>
                              {contractor.openIncidents ?? contractorIncidents.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ward tags */}
                  <div className="pt-3 mt-3 border-t border-[#17191c]/5 flex flex-wrap gap-1">
                    {contractor.activeWards.map((w, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-[#fafafb] border border-[#17191c]/5 text-[#777b86] font-mono text-[9px]">
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
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#17191c]/8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f2f2f3] flex items-center justify-center shrink-0 text-[#17191c]">
                  <Building2 className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-normal text-[#17191c]">{selectedContractor.name}</h2>
                  <div className="text-xs font-mono text-[#777b86] mt-0.5">
                    Reg: {selectedContractor.registrationNumber}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#17191c]">
                      {selectedContractor.classRating}
                    </span>
                    {selectedContractor.blacklistedStatus ? (
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#fbe1d1] text-[#5d2a1a] flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Blacklisted
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#fafafb] border border-[#17191c]/10 text-[#17191c]">
                        Eligible Bidder
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <QualityBadge score={selectedContractor.qualityScore} />
            </div>

            {/* Accountability disclaimer */}
            <div className="p-3.5 rounded-[16px] bg-[#fafafb] border border-[#17191c]/5 text-xs font-mono text-[#777b86] flex items-start gap-2.5">
              <Award className="w-4 h-4 shrink-0 mt-0.5 text-[#17191c]" />
              <span className="leading-relaxed">
                Contractor registered under Karnataka PWD project archives. Metrics reflect measured road roughness and defect density.
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-[16px] bg-[#fafafb] border border-[#17191c]/5">
                <div className="text-[9px] text-[#979799] uppercase">Projects Done</div>
                <div className="text-lg font-medium text-[#17191c] mt-1">{selectedContractor.totalProjectsCompleted ?? '28'}</div>
              </div>
              <div className="p-3 rounded-[16px] bg-[#fafafb] border border-[#17191c]/5">
                <div className="text-[9px] text-[#979799] uppercase">Open Defects</div>
                <div className={`text-lg font-medium mt-1 ${(selectedContractor.openIncidents ?? 0) > 15 ? 'text-[#5d2a1a]' : 'text-[#17191c]'}`}>
                  {selectedContractor.openIncidents ?? '14'}
                </div>
              </div>
              <div className="p-3 rounded-[16px] bg-[#fafafb] border border-[#17191c]/5">
                <div className="text-[9px] text-[#979799] uppercase">Resolved</div>
                <div className="text-lg font-medium text-[#17191c] mt-1">{selectedContractor.resolvedIncidents ?? '42'}</div>
              </div>
              <div className="p-3 rounded-[16px] bg-[#fafafb] border border-[#17191c]/5">
                <div className="text-[9px] text-[#979799] uppercase">Avg Resolution</div>
                <div className="text-lg font-medium text-[#17191c] mt-1">{selectedContractor.avgResolutionTimeDays ?? '9'}d</div>
              </div>
            </div>

            {/* Quality meter */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#777b86]">Paving Quality Index</span>
                <span className="font-medium text-[#17191c]">
                  {selectedContractor.qualityScore} / 100
                </span>
              </div>
              <div className="w-full bg-[#f2f2f3] h-2 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#17191c] rounded-full"
                  style={{ width: `${selectedContractor.qualityScore}%` }}
                />
              </div>
              <p className="text-[11px] text-[#a3a6af]">
                Computed from surface roughness post-12-months, water seepage rate, and pothole emergence density (IRC-SP-100).
              </p>
            </div>
          </div>

          {/* Penalties ledger */}
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-mono text-[#17191c] uppercase border-b border-[#17191c]/8 pb-3">
              <FileText className="w-3.5 h-3.5 text-[#777b86]" />
              <span>Financial Accountability Ledger</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 font-mono text-xs">
              <div className="p-4 rounded-[16px] bg-[#fbe1d1] text-[#5d2a1a] border border-[#5d2a1a]/15">
                <div className="text-[10px] uppercase font-semibold text-[#5d2a1a]/70">Penalties Levied</div>
                <div className="text-xl font-medium mt-1">
                  {formatINR(selectedContractor.penaltiesLeviedINR)}
                </div>
              </div>
              <div className="p-4 rounded-[16px] bg-[#fafafb] text-[#17191c] border border-[#17191c]/5">
                <div className="text-[10px] uppercase text-[#777b86]">Penalties Recovered</div>
                <div className="text-xl font-medium mt-1">
                  {formatINR(selectedContractor.penaltiesPaidINR)}
                </div>
              </div>
            </div>

            {selectedContractor.penaltiesLeviedINR > selectedContractor.penaltiesPaidINR && (
              <div className="p-3.5 rounded-[16px] bg-[#fafafb] border border-[#17191c]/10 text-xs font-mono text-[#777b86] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#5d2a1a]" />
                <span>
                  Outstanding: <strong className="text-[#17191c]">{formatINR(selectedContractor.penaltiesLeviedINR - selectedContractor.penaltiesPaidINR)}</strong> — recovery proceedings initiated under KTPP Act.
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-1">
            <button
              onClick={() => handleIssueNotice(selectedContractor)}
              className="w-full py-3.5 rounded-full bg-[#17191c] text-white hover:bg-black font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Issue Defect Liability Notice (DLP Clause 45.2)</span>
            </button>
            <button
              onClick={() =>
                addToast('Audit Dossier Exported', `PDF generated for ${selectedContractor.name}`, 'info')
              }
              className="w-full py-3 rounded-full border border-[#17191c]/20 bg-transparent text-[#17191c] hover:bg-[#fafafb] font-medium text-xs transition-colors cursor-pointer"
            >
              Download Comprehensive Contractor Audit Dossier →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

