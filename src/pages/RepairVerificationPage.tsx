import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PotholeIncident, RepairVerification } from '../types';

export const RepairVerificationPage: React.FC = () => {
  const { incidents, selectedIncident, setSelectedIncident, verifyRepair, addToast } = useApp();

  const activeIncident: PotholeIncident = selectedIncident || incidents[0];

  const [afterImage, setAfterImage] = useState<string>(
    activeIncident.repairVerification?.contractorSubmittedPhoto ||
    'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'
  );

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<RepairVerification | null>(
    activeIncident.repairVerification || null
  );

  const runVerificationAudit = async (shouldPass: boolean = true) => {
    setIsAuditing(true);
    addToast('Surface Scan Commenced', 'Running stereoscopic texture comparison against IRC-SP-100', 'info');

    const submittedPhoto = shouldPass
      ? 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
    setAfterImage(submittedPhoto);

    await new Promise(r => setTimeout(r, 800));

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

    if (shouldPass) {
      addToast('Repair Verification Approved', 'Contractor patch passed quality threshold. DLP period initiated.', 'success');
    } else {
      addToast('Repair Verification Rejected', 'Rework notice dispatched to contractor under Clause 45.2.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto text-left">
      {/* Header matching Approva */}
      <div className="brut-lg bg-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-[3px] border-[#121210] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="tag bg-[#2E8C42] text-white">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
                IRC-SP-100 QUALITY AUDIT
              </span>
              <span className="tag bg-[#CFE8D6] text-[#121210]">
                DEMO AUDIT MODE
              </span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-[#121210] tracking-tight">
              AI Repair Verification Lab
            </h1>
            <p className="text-sm font-body text-[#121210]/70 mt-1 max-w-2xl">
              Forensic validation of contractor road repairs. Compares pre-repair defect dimensions against post-patch hot-mix compaction.
            </p>
          </div>

          {/* Incident Switcher */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="font-bold text-[#121210]">CASE:</span>
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
              className="brut-sm bg-white px-3 py-1.5 font-mono font-bold text-[#121210] outline-none cursor-pointer"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.code} — {inc.roadName.substring(0, 26)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Case Quick Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div>
            <span className="text-[#121210]/60">ROAD: </span>
            <span className="font-bold text-[#121210]">{activeIncident.roadName}</span>
          </div>
          <div>
            <span className="text-[#121210]/60">CONTRACTOR: </span>
            <span className="font-bold text-[#121210]">{activeIncident.contractorName}</span>
          </div>
          <div>
            <span className="text-[#121210]/60">DEFECT DEPTH: </span>
            <span className="font-bold text-[#C03A3A]">{activeIncident.depthCm} cm</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Visual Inspection matching Approva */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BEFORE BOX */}
        <div className="brut bg-white p-5 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
            <div className="flex items-center gap-2 font-display font-extrabold text-sm text-[#C03A3A]">
              <span className="w-2.5 h-2.5 bg-[#C03A3A] border border-[#121210]" />
              <span>BEFORE: REPORTED DEFECT</span>
            </div>
            <span className="tag bg-[#C03A3A] text-white">
              {activeIncident.severity}
            </span>
          </div>

          <div className="relative overflow-hidden h-64 bg-black border-2 border-[#121210]">
            <img
              src={activeIncident.images.original}
              alt="Defect before repair"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-[#121210] text-white px-2 py-0.5 text-[10px] font-mono font-bold">
              DEPTH: {activeIncident.depthCm}cm · AREA: {activeIncident.surfaceAreaSqM}m²
            </div>
          </div>

          <div className="p-3 border-2 border-[#121210] bg-[#CFE8D6]/30 font-mono text-xs">
            <div><strong className="text-[#121210]">Roadway:</strong> {activeIncident.roadName}</div>
            <div className="text-[11px] text-[#121210]/70 mt-0.5">Assigned: {activeIncident.contractorName}</div>
          </div>
        </div>

        {/* AFTER BOX */}
        <div className="brut bg-white p-5 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
            <div className="flex items-center gap-2 font-display font-extrabold text-sm text-[#2E8C42]">
              <span className="w-2.5 h-2.5 bg-[#2E8C42] border border-[#121210]" />
              <span>AFTER: CONTRACTOR WORK SUBMISSION</span>
            </div>
            <span className="tag bg-[#CFE8D6] text-[#121210]">
              SITE PHOTOGRAMMETRY
            </span>
          </div>

          <div className="relative overflow-hidden h-64 bg-black border-2 border-[#121210]">
            <img
              src={afterImage}
              alt="Contractor repair submission"
              className="w-full h-full object-cover"
            />
            {auditResult && (
              <div className="absolute top-4 right-4 pointer-events-none">
                <span
                  className={`stamp ${auditResult.status === 'APPROVED' ? 'text-[#2E8C42]' : 'text-[#C03A3A]'} text-xs bg-white`}
                  style={{ transform: auditResult.status === 'APPROVED' ? 'rotate(-6deg)' : 'rotate(6deg)' }}
                >
                  {auditResult.status === 'APPROVED' ? 'APPROVED' : 'REWORK MANDATED'}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => runVerificationAudit(true)}
              disabled={isAuditing}
              className="flex-1 brut bg-[#2E8C42] text-white hover:bg-[#257335] py-2.5 px-3 font-display font-extrabold text-xs btn-press cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAuditing ? 'ANALYZING...' : 'SIMULATE VERIFIED PATCH (PASS)'}</span>
            </button>
            <button
              onClick={() => runVerificationAudit(false)}
              disabled={isAuditing}
              className="brut bg-[#C03A3A] text-white hover:bg-[#a62e2e] py-2.5 px-3 font-display font-extrabold text-xs btn-press cursor-pointer disabled:opacity-50"
            >
              <span>SIMULATE DEFECT (FAIL)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Quantitative Scorecard in Brutalist format */}
      {auditResult && (
        <div className="brut bg-white p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-[3px] border-[#121210]">
            <div className="flex items-center gap-2">
              {auditResult.status === 'APPROVED' ? (
                <CheckCircle2 className="w-6 h-6 text-[#2E8C42] stroke-[2.5]" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-[#C03A3A] stroke-[2.5]" />
              )}
              <span className="font-display font-extrabold text-lg text-[#121210] uppercase">
                {auditResult.status === 'APPROVED' ? 'VERIFICATION VERDICT: PASS' : 'VERIFICATION VERDICT: REJECTED'}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#121210]/60">
              AUDITOR: {auditResult.verifiedBy} ({auditResult.mode})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
            <div className="p-3 border-2 border-[#121210] bg-[#CFE8D6]/30">
              <span className="text-[10px] text-[#121210]/60 block font-bold">AREA REDUCTION</span>
              <span className="text-2xl font-extrabold text-[#2E8C42]">
                {auditResult.areaReductionPercent}%
              </span>
              <span className="text-[9px] text-[#121210]/60 block font-bold">Calculated</span>
            </div>

            <div className="p-3 border-2 border-[#121210] bg-white">
              <span className="text-[10px] text-[#121210]/60 block font-bold">SURFACE CONSISTENCY</span>
              <span className="text-2xl font-extrabold text-[#121210]">
                {auditResult.surfaceSmoothnessScore} / 100
              </span>
              <span className="text-[9px] text-[#121210]/60 block font-bold">IRC-SP-100 SPEC</span>
            </div>

            <div className="p-3 border-2 border-[#121210] bg-white">
              <span className="text-[10px] text-[#121210]/60 block font-bold">NEURAL CONFIDENCE</span>
              <span className="text-2xl font-extrabold text-[#121210]">
                {(auditResult.passConfidence * 100).toFixed(1)}%
              </span>
              <span className="text-[9px] text-[#121210]/60 block font-bold">Edge Vision Lab</span>
            </div>

            <div className="p-3 border-2 border-[#121210] bg-[#CFE8D6]/30">
              <span className="text-[10px] text-[#121210]/60 block font-bold">UNRESOLVED DAMAGE</span>
              <span className={`text-2xl font-extrabold ${auditResult.unresolvedDamageDetected ? 'text-[#C03A3A]' : 'text-[#2E8C42]'}`}>
                {auditResult.unresolvedDamageDetected ? 'DETECTED' : 'NONE'}
              </span>
              <span className="text-[9px] text-[#121210]/60 block font-bold">Subbase Scan</span>
            </div>
          </div>

          <div className="p-3 border-2 border-[#121210] bg-[#CFE8D6]/40 font-mono text-xs">
            <strong className="text-[#121210]">AUDIT CONCLUSION:</strong> {auditResult.notes}
          </div>
        </div>
      )}
    </div>
  );
};
