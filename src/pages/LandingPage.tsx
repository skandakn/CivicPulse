import React from 'react';
import {
  ArrowRight,
  Eye,
  PlusCircle,
  Cpu,
  Building2,
  Radar,
  ShieldCheck,
  RotateCcw,
  Zap,
  TrendingUp,
  Search,
  Sparkles,
  ChevronRight,
  Check,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CITY_METRICS } from '../data/mockData';
import { formatINR } from '../utils/formatters';

export const LandingPage: React.FC = () => {
  const { setCurrentView, incidents, selectIncidentById, loadDemoCase, resetDemo } = useApp();

  const stepsStory = [
    { step: '01', title: 'Detect', desc: 'Stereoscopic depth & asphalt cracking scanned via citizen photo or video stream.', category: 'AI Vision' },
    { step: '02', title: 'Prioritize', desc: 'Traffic volume × hospital corridor × depth algorithmic ranking.', category: 'Risk Matrix' },
    { step: '03', title: 'Assign', desc: 'Clause 45.2 statutory defect liability zero-cost contractor mandate.', category: 'PWD Audit' },
    { step: '04', title: 'Track', desc: 'Live municipal Sahaya SLA sync with automated escalation ledger.', category: 'BBMP API' },
    { step: '05', title: 'Verify', desc: 'Post-repair computer vision audit verifying road surface smoothness.', category: 'AI Verification' }
  ];

  return (
    <div className="space-y-20 pb-24 text-left max-w-[1200px] mx-auto">
      {/* STEEP HERO SECTION: Editorial serif display on warm paper with floating product artifacts */}
      <section className="relative pt-6 sm:pt-12 pb-16 overflow-visible">
        {/* Top Badges / Tag line */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
          <span className="text-xs font-mono text-[#777b86] uppercase tracking-wider">
            Municipal Audit Ledger
          </span>
          <span className="text-[#a3a6af]">·</span>
          <span className="text-xs font-mono text-[#17191c] bg-[#f2f2f3] px-3 py-1 rounded-full">
            BBMP Sahaya 2.0 Connected
          </span>
          <span className="text-[#a3a6af]">·</span>
          <span className="text-xs font-mono text-[#5d2a1a] bg-[#fbe1d1] px-3 py-1 rounded-full">
            IRC-SP-100 Standard
          </span>
        </div>

        {/* Center Editorial Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-5 px-4">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-[76px] font-normal text-[#17191c] leading-[1.12] tracking-[-0.025em]">
            See the hazard. Hold contractors <em className="italic font-normal">strictly accountable</em>. Sanction repairs by risk.
          </h1>

          <p className="text-[#777b86] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Bengaluru’s editorial civic ledger. Merging computer vision road scanning, geospatial telemetry, 
            and Defect Liability Period (DLP) warranty enforcement to fix arterial corridors with total transparency.
          </p>

          {/* Pill Button Pair */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setCurrentView('PRIORITY_QUEUE')}
              className="bg-[#17191c] text-[#ffffff] hover:bg-black px-6 py-3 rounded-full text-sm font-medium transition-all shadow-[0_4px_16px_rgba(23,25,28,0.12)] cursor-pointer flex items-center gap-2"
            >
              <span>Open Approver Inbox</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={loadDemoCase}
              className="border border-[#17191c] bg-transparent text-[#17191c] hover:bg-[#fafafb] px-6 py-3 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-[#17191c]" />
              <span>1-Click Judge Demo</span>
            </button>

            <button
              onClick={() => setCurrentView('REPORT')}
              className="bg-[#f2f2f3] text-[#17191c] hover:bg-[#e8e8ea] px-5 py-3 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Pothole</span>
            </button>

            <button
              onClick={resetDemo}
              className="p-3 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition-all cursor-pointer"
              title="Reset application to seed state"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FLOATING PRODUCT ARTIFACT COLLAGE around Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 px-2">
          {/* Artifact 1: Stat & Line Chart */}
          <div className="steep-artifact p-6 rounded-[20px] bg-white border border-[#17191c]/8 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between text-xs text-[#777b86] mb-3">
              <span className="font-mono uppercase text-[11px] tracking-wider">Taxpayer Savings</span>
              <span className="text-[#5d2a1a] font-medium bg-[#fbe1d1] px-2 py-0.5 rounded-full text-[10px]">
                ↑ 5.5x vs last week
              </span>
            </div>
            <div className="text-3xl font-medium text-[#17191c] font-mono">
              {formatINR(CITY_METRICS.taxpayerSavingsINR)}
            </div>
            <div className="text-xs text-[#777b86] mt-1">
              Enforced under Clause 45.2 contractor warranty
            </div>
            {/* Gestural line chart in Sienna Brown (#5d2a1a) */}
            <div className="mt-5 h-12 flex items-end gap-1.5 pt-2 border-t border-[#17191c]/5">
              {[35, 45, 38, 55, 68, 62, 85, 92].map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-[#17191c] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${val}%`, backgroundColor: idx >= 6 ? '#5d2a1a' : '#17191c' }}
                />
              ))}
            </div>
          </div>

          {/* Artifact 2: Critical Telemetry Region Fragment */}
          <div className="steep-artifact p-6 rounded-[20px] bg-white border border-[#17191c]/8 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between text-xs text-[#777b86] mb-3">
              <span className="font-mono uppercase text-[11px] tracking-wider">Live Hazard Radar</span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#17191c]">
                <span className="w-2 h-2 rounded-full bg-[#17191c] animate-pulse"></span>
                Ward 150
              </span>
            </div>
            <div className="font-serif text-xl font-normal text-[#17191c]">
              Outer Ring Road (Bellandur)
            </div>
            <div className="text-xs text-[#777b86] mt-1 flex items-center gap-2 font-mono">
              <span>Depth: 15.4cm</span>
              <span>·</span>
              <span>Area: 1.48m²</span>
              <span>·</span>
              <span className="text-[#5d2a1a] font-medium">Score 94</span>
            </div>
            <div className="mt-4 pt-3 border-t border-[#17191c]/5 flex items-center justify-between text-xs">
              <span className="text-[#777b86]">Assigned: Star Infratech</span>
              <button
                onClick={() => selectIncidentById(incidents[0].id, 'INCIDENT_DETAIL')}
                className="text-[#17191c] font-medium hover:underline text-xs"
              >
                Inspect Dossier →
              </button>
            </div>
          </div>

          {/* Artifact 3: AI Precision & Speed */}
          <div className="steep-artifact p-6 rounded-[20px] bg-white border border-[#17191c]/8 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between text-xs text-[#777b86] mb-3">
              <span className="font-mono uppercase text-[11px] tracking-wider">Vision Audit Speed</span>
              <span className="text-xs font-mono text-[#17191c]">35ms In-Browser</span>
            </div>
            <div className="text-3xl font-medium text-[#17191c] font-mono">
              {CITY_METRICS.aiPrecisionRate}%
            </div>
            <div className="text-xs text-[#777b86] mt-1">
              Stereoscopic depth extraction precision
            </div>
            <div className="mt-5 pt-3 border-t border-[#17191c]/5 flex items-center justify-between text-xs text-[#777b86]">
              <span>Active Potholes: {CITY_METRICS.activePotholes.toLocaleString()}</span>
              <span className="text-[#5d2a1a] font-medium bg-[#fbe1d1] px-2 py-0.5 rounded-full text-[10px]">
                {CITY_METRICS.criticalIssues} Past SLA
              </span>
            </div>
          </div>
        </div>

        {/* AI Composer Input Fragment (Matching Steep Style Reference #4) */}
        <div className="max-w-[540px] mx-auto mt-10">
          <div className="bg-white border border-[#ececec] rounded-[16px] p-3 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#777b86] hover:bg-[#f2f2f3] cursor-pointer transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Ask anything about Bengaluru potholes, contractors, or SLA..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#17191c] placeholder-[#a3a6af]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') setCurrentView('PRIORITY_QUEUE');
              }}
            />
            <button
              onClick={() => setCurrentView('PRIORITY_QUEUE')}
              className="w-9 h-9 rounded-full bg-[#17191c] text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer shrink-0"
              title="Search and navigate"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[11px] text-[#a3a6af]">
              Try "Which contractor has the most pending warranty repairs?" or "Indiranagar 100ft road status"
            </span>
          </div>
        </div>
      </section>

      {/* STEEP SIGNATURE: Accent Peach Card (Once per page, Kraft paper editorial effect) */}
      <section className="steep-peach-card rounded-[24px] p-8 sm:p-12 border border-[#5d2a1a]/15 shadow-sm">
        <div className="max-w-3xl">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#5d2a1a]/70 font-semibold mb-3">
            Editorial Feature · Clause 45.2 Statutory Mandate
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#5d2a1a] font-normal leading-snug">
            "Public funds must never pay twice for asphalt that deteriorates before its statutory warranty expires."
          </h2>
          <p className="text-[#5d2a1a]/85 text-sm sm:text-base mt-4 leading-relaxed">
            CivicPulse automatically cross-references every detected road defect with BBMP tender ledger archives. 
            When a crater opens on a road paved within the past 24 months, the repair order is routed directly to the original contractor under Defect Liability, enforcing zero-cost reconstruction.
          </p>
          <div className="mt-6 flex items-center gap-4 text-xs font-mono text-[#5d2a1a]">
            <span className="font-semibold">— Bengaluru Municipal Audit Council, 2026</span>
            <span className="text-[#5d2a1a]/40">·</span>
            <span className="bg-[#ffffff]/50 px-2.5 py-1 rounded-full border border-[#5d2a1a]/20">
              ₹4.2 Cr Saved Year-to-Date
            </span>
          </div>
        </div>
      </section>

      {/* SECTION WITH ALTERNATING BACKGROUND (Fog White #fafafb): 5 Audit Stages */}
      <section className="rounded-[24px] bg-[#fafafb] p-8 sm:p-12 border border-[#17191c]/8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#17191c]/8 gap-4 mb-8">
          <div>
            <div className="text-[11px] font-mono text-[#979799] uppercase tracking-wider">
              End-to-End Pipeline
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#17191c] font-normal mt-1">
              From Citizen Photo to Enforced Work Order
            </h2>
          </div>
          <span className="text-xs font-mono bg-[#f2f2f3] text-[#17191c] px-3.5 py-1 rounded-full">
            5 Immutable Stages
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stepsStory.map((st, i) => (
            <div
              key={i}
              className="bg-white rounded-[20px] p-5 border border-[#17191c]/8 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-medium bg-[#f2f2f3] text-[#17191c] px-2 py-0.5 rounded-full">
                    {st.step}
                  </span>
                  <span className="text-[11px] font-mono text-[#979799]">
                    {st.category}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-normal text-[#17191c]">
                  {st.title}
                </h3>
                <p className="text-xs text-[#777b86] mt-2 leading-relaxed">
                  {st.desc}
                </p>
              </div>
              <div className="pt-4 border-t border-[#17191c]/5 mt-4 flex items-center justify-end">
                {i < 4 && <ChevronRight className="w-3.5 h-3.5 text-[#979799]" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 CORE PILLARS SECTION: Neutral Cards (Mist Gray #f2f2f3, 24px radius) */}
      <section className="space-y-6">
        <div>
          <div className="text-[11px] font-mono text-[#979799] uppercase tracking-wider">
            Subsystem Modules
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#17191c] font-normal mt-1">
            Engineered for Municipal Scale
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => setCurrentView('REPORT')}
            className="steep-card rounded-[24px] bg-[#f2f2f3] p-8 cursor-pointer flex flex-col justify-between hover:bg-[#e8e8ea] transition-all"
          >
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#979799]">01 · VISION LAB</span>
              <h3 className="font-serif text-2xl font-normal text-[#17191c]">
                Computer Vision Analysis
              </h3>
              <p className="text-xs text-[#777b86] leading-relaxed">
                Extracts depth in centimeters, surface square meters, volume in liters, and asphalt edge degradation within 35ms from any mobile photo or video stream.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-1.5 text-xs font-medium text-[#17191c]">
              <span>Test Vision Lab</span>
              <span>→</span>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('GODS_EYE')}
            className="steep-card rounded-[24px] bg-[#f2f2f3] p-8 cursor-pointer flex flex-col justify-between hover:bg-[#e8e8ea] transition-all"
          >
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#979799]">02 · GEOSPATIAL RADAR</span>
              <h3 className="font-serif text-2xl font-normal text-[#17191c]">
                God’s Eye City Radar
              </h3>
              <p className="text-xs text-[#777b86] leading-relaxed">
                Full geospatial surveillance across 198 BBMP wards. Monitors arterial transit corridors like Outer Ring Road, Silk Board, and Whitefield with live telemetry.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-1.5 text-xs font-medium text-[#17191c]">
              <span>Open Geospatial Radar</span>
              <span>→</span>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('PRIORITY_QUEUE')}
            className="steep-card rounded-[24px] bg-[#f2f2f3] p-8 cursor-pointer flex flex-col justify-between hover:bg-[#e8e8ea] transition-all"
          >
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#979799]">03 · DISPATCH LEDGER</span>
              <h3 className="font-serif text-2xl font-normal text-[#17191c]">
                Work Order Dispatcher
              </h3>
              <p className="text-xs text-[#777b86] leading-relaxed">
                Algorithmic ranking by ambulance corridors and traffic density. Automatically audits Defect Liability clauses to enforce contractor rework under warranty.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-1.5 text-xs font-medium text-[#17191c]">
              <span>View Approver Inbox</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </section>

      {/* TOP DISPATCH QUEUE: Clean White Table Card */}
      <section className="rounded-[24px] bg-white border border-[#17191c]/8 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#17191c]/8 gap-4 mb-6">
          <div>
            <div className="text-[11px] font-mono text-[#5d2a1a] uppercase tracking-wider font-medium">
              Live BBMP Hazards · Top Priority Dossiers
            </div>
            <h3 className="font-serif text-2xl text-[#17191c] font-normal mt-1">
              Immediate Action Queue
            </h3>
          </div>
          <button
            onClick={() => setCurrentView('PRIORITY_QUEUE')}
            className="text-xs text-[#17191c] hover:text-[#5d2a1a] transition-colors cursor-pointer flex items-center gap-1 font-medium"
          >
            <span>Open Complete Inbox ({incidents.length})</span>
            <span>→</span>
          </button>
        </div>

        <div className="space-y-3">
          {incidents.slice(0, 3).map((incident, idx) => (
            <div
              key={incident.id}
              onClick={() => selectIncidentById(incident.id, 'INCIDENT_DETAIL')}
              className="p-5 rounded-[20px] bg-[#fafafb] hover:bg-[#f2f2f3] border border-[#17191c]/5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white border border-[#17191c]/10 flex items-center justify-center font-mono text-xs font-medium text-[#17191c] shrink-0">
                  {idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-[#777b86]">
                      WO-2026-{incident.code.replace('BLR-', '')}
                    </span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      incident.severity === 'CRITICAL' ? 'bg-[#fbe1d1] text-[#5d2a1a]' : 'bg-[#f2f2f3] text-[#17191c]'
                    }`}>
                      {incident.severity}
                    </span>
                    {incident.isUnderWarranty && (
                      <span className="text-[11px] font-mono bg-[#ffffff] text-[#17191c] px-2 py-0.5 rounded-full border border-[#17191c]/10">
                        DLP Warranty
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif text-lg font-normal text-[#17191c] mt-1">
                    {incident.roadName}
                  </h4>
                  <p className="text-xs text-[#777b86]">
                    {incident.landmark} · Ward {incident.wardNumber} ({incident.zone})
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 font-mono text-xs border-t md:border-t-0 pt-3 md:pt-0 border-[#17191c]/5">
                <div className="text-right">
                  <span className="text-[10px] text-[#979799] block">Risk Score</span>
                  <span className="text-sm font-medium text-[#17191c]">
                    {incident.priorityDetails.overallScore}/100
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#979799] block">Dimensions</span>
                  <span className="text-sm text-[#777b86]">
                    {incident.depthCm}cm · {incident.surfaceAreaSqM}m²
                  </span>
                </div>
                <button className="px-4 py-2 rounded-full bg-[#17191c] text-white text-xs font-medium hover:bg-black transition-colors cursor-pointer">
                  Inspect →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

