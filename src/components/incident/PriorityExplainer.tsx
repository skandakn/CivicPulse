import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { PriorityScore } from '../../types';

interface PriorityExplainerProps {
  priorityDetails: PriorityScore;
  overallScore: number;
}

export const PriorityExplainer: React.FC<PriorityExplainerProps> = ({
  priorityDetails,
  overallScore,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const factors = priorityDetails.scoreFactors;

  // Fallback: build factors from breakdown if scoreFactors not present
  const displayFactors = factors && factors.length > 0 ? factors : [
    {
      factor: 'Visual severity',
      contribution: Math.round(priorityDetails.breakdown.depthRisk * 0.32),
      detail: `Depth-based risk score: ${priorityDetails.breakdown.depthRisk}/100`,
      icon: '📏',
    },
    {
      factor: 'Traffic exposure',
      contribution: Math.round(priorityDetails.breakdown.trafficVolumeImpact * 0.22),
      detail: `Traffic volume impact: ${priorityDetails.breakdown.trafficVolumeImpact}/100`,
      icon: '🚗',
    },
    {
      factor: 'Report density',
      contribution: Math.round(priorityDetails.breakdown.citizenUpvotesWeight * 0.17),
      detail: `Citizen upvote weight: ${priorityDetails.breakdown.citizenUpvotesWeight}/100`,
      icon: '📣',
    },
    {
      factor: 'Persistence',
      contribution: Math.round(priorityDetails.breakdown.monsoonFloodingVulnerability * 0.12),
      detail: `Monsoon flooding vulnerability: ${priorityDetails.breakdown.monsoonFloodingVulnerability}/100`,
      icon: '⏱️',
    },
    {
      factor: 'Road importance',
      contribution: Math.round(priorityDetails.breakdown.twoWheelerAccidentHistory * 0.10),
      detail: `Two-wheeler accident history: ${priorityDetails.breakdown.twoWheelerAccidentHistory}/100`,
      icon: '🛣️',
    },
    {
      factor: 'Nearby sensitive area',
      contribution: Math.round(priorityDetails.breakdown.schoolHospitalProximity * 0.07),
      detail: `School/hospital proximity: ${priorityDetails.breakdown.schoolHospitalProximity}/100`,
      icon: '🏥',
    },
  ];

  const scoreColor = overallScore >= 90
    ? 'text-red-400'
    : overallScore >= 75
    ? 'text-amber-400'
    : overallScore >= 55
    ? 'text-yellow-400'
    : 'text-cyan-400';

  const ringColor = overallScore >= 90
    ? 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
    : overallScore >= 75
    ? 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
    : 'border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]';

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090C16] overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${ringColor}`}>
            <span className={`font-mono text-xl font-extrabold ${scoreColor}`}>{overallScore}</span>
          </div>
          <div className="text-left">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">AI Priority Score</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {overallScore >= 90 ? 'Extreme Hazard' : overallScore >= 75 ? 'High Priority' : overallScore >= 55 ? 'Medium Priority' : 'Low Priority'}
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Why this score?</span>
            </div>
          </div>
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expanded explainer */}
      {isOpen && (
        <div className="border-t border-white/10 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Confidence */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>
              Model confidence: <strong className="text-white">{Math.round(priorityDetails.confidence * 100)}%</strong>
              {' '}— computed {new Date(priorityDetails.calculatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} today
            </span>
          </div>

          {/* Factor breakdown table */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Score Breakdown</div>

            <div className="space-y-2">
              {displayFactors.map((f, idx) => {
                const barWidth = Math.min(100, Math.round((f.contribution / overallScore) * 100));
                const barColor = idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : idx === 2 ? 'bg-yellow-500' : idx === 3 ? 'bg-cyan-500' : idx === 4 ? 'bg-blue-500' : 'bg-purple-500';

                return (
                  <div key={f.factor} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{f.icon}</span>
                        <span className="text-xs font-semibold text-slate-200">{f.factor}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-sm">
                        <span className="text-slate-500">+</span>
                        <span className="font-extrabold text-white">{f.contribution}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed">{f.detail}</p>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs">
              <span className="text-slate-300 font-semibold">Total Score</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">= </span>
                <span className={`text-xl font-extrabold ${scoreColor}`}>{overallScore}</span>
                <span className="text-slate-500 text-sm">/100</span>
              </div>
            </div>
          </div>

          {/* Explanation bullets */}
          {priorityDetails.explanation.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Contextual Notes</div>
              <div className="space-y-1.5">
                {priorityDetails.explanation.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300 leading-relaxed">
                    <span className="text-cyan-500 mt-0.5 flex-shrink-0">›</span>
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-[10px] font-mono text-slate-600 text-center">
            Score computed by CivicPulse Neural Engine v4.2 — IRC-SP-100 risk matrix
          </div>
        </div>
      )}
    </div>
  );
};
