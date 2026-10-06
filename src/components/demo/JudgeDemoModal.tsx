import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const JudgeDemoModal: React.FC = () => {
  const {
    isJudgeDemoOpen,
    setIsJudgeDemoOpen,
    incidents,
    selectIncidentById,
    setCurrentView,
    resetDemo,
    addToast
  } = useApp();

  const [step, setStep] = useState<number>(1);

  if (!isJudgeDemoOpen) return null;

  const demoIncident = incidents.find(i => i.code === 'BNG-PTH-1042') || incidents[0];

  const steps = [
    { title: 'Ingestion & Raw Media', tag: 'STAGE 01-02' },
    { title: 'Computer Vision & Depth', tag: 'STAGE 03-04' },
    { title: 'Duplicate Clustering', tag: 'STAGE 05-06' },
    { title: 'Responsibility & Clause 45.2', tag: 'STAGE 07' },
    { title: 'Explainable Priority 94/100', tag: 'STAGE 08' },
    { title: 'God’s Eye Map Placement', tag: 'STAGE 09' },
    { title: 'AI Complaint Generation', tag: 'STAGE 10' },
    { title: 'Post-Repair AI Verification', tag: 'STAGE 11' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#17191c]/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 bg-[#fafafb] border-b border-[#17191c]/8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#17191c] text-white flex items-center justify-center border border-[#17191c]/15">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display font-black text-[#17191c] text-sm tracking-tight uppercase">
                  ONE-CLICK HACKATHON JUDGE DEMO
                </span>
                <span className="tag bg-white font-mono text-[10px] font-bold">
                  Case BNG-PTH-1042
                </span>
                <span className="stamp border-[#2E8C42] text-[#2E8C42] text-[10px] font-black">
                  DETERMINISTIC
                </span>
              </div>
              <p className="text-[11px] text-[#777b86] font-mono">
                Full lifecycle: from citizen photo to contractor legal liability and AI-verified repair
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetDemo}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-full text-[11px] font-mono font-bold text-[#17191c] hover:bg-[#fafafb] transition-colors cursor-pointer"
              title="Reset all demo state to initial seed"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              onClick={() => setIsJudgeDemoOpen(false)}
              className="p-1.5 border border-[#17191c]/15 hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-[#17191c]" />
            </button>
          </div>
        </div>

        {/* Progress Stepper Bar */}
        <div className="bg-white px-4 py-2 border-b border-[#17191c]/8 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {steps.map((s, idx) => {
              const current = step === idx + 1;
              const passed = step > idx + 1;
              return (
                <button
                  key={idx}
                  onClick={() => setStep(idx + 1)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold uppercase transition-all cursor-pointer
                    ${current
                      ? 'bg-[#17191c] text-white rounded-full'
                      : passed
                      ? 'bg-[#fafafb] text-[#17191c] border border-[#17191c]'
                      : 'bg-white text-[#777b86] hover:bg-[#fafafb]'
                    }
                  `}
                >
                  <span>{idx + 1}.</span>
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Dynamic Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-left">
          {/* STEP 1: Ingestion */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-[#2E8C42] uppercase">STEP 01 OF 08</span>
                  <h3 className="font-display text-xl font-black text-[#17191c]">Citizen Media Capture & Ingestion</h3>
                </div>
                <span className="tag bg-[#fafafb] text-[#17191c] font-mono text-xs font-bold">
                  Demo Inference Mode
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative border border-[#17191c]/15 h-52 sm:h-60 bg-black overflow-hidden">
                  <img
                    src={demoIncident.images.original}
                    alt="Raw citizen capture"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-[#17191c] text-white px-2 py-0.5 text-[10px] font-mono font-bold">
                    RAW CITIZEN DASHCAM CAPTURE
                  </div>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 bg-[#fafafb] border border-[#17191c]/15">
                    <span className="text-[#777b86] block text-[10px] uppercase font-bold">RECORDED LOCATION</span>
                    <strong className="font-display text-sm font-bold text-[#17191c]">{demoIncident.roadName}</strong>
                    <div className="text-[#777b86] text-xs mt-0.5">{demoIncident.landmark}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-white border border-[#17191c]/15">
                      <span className="text-[#777b86] block text-[10px] uppercase font-bold">GPS GEOLOCATION</span>
                      <span className="text-[#17191c] font-bold">12.9298° N, 77.6835° E</span>
                    </div>
                    <div className="p-2.5 bg-white border border-[#17191c]/15">
                      <span className="text-[#777b86] block text-[10px] uppercase font-bold">BBMP WARD</span>
                      <span className="text-[#17191c] font-bold">Ward 150 (Bellandur)</span>
                    </div>
                  </div>

                  <p className="font-body text-xs text-[#17191c] leading-relaxed">
                    Citizen uploads image through the mobile app. The media is instantly ingested with geotags, device accelerometer vectors, and camera EXIF metadata.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Computer Vision & Depth */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-[#2E8C42] uppercase">STEP 02 OF 08</span>
                  <h3 className="font-display text-xl font-black text-[#17191c]">Computer Vision & 3D Depth Extraction</h3>
                </div>
                <span className="tag bg-[#fafafb] text-[#17191c] font-mono text-xs font-bold">
                  ResNet-Pothole-v4.2 · Latency: 38ms
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative border border-[#17191c]/15 h-52 sm:h-60 bg-black overflow-hidden">
                  <img
                    src={demoIncident.images.original}
                    alt="Vision analysis"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute border-4 border-[#C03A3A] bg-[#C03A3A]/20 flex items-center justify-center shadow-sm"
                    style={{ top: '25%', left: '25%', width: '50%', height: '50%' }}
                  >
                    <span className="bg-[#17191c] text-white px-2 py-0.5 text-[10px] font-mono font-bold">
                      DEPTH: 18.0 CM · 96.8% CONFIDENCE
                    </span>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#C03A3A]/10 border border-[#17191c]/15">
                      <div className="flex items-center justify-between">
                        <span className="text-[#C03A3A] block text-[10px] font-bold uppercase">ESTIMATED DEPTH</span>
                        <span className="text-[9px] text-[#777b86] uppercase font-bold">Disparity</span>
                      </div>
                      <span className="text-2xl font-black text-[#C03A3A]">18.0 cm</span>
                      <div className="text-[10px] text-[#777b86] mt-0.5 font-sans">IRC limit: &lt;4.0 cm</div>
                    </div>

                    <div className="p-3 bg-white border border-[#17191c]/15">
                      <div className="flex items-center justify-between">
                        <span className="text-[#777b86] block text-[10px] font-bold uppercase">NEURAL CONFIDENCE</span>
                        <span className="text-[9px] text-[#2E8C42] uppercase font-bold">Model</span>
                      </div>
                      <span className="text-2xl font-black text-[#2E8C42]">96.8%</span>
                      <div className="text-[10px] text-[#777b86] mt-0.5 font-sans">Crater pattern match</div>
                    </div>

                    <div className="p-3 bg-white border border-[#17191c]/15">
                      <div className="flex items-center justify-between">
                        <span className="text-[#777b86] block text-[10px] font-bold uppercase">SURFACE AREA</span>
                        <span className="text-[9px] text-[#777b86] uppercase font-bold">Calculated</span>
                      </div>
                      <span className="text-2xl font-black text-[#17191c]">1.48 m²</span>
                      <div className="text-[10px] text-[#777b86] mt-0.5 font-sans">Bitumen fill: 38.5 L</div>
                    </div>

                    <div className="p-3 bg-[#C03A3A]/10 border border-[#17191c]/15">
                      <div className="flex items-center justify-between">
                        <span className="text-[#C03A3A] block text-[10px] font-bold uppercase">SEVERITY SCORE</span>
                        <span className="text-[9px] text-[#C03A3A] uppercase font-bold">Index</span>
                      </div>
                      <span className="text-2xl font-black text-[#C03A3A]">94 / 100</span>
                      <div className="text-[10px] text-[#C03A3A] mt-0.5 font-bold font-sans">CRITICAL HAZARD</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#C03A3A]/10 border border-[#17191c]/15 text-xs font-body text-[#17191c]">
                    <strong className="font-mono font-bold text-[#C03A3A]">Why CRITICAL?</strong> 18.0cm crater depth exceeds 4cm IRC safety threshold, causing severe rim collapse and two-wheeler instability.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Duplicate Clustering */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-[#2E8C42] uppercase">STEP 03 OF 08</span>
                  <h3 className="font-display text-xl font-black text-[#17191c]">Spatial Clustering & Duplicate Merging</h3>
                </div>
                <span className="tag bg-[#fafafb] text-[#17191c] font-mono text-xs font-bold">
                  94% Similarity Match
                </span>
              </div>

              <div className="p-4 bg-white border border-[#17191c]/15 space-y-3 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-[#17191c]">3 CITIZEN REPORTS MERGED INTO ONE MASTER INCIDENT</span>
                  <span className="tag bg-[#fafafb] font-mono text-[10px] font-bold">Radius: &lt;15 meters</span>
                </div>
                <p className="font-body text-[#17191c] leading-relaxed">
                  Instead of creating 3 fragmented tickets and redundant map pins, CivicPulse merges identical reports into Master Case <strong className="font-mono text-[#17191c]">BNG-PTH-1042</strong>. Each merge increments report density and elevates priority score while keeping municipal GIS clean.
                </p>

                <div className="space-y-2 pt-1 font-mono">
                  {demoIncident.supportingReports.map((r, i) => (
                    <div key={i} className="p-2.5 bg-[#fafafb] border border-[#17191c] flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-[#17191c]">{r.citizenName}</strong>: <span className="text-[#777b86]">"{r.notes}"</span>
                      </div>
                      <span className="tag bg-[#2E8C42] text-white font-bold">{r.similarityScore}% match</span>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-[#fafafb] border border-[#17191c]/15 text-xs font-body text-[#17191c]">
                  <strong className="font-mono font-bold text-[#17191c]">Why duplicate?</strong> 15 m spatial proximity + 94% visual feature similarity merged 3 citizen reports into 1 master case.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Responsibility Intelligence & Clause 45.2 */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-[#2E8C42] uppercase">STEP 04 OF 08</span>
                  <h3 className="font-display text-xl font-black text-[#17191c]">Responsibility Resolution & Tender Clause 45.2</h3>
                </div>
                <span className="stamp border-[#2E8C42] text-[#2E8C42] text-[10px] font-black">
                  DLP WARRANTY ACTIVE
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3.5 bg-white border border-[#17191c]/15 space-y-2">
                  <div className="text-[10px] text-[#777b86] uppercase font-bold">MUNICIPAL ATTRIBUTION CHAIN</div>
                  <div className="flex flex-wrap items-center gap-2 text-[#17191c]">
                    <span className="tag bg-[#fafafb] text-[#17191c] font-bold">
                      GPS 12.9298° N, 77.6835° E
                    </span>
                    <span>→</span>
                    <span className="tag bg-white font-bold">
                      Outer Ring Road (BLR-ARR-004)
                    </span>
                    <span>→</span>
                    <span className="tag bg-white font-bold">
                      Work Order: BBMP/WO-88/2024
                    </span>
                    <span>→</span>
                    <span className="tag bg-[#E8A030] text-[#17191c] font-bold">
                      Star Infratech Pvt Ltd
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#fafafb] border border-[#17191c]/15 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#2E8C42]">
                    <ShieldCheck className="w-5 h-5 text-[#2E8C42]" />
                    <span className="font-display font-black text-sm uppercase text-[#17191c]">LEGAL CONTRACT STATUS: ZERO PUBLIC COST REPAIR</span>
                  </div>
                  <p className="font-body text-[#17191c] text-xs leading-relaxed">
                    Road project associated with this location was completed in Nov 2024 under a 36-month warranty. Under <strong className="text-[#17191c]">Clause 45.2</strong> of Karnataka PWD Standard Specifications, contractor <strong className="text-[#17191c]">Star Infratech</strong> must rectify this crater at <strong className="text-[#2E8C42] font-black">ZERO cost to the public exchequer</strong> within 48 hours.
                  </p>
                  <div className="pt-1 text-xs text-[#2E8C42] font-mono font-bold">
                    Estimated Taxpayer Savings: ₹1,20,000 (Protected from duplicate tender billing)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Explainable Priority Score 94/100 */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-[#2E8C42] uppercase">STEP 05 OF 08</span>
                  <h3 className="font-display text-xl font-black text-[#17191c]">Explainable Priority Score: 94 / 100</h3>
                </div>
                <span className="tag bg-[#C03A3A] text-white font-mono text-xs font-bold">
                  CRITICAL DISPATCH
                </span>
              </div>

              <div className="p-4 bg-white border border-[#17191c]/15 space-y-2 font-mono text-xs">
                <div className="flex justify-between border-b border-[#17191c]/8 pb-2 text-[#777b86] font-bold text-[11px]">
                  <span>SCORING FACTOR</span>
                  <span>POINTS ALLOCATED</span>
                </div>

                <div className="flex justify-between items-center text-[#17191c]">
                  <span>Visual severity & depth (18cm crater)</span>
                  <span className="font-bold text-[#C03A3A]">+31</span>
                </div>
                <div className="flex justify-between items-center text-[#17191c]">
                  <span>Traffic exposure (24,500 PCU/hr)</span>
                  <span className="font-bold text-[#17191c]">+21</span>
                </div>
                <div className="flex justify-between items-center text-[#17191c]">
                  <span>Report density (3 reports merged)</span>
                  <span className="font-bold text-[#17191c]">+17</span>
                </div>
                <div className="flex justify-between items-center text-[#17191c]">
                  <span>Persistence (Unresolved &gt;48h)</span>
                  <span className="font-bold text-[#17191c]">+12</span>
                </div>
                <div className="flex justify-between items-center text-[#17191c]">
                  <span>Road importance (Arterial corridor)</span>
                  <span className="font-bold text-[#17191c]">+8</span>
                </div>
                <div className="flex justify-between items-center text-[#17191c]">
                  <span>Sensitive location (Ambulance transit)</span>
                  <span className="font-bold text-[#17191c]">+5</span>
                </div>

                <div className="pt-2 border-t-2 border-[#17191c] flex justify-between items-center text-sm font-black text-[#17191c]">
                  <span className="font-display uppercase">TOTAL AI PRIORITY SCORE</span>
                  <span className="tag bg-[#17191c] text-white text-base font-bold">94 — CRITICAL</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#fafafb] border border-[#17191c]/15 space-y-1 text-xs">
                <span className="text-[10px] font-mono text-[#777b86] uppercase font-bold block">
                  AI Natural Language Rationale
                </span>
                <p className="font-body text-[#17191c] italic">
                  "High-confidence pothole on a high-traffic corridor with multiple supporting reports and prolonged unresolved status."
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: God's Eye Map */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-[#2E8C42] uppercase">STEP 06 OF 08</span>
                  <h3 className="font-display text-xl font-black text-[#17191c]">God's Eye Command Center Integration</h3>
                </div>
                <button
                  onClick={() => {
                    setIsJudgeDemoOpen(false);
                    selectIncidentById(demoIncident.id, 'GODS_EYE');
                  }}
                  className="px-3 py-1 bg-[#17191c] text-white hover:bg-[#2E8C42] hover:text-white font-bold text-xs font-mono uppercase rounded-full cursor-pointer"
                >
                  Jump to Live Map
                </button>
              </div>

              <div className="p-4 bg-white border border-[#17191c]/15 space-y-3 text-xs font-mono">
                <p className="font-body text-[#17191c] leading-relaxed">
                  The verified master incident automatically renders on the city-wide geospatial canvas with glowing red severity markers, corridor health layer, and priority queue ordering.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[#fafafb] border border-[#17191c]/15">
                    <span className="text-[#777b86] block text-[10px] uppercase font-bold">CORRIDOR PCI</span>
                    <span className="text-[#C03A3A] font-black text-xl">28 / 100</span>
                  </div>
                  <div className="p-3 bg-white border border-[#17191c]/15">
                    <span className="text-[#777b86] block text-[10px] uppercase font-bold">QUEUE POSITION</span>
                    <span className="text-[#17191c] font-black text-xl">#1 in City</span>
                  </div>
                  <div className="p-3 bg-white border border-[#17191c]/15">
                    <span className="text-[#777b86] block text-[10px] uppercase font-bold">COORDINATES</span>
                    <span className="text-[#17191c] font-bold text-xs">12.9298° N, 77.6835° E</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: AI Complaint Generation */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-[#2E8C42] uppercase">STEP 07 OF 08</span>
                  <h3 className="font-display text-xl font-black text-[#17191c]">Automated Municipal Grievance Generation</h3>
                </div>
                <span className="stamp border-[#E8A030] text-[#E8A030] text-[10px] font-black">
                  SIMULATED GATEWAY READY
                </span>
              </div>

              <div className="p-5 bg-white border border-[#17191c]/15 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-[#17191c]/8 pb-2">
                  <span className="font-display text-xs font-black text-[#17191c] uppercase">BBMP SAHAYA 2.0 DRAFT NOTICE</span>
                  <span className="tag bg-[#fafafb] text-[10px] font-bold">DFT-BBMP-2026-90412</span>
                </div>

                <div className="space-y-2 text-[#17191c] font-body">
                  <div>
                    <span className="text-[#777b86] font-mono text-[11px] block font-bold uppercase">LOCATION:</span>
                    <strong>Outer Ring Road, Bellandur (Ward 150)</strong>
                  </div>
                  <div>
                    <span className="text-[#777b86] font-mono text-[11px] block font-bold uppercase">PRIORITY & SEVERITY:</span>
                    <span>Score 94/100 (CRITICAL) · 18.0cm Depth (Estimated Disparity) · 3 Merged Reports</span>
                  </div>
                  <div>
                    <span className="text-[#777b86] font-mono text-[11px] block font-bold uppercase">RECORDED TENDER & CONTRACTOR:</span>
                    <span>Tender WO-88/2024 · Star Infratech Pvt Ltd (Clause 45.2 Warranty Active)</span>
                  </div>
                  <div>
                    <span className="text-[#777b86] font-mono text-[11px] block font-bold uppercase">RECOMMENDED ACTION:</span>
                    <span className="text-[#2E8C42] font-bold">Notice to contractor under Clause 45.2 for emergency cold-mix compaction within 24h at zero public expense.</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#17191c] text-[10px] text-[#777b86] font-mono italic">
                  Watermark: AI-generated — review before submission.
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Post-Repair AI Verification */}
          {step === 8 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-[#2E8C42] uppercase">STEP 08 OF 08</span>
                  <h3 className="font-display text-xl font-black text-[#17191c]">Post-Repair AI Verification (Before vs After)</h3>
                </div>
                <span className="stamp border-[#2E8C42] text-[#2E8C42] text-[10px] font-black">
                  APPROVED VERDICT
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-[#C03A3A] font-black uppercase">BEFORE: RAW DEFECT</div>
                  <div className="relative border border-[#17191c]/15 h-48 bg-black overflow-hidden">
                    <img
                      src={demoIncident.images.original}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-[#17191c] text-white px-2 py-0.5 text-[10px] font-mono font-bold">
                      18.0cm Depth · Active Crater
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-[#2E8C42] font-black uppercase">AFTER: HOT-MIX PATCH</div>
                  <div className="relative border border-[#17191c]/15 h-48 bg-black overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80"
                      alt="After patch"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-[#2E8C42] text-white px-2 py-0.5 text-[10px] font-mono font-bold">
                      AI Verified: 98.4% Smoothness
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center">
                <div className="p-2.5 bg-white border border-[#17191c]/15">
                  <span className="text-[10px] text-[#777b86] block uppercase font-bold">AREA REDUCTION</span>
                  <span className="text-[#2E8C42] font-black text-lg">98.2%</span>
                </div>
                <div className="p-2.5 bg-white border border-[#17191c]/15">
                  <span className="text-[10px] text-[#777b86] block uppercase font-bold">SURFACE SMOOTH</span>
                  <span className="text-[#2E8C42] font-black text-lg">94 / 100</span>
                </div>
                <div className="p-2.5 bg-white border border-[#17191c]/15">
                  <span className="text-[10px] text-[#777b86] block uppercase font-bold">CONFIDENCE</span>
                  <span className="text-[#17191c] font-black text-lg">98.4%</span>
                </div>
                <div className="p-2.5 bg-[#2E8C42] text-white border border-[#17191c]/15">
                  <span className="text-[10px] text-white/80 block uppercase font-bold">AUDIT VERDICT</span>
                  <span className="font-black text-lg">APPROVED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-[#fafafb] border-t-2 border-[#17191c] flex items-center justify-between">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-full text-xs font-mono font-bold text-[#17191c] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Stage</span>
          </button>

          <span className="font-mono text-xs font-bold text-[#17191c]">
            Step {step} of 8
          </span>

          {step < 8 ? (
            <button
              onClick={() => setStep(prev => Math.min(8, prev + 1))}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#17191c] text-white hover:bg-[#2E8C42] hover:text-white font-mono font-bold text-xs uppercase rounded-full transition-all cursor-pointer btn-press"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setIsJudgeDemoOpen(false);
                setCurrentView('GODS_EYE');
                addToast('Demo Concluded', 'Returning to Bengaluru Command Center', 'info');
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2E8C42] text-white hover:bg-[#17191c] hover:text-white font-mono font-bold text-xs uppercase rounded-full transition-all cursor-pointer btn-press"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Explore Live Platform</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
