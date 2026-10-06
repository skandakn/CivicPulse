import React from 'react';
import {
  ArrowRight,
  Eye,
  PlusCircle,
  Cpu,
  Building2,
  Radar,
  Flame,
  ShieldCheck,
  RotateCcw,
  Zap,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CITY_METRICS } from '../data/mockData';
import { formatINR } from '../utils/formatters';

export const LandingPage: React.FC = () => {
  const { setCurrentView, incidents, selectIncidentById, loadDemoCase, resetDemo } = useApp();

  const stepsStory = [
    { step: '01', title: 'DETECT', desc: 'Stereoscopic depth & asphalt cracking via citizen photo/video', icon: Cpu, badge: 'AI VISION' },
    { step: '02', title: 'PRIORITIZE', desc: 'Traffic volume × hospital corridor × depth algorithmic ranking', icon: Flame, badge: 'RISK SCORE' },
    { step: '03', title: 'ASSIGN', desc: 'Clause 45.2 Defect Liability zero-cost contractor mandate', icon: Building2, badge: 'PWD DLP' },
    { step: '04', title: 'TRACK', desc: 'Live BBMP Sahaya SLA sync with automated escalation daemon', icon: Clock, badge: 'BBMP API' },
    { step: '05', title: 'VERIFY', desc: 'Post-repair computer vision audit verifying surface smoothness', icon: ShieldCheck, badge: 'AI AUDIT' }
  ];

  return (
    <div className="space-y-8 pb-16 text-left">
      {/* Approva Hero Section */}
      <section className="brut-lg bg-white p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="tag bg-[#2E8C42] text-white">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                AUDIT SYSTEM v2.4
              </span>
              <span className="tag bg-[#CFE8D6] text-[#121210]">
                BBMP SAHAYA 2.0 CONNECTED
              </span>
              <span className="tag bg-[#E8A030] text-[#121210]">
                IRC-SP-100 SPEC
              </span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#121210] leading-[1.05] tracking-tight">
              See the hazard. <br />
              <span className="bg-[#CFE8D6] px-2 py-0.5 border-2 border-[#121210] inline-block my-1 shadow-[3px_3px_0_#121210]">
                Hold contractors accountable.
              </span> <br />
              Sanction repairs by risk.
            </h1>

            <p className="font-body text-base sm:text-lg text-[#121210]/80 max-w-2xl leading-relaxed">
              Bengaluru’s municipal approval and pothole intelligence ledger. Merging computer vision road scanning, 
              geospatial telemetry, and Defect Liability Period (DLP) warranty enforcement to fix hazardous corridors before accidents happen.
            </p>

            {/* Brutalist CTAs matching Approva */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentView('SCROLL_WORLD')}
                className="brut bg-[#2E8C42] text-white hover:bg-[#257336] px-6 py-3 font-display font-extrabold text-sm sm:text-base btn-press cursor-pointer flex items-center gap-2 shadow-[4px_4px_0_0_#121210]"
              >
                <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
                <span>⚡ 3D SCROLL WORLD</span>
              </button>

              <button
                onClick={loadDemoCase}
                className="brut bg-[#E8A030] text-[#121210] hover:bg-[#d99020] px-6 py-3 font-display font-extrabold text-sm sm:text-base btn-press cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-[#121210]" />
                <span>1-CLICK JUDGE DEMO</span>
              </button>

              <button
                onClick={() => setCurrentView('PRIORITY_QUEUE')}
                className="brut bg-[#121210] text-white hover:bg-zinc-800 px-5 py-3 font-display font-extrabold text-sm sm:text-base btn-press cursor-pointer flex items-center gap-2"
              >
                <span>OPEN APPROVER INBOX</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentView('REPORT')}
                className="brut bg-[#CFE8D6] text-[#121210] hover:bg-[#bfe0ca] px-4 py-3 font-display font-bold text-sm btn-press cursor-pointer flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>REPORT POTHOLE</span>
              </button>

              <button
                onClick={resetDemo}
                className="brut-sm bg-white hover:bg-zinc-100 p-3 font-mono text-xs cursor-pointer"
                title="Reset application to initial clean seed state"
              >
                <RotateCcw className="w-4 h-4 text-[#121210]" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t-[3px] border-[#121210]">
              <div className="brut bg-[#CFE8D6]/40 p-2.5">
                <div className="text-xl sm:text-2xl font-extrabold text-[#121210] font-mono">
                  {CITY_METRICS.activePotholes.toLocaleString()}
                </div>
                <div className="text-[10px] font-mono text-[#121210]/70 font-bold uppercase">
                  ACTIVE POTHOLES
                </div>
              </div>

              <div className="brut bg-[#C03A3A] text-white p-2.5">
                <div className="text-xl sm:text-2xl font-extrabold font-mono flex items-center gap-1">
                  <span>{CITY_METRICS.criticalIssues}</span>
                  <span className="text-[10px] uppercase font-bold bg-white text-[#C03A3A] px-1">SLA!</span>
                </div>
                <div className="text-[10px] font-mono text-white/80 font-bold uppercase">
                  PAST 24H SLA
                </div>
              </div>

              <div className="brut bg-[#2E8C42] text-white p-2.5">
                <div className="text-xl sm:text-2xl font-extrabold font-mono">
                  {formatINR(CITY_METRICS.taxpayerSavingsINR)}
                </div>
                <div className="text-[10px] font-mono text-white/80 font-bold uppercase">
                  WARRANTY SAVED
                </div>
              </div>

              <div className="brut bg-white p-2.5">
                <div className="text-xl sm:text-2xl font-extrabold text-[#121210] font-mono">
                  {CITY_METRICS.aiPrecisionRate}%
                </div>
                <div className="text-[10px] font-mono text-[#121210]/70 font-bold uppercase">
                  AUDIT PRECISION
                </div>
              </div>
            </div>
          </div>

          {/* Right Product Visualization matching Approva brutalist card */}
          <div className="lg:col-span-5">
            <div className="brut bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#121210] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#2E8C42] brut-sm flex items-center justify-center text-white">
                    <Radar className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-sm text-[#121210]">
                      BENGALURU AI RADAR
                    </div>
                    <div className="font-mono text-[9px] text-[#121210]/60">
                      LIVE CORRIDOR TELEMETRY
                    </div>
                  </div>
                </div>
                <span className="stamp text-[#2E8C42] text-[10px]" style={{ transform: 'rotate(-2deg)' }}>
                  VERIFIED
                </span>
              </div>

              {/* Target Graphic Frame */}
              <div className="polka border-2 border-[#121210] bg-[#CFE8D6]/30 p-4 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                  <span className="bg-white border border-[#121210] px-1.5 py-0.5">
                    12.9298° N · 77.6835° E
                  </span>
                  <span className="bg-[#C03A3A] text-white border border-[#121210] px-1.5 py-0.5">
                    CRITICAL #1 · SCORE 94/100
                  </span>
                </div>

                <div className="brut bg-white p-4 text-center my-2">
                  <div className="font-mono font-extrabold text-xl text-[#C03A3A]">
                    DEPTH: 15.4 CM
                  </div>
                  <div className="text-xs font-mono font-bold text-[#121210] mt-0.5">
                    SURFACE: 1.48 m² · EST. FILL: 38.5 L
                  </div>
                  <div className="text-xs font-display font-bold text-[#121210] mt-2">
                    Outer Ring Road (Bellandur)
                  </div>
                  <div className="text-[10px] font-mono text-[#121210]/60">
                    High-Traffic Ambulance Corridor · Ward 150
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
                  <div className="border border-[#121210] bg-white p-1">
                    <span className="text-[#121210]/60 block">CONTRACTOR</span>
                    <span className="font-bold">Star Infratech</span>
                  </div>
                  <div className="border border-[#121210] bg-white p-1">
                    <span className="text-[#121210]/60 block">WARRANTY</span>
                    <span className="font-bold text-[#2E8C42]">DLP ACTIVE</span>
                  </div>
                  <div className="border border-[#121210] bg-white p-1">
                    <span className="text-[#121210]/60 block">EST. BUDGET</span>
                    <span className="font-bold">₹48,920</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => selectIncidentById(incidents[0].id, 'INCIDENT_DETAIL')}
                className="w-full brut bg-[#121210] text-white hover:bg-zinc-800 py-2.5 font-display font-extrabold text-xs btn-press cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>OPEN INVESTIGATION DOSSIER</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Story Sequence: DETECT -> PRIORITIZE -> ASSIGN -> TRACK -> VERIFY */}
      <section className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b-[3px] border-[#121210] pb-2">
          <div>
            <div className="text-[10px] font-mono font-bold text-[#121210]/60 uppercase tracking-widest">
              END-TO-END CIVIC PIPELINE
            </div>
            <h2 className="text-2xl font-display font-extrabold text-[#121210]">
              From Citizen Photo to Enforced Work Order
            </h2>
          </div>
          <span className="tag bg-[#CFE8D6] hidden sm:inline-flex">
            5 AUDIT STAGES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {stepsStory.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="brut-card p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-extrabold bg-[#121210] text-white px-2 py-0.5">
                      {st.step}
                    </span>
                    <Icon className="w-5 h-5 text-[#121210] stroke-[2.5]" />
                  </div>
                  <h3 className="font-display text-base font-extrabold text-[#121210]">
                    {st.title}
                  </h3>
                  <p className="text-xs font-body text-[#121210]/80 mt-1 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
                <div className="pt-3 border-t-2 border-[#121210]/15 mt-3 flex items-center justify-between">
                  <span className="font-mono text-[9px] font-bold text-[#121210]/60">
                    {st.badge}
                  </span>
                  {i < 4 && <ArrowRight className="w-3 h-3 text-[#121210]" />}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="space-y-4 text-left">
        <div className="border-b-[3px] border-[#121210] pb-2">
          <div className="text-[10px] font-mono font-bold text-[#121210]/60 uppercase tracking-widest">
            ENGINEERING SPECIFICATION
          </div>
          <h2 className="text-2xl font-display font-extrabold text-[#121210]">
            CivicPulse Subsystem Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={() => setCurrentView('REPORT')}
            className="brut-card p-6 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#CFE8D6] border-2 border-[#121210] flex items-center justify-center text-[#121210]">
                <Cpu className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#121210]">
                1. Computer Vision Lab
              </h3>
              <p className="text-xs text-[#121210]/80 leading-relaxed font-body">
                Extracts depth in centimeters, surface square meters, volume in liters, and asphalt edge degradation within 35ms from any mobile photo or video.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 font-display font-bold text-xs text-[#121210] underline">
              <span>Test Vision Lab →</span>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('GODS_EYE')}
            className="brut-card p-6 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#E8A030] border-2 border-[#121210] flex items-center justify-center text-[#121210]">
                <Eye className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#121210]">
                2. God’s Eye City Radar
              </h3>
              <p className="text-xs text-[#121210]/80 leading-relaxed font-body">
                Full geospatial surveillance across 198 BBMP wards. Monitors arterial corridors like Outer Ring Road, Silk Board, and Whitefield with live status feeds.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 font-display font-bold text-xs text-[#121210] underline">
              <span>Open Geospatial Radar →</span>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('PRIORITY_QUEUE')}
            className="brut-card p-6 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#2E8C42] border-2 border-[#121210] flex items-center justify-center text-white">
                <Building2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#121210]">
                3. Work Order Dispatcher
              </h3>
              <p className="text-xs text-[#121210]/80 leading-relaxed font-body">
                Algorithmic ranking by ambulance routes and transit volume. Auto-audits Defect Liability clauses to force zero-cost contractor rework under warranty.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 font-display font-bold text-xs text-[#121210] underline">
              <span>View Approver Inbox →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Priority Spotlight Section */}
      <section className="brut bg-white p-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[3px] border-[#121210] pb-3 mb-4">
          <div>
            <div className="text-[10px] font-mono font-bold text-[#C03A3A] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#C03A3A] border border-[#121210]" />
              TOP DISPATCH QUEUE · LIVE BBMP HAZARDS
            </div>
            <h3 className="text-xl font-display font-extrabold text-[#121210]">
              Immediate Action Dossiers
            </h3>
          </div>
          <button
            onClick={() => setCurrentView('PRIORITY_QUEUE')}
            className="brut-sm bg-white hover:bg-zinc-100 px-3 py-1.5 font-display font-extrabold text-xs text-[#121210] cursor-pointer"
          >
            OPEN COMPLETE INBOX ({incidents.length}) →
          </button>
        </div>

        <div className="space-y-3">
          {incidents.slice(0, 3).map((incident, idx) => (
            <div
              key={incident.id}
              onClick={() => selectIncidentById(incident.id, 'INCIDENT_DETAIL')}
              className="p-4 border-2 border-[#121210] bg-[#CFE8D6]/30 hover:bg-[#CFE8D6] flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 border-2 border-[#121210] flex items-center justify-center font-mono font-extrabold text-sm shrink-0 ${
                  idx === 0 ? 'bg-[#C03A3A] text-white' :
                  idx === 1 ? 'bg-[#E8A030] text-[#121210]' :
                  'bg-white text-[#121210]'
                }`}>
                  #{idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#121210]">
                      WO-2026-{incident.code.replace('BLR-', '')}
                    </span>
                    <span className={`tag ${incident.severity === 'CRITICAL' ? 'bg-[#C03A3A] text-white' : 'bg-[#E8A030] text-[#121210]'}`}>
                      {incident.severity}
                    </span>
                    {incident.isUnderWarranty && (
                      <span className="tag bg-[#2E8C42] text-white">
                        DLP WARRANTY
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-extrabold text-base text-[#121210] mt-1">
                    {incident.roadName}
                  </h4>
                  <p className="text-xs font-body text-[#121210]/70">
                    {incident.landmark} · Ward {incident.wardNumber} ({incident.zone})
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 font-mono text-xs border-t md:border-t-0 pt-2 md:pt-0 border-[#121210]/20">
                <div className="text-right">
                  <span className="text-[10px] text-[#121210]/60 block font-bold">RISK SCORE</span>
                  <span className="font-extrabold text-base text-[#121210]">
                    {incident.priorityDetails.overallScore}/100
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#121210]/60 block font-bold">DIMENSIONS</span>
                  <span className="font-bold text-[#121210]">
                    {incident.depthCm}cm · {incident.surfaceAreaSqM}m²
                  </span>
                </div>
                <button className="brut-sm bg-[#121210] text-white px-3 py-1 font-display font-bold text-xs hover:bg-zinc-800 cursor-pointer">
                  INSPECT
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
