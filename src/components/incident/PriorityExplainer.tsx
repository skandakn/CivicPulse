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

  return (
    <div className="bg-white brut overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full p-4 flex items-center justify-between hover:bg-[#CFE8D6]/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-[#121210] text-[#CFE8D6] border-2 border-[#121210] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#121210]">
            <span className="font-display font-black text-2xl">{overallScore}</span>
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-[#4A4A46] uppercase tracking-wider">AI Priority Score</div>
            <div className="font-display text-sm font-black text-[#121210] uppercase mt-0.5">
              {overallScore >= 90 ? 'Extreme Hazard' : overallScore >= 75 ? 'High Priority' : overallScore >= 55 ? 'Medium Priority' : 'Low Priority'}
            </div>
            <div className="text-[11px] text-[#2E8C42] font-mono font-bold mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inspect ledger formula</span>
            </div>
          </div>
        </div>
        <div className="text-[#121210] p-1 border-2 border-[#121210] bg-white">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded explainer */}
      {isOpen && (
        <div className="border-t-2 border-[#121210] p-4 space-y-4 bg-[#CFE8D6]/20">
          {/* Confidence */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#121210] font-bold">
            <Info className="w-3.5 h-3.5 text-[#2E8C42] shrink-0" />
            <span>
              Model confidence: <strong>{Math.round(priorityDetails.confidence * 100)}%</strong>
              {' '}— computed {new Date(priorityDetails.calculatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Factor breakdown table */}
          <div className="space-y-2 font-mono text-xs">
            <div className="text-[10px] uppercase font-bold text-[#4A4A46]">Score Breakdown Factors</div>

            <div className="space-y-2">
              {displayFactors.map((f) => {
                const barWidth = Math.min(100, Math.round((f.contribution / overallScore) * 100));

                return (
                  <div key={f.factor} className="p-3 bg-white border-2 border-[#121210] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{f.icon}</span>
                        <span className="font-bold text-[#121210]">{f.factor}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-sm font-black text-[#121210]">
                        <span>+</span>
                        <span>{f.contribution}</span>
                      </div>
                    </div>

                    <div className="w-full bg-[#CFE8D6]/40 border border-[#121210] h-2 overflow-hidden p-0.5">
                      <div
                        className="h-full bg-[#121210] transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#4A4A46] font-body">{f.detail}</p>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-3 bg-white border-2 border-[#121210] font-mono text-xs">
              <span className="font-display font-black text-sm uppercase text-[#121210]">TOTAL PRIORITY LEDGER</span>
              <div className="flex items-center gap-1">
                <span className="tag bg-[#121210] text-[#CFE8D6] text-base font-bold">
                  {overallScore} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Explanation bullets */}
          {priorityDetails.explanation.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold text-[#4A4A46] uppercase">Contextual Audit Notes</div>
              <div className="space-y-1.5">
                {priorityDetails.explanation.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#121210] font-body">
                    <span className="text-[#2E8C42] font-black shrink-0">›</span>
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-[10px] font-mono text-[#4A4A46] text-center pt-1 border-t border-[#121210]">
            Score computed by CivicPulse Engine v4.2 — IRC-SP-100 risk matrix
          </div>
        </div>
      )}
    </div>
  );
};
