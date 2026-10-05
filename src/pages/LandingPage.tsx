import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Eye,
  PlusCircle,
  Cpu,
  Building2,
  CheckCircle2,
  Radar,
  Activity,
  Layers,
  Sparkles,
  Zap,
  GitMerge,
  FileCheck,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CITY_METRICS } from '../data/mockData';
import { formatINR } from '../utils/formatters';

export const LandingPage: React.FC = () => {
  const { setCurrentView, incidents, selectIncidentById, loadDemoCase } = useApp();

  const topPriorityIncident = incidents[0];

  const stepsStory = [
    { step: '01', title: 'DETECT', desc: 'Stereoscopic depth & asphalt cracking via citizen photo/video', icon: Cpu, color: 'text-cyan-400' },
    { step: '02', title: 'PRIORITIZE', desc: 'Traffic volume × hospital corridor × depth algorithmic ranking', icon: Flame, color: 'text-amber-400' },
    { step: '03', title: 'ASSIGN', desc: 'Clause 45.2 Defect Liability Period zero-cost contractor mandate', icon: Building2, color: 'text-purple-400' },
    { step: '04', title: 'TRACK', desc: 'Live BBMP Sahaya SLA sync with automated escalation daemon', icon: Activity, color: 'text-blue-400' },
    { step: '05', title: 'VERIFY', desc: 'Post-repair computer vision audit verifying surface smoothness', icon: ShieldCheck, color: 'text-emerald-400' }
  ];

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0F1322] via-[#090C16] to-[#07090F] p-6 sm:p-10 lg:p-14 shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text & CTA */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-semibold">CIVICPULSE BENGALURU</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Next-Gen Municipal AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              See the problem. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                Find who's responsible.
              </span> <br />
              Fix what matters first.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              AI-powered pothole intelligence and accountability for Bengaluru. Merging computer vision road scanning, 
              God's Eye geospatial city intelligence, and algorithmic priority scoring to hold contractors accountable and fix hazardous roads before accidents occur.
            </p>

            {/* CTAs including 1-Click Judge Demo */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={loadDemoCase}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-sm shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>⚡ 1-Click Judge Demo</span>
              </button>

              <button
                onClick={() => setCurrentView('REPORT')}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-500/40 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                <span>Report Pothole</span>
              </button>

              <button
                onClick={() => setCurrentView('GODS_EYE')}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white font-medium text-sm transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-slate-400" />
                <span>God’s Eye Map</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                  {CITY_METRICS.activePotholes.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Active BLR Potholes</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-red-400 font-mono flex items-center gap-1">
                  <span>{CITY_METRICS.criticalIssues}</span>
                  <span className="text-xs text-red-500 animate-pulse">● Live</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Critical Road Hazards</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
                  {formatINR(CITY_METRICS.taxpayerSavingsINR)}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Contractor Warranties Saved</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono">
                  {CITY_METRICS.aiPrecisionRate}%
                </div>
                <div className="text-[11px] text-slate-400 font-medium">AI Audit Precision</div>
              </div>
            </div>
          </div>

          {/* Right Product Visualization */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-md rounded-2xl bg-[#090C16]/95 border border-cyan-500/30 p-4 shadow-[0_0_40px_rgba(0,240,255,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.06),transparent_70%)] pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Radar className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Bengaluru AI Radar
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  REALTIME SCAN
                </span>
              </div>

              {/* Simulated Map / Vision Display */}
              <div className="relative my-3 rounded-xl bg-[#06080F] border border-white/10 h-64 overflow-hidden flex flex-col justify-between p-3">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-black/60 border border-white/10">
                    LAT 12.9298° N | LNG 77.6835° E
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-400 font-bold">
                    PRIORITY #1 • 94/100
                  </span>
                </div>

                {/* Center Pothole Target Reticle */}
                <div className="relative z-10 my-auto flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28 border border-dashed border-red-500/60 rounded-xl flex items-center justify-center bg-red-500/5 backdrop-blur-sm">
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-red-500" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-red-500" />
                    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-red-500" />
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-red-500" />

                    <div className="text-center">
                      <div className="text-[10px] font-mono font-bold text-red-400 bg-red-950/80 px-1 rounded">
                        DEPTH: 15.4 CM
                      </div>
                      <div className="text-[9px] font-mono text-cyan-300 mt-1">
                        AREA: 1.48 m²
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-xs font-bold text-white">Outer Ring Road (Bellandur)</span>
                    <p className="text-[10px] text-slate-400">3 Reports Merged • Ambulance Route</p>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-3 gap-1 bg-black/70 backdrop-blur-md p-2 rounded-lg border border-white/10 text-center font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 block">RISK</span>
                    <span className="text-red-400 font-bold">94/100</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">EST. FILL</span>
                    <span className="text-cyan-400 font-bold">38.5 L</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">WARRANTY</span>
                    <span className="text-emerald-400 font-bold">ACTIVE DLP</span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Contractor: Star Infratech</span>
                </div>
                <button
                  onClick={loadDemoCase}
                  className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span>Launch Walkthrough</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Story Sequence: DETECT -> PRIORITIZE -> ASSIGN -> TRACK -> VERIFY */}
      <section className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
              THE END-TO-END PIPELINE
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              From Citizen Photo to Guaranteed Repair
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
            5 Automated Municipal Transitions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {stepsStory.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#090C16] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-slate-500">{st.step}</span>
                    <Icon className={`w-5 h-5 ${st.color}`} />
                  </div>
                  <h3 className="font-mono text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
                <div className="pt-3 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <span>Stage {st.step}</span>
                  {i < 4 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="space-y-6 text-left">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            INTELLIGENCE ARCHITECTURE
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How CivicPulse Powers Bengaluru
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            A unified pipeline transforming citizen reports and dashcam footage into prioritized, contractor-enforced public works.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Pothole Detection & Vision */}
          <div
            onClick={() => setCurrentView('REPORT')}
            className="group relative rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                1. Computer Vision Detection
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Citizens upload photos or dashcam videos. CivicPulse’s neural model extracts depth in centimeters, surface square meters, and asphalt edge degradation within 35ms.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <span>Try Citizen Reporter</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: God's Eye Geospatial */}
          <div
            onClick={() => setCurrentView('GODS_EYE')}
            className="group relative rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                2. God's Eye City Intelligence
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full geospatial surveillance of 198 BBMP wards. Monitors arterial corridors like Outer Ring Road, Silk Board, and Whitefield with live status feeds and severity heatmaps.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-2 text-xs font-semibold text-blue-400">
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Prioritization & Contractor Accountability */}
          <div
            onClick={() => setCurrentView('PRIORITY_QUEUE')}
            className="group relative rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                3. Priority & Contractor Accountability
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Problems are ranked by traffic volume and hospital proximity. CivicPulse checks Defect Liability clauses to force contractors to repair for free under warranty.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-2 text-xs font-semibold text-purple-400">
              <span>View Priority Queue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Live Priority Spotlight Section */}
      <section className="rounded-2xl bg-[#0B0E18] border border-white/10 p-6 lg:p-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              LIVE CIVIC THREAT LEVEL
            </div>
            <h3 className="text-xl font-bold text-white">Top Bengaluru Pothole Priority Queue</h3>
          </div>
          <button
            onClick={() => setCurrentView('PRIORITY_QUEUE')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>View All {incidents.length} Ranked Issues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {incidents.slice(0, 3).map((incident, idx) => (
            <div
              key={incident.id}
              onClick={() => selectIncidentById(incident.id, 'INCIDENT_DETAIL')}
              className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all group"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm flex-shrink-0
                  ${idx === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]' :
                    idx === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'}
                `}>
                  #{idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-100">{incident.code}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${incident.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                      {incident.severity}
                    </span>
                    {incident.isUnderWarranty && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 hidden sm:inline-block">
                        Contractor Warranty Active
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors mt-0.5">
                    {incident.roadName}
                  </h4>
                  <p className="text-xs text-slate-400">{incident.landmark}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-white/5 font-mono text-xs">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">AI PRIORITY SCORE</div>
                  <div className="text-base font-extrabold text-cyan-400">{incident.priorityDetails.overallScore}/100</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">DEPTH / VOL</div>
                  <div className="font-semibold text-slate-200">{incident.depthCm}cm / {incident.estimatedVolumeLiters}L</div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-slate-950 text-cyan-400 border border-cyan-500/30 font-bold transition-all text-xs">
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
