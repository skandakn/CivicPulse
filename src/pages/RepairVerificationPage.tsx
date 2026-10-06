import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronDown
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
    <div className="space-y-8 pb-16 max-w-6xl mx-auto text-left">
      {/* Editorial Header */}
      <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#17191c]/8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                IRC-SP-100 Quality Audit
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-[#f2f2f3] text-[#777b86]">
                Vision Lab · Forensic Pass
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#17191c] tracking-tight">
              AI Repair <span className="italic">Verification Lab</span>
            </h1>
            <p className="text-sm font-sans text-[#777b86] mt-2 max-w-2xl leading-relaxed">
              Forensic validation of contractor road repairs. Compares pre-repair defect dimensions against post-patch hot-mix compaction.
            </p>
          </div>

          {/* Incident Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#777b86] uppercase tracking-wider">Case:</span>
            <div className="relative">
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
                className="appearance-none rounded-full bg-[#fafafb] border border-[#17191c]/15 pl-4 pr-9 py-2 text-xs font-mono font-medium text-[#17191c] outline-none cursor-pointer hover:border-[#17191c] transition-colors"
              >
                {incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.code} — {inc.roadName.substring(0, 26)}...
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#777b86] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Selected Case Quick Strip */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div>
            <span className="text-[#777b86]">Roadway: </span>
            <span className="font-semibold text-[#17191c]">{activeIncident.roadName}</span>
          </div>
          <div>
            <span className="text-[#777b86]">Assigned Contractor: </span>
            <span className="font-semibold text-[#17191c]">{activeIncident.contractorName}</span>
          </div>
          <div>
            <span className="text-[#777b86]">Original Cavity: </span>
            <span className="font-semibold text-rose-700">{activeIncident.depthCm} cm depth · {activeIncident.surfaceAreaSqM} m²</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Visual Inspection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BEFORE BOX */}
        <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#17191c]/8">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>Before: Reported Defect</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-rose-50 text-rose-700 border border-rose-200">
              {activeIncident.severity}
            </span>
          </div>

          <div className="relative overflow-hidden h-64 rounded-2xl bg-[#17191c] border border-[#17191c]/10">
            <img
              src={activeIncident.images.original}
              alt="Defect before repair"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-[#17191c]/90 text-white backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-mono">
              Depth: {activeIncident.depthCm}cm · Area: {activeIncident.surfaceAreaSqM}m²
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#fafafb] border border-[#17191c]/8 text-xs font-mono">
            <div><span className="text-[#777b86]">Corridor:</span> <span className="text-[#17191c] font-medium">{activeIncident.roadName}</span></div>
            <div className="text-[#777b86] text-[11px] mt-1">Responsible: {activeIncident.contractorName}</div>
          </div>
        </div>

        {/* AFTER BOX */}
        <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#17191c]/8">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>After: Contractor Work Submission</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-[#f2f2f3] text-[#777b86] border border-[#17191c]/10">
              Site Photogrammetry
            </span>
          </div>

          <div className="relative overflow-hidden h-64 rounded-2xl bg-[#17191c] border border-[#17191c]/10">
            <img
              src={afterImage}
              alt="Contractor repair submission"
              className="w-full h-full object-cover"
            />
            {auditResult && (
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider shadow-sm border ${
                    auditResult.status === 'APPROVED'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-[#5d2a1a] text-[#fbe1d1] border-[#5d2a1a]'
                  }`}
                >
                  {auditResult.status === 'APPROVED' ? 'Verified Pass' : 'Rework Mandated'}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={() => runVerificationAudit(true)}
              disabled={isAuditing}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#17191c] text-white hover:bg-[#2b2e33] text-xs font-sans font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAuditing ? 'Analyzing...' : 'Simulate Verified Patch (Pass)'}</span>
            </button>
            <button
              onClick={() => runVerificationAudit(false)}
              disabled={isAuditing}
              className="py-2.5 px-4 rounded-full bg-transparent border border-[#17191c]/20 hover:border-[#17191c] text-[#17191c] text-xs font-sans transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>Simulate Defect (Fail)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Quantitative Scorecard */}
      {auditResult && (
        <div className="space-y-6">
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#17191c]/8">
              <div className="flex items-center gap-3">
                {auditResult.status === 'APPROVED' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-[#5d2a1a]" />
                )}
                <div>
                  <h3 className="font-serif text-2xl text-[#17191c] font-normal">
                    {auditResult.status === 'APPROVED' ? 'Verification Verdict: Pass' : 'Verification Verdict: Rejected'}
                  </h3>
                  <p className="text-xs font-mono text-[#777b86] mt-0.5">
                    Auditor: {auditResult.verifiedBy} ({auditResult.mode})
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
              <div className="p-4 rounded-2xl bg-[#fafafb] border border-[#17191c]/8">
                <span className="text-[10px] text-[#777b86] block uppercase tracking-wider">Area Reduction</span>
                <span className="text-2xl font-serif text-emerald-700 mt-1 block">
                  {auditResult.areaReductionPercent}%
                </span>
                <span className="text-[10px] text-[#777b86] block mt-1">Calculated</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#fafafb] border border-[#17191c]/8">
                <span className="text-[10px] text-[#777b86] block uppercase tracking-wider">Surface Consistency</span>
                <span className="text-2xl font-serif text-[#17191c] mt-1 block">
                  {auditResult.surfaceSmoothnessScore} / 100
                </span>
                <span className="text-[10px] text-[#777b86] block mt-1">IRC-SP-100 Spec</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#fafafb] border border-[#17191c]/8">
                <span className="text-[10px] text-[#777b86] block uppercase tracking-wider">Neural Confidence</span>
                <span className="text-2xl font-serif text-[#17191c] mt-1 block">
                  {(auditResult.passConfidence * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-[#777b86] block mt-1">Edge Vision Lab</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#fafafb] border border-[#17191c]/8">
                <span className="text-[10px] text-[#777b86] block uppercase tracking-wider">Unresolved Damage</span>
                <span className={`text-2xl font-serif mt-1 block ${auditResult.unresolvedDamageDetected ? 'text-[#5d2a1a]' : 'text-emerald-700'}`}>
                  {auditResult.unresolvedDamageDetected ? 'Detected' : 'None'}
                </span>
                <span className="text-[10px] text-[#777b86] block mt-1">Subbase Scan</span>
              </div>
            </div>
          </div>

          {/* Accent Peach Editorial Card for Audit Conclusion */}
          <div className="rounded-[24px] bg-[#fbe1d1] text-[#5d2a1a] p-6 space-y-2 border border-[#5d2a1a]/15 shadow-sm">
            <div className="text-xs font-mono uppercase tracking-wider opacity-75 font-semibold">
              Legal &amp; Engineering Audit Conclusion
            </div>
            <p className="font-serif text-lg leading-relaxed text-[#5d2a1a]">
              "{auditResult.notes}"
            </p>
            <div className="text-xs font-sans text-[#5d2a1a]/80 pt-2 border-t border-[#5d2a1a]/15 flex items-center justify-between">
              <span>IRC-SP-100 Compaction Protocol</span>
              <span>Statutory Defect Liability Period: 36 Months</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
