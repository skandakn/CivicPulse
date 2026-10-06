import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ScanLine,
  Loader2,
  BarChart3,
  AlertTriangle,
  Cpu,
  FlaskConical,
} from 'lucide-react';
import { PotholeIncident, RepairVerification } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/formatters';

interface RepairVerificationPanelProps {
  incident: PotholeIncident;
}

type VerificationStage = 'IDLE' | 'LOADING_BEFORE' | 'LOADING_AFTER' | 'COMPARING' | 'SCORING' | 'DONE';

function runDemoVerification(incident: PotholeIncident): RepairVerification {
  const existingV = incident.repairVerification;
  if (existingV) return existingV;

  const passConfidence = 0.38 + Math.random() * 0.2;
  return {
    incidentId: incident.id,
    repairedAt: new Date().toISOString(),
    contractorSubmittedPhoto: incident.images.repaired || '/sample_data/images/repaired_audit_inspection.jpg',
    aiAuditPhoto: incident.images.repaired || '/sample_data/images/repaired_audit_inspection.jpg',
    passConfidence,
    surfaceSmoothnessScore: Math.round(passConfidence * 100 * 0.9),
    thermalDensityScore: Math.round(passConfidence * 100 * 0.85),
    structuralSimilarityScore: Math.round(passConfidence * 100 * 0.88),
    edgeSealingScore: Math.round(passConfidence * 100 * 0.82),
    compactionScore: Math.round(passConfidence * 100 * 0.9),
    areaReductionPercent: passConfidence >= 0.75 ? 96.5 : 42.0,
    unresolvedDamageDetected: passConfidence < 0.75,
    verifiedBy: 'AI_VISION_AUDITOR',
    status: passConfidence >= 0.75 ? 'APPROVED' : 'REJECTED_REWORK_NEEDED',
    notes: passConfidence >= 0.75
      ? 'Repair complete. Surface smoothness within IRC-SP-100 tolerance.'
      : 'Repair quality insufficient. Cold patch applied without proper hot-mix compaction. Edge sealing absent. Rework required.',
    mode: 'DEMO_VERIFICATION_MODE',
    isDemo: true,
  };
}

