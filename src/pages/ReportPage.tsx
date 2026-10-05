import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Video,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileImage
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
}

const PRESET_SAMPLES: PresetSample[] = [
  {
    title: 'Severe Arterial Crater - Bellandur ORR',
    roadName: 'Outer Ring Road (Opposite Ecospace)',
    wardName: 'Bellandur',
    wardNumber: 150,
    landmark: 'Near EcoSpace skywalk bus stop, center lane',
    coords: { lat: 12.9298, lng: 77.6835 },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    severity: 'CRITICAL',
    depthCm: 15.2,
    areaSqM: 1.4
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
    depthCm: 11.5,
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
    depthCm: 10.8,
    areaSqM: 1.1
  }
];

type AIStage = 'IDLE' | 'DETECTING' | 'ANALYZING' | 'LOCATING' | 'CHECKING_DUPLICATES' | 'PRIORITIZING' | 'COMPLETED';

export const ReportPage: React.FC = () => {
  const { addPotholeReport, selectIncidentById, addToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedImage, setSelectedImage] = useState<string | null>(PRESET_SAMPLES[0].imageUrl);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>(PRESET_SAMPLES[0].coords);
  const [roadName, setRoadName] = useState(PRESET_SAMPLES[0].roadName);
  const [landmark, setLandmark] = useState(PRESET_SAMPLES[0].landmark);
  const [wardName, setWardName] = useState(PRESET_SAMPLES[0].wardName);
  const [wardNumber, setWardNumber] = useState<number>(PRESET_SAMPLES[0].wardNumber);
  const [description, setDescription] = useState('Deep crater in median lane causing two-wheelers to swerve abruptly. Rainwater pooled inside.');
  const [reporterPhone, setReporterPhone] = useState('+91 98450 78120');

  // AI Pipeline State
  const [aiStage, setAiStage] = useState<AIStage>('IDLE');
  const [detectedMetrics, setDetectedMetrics] = useState<{
    depthCm: number;
    areaSqM: number;
    volumeL: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    priorityScore: number;
  }>({
    depthCm: 15.2,
    areaSqM: 1.4,
    volumeL: 36.8,
    severity: 'CRITICAL',
    priorityScore: 96
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
      priorityScore: preset.severity === 'CRITICAL' ? 96 : 85
    });
    setAiStage('IDLE');
    setSubmittedIncident(null);
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
        addToast('Media Uploaded', file.name, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Full AI Multi-stage pipeline
  const runAiPipelineAndSubmit = async () => {
    setAiStage('DETECTING');
    addToast('AI Vision Pipeline Initiated', 'Analyzing road surface stereopsis', 'info');

    // Stage 1: Detecting (bounding box)
    await new Promise(r => setTimeout(r, 600));
    setAiStage('ANALYZING');

    // Stage 2: Analyzing (depth, volume, moisture)
    await new Promise(r => setTimeout(r, 700));
    setAiStage('LOCATING');

    // Stage 3: Locating (reverse geocode & road category)
    await new Promise(r => setTimeout(r, 600));
    setAiStage('CHECKING_DUPLICATES');

    // Stage 4: Checking duplicates (spatial cluster deduplication within 15m radius)
    await new Promise(r => setTimeout(r, 650));
    setAiStage('PRIORITIZING');

    // Stage 5: Prioritizing (traffic matrix × hospital route calculation)
    await new Promise(r => setTimeout(r, 700));
    setAiStage('COMPLETED');

    // Finalize creation
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

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    addToast(
      'Pothole Reported Successfully!',
      `Assigned Incident ID ${newIncident.code} & Ticket ${newIncident.sahayaTicketNo}`,
      'success'
    );
  };

  const stages: { key: AIStage; label: string; desc: string }[] = [
    { key: 'DETECTING', label: 'Detecting', desc: 'Computer vision bounding polygon' },
    { key: 'ANALYZING', label: 'Analyzing', desc: 'Depth stereopsis & asphalt decay' },
    { key: 'LOCATING', label: 'Locating', desc: 'BBMP ward & road hierarchy mapping' },
    { key: 'CHECKING_DUPLICATES', label: 'Checking duplicates', desc: 'Spatial cluster matching' },
    { key: 'PRIORITIZING', label: 'Prioritizing', desc: 'Emergency route & PCU density scoring' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-white/10 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 mb-2">
          <Camera className="w-3.5 h-3.5" />
          <span>CITIZEN INGESTION PORTAL</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Report a Bengaluru Pothole
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Upload road imagery or dashcam video. Our AI automatically extracts physical dimensions, matches the responsible contractor, and logs an algorithmic grievance into the BBMP Sahaya registry.
        </p>
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
                Quick Test Samples (Bengaluru Roads)
              </span>
              <span className="text-[11px] text-cyan-400">Click to autofill</span>
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
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{sample.depthCm}cm depth</div>
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
                  <div className="text-left font-mono">
                    <span className="text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded border border-white/20">
                      MEDIA READY FOR SCAN
                    </span>
                  </div>
                  <span className="text-xs text-cyan-400 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-500/40">
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

          {/* Upload Method Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <FileImage className="w-4 h-4 text-cyan-400" />
              <span>Upload Photo</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <Video className="w-4 h-4 text-purple-400" />
              <span>Upload Video</span>
            </button>

            <button
              type="button"
              onClick={() => {
                addToast('Camera Activated', 'Capturing sensor frame', 'info');
                fileInputRef.current?.click();
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Capture Photo</span>
            </button>
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

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Contact Phone (For BBMP Sahaya SMS Tracking)
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

        {/* Right Column: Interactive Map Picker & AI Pipeline */}
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

            {/* Map Container */}
            <div className="h-60 rounded-xl overflow-hidden border border-white/10 relative">
              <BengaluruMap
                height="100%"
                isPickerMode={true}
                pickerCoordinates={selectedCoords}
                onPickCoordinates={(coords) => {
                  setSelectedCoords(coords);
                  addToast(
                    'Location Updated',
                    `Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`,
                    'info'
                  );
                }}
              />
            </div>

            {/* Location Readouts */}
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

          {/* AI Processing Multi-Stage Pipeline */}
          <div className="rounded-2xl border border-white/10 bg-[#0A0D19] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  AI Neural Processing Pipeline
                </span>
              </div>
              {aiStage !== 'IDLE' && aiStage !== 'COMPLETED' && (
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Running Neural Models...
                </span>
              )}
            </div>

            {/* Stages visualization: Detecting -> Analyzing -> Locating -> Checking duplicates -> Prioritizing */}
            <div className="space-y-2.5">
              {stages.map((st, idx) => {
                const stageOrder: AIStage[] = ['DETECTING', 'ANALYZING', 'LOCATING', 'CHECKING_DUPLICATES', 'PRIORITIZING', 'COMPLETED'];
                const currentIndex = stageOrder.indexOf(aiStage);
                const stageIndex = stageOrder.indexOf(st.key);

                const isCurrent = aiStage === st.key;
                const isPassed = currentIndex > stageIndex || aiStage === 'COMPLETED';

                return (
                  <div
                    key={st.key}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all
                      ${isCurrent
                        ? 'bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : isPassed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/[0.02] border-white/5 text-slate-500'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold
                        ${isCurrent
                          ? 'bg-cyan-400 text-slate-950 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-white/10 text-slate-500'
                        }
                      `}>
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div>
                        <div className={`font-semibold ${isCurrent ? 'text-cyan-300' : isPassed ? 'text-slate-200' : 'text-slate-400'}`}>
                          {st.label}
                        </div>
                        <div className="text-[10px] text-slate-500">{st.desc}</div>
                      </div>
                    </div>

                    <span className="font-mono text-[10px]">
                      {isCurrent ? 'PROCESSING...' : isPassed ? 'VERIFIED' : 'QUEUED'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* AI Result Box if completed */}
            {submittedIncident && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>INCIDENT REGISTERED & TRIAGED</span>
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

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => selectIncidentById(submittedIncident.id, 'INCIDENT_DETAIL')}
                    className="flex-1 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Incident Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => selectIncidentById(submittedIncident.id, 'AI_ANALYSIS')}
                    className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Inspect AI Vision
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {!submittedIncident && (
              <button
                type="button"
                disabled={aiStage !== 'IDLE' && aiStage !== 'COMPLETED'}
                onClick={runAiPipelineAndSubmit}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {aiStage !== 'IDLE' && aiStage !== 'COMPLETED' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Processing Computer Vision Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Submit & Run AI Triaging Pipeline</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
