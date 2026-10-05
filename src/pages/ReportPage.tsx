import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  MapPin,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GitMerge
} from 'lucide-react';
import { BengaluruMap } from '../components/map/BengaluruMap';
import { useApp } from '../context/AppContext';
import { PotholeIncident } from '../types';
import confetti from 'canvas-confetti';

interface PresetSample {
  title: string;
  roadName: string;
  wardName: string;
  wardNumber: number;
  landmark: string;
  coords: { lat: number; lng: number };
  imageUrl: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  depthCm: number;
  areaSqM: number;
  isPotentialDuplicate?: boolean;
  duplicateMasterCode?: string;
  duplicateMasterId?: string;
}

const PRESET_SAMPLES: PresetSample[] = [
  {
    title: 'Bellandur ORR (Duplicate Test Case)',
    roadName: 'Outer Ring Road (Opposite Ecospace)',
    wardName: 'Bellandur',
    wardNumber: 150,
    landmark: 'Near EcoSpace skywalk bus stop, center lane',
    coords: { lat: 12.9298, lng: 77.6835 },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    severity: 'CRITICAL',
    depthCm: 18.0,
    areaSqM: 1.48,
    isPotentialDuplicate: true,
    duplicateMasterCode: 'BNG-PTH-1042',
    duplicateMasterId: 'inc-01'
  },
  {
    title: 'Waterlogged Pothole - Koramangala 80ft',
    roadName: '80 Feet Road, Koramangala 4th Block',
    wardName: 'Koramangala',
    wardNumber: 151,
    landmark: 'Near Sony World signal junction',
    coords: { lat: 12.9345, lng: 77.6269 },
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    severity: 'HIGH',
    depthCm: 11.2,
    areaSqM: 0.95
  },
  {
    title: 'Metro Feeder Trench - Whitefield Main Rd',
    roadName: 'Whitefield Main Road',
    wardName: 'Whitefield',
    wardNumber: 84,
    landmark: 'Near ITPL Gate 2 & metro pillar 421',
    coords: { lat: 12.9856, lng: 77.7289 },
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    severity: 'HIGH',
    depthCm: 10.5,
    areaSqM: 1.15
  }
];

type AIStage =
  | 'IDLE'
  | 'INGESTING'
  | 'DETECTING'
  | 'ANALYZING_DAMAGE'
  | 'ESTIMATING_SEVERITY'
  | 'IDENTIFYING_LOCATION'
  | 'CHECKING_DUPLICATES'
  | 'RESOLVING_RESPONSIBILITY'
  | 'CALCULATING_PRIORITY'
  | 'GENERATING_INCIDENT'
  | 'COMPLETED';

