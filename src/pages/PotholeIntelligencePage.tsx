import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  Activity,
  Sliders,
  AlertTriangle,
  FileCheck
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
    <div className="space-y-8 pb-16 max-w-7xl mx-auto text-left animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>NEURAL COMPUTER VISION LAB • v4.2</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Pothole Intelligence & Sensor Fusion
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Extracting 3D geometry, structural asphalt degradation, and multi-modal accelerometer signals for {currentIncident.code}.
          </p>
        </div>

        {/* Incident Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Select Incident:</span>
          <select
            value={currentIncident.id}
            onChange={(e) => {
              const inc = incidents.find(i => i.id === e.target.value);
              if (inc) {
                setSelectedIncident(inc);
                addToast(`Analyzing ${inc.code}`, inc.roadName, 'info');
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-[#0E121B] border border-white/15 text-xs font-mono text-cyan-400 font-bold outline-none cursor-pointer"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id} className="bg-[#0A0D16] text-slate-200">
                {inc.code} — {inc.roadName.substring(0, 30)}... ({inc.severity})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Interactive Computer Vision Canvas */}
        <div className="lg:col-span-7 space-y-4">
          {/* Overlay Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#090C16] border border-white/10 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>ACTIVE VISION LAYERS:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowBoundingBox(!showBoundingBox)}
                className={`px-2.5 py-1 rounded-md transition-all ${showBoundingBox ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'bg-white/5 text-slate-400'}`}
              >
                Polygon Box
              </button>
              <button
                onClick={() => setShowDepthHeatmap(!showDepthHeatmap)}
                className={`px-2.5 py-1 rounded-md transition-all ${showDepthHeatmap ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-white/5 text-slate-400'}`}
              >
                Depth Heatmap
              </button>
              <button
                onClick={() => setShowSegmentationMask(!showSegmentationMask)}
                className={`px-2.5 py-1 rounded-md transition-all ${showSegmentationMask ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-white/5 text-slate-400'}`}
              >
                Asphalt Mask
              </button>
              <button
                onClick={() => setShowSensorFusion(!showSensorFusion)}
                className={`px-2.5 py-1 rounded-md transition-all ${showSensorFusion ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-white/5 text-slate-400'}`}
              >
                Sensor IMU
              </button>
            </div>
          </div>

          {/* Vision Canvas Area */}
          <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black h-96 sm:h-[460px] shadow-2xl flex items-center justify-center">
            {/* Base Image */}
            <img
              src={currentIncident.images.original}
              alt="Raw road surface"
              className="w-full h-full object-cover opacity-85"
            />

            {/* Depth Heatmap Filter Simulation */}
            {showDepthHeatmap && (
              <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 via-amber-500/20 to-transparent mix-blend-overlay pointer-events-none" />
            )}

            {/* Asphalt Segmentation Mask Simulation */}
            {showSegmentationMask && (
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/25 via-transparent to-cyan-500/20 mix-blend-color pointer-events-none" />
            )}

            {/* Scanning Line */}
            <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_20px_#00F0FF] animate-pulse" style={{ top: '48%' }} />

            {/* Interactive Bounding Polygon Overlay */}
            {showBoundingBox && (
              <div
                className="absolute border-2 border-red-500/80 bg-red-500/10 rounded-xl pointer-events-none transition-all duration-300 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                style={{
                  top: '25%',
                  left: '28%',
                  width: '44%',
                  height: '50%'
                }}
              >
                {/* Corner reticles */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-white" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-white" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-white" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-white" />

                {/* Floating Metrics Badge on Bounding Box */}
                <div className="absolute -top-8 left-0 bg-[#070912]/90 backdrop-blur-md border border-red-500/60 px-2 py-0.5 rounded text-[11px] font-mono text-red-400 font-bold flex items-center gap-1.5 shadow-lg">
                  <span>POTHOLE DEPTH: {currentIncident.depthCm} cm</span>
                  <span className="text-white">|</span>
                  <span className="text-cyan-400">AREA: {currentIncident.surfaceAreaSqM} m²</span>
                </div>

                {/* Center Depth Stereopsis Pin */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border border-dashed border-red-400 flex items-center justify-center animate-spin" style={{ animationDuration: '8s' }}>
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#EF4444]" />
                  </div>
                </div>
              </div>
            )}

            {/* Canvas HUD Overlays */}
            <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md p-2 rounded-lg border border-white/10 font-mono text-[10px] text-slate-300 space-y-0.5">
              <div>RESOLUTION: 3840 x 2160 UHD</div>
              <div>STEREOSCOPIC FOV: 84°</div>
              <div className="text-emerald-400">INFERENCE LATENCY: {currentIncident.aiMetrics.processingTimeMs} ms</div>
            </div>

            <div className="absolute bottom-4 right-4 z-10 bg-black/70 backdrop-blur-md p-2 rounded-lg border border-white/10 font-mono text-[10px] text-slate-300 text-right space-y-0.5">
              <div className="text-cyan-400 font-bold">MODEL: CIVICPULSE-RESNET-ROAD-v4.2</div>
              <div>CONFIDENCE: {(currentIncident.aiMetrics.modelConfidence * 100).toFixed(1)}%</div>
            </div>
          </div>

          {/* Sensor Fusion Graph (IMU Accelerometer Z-axis spike) */}
          {showSensorFusion && (
            <div className="p-4 rounded-2xl bg-[#090C16] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Sensor Fusion: Smartphone & Bus Gyro Z-Axis Acceleration (m/s²)
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  SHOCKWAVE VERIFIED (+3.4G SPIKE)
                </span>
              </div>

              {/* Simulated Waveform SVG */}
              <div className="h-20 w-full bg-[#06080F] rounded-xl p-2 border border-white/5 relative overflow-hidden flex items-center">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 100">
                  <path
                    d="M0,50 L40,51 L80,49 L120,52 L160,48 L200,53 L220,15 L235,92 L250,5 L265,85 L280,35 L300,52 L350,50 L400,49 L450,51 L500,50"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                  />
                  {/* Threshold Line */}
                  <line x1="0" y1="25" x2="500" y2="25" stroke="rgba(239, 68, 68, 0.4)" strokeDasharray="4" strokeWidth="1" />
                </svg>
                <span className="absolute top-2 right-2 text-[9px] font-mono text-red-400">
                  CRITICAL IMPACT THRESHOLD (2.5G)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 cols: Quantitative Diagnostics & Explainable AI */}
        <div className="lg:col-span-5 space-y-6">
          {/* Key Metrics Dashboard */}
          <div className="rounded-2xl border border-white/10 bg-[#090C16] p-5 space-y-4">
            <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Extracted Structural Metrics</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-slate-500">POTHOLE DEPTH</div>
                <div className="text-xl font-extrabold text-red-400 mt-0.5">
                  {currentIncident.depthCm} cm
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  IRC Standard Limit: &lt;4.0 cm
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-slate-500">SURFACE CRATER AREA</div>
                <div className="text-xl font-extrabold text-slate-100 mt-0.5">
                  {currentIncident.surfaceAreaSqM} m²
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Calculated from 3D cloud
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-slate-500">ESTIMATED BITUMEN FILL</div>
                <div className="text-xl font-extrabold text-cyan-400 mt-0.5">
                  {currentIncident.estimatedVolumeLiters} Liters
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Approx. 4-6 asphalt bags
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-slate-500">ASPHALT DECAY INDEX</div>
                <div className="text-xl font-extrabold text-purple-400 mt-0.5">
                  {currentIncident.aiMetrics.asphaltDeteriorationIndex} / 100
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Edge aggregate loss severe
                </div>
              </div>
            </div>

            {/* Vehicle Damage Hazard Gauge */}
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-red-300 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Vehicle Damage & Accident Hazard
                </span>
                <span className="text-red-400 font-extrabold">
                  {currentIncident.aiMetrics.vehicleDamageHazard} / 100
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#EF4444]"
                  style={{ width: `${currentIncident.aiMetrics.vehicleDamageHazard}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                High hazard to two-wheelers and auto-rickshaws. High probability of rim bending or suspension rupture above 25 km/h.
              </p>
            </div>
          </div>

          {/* Explainable AI (XAI) Formula Breakdown */}
          <div className="rounded-2xl border border-white/10 bg-[#090C16] p-5 space-y-3">
            <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Priority Score Algorithm Breakdown</span>
            </h3>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Traffic Volume Impact (25%)</span>
                <span className="text-cyan-400 font-bold">{currentIncident.priorityDetails.breakdown.trafficVolumeImpact}/100</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Hospital/Emergency Route (20%)</span>
                <span className="text-cyan-400 font-bold">{currentIncident.priorityDetails.breakdown.schoolHospitalProximity}/100</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Depth & Physical Severity (35%)</span>
                <span className="text-cyan-400 font-bold">{currentIncident.priorityDetails.breakdown.depthRisk}/100</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Monsoon Waterlogging Risk (15%)</span>
                <span className="text-cyan-400 font-bold">{currentIncident.priorityDetails.breakdown.monsoonFloodingVulnerability}/100</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Citizen Community Upvotes (5%)</span>
                <span className="text-cyan-400 font-bold">{currentIncident.priorityDetails.breakdown.citizenUpvotesWeight}/100</span>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm font-bold">
                <span className="text-white">AGGREGATE AI PRIORITY</span>
                <span className="text-cyan-400 text-base">{currentIncident.priorityDetails.overallScore} / 100</span>
              </div>
            </div>

            <button
              onClick={() => selectIncidentById(currentIncident.id, 'INCIDENT_DETAIL')}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Examine Incident Legal & Contractor History</span>
              <FileCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
