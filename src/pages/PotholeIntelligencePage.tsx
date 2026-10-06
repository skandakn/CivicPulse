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
  Maximize2
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
    <div className="space-y-6 pb-16 max-w-7xl mx-auto text-left">
      {/* Approva-Style Header Bar */}
      <div className="bg-white brut p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="tag bg-[#CFE8D6] text-[#121210] font-mono font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              VISION LAB · v4.2
            </span>
            <span className="tag bg-white font-mono text-xs">
              IRC-SP-100 CERTIFIED
            </span>
            <span className="tag bg-[#E8A030] text-[#121210] font-mono text-xs font-bold">
              STEREO-3D INFERENCE
            </span>
          </div>
          <h1 className="font-display text-3xl font-black text-[#121210] tracking-tight">
            Pothole Vision & Sensor Fusion Engine
          </h1>
          <p className="font-body text-sm text-[#4A4A46] mt-1">
            Volumetric crater photogrammetry, aggregate loss index, and multi-modal accelerometer telemetry for ticket <span className="font-mono font-bold text-[#121210]">{currentIncident.code}</span>.
          </p>
        </div>

        {/* Incident Selector */}
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs font-bold text-[#121210] uppercase">Ticket:</div>
          <select
            value={currentIncident.id}
            onChange={(e) => {
              const inc = incidents.find(i => i.id === e.target.value);
              if (inc) {
                setSelectedIncident(inc);
                addToast(`Analyzing ${inc.code}`, inc.roadName, 'info');
              }
            }}
            className="px-3 py-2 bg-white brut font-mono text-xs font-bold text-[#121210] outline-none cursor-pointer focus:bg-[#CFE8D6]"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.code} — {inc.roadName.substring(0, 24)}... ({inc.severity})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Interactive Computer Vision Canvas */}
        <div className="lg:col-span-7 space-y-4">
          {/* Layer Control Bar */}
          <div className="bg-white brut p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#121210]">
              <Layers className="w-4 h-4 text-[#2E8C42]" />
              <span>ACTIVE VISION LAYERS:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowBoundingBox(!showBoundingBox)}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
                  showBoundingBox
                    ? 'bg-[#121210] text-[#CFE8D6] brut-sm'
                    : 'bg-[#CFE8D6] text-[#121210] border-2 border-[#121210]'
                }`}
              >
                Polygon Box
              </button>
              <button
                onClick={() => setShowDepthHeatmap(!showDepthHeatmap)}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
                  showDepthHeatmap
                    ? 'bg-[#C03A3A] text-white brut-sm'
                    : 'bg-[#CFE8D6] text-[#121210] border-2 border-[#121210]'
                }`}
              >
                Depth Heatmap
              </button>
              <button
                onClick={() => setShowSegmentationMask(!showSegmentationMask)}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
                  showSegmentationMask
                    ? 'bg-[#E8A030] text-[#121210] brut-sm'
                    : 'bg-[#CFE8D6] text-[#121210] border-2 border-[#121210]'
                }`}
              >
                Asphalt Mask
              </button>
              <button
                onClick={() => setShowSensorFusion(!showSensorFusion)}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
                  showSensorFusion
                    ? 'bg-[#2E8C42] text-white brut-sm'
                    : 'bg-[#CFE8D6] text-[#121210] border-2 border-[#121210]'
                }`}
              >
                IMU Gyro
              </button>
            </div>
          </div>

          {/* Vision Canvas Area */}
          <div className="relative bg-white brut overflow-hidden h-96 sm:h-[460px] flex items-center justify-center">
            {/* Base Image */}
            <img
              src={currentIncident.images.original}
              alt="Raw road surface"
              className="w-full h-full object-cover"
            />

            {/* Depth Heatmap Filter Simulation */}
            {showDepthHeatmap && (
              <div className="absolute inset-0 bg-gradient-to-t from-[#C03A3A]/40 via-[#E8A030]/25 to-transparent mix-blend-multiply pointer-events-none" />
            )}

            {/* Asphalt Segmentation Mask Simulation */}
            {showSegmentationMask && (
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2E8C42]/30 via-transparent to-[#E8A030]/30 mix-blend-color pointer-events-none" />
            )}

            {/* Scanning Line */}
            <div className="absolute left-0 right-0 h-1 bg-[#2E8C42] border-y border-[#121210] pointer-events-none animate-pulse" style={{ top: '48%' }} />

            {/* Interactive Bounding Polygon Overlay */}
            {showBoundingBox && (
              <div
                className="absolute border-4 border-[#C03A3A] bg-[#C03A3A]/10 pointer-events-none transition-all duration-300 shadow-[6px_6px_0_#121210]"
                style={{
                  top: '25%',
                  left: '26%',
                  width: '48%',
                  height: '50%'
                }}
              >
                {/* Reticle Marks */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#121210] border-2 border-white" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#121210] border-2 border-white" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#121210] border-2 border-white" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#121210] border-2 border-white" />

                {/* Floating Metrics Badge on Bounding Box */}
                <div className="absolute -top-10 left-0 bg-[#121210] text-white border-2 border-black px-2.5 py-1 text-xs font-mono font-bold flex items-center gap-2 shadow-[2px_2px_0_#C03A3A]">
                  <span className="text-[#CFE8D6]">DEPTH: {currentIncident.depthCm} cm</span>
                  <span>|</span>
                  <span className="text-[#E8A030]">AREA: {currentIncident.surfaceAreaSqM} m²</span>
                </div>

                {/* Center Depth Stereopsis Pin */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-dashed border-[#121210] flex items-center justify-center bg-white/40">
                    <Crosshair className="w-6 h-6 text-[#C03A3A]" />
                  </div>
                </div>
              </div>
            )}

            {/* Canvas HUD Overlays */}
            <div className="absolute top-4 left-4 z-10 bg-white/95 brut-sm p-2 font-mono text-[11px] text-[#121210] space-y-0.5">
              <div className="font-bold">RESOLUTION: 3840 x 2160 UHD</div>
              <div>STEREOSCOPIC FOV: 84°</div>
              <div className="text-[#2E8C42] font-bold">INFERENCE: {currentIncident.aiMetrics.processingTimeMs} ms</div>
            </div>

            <div className="absolute bottom-4 right-4 z-10 bg-white/95 brut-sm p-2 font-mono text-[11px] text-[#121210] text-right space-y-0.5">
              <div className="font-bold">MODEL: CIVICPULSE-RESNET-v4.2</div>
              <div className="text-[#2E8C42] font-bold">CONFIDENCE: {(currentIncident.aiMetrics.modelConfidence * 100).toFixed(1)}%</div>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <div className="stamp border-[#2E8C42] text-[#2E8C42] bg-white text-[11px] font-black">
                AI DETECTED
              </div>
            </div>
          </div>

          {/* Sensor Fusion Graph (IMU Accelerometer Z-axis spike) */}
          {showSensorFusion && (
            <div className="bg-white brut p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[#121210] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#E8A030]" />
                  BMTC Bus Telemetry: Gyro Z-Axis Acceleration (m/s²)
                </span>
                <span className="stamp border-[#C03A3A] text-[#C03A3A] bg-white text-[10px] font-bold">
                  +3.4G SHOCK SPIKE
                </span>
              </div>

              {/* Simulated Waveform SVG */}
              <div className="h-20 w-full bg-[#CFE8D6] border-2 border-[#121210] p-2 relative overflow-hidden flex items-center">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 100">
                  <path
                    d="M0,50 L40,51 L80,49 L120,52 L160,48 L200,53 L220,15 L235,92 L250,5 L265,85 L280,35 L300,52 L350,50 L400,49 L450,51 L500,50"
                    fill="none"
                    stroke="#121210"
                    strokeWidth="3"
                  />
                  {/* Threshold Line */}
                  <line x1="0" y1="25" x2="500" y2="25" stroke="#C03A3A" strokeDasharray="4" strokeWidth="2" />
                </svg>
                <span className="absolute top-2 right-2 text-[10px] font-mono font-bold text-[#C03A3A] bg-white px-1.5 border border-[#C03A3A]">
                  CRITICAL IMPACT THRESHOLD (2.5G)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 cols: Quantitative Diagnostics & Explainable AI */}
        <div className="lg:col-span-5 space-y-6">
          {/* Key Metrics Dashboard */}
          <div className="bg-white brut p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
              <h3 className="font-display text-base font-black text-[#121210] uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2E8C42]" />
                <span>Extracted Structural Metrics</span>
              </h3>
              <span className="tag bg-[#CFE8D6] font-mono text-[10px] font-bold">AUDIT READY</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 bg-[#CFE8D6]/40 border-2 border-[#121210]">
                <div className="text-[10px] font-bold text-[#4A4A46] uppercase">POTHOLE DEPTH</div>
                <div className="text-2xl font-black text-[#C03A3A] mt-0.5">
                  {currentIncident.depthCm} cm
                </div>
                <div className="text-[10px] text-[#4A4A46] mt-1 font-sans">
                  IRC Limit: &lt;4.0 cm
                </div>
              </div>

              <div className="p-3 bg-white border-2 border-[#121210]">
                <div className="text-[10px] font-bold text-[#4A4A46] uppercase">SURFACE CRATER AREA</div>
                <div className="text-2xl font-black text-[#121210] mt-0.5">
                  {currentIncident.surfaceAreaSqM} m²
                </div>
                <div className="text-[10px] text-[#4A4A46] mt-1 font-sans">
                  Stereoscopic photogrammetry
                </div>
              </div>

              <div className="p-3 bg-white border-2 border-[#121210]">
                <div className="text-[10px] font-bold text-[#4A4A46] uppercase">ESTIMATED BITUMEN FILL</div>
                <div className="text-2xl font-black text-[#2E8C42] mt-0.5">
                  {currentIncident.estimatedVolumeLiters} L
                </div>
                <div className="text-[10px] text-[#4A4A46] mt-1 font-sans">
                  Approx. 4-6 asphalt bags
                </div>
              </div>

              <div className="p-3 bg-[#E8A030]/20 border-2 border-[#121210]">
                <div className="text-[10px] font-bold text-[#4A4A46] uppercase">ASPHALT DECAY INDEX</div>
                <div className="text-2xl font-black text-[#121210] mt-0.5">
                  {currentIncident.aiMetrics.asphaltDeteriorationIndex} / 100
                </div>
                <div className="text-[10px] text-[#4A4A46] mt-1 font-sans">
                  Severe aggregate loss
                </div>
              </div>
            </div>

            {/* Vehicle Damage Hazard Gauge */}
            <div className="p-4 bg-[#C03A3A]/10 border-2 border-[#121210] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#C03A3A] flex items-center gap-1.5 uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  Vehicle Damage & Accident Hazard
                </span>
                <span className="font-black text-[#C03A3A] text-sm">
                  {currentIncident.aiMetrics.vehicleDamageHazard} / 100
                </span>
              </div>
              <div className="w-full bg-white border-2 border-[#121210] h-4 overflow-hidden p-0.5">
                <div
                  className="bg-[#C03A3A] h-full transition-all duration-500"
                  style={{ width: `${currentIncident.aiMetrics.vehicleDamageHazard}%` }}
                />
              </div>
              <p className="font-body text-xs text-[#121210] leading-snug">
                Critical hazard to two-wheelers and auto-rickshaws. High probability of rim bending or suspension rupture above 25 km/h.
              </p>
            </div>
          </div>

          {/* Explainable AI (XAI) Formula Breakdown */}
          <div className="bg-white brut p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
              <h3 className="font-display text-base font-black text-[#121210] uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#2E8C42]" />
                <span>Priority Score Ledger Breakdown</span>
              </h3>
              <span className="tag bg-[#CFE8D6] font-mono text-[10px] font-bold">WEIGHTED</span>
            </div>

            <div className="p-3 bg-[#CFE8D6]/30 border-2 border-[#121210] font-mono text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[#4A4A46]">Traffic Volume Impact (25%)</span>
                <span className="font-bold text-[#121210]">{currentIncident.priorityDetails.breakdown.trafficVolumeImpact}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4A4A46]">Hospital/Emergency Route (20%)</span>
                <span className="font-bold text-[#121210]">{currentIncident.priorityDetails.breakdown.schoolHospitalProximity}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4A4A46]">Depth & Physical Severity (35%)</span>
                <span className="font-bold text-[#C03A3A]">{currentIncident.priorityDetails.breakdown.depthRisk}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4A4A46]">Monsoon Waterlogging Risk (15%)</span>
                <span className="font-bold text-[#121210]">{currentIncident.priorityDetails.breakdown.monsoonFloodingVulnerability}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4A4A46]">Citizen Community Upvotes (5%)</span>
                <span className="font-bold text-[#121210]">{currentIncident.priorityDetails.breakdown.citizenUpvotesWeight}/100</span>
              </div>

              <div className="pt-2 border-t-2 border-[#121210] flex items-center justify-between text-sm font-black">
                <span className="font-display uppercase text-[#121210]">AGGREGATE AI PRIORITY</span>
                <span className="tag bg-[#121210] text-[#CFE8D6] text-sm font-bold">
                  {currentIncident.priorityDetails.overallScore} / 100
                </span>
              </div>
            </div>

            <button
              onClick={() => selectIncidentById(currentIncident.id, 'INCIDENT_DETAIL')}
              className="w-full py-3 bg-[#121210] text-[#CFE8D6] hover:bg-[#2E8C42] hover:text-white brut font-display text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 btn-press transition-colors cursor-pointer"
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