export const ReportPage: React.FC = () => {
  const { addPotholeReport, mergeDuplicateReport, selectIncidentById, addToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedImage, setSelectedImage] = useState<string | null>(PRESET_SAMPLES[0].imageUrl);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>(PRESET_SAMPLES[0].coords);
  const [roadName, setRoadName] = useState(PRESET_SAMPLES[0].roadName);
  const [landmark, setLandmark] = useState(PRESET_SAMPLES[0].landmark);
  const [wardName, setWardName] = useState(PRESET_SAMPLES[0].wardName);
  const [wardNumber, setWardNumber] = useState<number>(PRESET_SAMPLES[0].wardNumber);
  const [description, setDescription] = useState('Deep crater in median lane causing two-wheelers to swerve abruptly. Rainwater pooled inside.');
  const [reporterName, setReporterName] = useState('Kavitha S. (Indiranagar Commuter)');
  const [reporterPhone, setReporterPhone] = useState('+91 98450 78120');

  // AI Pipeline State
  const [aiStage, setAiStage] = useState<AIStage>('IDLE');
  const [detectedDuplicate, setDetectedDuplicate] = useState<{ masterCode: string; masterId: string } | null>(null);

  const [detectedMetrics, setDetectedMetrics] = useState<{
    depthCm: number;
    areaSqM: number;
    volumeL: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    priorityScore: number;
  }>({
    depthCm: 18.0,
    areaSqM: 1.48,
    volumeL: 38.5,
    severity: 'CRITICAL',
    priorityScore: 94
  });

  const [submittedIncident, setSubmittedIncident] = useState<PotholeIncident | null>(null);

  // Handle Preset Select
  const handleSelectPreset = (preset: PresetSample) => {
    setSelectedImage(preset.imageUrl);
    setSelectedCoords(preset.coords);
    setRoadName(preset.roadName);
    setLandmark(preset.landmark);
    setWardName(preset.wardName);
    setWardNumber(preset.wardNumber);
    setDetectedMetrics({
      depthCm: preset.depthCm,
      areaSqM: preset.areaSqM,
      volumeL: Math.round(preset.depthCm * preset.areaSqM * 2.2),
      severity: preset.severity,
      priorityScore: preset.severity === 'CRITICAL' ? 94 : 85
    });
    setAiStage('IDLE');
    setSubmittedIncident(null);
    setDetectedDuplicate(null);
    addToast('Preset Pothole Loaded', `${preset.roadName}`, 'info');
  };

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setAiStage('IDLE');
        setSubmittedIncident(null);
        setDetectedDuplicate(null);
        addToast('Media Uploaded', file.name, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // 9-Stage AI Analysis Pipeline
  const runAiPipeline = async () => {
    setDetectedDuplicate(null);

    // 01 — INGESTING IMAGE
    setAiStage('INGESTING');
    await new Promise(r => setTimeout(r, 250));

    // 02 — DETECTING POTHOLE
    setAiStage('DETECTING');
    await new Promise(r => setTimeout(r, 250));

    // 03 — ANALYZING DAMAGE
    setAiStage('ANALYZING_DAMAGE');
    await new Promise(r => setTimeout(r, 250));

    // 04 — ESTIMATING SEVERITY
    setAiStage('ESTIMATING_SEVERITY');
    await new Promise(r => setTimeout(r, 250));

    // 05 — IDENTIFYING LOCATION
    setAiStage('IDENTIFYING_LOCATION');
    await new Promise(r => setTimeout(r, 220));

    // 06 — CHECKING DUPLICATES
    setAiStage('CHECKING_DUPLICATES');
    await new Promise(r => setTimeout(r, 250));

    // Check if within 50m of Outer Ring Road EcoSpace incident (inc-01)
    const isNearEcoSpace = Math.abs(selectedCoords.lat - 12.9298) < 0.005 && Math.abs(selectedCoords.lng - 77.6835) < 0.005;

    if (isNearEcoSpace) {
      setDetectedDuplicate({ masterCode: 'BNG-PTH-1042', masterId: 'inc-01' });
    }

    // 07 — RESOLVING ROAD RESPONSIBILITY
    setAiStage('RESOLVING_RESPONSIBILITY');
    await new Promise(r => setTimeout(r, 250));

    // 08 — CALCULATING PRIORITY
    setAiStage('CALCULATING_PRIORITY');
    await new Promise(r => setTimeout(r, 250));

    // 09 — GENERATING INCIDENT
    setAiStage('GENERATING_INCIDENT');
    await new Promise(r => setTimeout(r, 220));

    setAiStage('COMPLETED');

    if (!isNearEcoSpace) {
      // Auto-create standard incident
      finalizeNewIncident();
    }
  };

  const finalizeNewIncident = () => {
    const newIncident = addPotholeReport({
      roadName,
      landmark,
      wardName,
      wardNumber,
      coordinates: selectedCoords,
      severity: detectedMetrics.severity,
      depthCm: detectedMetrics.depthCm,
      surfaceAreaSqM: detectedMetrics.areaSqM,
      estimatedVolumeLiters: detectedMetrics.volumeL,
      riskScore: detectedMetrics.priorityScore,
      images: {
        original: selectedImage || PRESET_SAMPLES[0].imageUrl
      }
    });

    setSubmittedIncident(newIncident);

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    addToast(
      'Incident Registered Successfully!',
      `Assigned ID ${newIncident.code} & Ticket ${newIncident.sahayaTicketNo}`,
      'success'
    );
  };

  const handleMergeDuplicate = () => {
    if (!detectedDuplicate) return;

    mergeDuplicateReport(detectedDuplicate.masterId, description, reporterName);
    selectIncidentById(detectedDuplicate.masterId, 'INCIDENT_DETAIL');
  };

  const stages: { key: AIStage; label: string; desc: string }[] = [
    { key: 'INGESTING', label: '01 — Ingesting Image', desc: 'Validating resolution & sensor geotag EXIF' },
    { key: 'DETECTING', label: '02 — Detecting Pothole', desc: 'Neural bounding polygon & edge localization' },
    { key: 'ANALYZING_DAMAGE', label: '03 — Analyzing Damage', desc: 'Stereoscopic depth & asphalt aggregate breakdown' },
    { key: 'ESTIMATING_SEVERITY', label: '04 — Estimating Severity', desc: 'Classification under IRC-SP-100 standards' },
    { key: 'IDENTIFYING_LOCATION', label: '05 — Identifying Location', desc: 'Bengaluru GIS road corridor mapping' },
    { key: 'CHECKING_DUPLICATES', label: '06 — Checking Duplicates', desc: 'Spatial cluster & visual similarity deduplication' },
    { key: 'RESOLVING_RESPONSIBILITY', label: '07 — Resolving Responsibility', desc: 'Matching active road contracts & Clause 45.2 warranty' },
    { key: 'CALCULATING_PRIORITY', label: '08 — Calculating Priority', desc: 'Traffic density × Emergency routes × Depth weighting' },
    { key: 'GENERATING_INCIDENT', label: '09 — Generating Incident', desc: 'Syncing to BBMP Sahaya grievance registry' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>CITIZEN INGESTION PORTAL</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400">Demo Inference Mode</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Report a Bengaluru Pothole
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Upload road imagery or dashcam video. The neural pipeline extracts physical dimensions, matches the responsible contractor under tender warranty, and stages an official grievance.
          </p>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Image Preview */}
        <div className="lg:col-span-6 space-y-6">
          {/* Preset Sample Bar */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Quick Test Samples
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">Click to autofill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(sample)}
                  className={`p-2 rounded-lg text-left text-xs transition-all border
                    ${roadName === sample.roadName
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                      : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.07]'
                    }
                  `}
                >
                  <div className="font-bold truncate">{sample.wardName}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {sample.isPotentialDuplicate ? 'Duplicate Test' : `${sample.depthCm}cm depth`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative rounded-2xl border-2 border-dashed border-white/15 hover:border-cyan-500/60 bg-[#0A0D18] p-8 text-center cursor-pointer transition-all hover:bg-[#0D1222]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {selectedImage ? (
              <div className="relative rounded-xl overflow-hidden max-h-72 border border-white/10 group-hover:border-cyan-500/40 transition-colors">
                <img
                  src={selectedImage}
                  alt="Pothole capture preview"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 justify-between">
                  <span className="text-xs font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded border border-white/20">
                    MEDIA READY FOR AI SCAN
                  </span>
                  <span className="text-xs text-cyan-400 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-500/40 font-mono">
                    Click to change
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)] group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Drop a pothole photo or video</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports high-res JPG, PNG, MP4 dashcam clips up to 50MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description & Contact Input */}
          <div className="space-y-4 p-5 rounded-2xl bg-[#090C17] border border-white/10">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Citizen Description / Hazard Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention specific lane, depth, accidents observed..."
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Citizen Name
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Location Map & 9-Stage AI Pipeline */}
        <div className="lg:col-span-6 space-y-6">
          {/* Location Picker Map */}
          <div className="rounded-2xl border border-white/10 bg-[#090C16] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Pinpoint Bengaluru Location
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                Click map to drop pin
              </span>
            </div>

            <div className="h-56 rounded-xl overflow-hidden border border-white/10 relative">
              <BengaluruMap
                height="100%"
                isPickerMode={true}
                pickerCoordinates={selectedCoords}
                onPickCoordinates={(coords) => {
                  setSelectedCoords(coords);
                  addToast('Coordinates Updated', `Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`, 'info');
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/5 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">COORDINATES</span>
                <span className="text-cyan-400 font-bold">
                  {selectedCoords.lat.toFixed(4)}° N, {selectedCoords.lng.toFixed(4)}° E
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">BBMP WARD</span>
                <span className="text-slate-200 font-semibold">
                  Ward {wardNumber}: {wardName}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px]">ROAD CORRIDOR</span>
                <span className="text-white font-medium">{roadName}</span>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">{landmark}</div>
              </div>
            </div>
          </div>

          {/* 9-Stage AI Processing Pipeline */}
          <div className="rounded-2xl border border-white/10 bg-[#0A0D19] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  9-Stage Neural Pipeline
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                Demo Inference Mode
              </span>
            </div>

            {/* Stages Stack */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {stages.map((st, idx) => {
                const stageOrder: AIStage[] = [
                  'INGESTING',
                  'DETECTING',
                  'ANALYZING_DAMAGE',
                  'ESTIMATING_SEVERITY',
                  'IDENTIFYING_LOCATION',
                  'CHECKING_DUPLICATES',
                  'RESOLVING_RESPONSIBILITY',
                  'CALCULATING_PRIORITY',
                  'GENERATING_INCIDENT',
                  'COMPLETED'
                ];
                const currentIndex = stageOrder.indexOf(aiStage);
                const stageIndex = stageOrder.indexOf(st.key);

                const isCurrent = aiStage === st.key;
                const isPassed = currentIndex > stageIndex || aiStage === 'COMPLETED';

                return (
                  <div
                    key={st.key}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all
                      ${isCurrent
                        ? 'bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                        : isPassed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/[0.02] border-white/5 text-slate-500'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold
                        ${isCurrent
                          ? 'bg-cyan-400 text-slate-950 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-white/10 text-slate-500'
                        }
                      `}>
                        {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      <div>
                        <div className={`font-semibold text-[11px] ${isCurrent ? 'text-cyan-300' : isPassed ? 'text-slate-200' : 'text-slate-400'}`}>
                          {st.label}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">{st.desc}</div>
                      </div>
                    </div>

                    <span className="font-mono text-[9px]">
                      {isCurrent ? 'ANALYZING...' : isPassed ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Duplicate Detection Alert Box */}
            {detectedDuplicate && aiStage === 'COMPLETED' && (
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/50 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <GitMerge className="w-4 h-4 text-purple-400" />
                  <span>94% SIMILARITY: DUPLICATE INCIDENT DETECTED</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Location is within 15 meters of existing master incident <strong className="text-white font-mono">{detectedDuplicate.masterCode}</strong> on Outer Ring Road.
                  Merging will increment community weight and raise priority score without cluttering the municipal map.
                </p>

                <div className="p-2 rounded bg-purple-950/60 border border-purple-500/20 text-[11px] font-sans text-slate-300">
                  <strong className="text-purple-300 font-mono">Why duplicate?</strong> 15 m spatial proximity + 94% visual feature similarity.
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleMergeDuplicate}
                    className="flex-1 py-2 px-3 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Merge as Supporting Report (Recommended)</span>
                  </button>
                  <button
                    onClick={finalizeNewIncident}
                    className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                  >
                    Create Separate Incident
                  </button>
                </div>
              </div>
            )}

            {/* Standard Completed Incident Box */}
            {submittedIncident && !detectedDuplicate && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>INCIDENT GENERATED & SYNCED</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-white">
                    {submittedIncident.code}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block">SEVERITY</span>
                    <span className="font-bold text-red-400">{submittedIncident.severity}</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block">PRIORITY</span>
                    <span className="font-bold text-cyan-400">{submittedIncident.priorityDetails.overallScore}/100</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block">SAHAYA TICKET</span>
                    <span className="font-bold text-amber-300 text-[10px]">{submittedIncident.sahayaTicketNo}</span>
                  </div>
                </div>

                <button
                  onClick={() => selectIncidentById(submittedIncident.id, 'INCIDENT_DETAIL')}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Investigate Incident Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Submit Trigger Button */}
            {aiStage === 'IDLE' && (
              <button
                type="button"
                onClick={runAiPipeline}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Run 9-Stage AI Triaging Pipeline</span>
              </button>
            )}

            {aiStage !== 'IDLE' && aiStage !== 'COMPLETED' && (
              <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-cyan-300 text-xs font-mono flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Executing Stage: {stages.find(s => s.key === aiStage)?.label}...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
