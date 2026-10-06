import React, { useState } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Clock,
  FileText,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { karnatakaProcurementCache, ProcurementRecord } from '../data/procurement/karnataka/tenders';

export const ContractorIntelligencePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ProcurementRecord>(karnatakaProcurementCache[0]);

  const filtered = karnatakaProcurementCache.filter(
    c =>
      c.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.workDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contractorName && c.contractorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/40 text-xs font-mono text-blue-300 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>PROCUREMENT INTELLIGENCE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Karnataka Procurement Records
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Verified awarded road projects sourced directly from the Karnataka Public Procurement Portal (KPPP).
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 w-full md:w-72">
          <Search className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search tender, work, contractor..."
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Record List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Awarded Road Tenders ({filtered.length})
          </span>

          <div className="space-y-2.5">
            {filtered.map(record => {
              const isSelected = selectedRecord.id === record.id;

              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all group
                    ${isSelected
                      ? 'bg-blue-950/25 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                      : 'bg-[#090C16] border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                    }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                        {record.workDescription}
                      </h3>
                    </div>
                    
                    <div className="text-[10px] text-slate-400 font-mono">
                      {record.tenderNumber}
                    </div>

                    <div className="pt-2 mt-2 border-t border-white/5 flex flex-wrap gap-2 text-[10px] font-mono">
                      {record.contractorName ? (
                        <span className="text-emerald-400">✅ {record.contractorName}</span>
                      ) : (
                        <span className="text-slate-500">Contractor: Not verified</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl bg-[#090C16] border border-white/10 space-y-6">
            <div className="space-y-2 pb-5 border-b border-white/10">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" /> VERIFIED SOURCE
              </div>
              <h2 className="text-xl font-bold text-white leading-snug">
                {selectedRecord.workDescription}
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-[11px]">
                <div className="space-y-1">
                  <span className="text-slate-500 block">Tender Number</span>
                  <span className="text-slate-200">{selectedRecord.tenderNumber}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">Department / Authority</span>
                  <span className="text-slate-200">{selectedRecord.department}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">Tender Status</span>
                  <span className="text-slate-200">{selectedRecord.tenderStatus}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">Published Date</span>
                  <span className="text-slate-200">{selectedRecord.publishedDate}</span>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-slate-500 block">Project Location</span>
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {selectedRecord.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-300 border-b border-white/10 pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Awarded Contractor Intelligence
              </h3>
              
              {selectedRecord.contractorName ? (
                <div className="space-y-3">
                  <div className="text-lg font-bold text-white">{selectedRecord.contractorName}</div>
                  
                  <div className="space-y-1 text-[11px] font-mono">
                    <span className="text-slate-500 block">Award Evidence Document</span>
                    <span className="text-emerald-400">{selectedRecord.awardEvidence}</span>
                  </div>
                  
                  <div className="p-3 mt-2 rounded-lg bg-blue-950/20 border border-blue-500/20 text-[10px] text-blue-300/80 font-mono flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-400" />
                    <span>
                      This contractor is associated with this road project per {selectedRecord.sourceType}. 
                      DLP (Defect Liability Period) status unavailable from public record.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex flex-col items-center justify-center text-center gap-2 text-slate-400 font-mono text-xs">
                  <AlertCircle className="w-6 h-6 opacity-50" />
                  <p>Winning contractor not available in verified source</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <FileText className="w-3.5 h-3.5" />
              Source: {selectedRecord.sourceType} • {selectedRecord.sourceUrl}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
