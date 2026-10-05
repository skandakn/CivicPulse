import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Camera
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PotholeIncident, RepairVerification } from '../types';

export const RepairVerificationPage: React.FC = () => {
  const { incidents, selectedIncident, setSelectedIncident, verifyRepair, addToast } = useApp();

  const activeIncident: PotholeIncident = selectedIncident || incidents[0];

  const [afterImage, setAfterImage] = useState<string | null>(
    activeIncident.repairVerification?.contractorSubmittedPhoto || null
  );

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<RepairVerification | null>(
    activeIncident.repairVerification || null
  );

  const runVerificationAudit = async (shouldPass: boolean = true) => {
    setIsAuditing(true);
    addToast('Surface Scan Commenced', 'Running stereoscopic texture comparison', 'info');

    const submittedPhoto = shouldPass
      ? 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
    setAfterImage(submittedPhoto);

    await new Promise(r => setTimeout(r, 1200));

    const result: RepairVerification = {
      incidentId: activeIncident.id,
      repairedAt: new Date().toISOString(),
      contractorSubmittedPhoto: submittedPhoto,
      aiAuditPhoto: submittedPhoto,
      passConfidence: shouldPass ? 0.984 : 0.642,
      surfaceSmoothnessScore: shouldPass ? 94 : 52,
      areaReductionPercent: shouldPass ? 98.2 : 61.0,
      unresolvedDamageDetected: !shouldPass,
      thermalDensityScore: shouldPass ? 96 : 58,
      verifiedBy: 'AI_VISION_AUDITOR',
      status: shouldPass ? 'APPROVED' : 'REJECTED_REWORK_NEEDED',
      notes: shouldPass
        ? 'Bituminous hot-mix compaction verified. Aggregate interlock adheres to IRC-SP-100 specification.'
        : 'Subbase void anomaly detected. Insufficient compaction; rework mandated under Clause 45.2.',
      mode: 'DEMO_VERIFICATION_MODE'
    };

    setAuditResult(result);
    setIsAuditing(false);
    verifyRepair(activeIncident.id, result);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono text-emerald-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI POST-REPAIR QUALITY AUDIT • DEMO VERIFICATION MODE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AI Repair Verification Lab
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Automating objective forensic verification of contractor road repairs. Compares pre-repair defect topography against post-patch hot-mix compaction.
          </p>
        </div>

        {/* Incident Switcher */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500">Case:</span>
          <select
            value={activeIncident.id}
            onChange={(e) => {
              const inc = incidents.find(i => i.id === e.target.value);
              if (inc) {
                setSelectedIncident(inc);
                setAfterImage(
                  inc.repairVerification?.contractorSubmittedPhoto ||
                  'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'
                );
                setAuditResult(inc.repairVerification || null);
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-[#0E121B] border border-white/15 text-cyan-400 font-bold outline-none cursor-pointer"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id} className="bg-[#0A0D16] text-slate-200">
                {inc.code} — {inc.roadName.substring(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Before vs After Side-by-Side Visual Inspection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BEFORE BOX */}
        <div className="p-5 rounded-2xl bg-[#090C16] border border-red-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>BEFORE: REPORTED DEFECT</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Severity: {activeIncident.severity}
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden h-64 bg-black border border-white/10">
            <img
              src={activeIncident.images.original}
              alt="Defect before repair"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-red-400">
              Depth: {activeIncident.depthCm}cm • Area: {activeIncident.surfaceAreaSqM}m²
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 font-mono text-xs text-slate-300">
            <div>Road: {activeIncident.roadName}</div>
            <div className="text-[11px] text-slate-500">Contractor: {activeIncident.contractorName}</div>
          </div>
        </div>

        {/* AFTER BOX */}
        <div className="p-5 rounded-2xl bg-[#090C16] border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AFTER: CONTRACTOR WORK SUBMISSION</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">
              Contractor Audit Photo
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden h-64 bg-black border border-white/10 flex flex-col items-center justify-center">
            {afterImage ? (
              <>
                <img
                  src={afterImage}
                  alt="Contractor repair submission"
                  className="w-full h-full object-cover"
                />
                {auditResult && (
                  <div className={`absolute bottom-2 left-2 px-2.5 py-1 rounded text-xs font-mono font-bold border backdrop-blur-md
                    ${auditResult.status === 'APPROVED'
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-950/90 text-red-300 border-red-500/40'
                    }
                  `}>
                    {auditResult.status === 'APPROVED' ? 'AI AUDIT: APPROVED' : 'AI AUDIT: REWORK REQUIRED'}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Camera className="w-8 h-8 opacity-50" />
                <span className="text-sm font-mono">Awaiting repair evidence</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => runVerificationAudit(true)}
              disabled={isAuditing}
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAuditing ? 'Analyzing...' : 'Simulate Verified Patch (Pass)'}</span>
            </button>
            <button
              onClick={() => runVerificationAudit(false)}
              disabled={isAuditing}
              className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-red-400 border border-red-500/30 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Simulate Defect (Fail)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Quantitative Scorecard */}
      {auditResult && (
        <div className={`p-6 rounded-2xl border space-y-4 animate-in fade-in
          ${auditResult.status === 'APPROVED'
            ? 'bg-emerald-950/20 border-emerald-500/40'
            : 'bg-red-950/20 border-red-500/40'
          }
        `}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              {auditResult.status === 'APPROVED' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <span className="font-mono text-sm font-bold text-white uppercase">
                {auditResult.status === 'APPROVED' ? 'VERIFICATION VERDICT: PASS' : 'VERIFICATION VERDICT: REJECTED'}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Auditor: {auditResult.verifiedBy} ({auditResult.mode})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-400 block">AREA REDUCTION</span>
              <span className="text-xl font-extrabold text-emerald-400">
                {auditResult.areaReductionPercent}%
              </span>
              <span className="text-[9px] text-slate-500 block">Calculated</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-400 block">SURFACE CONSISTENCY</span>
              <span className="text-xl font-extrabold text-white">
                {auditResult.surfaceSmoothnessScore} / 100
              </span>
              <span className="text-[9px] text-slate-500 block">IRC-SP-100 Standard</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-500 block">NEURAL CONFIDENCE</span>
              <span className="text-xl font-extrabold text-cyan-400">
                {(auditResult.passConfidence * 100).toFixed(1)}%
              </span>
              <span className="text-[9px] text-slate-500 block">Model-Generated</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-400 block">UNRESOLVED DAMAGE</span>
              <span className={`text-xl font-extrabold ${auditResult.unresolvedDamageDetected ? 'text-red-400' : 'text-emerald-400'}`}>
                {auditResult.unresolvedDamageDetected ? 'DETECTED' : 'NONE'}
              </span>
              <span className="text-[9px] text-slate-500 block">Subbase Void Scan</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
            <strong>Audit Notes:</strong> {auditResult.notes}
          </p>
        </div>
      )}
    </div>
  );
};