const MetricBar: React.FC<{ label: string; score: number; delay?: string }> = ({ label, score }) => {
  const color = score >= 80 ? 'bg-[#2E8C42]'
    : score >= 60 ? 'bg-[#E8A030]'
    : 'bg-[#C03A3A]';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono font-bold">
        <span className="text-[#121210]">{label}</span>
        <span className={score >= 80 ? 'text-[#2E8C42]' : score >= 60 ? 'text-[#E8A030]' : 'text-[#C03A3A]'}>
          {score} / 100
        </span>
      </div>
      <div className="w-full bg-white border border-[#121210] h-2.5 overflow-hidden p-0.5">
        <div
          className={`h-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export const RepairVerificationPanel: React.FC<RepairVerificationPanelProps> = ({ incident }) => {
  const { addToast } = useApp();
  const [stage, setStage] = useState<VerificationStage>('IDLE');
  const [result, setResult] = useState<RepairVerification | null>(incident.repairVerification || null);
  const [showBefore, setShowBefore] = useState(true);

  const isRepaired = incident.status === 'REPAIRED' || incident.status === 'AI_VERIFIED';

  const runVerification = async () => {
    setStage('LOADING_BEFORE');
    addToast('CV Pipeline Started', 'Loading before-image for analysis', 'info');
    await new Promise(r => setTimeout(r, 600));

    setStage('LOADING_AFTER');
    addToast('After-Image Loaded', 'Comparing surface profiles', 'info');
    await new Promise(r => setTimeout(r, 600));

    setStage('COMPARING');
    await new Promise(r => setTimeout(r, 700));

    setStage('SCORING');
    await new Promise(r => setTimeout(r, 600));

    const verification = runDemoVerification(incident);
    setResult(verification);
    setStage('DONE');

    if (verification.status === 'APPROVED') {
      addToast('Repair Verified ✓', `${Math.round(verification.passConfidence * 100)}% confidence — APPROVED`, 'success');
    } else {
      addToast('Repair Rejected', `${Math.round(verification.passConfidence * 100)}% confidence — Rework required`, 'warning');
    }
  };

  const pct = result ? Math.round(result.passConfidence * 100) : 0;
  const isApproved = result?.status === 'APPROVED';
  const isDemo = result?.isDemo ?? true;

  const stageLabels: Record<VerificationStage, string> = {
    IDLE: '',
    LOADING_BEFORE: 'Loading before-repair image...',
    LOADING_AFTER: 'Loading after-repair image...',
    COMPARING: 'Running structural similarity analysis...',
    SCORING: 'Computing verification score...',
    DONE: '',
  };

  return (
    <div className="bg-white brut overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b-2 border-[#121210] flex items-center justify-between bg-[#CFE8D6]/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white border-2 border-[#121210] flex items-center justify-center">
            <ScanLine className="w-4 h-4 text-[#121210]" />
          </div>
          <div>
            <h3 className="font-display text-sm font-black text-[#121210] uppercase">Repair Verification</h3>
            <p className="text-[11px] text-[#4A4A46] font-mono">AI Computer Vision before/after audit</p>
          </div>
        </div>
        {isDemo && result && (
          <span className="tag bg-[#E8A030] text-[#121210] font-mono text-[9px] font-bold flex items-center gap-1">
            <FlaskConical className="w-2.5 h-2.5" />
            BENCHMARK
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Before / After image comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`relative border-2 cursor-pointer transition-all ${showBefore ? 'border-[#C03A3A] shadow-[2px_2px_0_#121210]' : 'border-[#121210] opacity-70'}`}
            onClick={() => setShowBefore(true)}
          >
            <img
              src={incident.images.original}
              alt="Before repair"
              onError={(e) => { e.currentTarget.src = '/sample_data/images/real/bellandur_orr_flyover.jpg'; }}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
              <span className="text-[10px] font-mono font-bold text-white bg-[#C03A3A] px-1.5 py-0.5 border border-[#121210]">
                BEFORE
              </span>
            </div>
          </div>

          <div
            className={`relative border-2 cursor-pointer transition-all ${!showBefore ? 'border-[#2E8C42] shadow-[2px_2px_0_#121210]' : 'border-[#121210] opacity-70'}`}
            onClick={() => setShowBefore(false)}
          >
            <img
              src={incident.images.repaired || '/sample_data/images/repaired_audit_inspection.jpg'}
              alt="After repair"
              onError={(e) => { e.currentTarget.src = '/sample_data/images/repaired_audit_inspection.jpg'; }}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
              <span className="text-[10px] font-mono font-bold text-white bg-[#2E8C42] px-1.5 py-0.5 border border-[#121210]">
                AFTER
              </span>
            </div>
            {!incident.images.repaired && (
              <div className="absolute inset-0 bg-[#CFE8D6]/80 flex items-center justify-center">
                <span className="text-[10px] font-mono font-bold text-[#121210]">Not yet repaired</span>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline progress */}
        {stage !== 'IDLE' && stage !== 'DONE' && (
          <div className="p-3 bg-[#CFE8D6] border-2 border-[#121210] flex items-center gap-3 text-xs">
            <Loader2 className="w-4 h-4 text-[#121210] animate-spin flex-shrink-0" />
            <div>
              <div className="font-mono text-[#121210] font-bold">{stageLabels[stage]}</div>
              <div className="text-[10px] text-[#4A4A46] font-mono">
                {stage === 'COMPARING' ? 'SSIM · Edge Detection · Depth Delta Analysis' :
                 stage === 'SCORING' ? 'Compaction · Thermal Density · Surface Smoothness' :
                 'CV Neural Pipeline v4.2 — demo adapter active'}
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && stage === 'DONE' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Big verdict */}
            <div className={`p-4 border-2 border-[#121210] text-center space-y-1 ${
              isApproved
                ? 'bg-[#CFE8D6] shadow-[4px_4px_0_#121210]'
                : 'bg-[#C03A3A]/10 shadow-[4px_4px_0_#121210]'
            }`}>
              {isApproved ? (
                <ShieldCheck className="w-8 h-8 text-[#2E8C42] mx-auto" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-[#C03A3A] mx-auto" />
              )}
              <div className="font-display text-3xl font-black text-[#121210]">
                {pct}%
              </div>
              <div className="text-xs font-mono text-[#4A4A46]">Repair verification confidence</div>
              <div className={`font-display text-sm font-black uppercase ${isApproved ? 'text-[#2E8C42]' : 'text-[#C03A3A]'}`}>
                {isApproved ? '✓ AI VERIFIED' : '✗ POSSIBLE UNRESOLVED DAMAGE'}
              </div>
            </div>

            {/* Metric bars */}
            <div className="space-y-3 p-4 bg-[#CFE8D6]/20 border-2 border-[#121210]">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#121210] uppercase tracking-wider mb-1">
                <BarChart3 className="w-3.5 h-3.5 text-[#2E8C42]" />
                <span>CV Analysis Metrics</span>
              </div>
              <MetricBar label="Surface Smoothness" score={result.surfaceSmoothnessScore} />
              <MetricBar label="Thermal Density" score={result.thermalDensityScore} delay="100ms" />
              <MetricBar label="Structural Similarity (SSIM)" score={result.structuralSimilarityScore ?? 0} delay="200ms" />
              <MetricBar label="Edge Sealing" score={result.edgeSealingScore ?? 0} delay="300ms" />
              <MetricBar label="Compaction Score" score={result.compactionScore ?? 0} delay="400ms" />
            </div>

            {/* Notes */}
            <div className="p-3 bg-white border-2 border-[#121210] text-xs">
              <div className="text-[10px] font-mono font-bold text-[#4A4A46] mb-1">AUDITOR NOTES</div>
              <p className="font-body text-[#121210] leading-relaxed">{result.notes}</p>
              <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-[#4A4A46]">
                <Cpu className="w-3 h-3 text-[#2E8C42]" />
                <span>{result.verifiedBy.replace('_', ' ')} · {formatDateTime(result.repairedAt)}</span>
              </div>
            </div>

            {!isApproved && (
              <div className="p-3 bg-[#E8A030]/20 border-2 border-[#121210] flex items-start gap-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-[#121210] flex-shrink-0 mt-0.5" />
                <div className="font-body text-[#121210]">
                  <strong>Rework notice generated.</strong> Contractor must re-inspect and repair within 48 hours or face penalty escalation.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing verification (pre-loaded) */}
        {result && stage === 'IDLE' && (
          <div className="space-y-4">
            <div className={`p-4 border-2 border-[#121210] text-center space-y-1 ${
              isApproved
                ? 'bg-[#CFE8D6] shadow-[4px_4px_0_#121210]'
                : 'bg-[#C03A3A]/10 shadow-[4px_4px_0_#121210]'
            }`}>
              {isApproved ? (
                <ShieldCheck className="w-8 h-8 text-[#2E8C42] mx-auto" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-[#C03A3A] mx-auto" />
              )}
              <div className="font-display text-3xl font-black text-[#121210]">{pct}%</div>
              <div className="text-xs font-mono text-[#4A4A46]">Repair verification confidence</div>
              <div className={`font-display text-sm font-black uppercase ${isApproved ? 'text-[#2E8C42]' : 'text-[#C03A3A]'}`}>
                {isApproved ? '✓ AI VERIFIED' : '✗ POSSIBLE UNRESOLVED DAMAGE'}
              </div>
            </div>

            <div className="space-y-3 p-4 bg-[#CFE8D6]/20 border-2 border-[#121210]">
              <MetricBar label="Surface Smoothness" score={result.surfaceSmoothnessScore} />
              <MetricBar label="Thermal Density" score={result.thermalDensityScore} />
              <MetricBar label="Structural Similarity" score={result.structuralSimilarityScore ?? 0} />
              <MetricBar label="Edge Sealing" score={result.edgeSealingScore ?? 0} />
              <MetricBar label="Compaction Score" score={result.compactionScore ?? 0} />
            </div>

            <div className="p-3 bg-white border-2 border-[#121210] text-xs">
              <div className="text-[10px] font-mono font-bold text-[#4A4A46] mb-1">AUDITOR NOTES</div>
              <p className="font-body text-[#121210]">{result.notes}</p>
            </div>
          </div>
        )}

        {/* CTA button */}
        {stage === 'IDLE' && !result && (
          <div className="space-y-3">
            {!isRepaired && (
              <div className="p-3 bg-[#E8A030]/20 border-2 border-[#121210] flex items-start gap-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-[#121210] flex-shrink-0 mt-0.5" />
                <span className="font-body text-[#121210]">
                  Repair verification is available once contractor submits post-repair photo.
                  Status: <strong>{incident.status.replace('_', ' ')}</strong>
                </span>
              </div>
            )}
            <button
              onClick={runVerification}
              disabled={stage !== 'IDLE'}
              className="w-full py-3 bg-[#121210] text-[#CFE8D6] hover:bg-[#2E8C42] hover:text-white brut font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 btn-press transition-all cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              <span>Run CV Repair Verification</span>
            </button>
            <p className="text-center text-[10px] text-[#4A4A46] font-mono">
              Demo adapter active — uses image comparison simulation
            </p>
          </div>
        )}

        {stage === 'DONE' && (
          <button
            onClick={() => { setResult(null); setStage('IDLE'); }}
            className="w-full text-center text-xs text-[#121210] hover:underline font-mono font-bold cursor-pointer"
          >
            ← Run new verification
          </button>
        )}
      </div>
    </div>
  );
};
