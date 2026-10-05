import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const JudgeDemoModal: React.FC = () => {
  const {
    isJudgeDemoOpen,
    setIsJudgeDemoOpen,
    incidents,
    selectIncidentById,
    setCurrentView,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full max-w-4xl bg-[#090C16] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 bg-[#060810] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-tight font-mono">
                  ONE-CLICK HACKATHON JUDGE DEMO
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
                  Case BNG-PTH-1042
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Full lifecycle: from citizen photo to contractor legal liability and AI-verified repair
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsJudgeDemoOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper Bar */}
        <div className="bg-[#0B0E1A] px-4 py-2 border-b border-white/5 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {steps.map((s, idx) => {
              const current = step === idx + 1;
              const passed = step > idx + 1;
              return (
                <button
                  key={idx}
                  onClick={() => setStep(idx + 1)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all
                    ${current
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_#00F0FF]'
                      : passed
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/[0.02] text-slate-500 hover:text-slate-300'
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
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">STEP 01 OF 08</span>
                  <h3 className="text-xl font-bold text-white">Citizen Media Capture & Ingestion</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-white/5 text-slate-300 text-xs font-mono border border-white/10">
                  Demo Inference Mode
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative rounded-xl overflow-hidden border border-white/10 h-64 bg-black">
                  <img
                    src={demoIncident.images.original}
                    alt="Raw citizen capture"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400">
                    RAW CITIZEN DASHCAM CAPTURE
                  </div>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">RECORDED LOCATION</span>
                    <strong className="text-white text-sm">{demoIncident.roadName}</strong>
                    <div className="text-slate-400 text-xs mt-0.5">{demoIncident.landmark}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-slate-500 block text-[10px]">GPS GEOLOCATION</span>
                      <span className="text-cyan-400 font-bold">12.9298° N, 77.6835° E</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-slate-500 block text-[10px]">BBMP WARD</span>
                      <span className="text-slate-200 font-semibold">Ward 150 (Bellandur)</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Citizen uploads image through the mobile app. The media is instantly ingested with geotags, device accelerometer vectors, and camera EXIF metadata.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Computer Vision & Depth */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">STEP 02 OF 08</span>
                  <h3 className="text-xl font-bold text-white">Computer Vision & 3D Depth Extraction</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-300 text-xs font-mono border border-cyan-500/30">
                  ResNet-Pothole-v4.2 (Inference Latency: 38ms)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative rounded-xl overflow-hidden border border-red-500/40 h-64 bg-black">
                  <img
                    src={demoIncident.images.original}
                    alt="Vision analysis"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 via-transparent to-transparent mix-blend-overlay" />
                  <div
                    className="absolute border-2 border-red-500 bg-red-500/15 rounded-lg flex items-center justify-center"
                    style={{ top: '25%', left: '25%', width: '50%', height: '50%' }}
                  >
                    <span className="bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-red-400 font-bold">
                      DEPTH: 15.4 CM (CRITICAL)
                    </span>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30">
                      <span className="text-red-400 block text-[10px]">MEASURED DEPTH</span>
                      <span className="text-xl font-extrabold text-red-300">15.4 cm</span>
                      <div className="text-[10px] text-slate-400 mt-1">IRC limit: &lt;4.0 cm</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-slate-500 block text-[10px]">SURFACE AREA</span>
                      <span className="text-xl font-extrabold text-slate-100">1.48 m²</span>
                      <div className="text-[10px] text-slate-400 mt-1">Crater bounding area</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-slate-500 block text-[10px]">ESTIMATED FILL</span>
                      <span className="text-xl font-extrabold text-cyan-400">38.5 Liters</span>
                      <div className="text-[10px] text-slate-400 mt-1">Bituminous hot-mix</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-slate-500 block text-[10px]">SEVERITY SCORE</span>
                      <span className="text-xl font-extrabold text-red-400">94 / 100</span>
                      <div className="text-[10px] text-red-400 mt-1 font-bold">CRITICAL HAZARD</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Stereoscopic neural networks evaluate road surface depth contours, classifying vehicle suspension hazard index within 38 milliseconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Duplicate Clustering */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">STEP 03 OF 08</span>
                  <h3 className="text-xl font-bold text-white">Spatial Clustering & Duplicate Merging</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-purple-950 text-purple-300 text-xs font-mono border border-purple-500/30">
                  94% Similarity Match
                </span>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-purple-300 font-bold">3 CITIZEN REPORTS MERGED INTO ONE MASTER INCIDENT</span>
                  <span className="text-cyan-400">Radius: &lt;15 meters</span>
                </div>
                <p className="text-slate-300 font-sans leading-relaxed">
                  Instead of creating 3 fragmented tickets and redundant map pins, CivicPulse merges identical reports into Master Case <strong className="text-white font-mono">BNG-PTH-1042</strong>. Each merge increments report density and elevates priority score while keeping municipal GIS clean.
                </p>

                <div className="space-y-2 pt-1 font-mono">
                  {demoIncident.supportingReports.map((r, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-[11px]">
                      <div>
                        <strong className="text-white">{r.citizenName}</strong>: <span className="text-slate-400">"{r.notes}"</span>
                      </div>
                      <span className="text-emerald-400 font-bold">{r.similarityScore}% match</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Responsibility Intelligence & Clause 45.2 */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">STEP 04 OF 08</span>
                  <h3 className="text-xl font-bold text-white">Responsibility Resolution & Tender Clause 45.2</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 text-xs font-mono border border-emerald-500/30">
                  Defect Liability Period: ACTIVE
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                {/* Chain Breakdown */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="text-[10px] text-slate-500 uppercase">MUNICIPAL ATTRIBUTION CHAIN</div>
                  <div className="flex flex-wrap items-center gap-2 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-cyan-400">
                      GPS 12.9298° N, 77.6835° E
                    </span>
                    <span>→</span>
                    <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-white">
                      Outer Ring Road (BLR-ARR-004)
                    </span>
                    <span>→</span>
                    <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-white">
                      Work Order: BBMP/WO-88/2024
                    </span>
                    <span>→</span>
                    <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-amber-300">
                      Star Infratech Pvt Ltd
                    </span>
                  </div>
                </div>

                {/* Neutral Language & Liability Card */}
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>LEGAL CONTRACT STATUS: FREE REPAIR MANDATE</span>
                  </div>
                  <p className="text-slate-300 font-sans leading-relaxed">
                    Road project associated with this location was completed in Nov 2024 under a 36-month warranty. Under <strong className="text-white">Clause 45.2</strong> of Karnataka PWD Standard Specifications, contractor <strong className="text-white">Star Infratech</strong> must rectify this crater at <strong className="text-emerald-400">ZERO cost to the public exchequer</strong> within 48 hours.
                  </p>
                  <div className="pt-1 text-[11px] text-emerald-400 font-mono">
                    Estimated Taxpayer Savings: ₹1,20,000 (Protected from duplicate tender billing)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Explainable Priority Score 94/100 */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">STEP 05 OF 08</span>
                  <h3 className="text-xl font-bold text-white">Explainable Priority Score: 94 / 100</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-red-950 text-red-300 text-xs font-mono border border-red-500/30">
                  CRITICAL DISPATCH
                </span>
              </div>

              {/* Exact Itemized Scoring Table */}
              <div className="p-4 rounded-xl bg-[#060810] border border-white/10 space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-white/10 pb-2 text-slate-400 text-[11px]">
                  <span>SCORING FACTOR</span>
                  <span>POINTS ALLOCATED</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Visual severity & depth (&gt;15cm)</span>
                  <span className="font-bold text-cyan-400">+31</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Traffic exposure (24,500 PCU/hr)</span>
                  <span className="font-bold text-cyan-400">+21</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Report density (3 reports merged)</span>
                  <span className="font-bold text-cyan-400">+17</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Persistence (Unresolved &gt;48h)</span>
                  <span className="font-bold text-cyan-400">+12</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Road importance (Arterial corridor)</span>
                  <span className="font-bold text-cyan-400">+8</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Sensitive location (Ambulance transit)</span>
                  <span className="font-bold text-cyan-400">+5</span>
                </div>

                <div className="pt-2 border-t border-white/15 flex justify-between items-center text-base font-extrabold text-white">
                  <span>TOTAL AI PRIORITY SCORE</span>
                  <span className="text-red-400 text-xl">94 — CRITICAL</span>
                </div>
              </div>

              {/* Short AI Explanation */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                  AI Natural Language Rationale
                </span>
                <p className="text-slate-200 font-sans italic leading-relaxed">
                  "High-confidence pothole on a high-traffic corridor with multiple supporting reports and prolonged unresolved status."
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: God's Eye Map */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">STEP 06 OF 08</span>
                  <h3 className="text-xl font-bold text-white">God's Eye Command Center Integration</h3>
                </div>
                <button
                  onClick={() => {
                    setIsJudgeDemoOpen(false);
                    selectIncidentById(demoIncident.id, 'GODS_EYE');
                  }}
                  className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-xs font-mono"
                >
                  Jump to Live Map
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3 text-xs font-mono">
                <p className="text-slate-300 font-sans leading-relaxed">
                  The verified master incident automatically renders on the city-wide geospatial canvas with glowing red severity markers, corridor health layer, and priority queue ordering.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-slate-500 block text-[10px]">CORRIDOR PCI</span>
                    <span className="text-red-400 font-bold text-sm">28 / 100</span>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-slate-500 block text-[10px]">QUEUE POSITION</span>
                    <span className="text-cyan-400 font-bold text-sm">#1 in Bengaluru</span>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-slate-500 block text-[10px]">MAP COORDINATES</span>
                    <span className="text-slate-200 font-bold text-xs">12.9298° N, 77.6835° E</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: AI Complaint Generation */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">STEP 07 OF 08</span>
                  <h3 className="text-xl font-bold text-white">Automated Municipal Grievance Generation</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 text-xs font-mono border border-amber-500/30">
                  Ready to submit (Simulated Gateway Mode)
                </span>
              </div>

              <div className="p-5 rounded-xl bg-[#060810] border border-amber-500/30 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-amber-400 font-bold">BBMP SAHAYA 2.0 DRAFT NOTICE</span>
                  <span className="text-[10px] text-slate-500">ID: DFT-BBMP-2026-90412</span>
                </div>

                <div className="space-y-2 text-slate-300 font-sans">
                  <div>
                    <span className="text-slate-500 font-mono text-[11px] block">LOCATION:</span>
                    <strong>Outer Ring Road, Bellandur (Ward 150)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[11px] block">PRIORITY & SEVERITY:</span>
                    <span>Score 94/100 (CRITICAL) • 15.4cm Depth • 3 Supporting Reports</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[11px] block">RECORDED TENDER & CONTRACTOR:</span>
                    <span>Tender WO-88/2024 • Star Infratech Pvt Ltd (Clause 45.2 Warranty Active)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[11px] block">RECOMMENDED ACTION:</span>
                    <span className="text-emerald-400">Notice to contractor under Clause 45.2 for emergency cold-mix compaction within 24h at zero public expense.</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-[10px] text-slate-500 italic">
                  Watermark: AI-generated — review before submission.
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Post-Repair AI Verification */}
          {step === 8 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase">STEP 08 OF 08</span>
                  <h3 className="text-xl font-bold text-white">Post-Repair AI Verification (Before vs After)</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 text-xs font-mono border border-emerald-500/30">
                  Demo Verification Mode (Approved)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-red-400 font-bold">BEFORE: RAW DEFECT</div>
                  <div className="relative rounded-xl overflow-hidden border border-red-500/40 h-48 bg-black">
                    <img
                      src={demoIncident.images.original}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-red-400">
                      15.4cm Depth • Crater Active
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">AFTER: HOT-MIX PATCH</div>
                  <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 h-48 bg-black">
                    <img
                      src="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80"
                      alt="After patch"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-emerald-950/90 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300">
                      AI Verified: 98.4% Smoothness
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-500 block">AREA REDUCTION</span>
                  <span className="text-emerald-400 font-bold">98.2%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-500 block">SURFACE PASS</span>
                  <span className="text-emerald-400 font-bold">94 / 100</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-500 block">CONFIDENCE</span>
                  <span className="text-cyan-400 font-bold">98.4%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-500 block">AUDIT VERDICT</span>
                  <span className="text-emerald-400 font-bold">APPROVED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-[#060810] border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Stage</span>
          </button>

          <span className="font-mono text-xs text-slate-500">
            Step {step} of 8
          </span>

          {step < 8 ? (
            <button
              onClick={() => setStep(prev => Math.min(8, prev + 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
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
