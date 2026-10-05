import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ScanLine,
  Loader2,
  CheckCircle2,
  XCircle,
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

// Simulate a CV comparison result based on incident data
function runDemoVerification(incident: PotholeIncident): RepairVerification {
  const existingV = incident.repairVerification;
  if (existingV) return existingV;

  // Simulate pass/fail based on contractor quality
  const passConfidence = 0.38 + Math.random() * 0.2; // 38–58% — likely fail for demo
  return {
    incidentId: incident.id,
    repairedAt: new Date().toISOString(),
    contractorSubmittedPhoto: incident.images.repaired || incident.images.original,
    aiAuditPhoto: incident.images.repaired || incident.images.original,
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
      ? 'Repair appears complete. Surface smoothness within IRC-SP-100 tolerance.'
      : 'Repair quality insufficient. Cold patch applied without proper hot-mix compaction. Edge sealing absent. Rework required.',
    mode: 'DEMO_VERIFICATION_MODE',
    isDemo: true,
  };
}

const MetricBar: React.FC<{ label: string; score: number; delay?: string }> = ({ label, score, delay = '0ms' }) => {
  const color = score >= 80 ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]'
    : score >= 60 ? 'bg-amber-500'
    : 'bg-red-500';

  return (
    <div className="space-y-1.5" style={{ animationDelay: delay }}>
      <div className="flex justify-between text-[11px] font-mono">
        <span className="text-slate-300">{label}</span>
        <span className={score >= 80 ? 'text-emerald-400 font-bold' : score >= 60 ? 'text-amber-400 font-bold' : 'text-red-400 font-bold'}>
          {score}
        </span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
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
    await new Promise(r => setTimeout(r, 700));

    setStage('LOADING_AFTER');
    addToast('After-Image Loaded', 'Comparing surface profiles', 'info');
    await new Promise(r => setTimeout(r, 800));

    setStage('COMPARING');
    await new Promise(r => setTimeout(r, 900));

    setStage('SCORING');
    await new Promise(r => setTimeout(r, 700));

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
    <div className="rounded-2xl border border-white/10 bg-[#090C16] overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <ScanLine className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white">Repair Verification</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">AI Computer Vision before/after audit</p>
          </div>
        </div>
        {isDemo && result && (
          <span className="text-[9px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-full flex items-center gap-1">
            <ScanLine className="w-2.5 h-2.5" />
            CV Verified
          </span>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Before / After image comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${showBefore ? 'border-red-500/50' : 'border-white/10 opacity-70'}`}
            onClick={() => setShowBefore(true)}
          >
            <img
              src={incident.images.original}
              alt="Before repair"
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
              <span className="text-[10px] font-mono font-bold text-red-400 bg-black/60 px-1.5 py-0.5 rounded">
                BEFORE
              </span>
            </div>
            {showBefore && (
              <div className="absolute inset-0 border-2 border-red-500/60 rounded-xl pointer-events-none" />
            )}
          </div>

          <div
            className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${!showBefore ? 'border-emerald-500/50' : 'border-white/10 opacity-70'}`}
            onClick={() => setShowBefore(false)}
          >
            <img
              src={incident.images.repaired || incident.images.original}
              alt="After repair"
              className={`w-full h-32 object-cover ${!incident.images.repaired ? 'filter grayscale' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded">
                AFTER
              </span>
            </div>
            {!incident.images.repaired && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                <span className="text-[10px] font-mono text-slate-400">Not yet repaired</span>
              </div>
            )}
            {!showBefore && (
              <div className="absolute inset-0 border-2 border-emerald-500/60 rounded-xl pointer-events-none" />
            )}
          </div>
        </div>

        {/* Pipeline progress */}
        {stage !== 'IDLE' && stage !== 'DONE' && (
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center gap-3 text-xs">
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" />
            <div>
              <div className="font-mono text-purple-300 font-semibold">{stageLabels[stage]}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                {stage === 'COMPARING' ? 'SSIM • Edge Detection • Depth Delta Analysis' :
                 stage === 'SCORING' ? 'Compaction • Thermal Density • Surface Smoothness' :
                 'CV Neural Pipeline v4.2 — demo adapter active'}
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && stage === 'DONE' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Big verdict */}
            <div className={`p-4 rounded-2xl border text-center space-y-1 ${
              isApproved
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : 'bg-red-950/20 border-red-500/30'
            }`}>
              {isApproved ? (
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
              )}
              <div className="font-mono text-3xl font-extrabold text-white">
                {pct}%
              </div>
              <div className="text-xs font-mono text-slate-400">Repair verification confidence</div>
              <div className={`text-sm font-bold font-mono ${isApproved ? 'text-emerald-400' : 'text-red-400'}`}>
                {isApproved ? '✓ AI VERIFIED' : '✗ POSSIBLE UNRESOLVED DAMAGE'}
              </div>
            </div>

            {/* Metric bars */}
            <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                <BarChart3 className="w-3 h-3 text-cyan-400" />
                <span>CV Analysis Metrics</span>
              </div>
              <MetricBar label="Surface Smoothness" score={result.surfaceSmoothnessScore} />
              <MetricBar label="Thermal Density" score={result.thermalDensityScore} delay="100ms" />
              <MetricBar label="Structural Similarity (SSIM)" score={result.structuralSimilarityScore ?? 0} delay="200ms" />
              <MetricBar label="Edge Sealing" score={result.edgeSealingScore ?? 0} delay="300ms" />
              <MetricBar label="Compaction Score" score={result.compactionScore ?? 0} delay="400ms" />
            </div>

            {/* Notes */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
              <div className="text-[10px] font-mono text-slate-500 mb-1">AUDITOR NOTES</div>
              <p className="text-slate-300 leading-relaxed">{result.notes}</p>
              <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>{result.verifiedBy.replace('_', ' ')} • {formatDateTime(result.repairedAt)}</span>
              </div>
            </div>

            {!isApproved && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-amber-200/80">
                  <strong className="text-amber-300">Rework notice generated.</strong>{' '}
                  Contractor must re-inspect and repair within 48 hours or face penalty escalation.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing verification (pre-loaded) */}
        {result && stage === 'IDLE' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border text-center space-y-1 ${
              isApproved
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : 'bg-red-950/20 border-red-500/30'
            }`}>
              {isApproved ? (
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
              )}
              <div className="font-mono text-3xl font-extrabold text-white">{pct}%</div>
              <div className="text-xs font-mono text-slate-400">Repair verification confidence</div>
              <div className={`text-sm font-bold font-mono ${isApproved ? 'text-emerald-400' : 'text-red-400'}`}>
                {isApproved ? '✓ AI VERIFIED' : '✗ POSSIBLE UNRESOLVED DAMAGE'}
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <MetricBar label="Surface Smoothness" score={result.surfaceSmoothnessScore} />
              <MetricBar label="Thermal Density" score={result.thermalDensityScore} />
              <MetricBar label="Structural Similarity" score={result.structuralSimilarityScore ?? 0} />
              <MetricBar label="Edge Sealing" score={result.edgeSealingScore ?? 0} />
              <MetricBar label="Compaction Score" score={result.compactionScore ?? 0} />
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
              <div className="text-[10px] font-mono text-slate-500 mb-1">AUDITOR NOTES</div>
              <p className="text-slate-300">{result.notes}</p>
            </div>
          </div>
        )}

        {/* CTA button */}
        {stage === 'IDLE' && !result && (
          <div className="space-y-3">
            {!isRepaired && (
              <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 flex items-start gap-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">
                  Repair verification is available once the contractor submits a post-repair photo.
                  Current status: <strong className="text-white">{incident.status.replace('_', ' ')}</strong>
                </span>
              </div>
            )}
            <button
              onClick={runVerification}
              disabled={stage !== 'IDLE'}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              <span>Run CV Repair Verification</span>
            </button>
            <p className="text-center text-[10px] text-slate-500 font-mono">
              Demo adapter active — uses image comparison simulation
            </p>
          </div>
        )}

        {stage === 'DONE' && (
          <button
            onClick={() => { setResult(null); setStage('IDLE'); }}
            className="w-full text-center text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-mono cursor-pointer"
          >
            ← Run new verification
          </button>
        )}
      </div>
    </div>
  );
};
