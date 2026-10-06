import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  Activity,
  Sliders,
  AlertTriangle,
  FileCheck,
  Crosshair,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PotholeIncident } from '../types';

export const PotholeIntelligencePage: React.FC = () => {
  const { incidents, selectedIncident, setSelectedIncident, selectIncidentById, addToast } = useApp();

  const currentIncident: PotholeIncident = selectedIncident || incidents[0];

  // Vision Layer Toggles
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showDepthHeatmap, setShowDepthHeatmap] = useState(true);
  const [showSegmentationMask, setShowSegmentationMask] = useState(false);
  const [showSensorFusion, setShowSensorFusion] = useState(true);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto text-left">
      {/* Editorial Header */}
      <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#17191c]/8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-[#f2f2f3] text-[#777b86] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Vision Lab · v4.2
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-[#fafafb] text-[#17191c] border border-[#17191c]/10">
                IRC-SP-100 Certified
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-[#fbe1d1] text-[#5d2a1a]">
                Stereo-3D Inference
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#17191c] tracking-tight">
              Pothole Vision &amp; <span className="italic">Sensor Fusion Engine</span>
            </h1>
            <p className="text-sm font-sans text-[#777b86] mt-2 max-w-2xl leading-relaxed">
              Volumetric crater photogrammetry, aggregate loss index, and multi-modal accelerometer telemetry for ticket <span className="font-mono text-[#17191c] font-semibold">{currentIncident.code}</span>.
            </p>
          </div>

          {/* Incident Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#777b86] uppercase tracking-wider">Ticket:</span>
            <div className="relative">
              <select
                value={currentIncident.id}
                onChange={(e) => {
                  const inc = incidents.find(i => i.id === e.target.value);
                  if (inc) {
                    setSelectedIncident(inc);
                    addToast(`Analyzing ${inc.code}`, inc.roadName, 'info');
                  }
                }}
                className="appearance-none rounded-full bg-[#fafafb] border border-[#17191c]/15 pl-4 pr-9 py-2 text-xs font-mono font-medium text-[#17191c] outline-none cursor-pointer hover:border-[#17191c] transition-colors"
              >
                {incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.code} — {inc.roadName.substring(0, 24)}... ({inc.severity})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#777b86] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Layer Control Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#777b86] uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#17191c]" />
            <span>Active Vision Layers:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBoundingBox(!showBoundingBox)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                showBoundingBox
                  ? 'bg-[#17191c] text-white shadow-sm'
                  : 'bg-transparent text-[#777b86] border border-[#17191c]/15 hover:text-[#17191c] hover:border-[#17191c]'
              }`}
            >
              Polygon Box
            </button>
            <button
              onClick={() => setShowDepthHeatmap(!showDepthHeatmap)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                showDepthHeatmap
                  ? 'bg-[#5d2a1a] text-[#fbe1d1] shadow-sm'
                  : 'bg-transparent text-[#777b86] border border-[#17191c]/15 hover:text-[#17191c] hover:border-[#17191c]'
              }`}
            >
              Depth Heatmap
            </button>
            <button
              onClick={() => setShowSegmentationMask(!showSegmentationMask)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                showSegmentationMask
                  ? 'bg-[#17191c] text-white shadow-sm'
                  : 'bg-transparent text-[#777b86] border border-[#17191c]/15 hover:text-[#17191c] hover:border-[#17191c]'
              }`}
            >
              Asphalt Mask
            </button>
            <button
              onClick={() => setShowSensorFusion(!showSensorFusion)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                showSensorFusion
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-transparent text-[#777b86] border border-[#17191c]/15 hover:text-[#17191c] hover:border-[#17191c]'
              }`}
            >
              IMU Gyro Telemetry
            </button>
          </div>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Interactive Computer Vision Canvas */}
        <div className="lg:col-span-7 space-y-6">
          {/* Vision Canvas Area */}
          <div className="relative rounded-[24px] bg-[#17191c] border border-[#17191c]/10 overflow-hidden h-96 sm:h-[480px] flex items-center justify-center shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)]">
            {/* Base Image */}
            <img
              src={currentIncident.images.original}
              alt="Raw road surface"
              className="w-full h-full object-cover"
            />

            {/* Depth Heatmap Filter Simulation */}
            {showDepthHeatmap && (
              <div className="absolute inset-0 bg-gradient-to-t from-[#5d2a1a]/40 via-[#fbe1d1]/30 to-transparent mix-blend-multiply pointer-events-none" />
            )}

            {/* Asphalt Segmentation Mask Simulation */}
            {showSegmentationMask && (
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/30 via-transparent to-[#5d2a1a]/25 mix-blend-color pointer-events-none" />
            )}

            {/* Scanning Line */}
            <div className="absolute left-0 right-0 h-0.5 bg-[#fbe1d1] pointer-events-none animate-pulse" style={{ top: '48%' }} />

            {/* Interactive Bounding Polygon Overlay */}
            {showBoundingBox && (
              <div
                className="absolute border border-white/80 bg-white/5 pointer-events-none transition-all duration-300 rounded-lg"
                style={{
                  top: '25%',
                  left: '26%',
                  width: '48%',
                  height: '50%'
                }}
              >
                {/* Floating Metrics Badge on Bounding Box */}
                <div className="absolute -top-9 left-0 bg-[#17191c]/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono flex items-center gap-2 shadow-sm border border-white/10">
                  <span className="text-[#fbe1d1]">Depth: {currentIncident.depthCm} cm</span>
                  <span className="opacity-40">|</span>
                  <span>Area: {currentIncident.surfaceAreaSqM} m²</span>
                </div>

                {/* Center Depth Stereopsis Pin */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border border-dashed border-white/70 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <Crosshair className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Canvas HUD Overlays */}
            <div className="absolute top-4 left-4 z-10 bg-[#17191c]/80 backdrop-blur-md px-3.5 py-2 rounded-xl font-mono text-[11px] text-white/90 space-y-0.5 border border-white/10">
              <div className="font-semibold">3840 x 2160 UHD</div>
              <div className="text-white/60">FOV 84° Stereoscopic</div>
              <div className="text-[#fbe1d1]">Inference: {currentIncident.aiMetrics.processingTimeMs} ms</div>
            </div>

            <div className="absolute bottom-4 right-4 z-10 bg-[#17191c]/80 backdrop-blur-md px-3.5 py-2 rounded-xl font-mono text-[11px] text-right space-y-0.5 border border-white/10 text-white/90">
              <div className="font-semibold">CIVICPULSE-RESNET-v4.2</div>
              <div className="text-emerald-400">Confidence: {(currentIncident.aiMetrics.modelConfidence * 100).toFixed(1)}%</div>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#17191c] text-[11px] font-mono font-medium shadow-sm">
                AI Detected
              </span>
            </div>
          </div>

          {/* Sensor Fusion Graph (IMU Accelerometer Z-axis spike) */}
          {showSensorFusion && (
            <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#17191c] font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#5d2a1a]" />
                  BMTC Bus Telemetry: Gyro Z-Axis Acceleration (m/s²)
                </span>
                <span className="px-3 py-1 rounded-full bg-[#fbe1d1] text-[#5d2a1a] text-[10px] font-mono font-semibold uppercase tracking-wider">
                  +3.4G Shock Spike
                </span>
              </div>

              {/* Minimalist Editorial Waveform SVG */}
              <div className="h-24 w-full bg-[#fafafb] rounded-2xl border border-[#17191c]/8 p-3 relative overflow-hidden flex items-center">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 100">
                  <path
                    d="M0,50 L40,51 L80,49 L120,52 L160,48 L200,53 L220,15 L235,92 L250,5 L265,85 L280,35 L300,52 L350,50 L400,49 L450,51 L500,50"
                    fill="none"
                    stroke="#17191c"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Threshold Line */}
                  <line x1="0" y1="25" x2="500" y2="25" stroke="#5d2a1a" strokeDasharray="3 3" strokeWidth="1.25" opacity="0.6" />
                </svg>
                <span className="absolute top-2 right-3 text-[10px] font-mono text-[#5d2a1a] bg-[#fbe1d1]/80 px-2 py-0.5 rounded-full">
                  Impact Threshold (2.5G)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 cols: Quantitative Diagnostics & Explainable AI */}
        <div className="lg:col-span-5 space-y-6">
          {/* Key Metrics Dashboard */}
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 space-y-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#17191c]/8">
              <h3 className="font-serif text-xl text-[#17191c] font-normal flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#777b86]" />
                <span>Extracted Structural Metrics</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-[#f2f2f3] text-[#777b86] font-mono text-[10px] uppercase tracking-wider">Audit Ready</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-4 bg-[#fafafb] rounded-2xl border border-[#17191c]/8">
                <div className="text-[10px] text-[#777b86] uppercase tracking-wider">Pothole Depth</div>
                <div className="text-2xl font-serif text-rose-700 mt-1">
                  {currentIncident.depthCm} cm
                </div>
                <div className="text-[10px] text-[#777b86] mt-1 font-sans">
                  IRC Limit: &lt;4.0 cm
                </div>
              </div>

              <div className="p-4 bg-[#fafafb] rounded-2xl border border-[#17191c]/8">
                <div className="text-[10px] text-[#777b86] uppercase tracking-wider">Crater Area</div>
                <div className="text-2xl font-serif text-[#17191c] mt-1">
                  {currentIncident.surfaceAreaSqM} m²
                </div>
                <div className="text-[10px] text-[#777b86] mt-1 font-sans">
                  Photogrammetry
                </div>
              </div>

              <div className="p-4 bg-[#fafafb] rounded-2xl border border-[#17191c]/8">
                <div className="text-[10px] text-[#777b86] uppercase tracking-wider">Bitumen Fill</div>
                <div className="text-2xl font-serif text-emerald-800 mt-1">
                  {currentIncident.estimatedVolumeLiters} L
                </div>
                <div className="text-[10px] text-[#777b86] mt-1 font-sans">
                  ~4-6 asphalt bags
                </div>
              </div>

              <div className="p-4 bg-[#fafafb] rounded-2xl border border-[#17191c]/8">
                <div className="text-[10px] text-[#777b86] uppercase tracking-wider">Decay Index</div>
                <div className="text-2xl font-serif text-[#17191c] mt-1">
                  {currentIncident.aiMetrics.asphaltDeteriorationIndex} / 100
                </div>
                <div className="text-[10px] text-[#777b86] mt-1 font-sans">
                  Severe aggregate loss
                </div>
              </div>
            </div>

            {/* Vehicle Damage Hazard Gauge */}
            <div className="p-5 bg-[#fafafb] rounded-2xl border border-[#17191c]/8 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-medium text-[#17191c] flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Vehicle Hazard Score
                </span>
                <span className="font-serif text-base text-rose-700">
                  {currentIncident.aiMetrics.vehicleDamageHazard} / 100
                </span>
              </div>
              <div className="w-full bg-[#f2f2f3] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentIncident.aiMetrics.vehicleDamageHazard}%` }}
                />
              </div>
              <p className="font-sans text-xs text-[#777b86] leading-relaxed">
                Critical hazard to two-wheelers and auto-rickshaws. High probability of rim bending or suspension rupture above 25 km/h.
              </p>
            </div>
          </div>

          {/* Explainable AI (XAI) Formula Breakdown */}
          <div className="rounded-[24px] bg-white border border-[#17191c]/8 p-6 space-y-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#17191c]/8">
              <h3 className="font-serif text-xl text-[#17191c] font-normal flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#777b86]" />
                <span>Priority Ledger Breakdown</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-[#f2f2f3] text-[#777b86] font-mono text-[10px] uppercase tracking-wider">Weighted</span>
            </div>

            <div className="p-4 bg-[#fafafb] rounded-2xl border border-[#17191c]/8 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#777b86]">Traffic Volume Impact (25%)</span>
                <span className="font-semibold text-[#17191c]">{currentIncident.priorityDetails.breakdown.trafficVolumeImpact}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#777b86]">Hospital/Emergency Route (20%)</span>
                <span className="font-semibold text-[#17191c]">{currentIncident.priorityDetails.breakdown.schoolHospitalProximity}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#777b86]">Depth &amp; Physical Severity (35%)</span>
                <span className="font-semibold text-rose-700">{currentIncident.priorityDetails.breakdown.depthRisk}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#777b86]">Monsoon Flooding Risk (15%)</span>
                <span className="font-semibold text-[#17191c]">{currentIncident.priorityDetails.breakdown.monsoonFloodingVulnerability}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#777b86]">Citizen Upvotes (5%)</span>
                <span className="font-semibold text-[#17191c]">{currentIncident.priorityDetails.breakdown.citizenUpvotesWeight}/100</span>
              </div>

              <div className="pt-3 border-t border-[#17191c]/8 flex items-center justify-between text-sm">
                <span className="font-serif text-base text-[#17191c]">Aggregate Priority</span>
                <span className="px-3 py-1 rounded-full bg-[#17191c] text-white font-mono text-xs font-semibold">
                  {currentIncident.priorityDetails.overallScore} / 100
                </span>
              </div>
            </div>

            <button
              onClick={() => selectIncidentById(currentIncident.id, 'INCIDENT_DETAIL')}
              className="w-full py-3 rounded-full bg-[#17191c] text-white hover:bg-[#2b2e33] text-xs font-sans font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Examine Incident Legal &amp; Contractor History</span>
              <FileCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
