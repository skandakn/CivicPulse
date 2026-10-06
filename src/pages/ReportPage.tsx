import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  MapPin,
  Sparkles,
  ArrowRight,
  FileImage,
  Layers,
  FileCheck,
  Building2,
  ShieldAlert,
  Mic,
  Square,
  FileText,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { BengaluruMap } from '../components/map/BengaluruMap';
import { useApp } from '../context/AppContext';
import { PotholeAnalysisResponse } from '../types';
import confetti from 'canvas-confetti';
import {
  transcriptionService,
  InterpretedComplaint,
  TranscriptionResult,
  DEMO_VOICE_SAMPLES,
  DemoVoiceSample
} from '../services/transcriptionService';
import { ComplaintTrackingStepper } from '../components/common/ComplaintTrackingStepper';
import { DepartmentRoutingBadge } from '../components/common/DepartmentRoutingBadge';

interface PresetSample {
  id: string;
  title: string;
  roadName: string;
  wardName: string;
  wardNumber: number;
  landmark: string;
  coords: { lat: number; lng: number };
  imageUrl: string;
  expectedDuplicate: string | null;
  potholeCount: number;
}

const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'bellandur-orr',
    title: 'Severe Arterial Crater - Bellandur ORR',
    roadName: 'Outer Ring Road (Opposite Ecospace)',
    wardName: 'Bellandur',
    wardNumber: 150,
    landmark: 'Near EcoSpace skywalk bus stop, center lane',
    coords: { lat: 12.9279, lng: 77.6833 },
    imageUrl: '/sample_data/images/bellandur_outer_ring_road_severe.jpg',
    expectedDuplicate: 'BNG-PTH-1042',
    potholeCount: 3
  },
  {
    id: 'indiranagar-100ft',
    title: 'Indiranagar 100ft Road - Single Deep Crater',
    roadName: '100 Feet Road, Near CMH Hospital',
    wardName: 'Indiranagar',
    wardNumber: 80,
    landmark: 'Near CMH Hospital Junction, right lane',
    coords: { lat: 12.9784, lng: 77.6408 },
    imageUrl: '/sample_data/images/indiranagar_100ft_road_cluster.jpg',
    expectedDuplicate: 'BNG-PTH-1088',
    potholeCount: 1
  },
  {
    id: 'whitefield-itpl',
    title: 'Waterlogged Pothole - Whitefield ITPL',
    roadName: 'ITPL Main Road, Pattandur Agrahara',
    wardName: 'Whitefield',
    wardNumber: 84,
    landmark: 'Near ITPL Gate 2 & metro pillar 421',
    coords: { lat: 12.9866, lng: 77.7381 },
    imageUrl: '/sample_data/images/whitefield_itpl_critical.jpg',
    expectedDuplicate: 'BNG-PTH-1102',
    potholeCount: 2
  },
  {
    id: 'indoor-hackathon',
    title: 'Indoor Hackathon Road Surface Test Card',
    roadName: 'Bengaluru Innovation Lab Floor',
    wardName: 'Bellandur',
    wardNumber: 150,
    landmark: 'Hackathon Stage Demonstration Area',
    coords: { lat: 12.9279, lng: 77.6833 },
    imageUrl: '/sample_data/images/indoor_hackathon_demo.jpg',
    expectedDuplicate: 'BNG-PTH-1042',
    potholeCount: 2
  }
];

type ReportStep = 'INPUT' | 'CINEMATIC_ANALYSIS' | 'REPORT_SUMMARY';

export const ReportPage: React.FC = () => {
  const { incidents, selectIncidentById, addToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active step in workflow
  const [reportStep, setReportStep] = useState<ReportStep>('INPUT');

  // Input & Upload State
  const [selectedImage, setSelectedImage] = useState<string>(PRESET_SAMPLES[0].imageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>(PRESET_SAMPLES[0].coords);
  const [roadName, setRoadName] = useState(PRESET_SAMPLES[0].roadName);
  const [landmark, setLandmark] = useState(PRESET_SAMPLES[0].landmark);
  const [wardName, setWardName] = useState(PRESET_SAMPLES[0].wardName);
  const [wardNumber, setWardNumber] = useState<number>(PRESET_SAMPLES[0].wardNumber);
  const [description, setDescription] = useState('Severe road craters in primary vehicle track causing vehicle swerving.');
  const [reporterPhone, setReporterPhone] = useState('+91 98450 78120');
  const [detectorMode, setDetectorMode] = useState<'auto' | 'demo' | 'opencv' | 'yolo'>('auto');

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState<PotholeAnalysisResponse | null>(null);
  const [showPolygons, setShowPolygons] = useState(true);
  const [activeDetectionId, setActiveDetectionId] = useState<string | null>(null);

  // Animated pipeline steps
  const pipelineStepLabels = [
    'Image received',
    'Pothole detected',
    'Damage analyzed',
    'Severity calculated',
    'Duplicate check',
    'Road intelligence',
    'Priority calculation'
  ];
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // WebNova Ingestion Channel Mode: Photo / Voice / Text
  type SubmissionMode = 'PHOTO' | 'VOICE' | 'TEXT';
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>('PHOTO');

  // Voice Complaint Subsystem State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [_audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [voiceText, setVoiceText] = useState(DEMO_VOICE_SAMPLES[0].transcript);
  const [interpretedComplaint, setInterpretedComplaint] = useState<InterpretedComplaint>({
    roadName: 'Outer Ring Road',
    wardName: 'Bellandur',
    wardNumber: 150,
    coordinates: { lat: 12.9234, lng: 77.6892 },
    landmark: 'EcoSpace skywalk',
    severity: 'CRITICAL',
    estimatedDepthCm: 15.0,
    department: {
      name: 'BBMP Road Infrastructure Department',
      acronym: 'BBMP',
      nodalOfficer: 'Chief Engineer',
      routingReason: 'Standard road maintenance jurisdiction'
    },
    summary: 'Waterlogged crater causing vehicular damage'
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Text Complaint Subsystem State
  const [textComplaintInput, setTextComplaintInput] = useState(
    'Massive waterlogged crater cluster on ITPL Main Road near Metro pillar 421. Water covers the hole, making it invisible to cars.'
  );
  const [sessionTimestamp] = useState(() => new Date().toISOString());

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());

        await handleTranscribe(blob, recordingDuration);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      addToast('Voice Recording', 'Microphone active — describe the road condition & location', 'info');
    } catch (err: any) {
      console.warn('Microphone access restricted:', err);
      addToast('Mic Access Restricted', 'Switched to 1-Click Demo Voice Mode', 'info');
      handleSelectDemoVoice(DEMO_VOICE_SAMPLES[0]);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handleTranscribe = async (blob: Blob, duration: number, preferredProvider?: 'gemini' | 'groq' | 'demo') => {
    setIsTranscribing(true);
    try {
      const result = await transcriptionService.transcribeAudio(blob, duration, preferredProvider);
      setTranscriptionResult(result);
      setVoiceText(result.text);
      applyInterpretedData(result.text);
      addToast('Speech Transcribed', `Processed via ${result.providerLabel}`, 'success');
    } catch (_err: any) {
      const fallback = transcriptionService.getDemoFallbackTranscription(duration);
      setTranscriptionResult(fallback);
      setVoiceText(fallback.text);
      applyInterpretedData(fallback.text);
      addToast('Voice Processed', fallback.providerLabel, 'info');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSelectDemoVoice = (sample: DemoVoiceSample) => {
    const duration = parseInt(sample.duration.split(':')[1]) || 5;
    setRecordingDuration(duration);
    const fallback = transcriptionService.getDemoFallbackTranscription(duration, sample.id);
    setTranscriptionResult(fallback);
    setVoiceText(sample.transcript);
    applyInterpretedData(sample.transcript);
    addToast('Demo Voice Loaded', `${sample.title} (${sample.location})`, 'success');
  };

  const applyInterpretedData = async (text: string) => {
    const interpreted = await transcriptionService.interpretComplaint(text, selectedCoords);
    setInterpretedComplaint(interpreted);
    setRoadName(interpreted.roadName);
    setLandmark(interpreted.landmark);
    setWardName(interpreted.wardName);
    setWardNumber(interpreted.wardNumber);
    setSelectedCoords(interpreted.coordinates);
    setDescription(text);
  };

  const handleTextComplaintChange = (val: string) => {
    setTextComplaintInput(val);
    applyInterpretedData(val);
  };

  const submitVoiceOrTextComplaint = async () => {
    const sourceText = submissionMode === 'VOICE' ? voiceText : textComplaintInput;
    if (!sourceText.trim()) {
      addToast('Grievance Required', 'Please provide or record your pothole description', 'error');
      return;
    }

    const interpreted = interpretedComplaint || await transcriptionService.interpretComplaint(sourceText, selectedCoords);

    // Duplicate check match
    const matchedDuplicate = incidents.find(i => 
      i.roadName.toLowerCase().includes(interpreted.wardName.toLowerCase()) || 
      i.wardNumber === interpreted.wardNumber
    ) || incidents[0];

    const analysisPayload: PotholeAnalysisResponse = {
      detected: true,
      confidence: 0.962,
      detections: [
        {
          id: 'pothole-01',
          label: 'pothole',
          confidence: 0.962,
          box: { x: 330, y: 380, width: 290, height: 180, x_norm: 0.32, y_norm: 0.49, width_norm: 0.28, height_norm: 0.23 },
          severity: interpreted.severity === 'CRITICAL' ? 'Critical' : interpreted.severity === 'HIGH' ? 'High' : 'Medium',
          areaSqPx: 52200,
          relativeArea: 0.066,
          depthEstimate: `Cavity (~${interpreted.estimatedDepthCm} cm)`
        }
      ],
      estimatedSeverity: interpreted.severity,
      damageArea: `${(interpreted.estimatedDepthCm * 0.12).toFixed(1)} m²`,
      potholeCount: 1,
      roadCondition: `${interpreted.roadName} — ${interpreted.department.routingReason}`,
      explanation: `${interpreted.summary} Pothole depth estimated at ${interpreted.estimatedDepthCm}cm.`,
      imageMetadata: { width: 1024, height: 768, sizeBytes: 340000, format: 'jpeg' },
      damageImpact: {
        totalAreaSqMeters: parseFloat((interpreted.estimatedDepthCm * 0.12).toFixed(1)),
        roadObstructionPct: interpreted.severity === 'CRITICAL' ? 62.4 : 45.0,
        twoWheelerRisk: interpreted.severity === 'CRITICAL' ? 'Extreme (High Skidding & Rim Fracture Risk)' : 'High',
        busTransitDisruption: interpreted.severity === 'CRITICAL' ? 'Severe (Speed Reduction < 10 km/h)' : 'Moderate',
        laneClosureRecommended: interpreted.severity === 'CRITICAL',
        repairUrgency: interpreted.severity === 'CRITICAL' ? 'Emergency Cold Patching (< 24h)' : 'Priority Patching (< 48h)'
      },
      severityEngine: {
        score: interpreted.severity === 'CRITICAL' ? 94 : interpreted.severity === 'HIGH' ? 82 : 65,
        level: interpreted.severity,
        factors: { visual_size: 19.5, pothole_count: 15.0, road_obstruction: 15.0, confidence: 9.3, road_importance: 15.0, hub_proximity: 8.5, previous_reports: 8.0, persistence: 3.7 },
        explanations: [
          `Corridor: ${interpreted.roadName}`,
          `Report density: 17 merged citizen submissions`,
          `Routed directly to ${interpreted.department.name}`
        ]
      },
      duplicateCheck: {
        isDuplicate: true,
        duplicateProbability: 0.94,
        matchedIncidentId: matchedDuplicate?.code || 'BNG-PTH-1042',
        reason: `94% likely duplicate of ${matchedDuplicate?.code || 'BNG-PTH-1042'} on ${interpreted.roadName}`,
        distanceMeters: 14.2
      },
      incident: {
        id: matchedDuplicate?.code || 'BNG-PTH-1042',
        canonicalLocation: {
          lat: interpreted.coordinates.lat,
          lng: interpreted.coordinates.lng,
          address: interpreted.roadName,
          ward: `Ward ${interpreted.wardNumber} - ${interpreted.wardName}`,
          zone: 'Mahadevapura'
        },
        priority: interpreted.severity === 'CRITICAL' ? 94 : 82,
        severity: interpreted.severity,
        reportsMerged: 17,
        road: interpreted.roadName,
        authority: interpreted.department.name,
        contractor: 'Unverified / KPPP Search Required',
        status: 'Verified',
        lastReportedAt: sessionTimestamp
      },
      inferenceTimeMs: 24.5,
      modelName: submissionMode === 'VOICE' ? 'Gemini-3.8-Flash-Multimodal-STT + NLP' : 'CivicPulse-NLP-Triage-Engine',
      activePipelineMode: 'demo'
    };

    setAnalysisResult(analysisPayload);
    finalizeAndGoToReport();
    addToast(
      submissionMode === 'VOICE' ? 'Voice Grievance Ingested' : 'Text Grievance Ingested',
      `Routed to ${interpreted.department.acronym} under Priority ${analysisPayload.incident.priority}/100`,
      'success'
    );
  };

  // Handle Preset Select
  const handleSelectPreset = (preset: PresetSample) => {
    setSelectedImage(preset.imageUrl);
    setSelectedFile(null);
    setSelectedCoords(preset.coords);
    setRoadName(preset.roadName);
    setLandmark(preset.landmark);
    setWardName(preset.wardName);
    setWardNumber(preset.wardNumber);
    setReportStep('INPUT');
    setAnalysisResult(null);
    addToast('Preset Road Loaded', `${preset.title}`, 'info');
  };

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        addToast('File Too Large', 'Maximum file size is 15MB', 'error');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setReportStep('INPUT');
      setAnalysisResult(null);
      addToast('Media Uploaded', file.name, 'success');
    }
  };

  // Trigger Full AI Computer Vision Workflow
  const runVisionAnalysis = async () => {
    setReportStep('CINEMATIC_ANALYSIS');
    setActiveStepIndex(0);
    addToast('Computer Vision Triggered', 'Analyzing road surface geometry', 'info');

    let stepCounter = 0;
    const stepInterval = setInterval(() => {
      stepCounter++;
      setActiveStepIndex(stepCounter);
      if (stepCounter >= pipelineStepLabels.length) {
        clearInterval(stepInterval);
      }
    }, 280);

    try {
      let response: Response;
      const formData = new FormData();
      formData.append('latitude', selectedCoords.lat.toString());
      formData.append('longitude', selectedCoords.lng.toString());
      formData.append('road_hint', roadName);
      formData.append('mode', detectorMode);

      if (selectedFile) {
        formData.append('image', selectedFile);
      } else {
        const imgBlob = await fetch(selectedImage).then(r => r.blob());
        formData.append('image', imgBlob, 'preset.jpg');
      }

      response = await fetch('/api/analyze-pothole', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let errMsg = `API error (${response.status})`;
        try {
          const errData = await response.json();
          if (errData.detail) errMsg = errData.detail;
        } catch {}
        throw new Error(errMsg);
      }

      const data: PotholeAnalysisResponse = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      if (detectorMode === 'demo') {
        // Fallback result isolated strictly to DEMO benchmark mode
        const fallbackResult: PotholeAnalysisResponse = {
          detected: true,
          confidence: 0.964,
          detections: [
            {
              id: 'pothole-01',
              label: 'pothole',
              confidence: 0.964,
              box: { x: 330, y: 380, width: 290, height: 180, x_norm: 0.32, y_norm: 0.49, width_norm: 0.28, height_norm: 0.23 },
              severity: 'High',
              areaSqPx: 52200,
              relativeArea: 0.066,
              depthEstimate: 'Deep Cavity (~11 cm)',
              polygon: [[330, 440], [360, 390], [420, 380], [510, 395], [590, 430], [620, 490], [580, 540], [480, 560], [380, 550], [335, 490]]
            },
            {
              id: 'pothole-02',
              label: 'pothole',
              confidence: 0.948,
              box: { x: 640, y: 460, width: 190, height: 120, x_norm: 0.62, y_norm: 0.60, width_norm: 0.18, height_norm: 0.15 },
              severity: 'Medium',
              areaSqPx: 22800,
              relativeArea: 0.029,
              depthEstimate: 'Moderate (~6 cm)',
              polygon: [[640, 510], [670, 470], [750, 460], [820, 500], [830, 550], [770, 580], [690, 570], [645, 530]]
            },
            {
              id: 'pothole-03',
              label: 'pothole',
              confidence: 0.912,
              box: { x: 180, y: 480, width: 150, height: 95, x_norm: 0.18, y_norm: 0.62, width_norm: 0.15, height_norm: 0.12 },
              severity: 'Medium',
              areaSqPx: 14250,
              relativeArea: 0.018,
              depthEstimate: 'Shallow Surface Break (~4 cm)',
              polygon: [[180, 520], [210, 485], [280, 480], [325, 515], [330, 555], [275, 575], [205, 565]]
            }
          ],
          estimatedSeverity: 'Severe',
          damageArea: '1.8 m²',
          potholeCount: 3,
          roadCondition: 'Degraded Bituminous Asphalt - Severe Hazard to Two-Wheelers & Bus Transit',
          explanation: '3 hazardous structural depressions detected across primary travel lane. Largest crater depth exceeds 10cm.',
          imageMetadata: { width: 1024, height: 768, sizeBytes: 340000, format: 'jpeg' },
          damageImpact: {
            totalAreaSqMeters: 1.8,
            roadObstructionPct: 64.1,
            twoWheelerRisk: 'Extreme (High Skidding & Rim Fracture Risk)',
            busTransitDisruption: 'Severe (Speed Reduction to < 10 km/h, Axle Stress)',
            laneClosureRecommended: true,
            repairUrgency: 'Emergency Cold Patching Required (< 24h)',
            primaryCraterId: 'pothole-01',
            primaryCraterDepth: 'Deep Cavity (~11 cm)'
          },
          severityEngine: {
            score: 94,
            level: 'CRITICAL',
            factors: { visual_size: 19.5, pothole_count: 15.0, road_obstruction: 15.0, confidence: 9.3, road_importance: 15.0, hub_proximity: 8.5, previous_reports: 8.0, persistence: 3.7 },
            explanations: [
              'Multi-crater cluster (3 distinct depressions in single frame)',
              'High roadway obstruction (64.1% vehicle track span)',
              'Arterial Corridor (Outer Ring Road Corridor)',
              'Within 0.4km of Bellandur EcoSpace Tech Corridor',
              '17 citizen reports consolidated'
            ]
          },
          duplicateCheck: {
            isDuplicate: true,
            duplicateProbability: 0.94,
            matchedIncidentId: 'BNG-PTH-1042',
            reason: '94% likely duplicate of BNG-PTH-1042 located 14m away on Outer Ring Road (Bellandur flyover descent)',
            distanceMeters: 14.2
          },
          incident: {
            id: 'BNG-PTH-1042',
            canonicalLocation: { lat: 12.9279, lng: 77.6833, address: 'Outer Ring Road, near Bellandur EcoSpace Flyover Descent', ward: 'Ward 150 - Bellandur', zone: 'Mahadevapura' },
            priority: 94,
            severity: 'CRITICAL',
            reportsMerged: 17,
            road: 'Outer Ring Road (State Highway 35 Connector)',
            authority: 'BBMP Mahadevapura Division (Major Roads Dept)',
            contractor: 'Unverified / KPPP Search Required',
            status: 'Verified',
            lastReportedAt: new Date().toISOString()
          },
          inferenceTimeMs: 24.5,
          modelName: 'CivicPulse-YOLOv11x-BengaluruCivic-DEMO',
          activePipelineMode: 'demo'
        };
        setAnalysisResult(fallbackResult);
      } else {
        // STRICT ISOLATION: The demo adapter must NEVER silently activate when OPENCV or YOLO is requested.
        setReportStep('INPUT');
        addToast('CV Inference Error', err.message || 'Detection failed on active detector', 'error');
        return;
      }
    }
  };

  const finalizeAndGoToReport = () => {
    setReportStep('REPORT_SUMMARY');
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const navigateToRoadIntelligence = () => {
    const targetIncident = incidents.find(i => i.code === 'BNG-PTH-1042') || incidents[0];
    selectIncidentById(targetIncident.id, 'AI_ANALYSIS');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 text-left animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>AI COMPUTER VISION INGESTION CORE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Report Road Surface &amp; Pothole Hazard
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Upload dashcam footage or indoor test card. CivicPulse executes edge computer vision, quantifies crater geometry, calculates severity, and prevents duplicate complaints.
          </p>
        </div>

        {/* Step Indicator / Mode Switch */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setDetectorMode('auto')}
              className={`px-3 py-1 rounded-lg transition-all ${detectorMode === 'auto' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400'}`}
            >
              Auto
            </button>
            <button
              onClick={() => setDetectorMode('demo')}
              className={`px-3 py-1 rounded-lg transition-all ${detectorMode === 'demo' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40' : 'text-slate-400'}`}
            >
              Demo Benchmark
            </button>
            <button
              onClick={() => setDetectorMode('opencv')}
              className={`px-3 py-1 rounded-lg transition-all ${detectorMode === 'opencv' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400'}`}
            >
              Live OpenCV
            </button>
          </div>
        </div>
      </div>

      {/* STAGE 1: INPUT & MULTIMODAL INGESTION VIEW */}
      {reportStep === 'INPUT' && (
        <div className="space-y-6">
          {/* WebNova 4-Channel Ingestion Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-2.5 rounded-2xl bg-[#0A0D1A] border border-white/10 shadow-lg">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/5">
              <button
                type="button"
                onClick={() => setSubmissionMode('PHOTO')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  submissionMode === 'PHOTO'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_#00F0FF]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photo / Dashcam</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmissionMode('VOICE')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  submissionMode === 'VOICE'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_0_18px_rgba(168,85,247,0.5)] ring-1 ring-purple-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-purple-300" />
                <span>Voice Complaint</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-900/90 text-purple-200 border border-purple-400/40 font-mono">
                  AI STT
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSubmissionMode('TEXT')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  submissionMode === 'TEXT'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_#00F0FF]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text Grievance</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono pr-2">
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>GPS Geotagging: <strong className="text-cyan-400">Locked</strong></span>
              </div>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 text-[11px]">
                Active: <strong className="text-emerald-400">Photo • Voice • Text • Map</strong>
              </span>
            </div>
          </div>

          {/* CHANNEL 1: PHOTO / DASHCAM (Default CV Engine) */}
          {submissionMode === 'PHOTO' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload, Presets & Preview */}
          <div className="lg:col-span-6 space-y-6">
            {/* Curated Benchmark Samples Bar */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Bengaluru Benchmark Test Cards
                </span>
                <span className="text-[11px] text-cyan-400">1-Click Test</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectPreset(sample)}
                    className={`p-2.5 rounded-lg text-left text-xs transition-all border
                      ${roadName === sample.roadName
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                        : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.07]'
                      }
                    `}
                  >
                    <div className="font-bold truncate">{sample.title.split('-')[0]}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {sample.potholeCount} crater(s) • Dup: {sample.expectedDuplicate}
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
                accept="image/*"
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
                        SURFACE IMAGE LOADED
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
                      Supports high-res JPG, PNG, WEBP dashcam clips up to 15MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Computer Vision Subsystem Engine Selector */}
            <div className="p-3.5 rounded-2xl bg-[#090C17] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Inference Subsystem Mode</span>
                <span className={`text-[11px] font-bold ${
                  detectorMode === 'demo' ? 'text-purple-400' : detectorMode === 'opencv' ? 'text-cyan-400' : detectorMode === 'yolo' ? 'text-blue-400' : 'text-emerald-400'
                }`}>
                  {detectorMode === 'demo' ? 'DEMO (Benchmark)' : detectorMode === 'opencv' ? 'OPENCV (Prototype CV)' : detectorMode === 'yolo' ? 'YOLO (Neural Net)' : 'AUTO DETECTOR'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['auto', 'opencv', 'yolo', 'demo'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setDetectorMode(m);
                      addToast('Mode Selected', `${m.toUpperCase()} inference engine`, 'info');
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                      detectorMode === m
                        ? m === 'demo'
                          ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                          : m === 'opencv'
                          ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                          : m === 'yolo'
                          ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.35)]'
                          : 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                    }`}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                <FileImage className="w-4 h-4 text-cyan-400" />
                <span>Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Live Camera</span>
              </button>

              <button
                type="button"
                onClick={runVisionAnalysis}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-xs font-bold text-cyan-300 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Run CV Scan</span>
              </button>
            </div>

            {/* Description & Contact Notes */}
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

          {/* Right Column: Interactive Map Picker & Primary Trigger */}
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
                  Click map to update GPS
                </span>
              </div>

              <div className="h-60 rounded-xl overflow-hidden border border-white/10 relative">
                <BengaluruMap
                  height="100%"
                  isPickerMode={true}
                  pickerCoordinates={selectedCoords}
                  onPickCoordinates={(coords) => {
                    setSelectedCoords(coords);
                    addToast('Coordinates Updated', `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E`, 'info');
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

            {/* Launch Primary CV Button */}
            <button
              type="button"
              onClick={runVisionAnalysis}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>LAUNCH COMPUTER VISION PIPELINE</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      )}

      {/* CHANNEL 2: VOICE COMPLAINT (WebNova Multimodal Channel) */}
      {submissionMode === 'VOICE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
          {/* Left Column: Voice Recording Cockpit & STT Transcription */}
          <div className="lg:col-span-6 space-y-6">
            {/* Voice Status & Provider Header */}
            <div className="p-5 rounded-2xl bg-[#090D1A] border border-purple-500/30 space-y-4 shadow-[0_0_25px_rgba(168,85,247,0.12)]">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Radio className={`w-4 h-4 ${isRecording ? 'text-red-400 animate-pulse' : 'text-purple-400'}`} />
                  <span className="font-bold text-white uppercase tracking-wider">
                    {isRecording ? 'Recording In Progress...' : isTranscribing ? 'Transcribing via Gemini 3.8 Flash...' : 'Spoken Grievance Cockpit'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 border border-purple-500/40 text-purple-300">
                  {transcriptionResult?.providerLabel || 'Gemini 3.8 Flash Neural Speech'}
                </span>
              </div>

              {/* Central Interactive Microphone Record Button */}
              <div className="py-6 text-center space-y-4">
                <div className="relative inline-flex items-center justify-center">
                  {isRecording && (
                    <span className="absolute w-32 h-32 rounded-full bg-red-500/20 animate-ping" />
                  )}
                  <button
                    type="button"
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xl ${
                      isRecording
                        ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-[0_0_35px_rgba(239,68,68,0.6)] scale-105'
                        : 'bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-8 h-8 fill-current mb-1" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider">STOP</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider">RECORD</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="font-mono text-3xl font-black text-white">
                    00:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}
                  </div>
                  <p className="text-xs text-slate-400">
                    {isRecording
                      ? 'Speak clearly — mention corridor, landmark, crater severity, or waterlogging'
                      : 'Tap Record to speak, or pick an offline benchmark voice clip below'}
                  </p>
                </div>

                {/* HTML5 Audio Playback (if recorded) */}
                {audioUrl && (
                  <div className="pt-2 max-w-sm mx-auto">
                    <audio controls src={audioUrl} className="w-full h-8 opacity-80" />
                  </div>
                )}
              </div>

              {/* 1-Click Benchmark Voice Clips */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Sample Voice Reports
                  </span>
                  <span className="text-[10px] font-mono text-purple-400">Quick select</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_VOICE_SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectDemoVoice(sample)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        voiceText === sample.transcript
                          ? 'bg-purple-950/60 border-purple-500/70 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                          : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate">{sample.title.split(' ')[0]}</span>
                        <span className="text-[10px] font-mono text-slate-400">{sample.duration}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{sample.location.split(',')[0]}</div>
                      <span className={`inline-block mt-1 text-[9px] font-mono px-1.5 py-0.2 rounded ${
                        sample.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {sample.severity}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Editable Transcription Text Area */}
            <div className="p-4 rounded-2xl bg-[#090C17] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Transcribed Spoken Complaint (Editable)
                </label>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Auto-Triage Active
                </span>
              </div>
              <textarea
                rows={3}
                value={voiceText}
                onChange={(e) => {
                  setVoiceText(e.target.value);
                  applyInterpretedData(e.target.value);
                }}
                placeholder="Citizen spoken complaint transcription..."
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 leading-relaxed font-sans"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Complainant Contact (SMS Tracking)
                  </label>
                  <input
                    type="text"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={submitVoiceOrTextComplaint}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Voice Grievance</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Real-time AI NLP Triage, Department Routing & Map */}
          <div className="lg:col-span-6 space-y-6">
            {/* Automated Department Routing Card */}
            <DepartmentRoutingBadge
              department={interpretedComplaint?.department.acronym || 'BBMP'}
              roadName={interpretedComplaint?.roadName || roadName}
              nodalOfficer={interpretedComplaint?.department.nodalOfficer}
              routingReason={interpretedComplaint?.department.routingReason}
            />

            {/* Location Picker Map */}
            <div className="rounded-2xl border border-white/10 bg-[#090C16] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    AI Resolved Bengaluru Location
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">
                  Click map to adjust GPS
                </span>
              </div>

              <div className="h-56 rounded-xl overflow-hidden border border-white/10 relative">
                <BengaluruMap
                  height="100%"
                  isPickerMode={true}
                  pickerCoordinates={selectedCoords}
                  onPickCoordinates={(coords) => {
                    setSelectedCoords(coords);
                    addToast('Coordinates Updated', `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E`, 'info');
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/5 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">CORRIDOR RESOLVED</span>
                  <span className="text-white font-medium truncate block">{interpretedComplaint?.roadName || roadName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SEVERITY TRIAGE</span>
                  <span className={`font-bold ${interpretedComplaint?.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
                    {interpretedComplaint?.severity || 'HIGH'} (~{interpretedComplaint?.estimatedDepthCm || 12} cm)
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Stage Stepper Preview */}
            <ComplaintTrackingStepper
              status="REPORTED"
              filedAt={sessionTimestamp}
              assignedAuthority={interpretedComplaint?.department.name || 'BBMP Road Infrastructure Dept'}
              compact={true}
            />
          </div>
        </div>
      )}

      {/* CHANNEL 3: TEXT COMPLAINT (WebNova Natural Language Channel) */}
      {submissionMode === 'TEXT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
          {/* Left Column: Text Grievance Cockpit */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-5 rounded-2xl bg-[#090D1A] border border-cyan-500/30 space-y-4 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white uppercase tracking-wider">
                    Natural Language Grievance Ingestion
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  Real-time NLP Parser
                </span>
              </div>

              {/* 1-Click Quick Prompts */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Quick Grievance Templates
                </span>
                <div className="space-y-1.5">
                  {[
                    {
                      title: 'Bellandur ORR Arterial Crater',
                      text: 'There is a very large pothole near Bellandur Outer Ring Road opposite EcoSpace skywalk and bikes are struggling to avoid it.'
                    },
                    {
                      title: 'Indiranagar 100ft Road Cavity',
                      text: 'Severe cavity on 100 Feet Road Indiranagar near CMH Hospital junction. Two-wheelers are swerving dangerously into oncoming traffic.'
                    },
                    {
                      title: 'Whitefield ITPL Waterlogged Cluster',
                      text: 'Waterlogged road crater cluster on ITPL Main Road near Metro pillar 421. Water covers the hole making it completely invisible to cars.'
                    }
                  ].map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTextComplaintChange(tmpl.text)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        textComplaintInput === tmpl.text
                          ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-200'
                          : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="font-bold">{tmpl.title}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{tmpl.text}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Hazard Description & Location Context
                </label>
                <textarea
                  rows={4}
                  value={textComplaintInput}
                  onChange={(e) => handleTextComplaintChange(e.target.value)}
                  placeholder="Describe road name, nearest landmark, crater size, waterlogging..."
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 leading-relaxed font-sans"
                />
              </div>

              {/* Reporter contact & submit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Contact Phone (SMS Tracking)
                  </label>
                  <input
                    type="text"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={submitVoiceOrTextComplaint}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Submit Grievance</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Department Routing, Map Picker & Stepper */}
          <div className="lg:col-span-6 space-y-6">
            <DepartmentRoutingBadge
              department={interpretedComplaint?.department.acronym || 'BBMP'}
              roadName={interpretedComplaint?.roadName || roadName}
              nodalOfficer={interpretedComplaint?.department.nodalOfficer}
              routingReason={interpretedComplaint?.department.routingReason}
            />

            <div className="rounded-2xl border border-white/10 bg-[#090C16] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Bengaluru GPS Pinpoint
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">
                  Click map to adjust GPS
                </span>
              </div>

              <div className="h-56 rounded-xl overflow-hidden border border-white/10 relative">
                <BengaluruMap
                  height="100%"
                  isPickerMode={true}
                  pickerCoordinates={selectedCoords}
                  onPickCoordinates={(coords) => {
                    setSelectedCoords(coords);
                    addToast('Coordinates Updated', `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E`, 'info');
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/5 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">ROAD CORRIDOR</span>
                  <span className="text-white font-medium truncate block">{interpretedComplaint?.roadName || roadName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SEVERITY TRIAGE</span>
                  <span className={`font-bold ${interpretedComplaint?.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
                    {interpretedComplaint?.severity || 'HIGH'} (~{interpretedComplaint?.estimatedDepthCm || 12} cm)
                  </span>
                </div>
              </div>
            </div>

            <ComplaintTrackingStepper
              status="REPORTED"
              filedAt={sessionTimestamp}
              assignedAuthority={interpretedComplaint?.department.name || 'BBMP Road Infrastructure Dept'}
              compact={true}
            />
          </div>
        </div>
      )}
    </div>
  )}

      {/* STAGE 2: CINEMATIC VISUAL ANALYSIS SCREEN */}
      {reportStep === 'CINEMATIC_ANALYSIS' && analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Bar for Vision Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-[#090C16] border border-white/10 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
                {analysisResult.modelName}
              </span>
              <span className="text-slate-400">
                Latency: <strong className="text-white">{analysisResult.inferenceTimeMs}ms</strong>
              </span>
              <span className="text-slate-400">
                Resolution: <strong className="text-white">{analysisResult.imageMetadata.width}×{analysisResult.imageMetadata.height}px</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPolygons(!showPolygons)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  showPolygons ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-400 border-white/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1" />
                {showPolygons ? 'Segmentation Masks ON' : 'Bounding Boxes Only'}
              </button>
              <button
                onClick={() => setReportStep('INPUT')}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 cursor-pointer"
              >
                ← Change Image
              </button>
            </div>
          </div>

          {/* Main Inspection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 cols: Image Viewport with Bounding Boxes */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#05070C] relative shadow-[0_0_35px_rgba(0,0,0,0.8)]">
              <div className="relative w-full overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Road Surface Defect View"
                  className="w-full h-auto max-h-[560px] object-contain block"
                />

                {/* Radar Scanline Sweep Animation */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f2fe] animate-pulse pointer-events-none" style={{ top: '48%' }} />

                {/* SVG Overlay for Bounding Boxes and Polygons */}
                <svg
                  viewBox={`0 0 ${analysisResult.imageMetadata.width} ${analysisResult.imageMetadata.height}`}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  {analysisResult.detections.map((det, idx) => {
                    const isSelected = activeDetectionId === det.id;
                    const isCritical = det.severity === 'Critical' || det.severity === 'High';
                    const strokeColor = isCritical ? '#f43f5e' : '#00f2fe';
                    const fillColor = isCritical ? 'rgba(244, 63, 94, 0.16)' : 'rgba(0, 242, 254, 0.14)';

                    return (
                      <g
                        key={det.id}
                        className="pointer-events-auto cursor-pointer"
                        onMouseEnter={() => setActiveDetectionId(det.id)}
                        onMouseLeave={() => setActiveDetectionId(null)}
                      >
                        {/* Optional Polygon mask */}
                        {showPolygons && det.polygon && det.polygon.length > 2 && (
                          <polygon
                            points={det.polygon.map(pt => `${pt[0]},${pt[1]}`).join(' ')}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth={isSelected ? 3.5 : 2}
                            strokeDasharray={isSelected ? '6,3' : 'none'}
                          />
                        )}

                        {/* Bounding Box rectangle */}
                        <rect
                          x={det.box.x}
                          y={det.box.y}
                          width={det.box.width}
                          height={det.box.height}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={isSelected ? 3.5 : 2.5}
                          rx={6}
                        />

                        {/* Corner Reticles */}
                        <path d={`M ${det.box.x} ${det.box.y + 14} L ${det.box.x} ${det.box.y} L ${det.box.x + 14} ${det.box.y}`} stroke="#fff" strokeWidth={3} fill="none" />
                        <path d={`M ${det.box.x + det.box.width - 14} ${det.box.y} L ${det.box.x + det.box.width} ${det.box.y} L ${det.box.x + det.box.width} ${det.box.y + 14}`} stroke="#fff" strokeWidth={3} fill="none" />
                        <path d={`M ${det.box.x} ${det.box.y + det.box.height - 14} L ${det.box.x} ${det.box.y + det.box.height} L ${det.box.x + 14} ${det.box.y + det.box.height}`} stroke="#fff" strokeWidth={3} fill="none" />
                        <path d={`M ${det.box.x + det.box.width - 14} ${det.box.y + det.box.height} L ${det.box.x + det.box.width} ${det.box.y + det.box.height} L ${det.box.x + det.box.width} ${det.box.y + det.box.height - 14}`} stroke="#fff" strokeWidth={3} fill="none" />

                        {/* Top Label Pill */}
                        <g transform={`translate(${det.box.x}, ${Math.max(22, det.box.y - 8)})`}>
                          <rect
                            x={0}
                            y={-20}
                            width={185}
                            height={24}
                            fill={isCritical ? 'rgba(244, 63, 94, 0.95)' : 'rgba(0, 242, 254, 0.95)'}
                            rx={4}
                          />
                          <text
                            x={8}
                            y={-4}
                            fill="#0a0d14"
                            fontSize={13}
                            fontWeight="800"
                            fontFamily="monospace"
                          >
                            POTHOLE #{idx + 1} • {(det.confidence * 100).toFixed(1)}%
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Viewport Telemetry Footer */}
              <div className="p-3 bg-[#090C16] border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                  Live Edge CV Sensor
                </span>
                <span className="text-slate-400">
                  {selectedCoords.lat.toFixed(4)}°N, {selectedCoords.lng.toFixed(4)}°E
                </span>
              </div>
            </div>

            {/* Right 5 cols: AI Analysis Panel & Pipeline */}
            <div className="lg:col-span-5 space-y-6">
              {/* Vision Analysis Panel matching exact prompt specification */}
              <div className="p-5 rounded-2xl bg-[#0A0D19] border border-cyan-500/40 shadow-[0_0_25px_rgba(0,242,254,0.15)] space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-cyan-400 tracking-wider uppercase">
                      VISION ANALYSIS
                    </span>
                    <h2 className="text-xl font-extrabold text-white">
                      Road Hazard Telemetry
                    </h2>
                  </div>
                  <div className="text-right">
                    {analysisResult.activePipelineMode === 'demo' || analysisResult.modelName?.includes('DEMO') ? (
                      <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold border border-purple-500/40 inline-block shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                        PROTOTYPE INFERENCE
                      </span>
                    ) : analysisResult.activePipelineMode === 'yolo' || analysisResult.modelName?.includes('YOLO') ? (
                      <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold border border-blue-500/40 inline-block shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                        YOLO INFERENCE {analysisResult.modelName?.includes('Adaptive') ? '(Prototype CV Fallback)' : ''}
                      </span>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/40 inline-block shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                          OPENCV INFERENCE
                        </span>
                        <span className="block text-[10px] text-cyan-400/80 font-mono">Prototype CV inference</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-xs text-slate-400 block mb-0.5">Potholes detected</span>
                    <span className="text-2xl font-black text-cyan-400">{analysisResult.potholeCount}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-xs text-slate-400 block mb-0.5">Largest pothole</span>
                    <span className="text-xl font-black text-red-400">
                      {analysisResult.detections[0]?.severity || 'High'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-xs text-slate-400 block mb-0.5">Confidence</span>
                    <span className="text-2xl font-black text-emerald-400">
                      {(analysisResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-xs text-slate-400 block mb-0.5">Estimated damage</span>
                    <span className="text-xl font-black text-red-400">{analysisResult.estimatedSeverity}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                  <div className="font-bold text-white">{analysisResult.roadCondition}</div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">{analysisResult.explanation}</div>
                </div>

                <div className="flex justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
                  <span>Surface Area: <strong className="text-white">{analysisResult.damageArea}</strong></span>
                  <span>Lane Obstruction: <strong className="text-amber-400">{analysisResult.damageImpact.roadObstructionPct}%</strong></span>
                </div>
              </div>

              {/* Animated Pipeline Progression as requested in prompt */}
              <div className="p-5 rounded-2xl bg-[#090C17] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white">Pipeline Progression</span>
                  <span className="text-emerald-400">
                    {activeStepIndex >= pipelineStepLabels.length ? 'ALL STEPS COMPLETE' : 'IN PROGRESS...'}
                  </span>
                </div>

                <div className="space-y-2">
                  {pipelineStepLabels.map((label, idx) => {
                    const isDone = activeStepIndex > idx;
                    const isActive = activeStepIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                          isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : isActive
                            ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                            : 'bg-white/[0.02] border-white/5 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isDone ? 'bg-emerald-500 text-black' : isActive ? 'bg-cyan-400 text-black animate-pulse' : 'bg-white/10 text-slate-500'
                          }`}>
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <span className={isDone ? 'text-slate-200' : isActive ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                            {label}
                          </span>
                        </div>

                        <span className="font-mono text-[10px]">
                          {isDone ? 'DONE' : isActive ? 'ACTIVE' : 'PENDING'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Primary Transition to Report */}
                <button
                  type="button"
                  onClick={finalizeAndGoToReport}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>VIEW INCIDENT DOSSIER &amp; DEDUPLICATION</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: REPORT SUMMARY & DEDUPLICATION VIEW */}
      {reportStep === 'REPORT_SUMMARY' && analysisResult && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Hero Banner matching exact prompt specification:
              POTHOLE DETECTED
              Priority: 94/100
              Severity: CRITICAL
              Reports merged: 17
              Then: "Continue to Road Intelligence"
          */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-red-950/50 via-[#0A0D1B] to-[#0A0D18] border border-red-500/40 shadow-[0_0_40px_rgba(244,63,94,0.25)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/50">
                <ShieldAlert className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <span className="text-xs font-mono font-extrabold text-red-400 tracking-widest uppercase">
                  HAZARD VERIFIED
                </span>
                <h1 className="text-4xl font-black text-white tracking-tight">
                  POTHOLE DETECTED
                </h1>
              </div>
            </div>

            {/* 3 Metric Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Priority */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase block mb-1">
                  Priority Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-cyan-400 font-mono">
                    {analysisResult.incident.priority}
                  </span>
                  <span className="text-lg font-bold text-slate-500 font-mono">/100</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: `${analysisResult.incident.priority}%` }} />
                </div>
              </div>

              {/* Severity */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase block mb-1">
                  Severity Level
                </span>
                <div className="text-4xl font-black text-red-400 tracking-wide font-mono">
                  {analysisResult.incident.severity.toUpperCase()}
                </div>
                <div className="text-xs text-slate-400 mt-2 truncate">
                  {analysisResult.roadCondition.split('/')[0]}
                </div>
              </div>

              {/* Reports Merged */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase block mb-1">
                  Reports Merged
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-sky-400 font-mono">
                    {analysisResult.incident.reportsMerged}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    ✓ CONSOLIDATED
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  No duplicate ticket created
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={navigateToRoadIntelligence}
                className="py-4 px-8 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Continue to Road Intelligence</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>

              <button
                type="button"
                onClick={() => setReportStep('CINEMATIC_ANALYSIS')}
                className="py-4 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Review Vision Overlay
              </button>
            </div>
          </div>

          {/* Duplicate Detection Card & Master Incident Dossier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duplicate Detection Verification */}
            <div className="p-6 rounded-2xl bg-[#0A0D19] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <FileCheck className="w-5 h-5" />
                <span>DUPLICATE DETECTION ENGINE</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs">
                <div className="font-mono text-emerald-400 font-bold mb-1">
                  {(analysisResult.duplicateCheck.duplicateProbability * 100).toFixed(0)}% MATCH CONFIDENCE
                </div>
                <div className="text-white font-medium">
                  {analysisResult.duplicateCheck.reason}
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Matched Master Incident:</span>
                  <strong className="text-cyan-400">{analysisResult.incident.id}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Action Taken:</span>
                  <strong className="text-emerald-400">Appended as Supporting Evidence</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <strong className="text-white">{analysisResult.incident.status}</strong>
                </div>
              </div>
            </div>

            {/* BBMP Ward & Contractor SLA Dossier */}
            <div className="p-6 rounded-2xl bg-[#0A0D19] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Building2 className="w-5 h-5" />
                <span>BBMP JURISDICTION &amp; CONTRACTOR SLA</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Corridor</span>
                  <span className="text-white font-bold">{analysisResult.incident.road}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Ward</span>
                    <span className="text-slate-200 font-medium">{analysisResult.incident.canonicalLocation.ward}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Zone</span>
                    <span className="text-slate-200 font-medium">{analysisResult.incident.canonicalLocation.zone}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Assigned Contractor</span>
                  <span className="text-amber-400 font-medium">{analysisResult.incident.contractor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* WebNova 4-Stage Lifecycle Stepper */}
          <ComplaintTrackingStepper
            status="REPORTED"
            filedAt={analysisResult.incident.lastReportedAt}
            assignedAuthority={analysisResult.incident.authority}
            contractorName={analysisResult.incident.contractor}
          />

          {/* WebNova Automated Department Routing */}
          <DepartmentRoutingBadge
            department={analysisResult.incident.authority?.includes('BMRCL') ? 'BMRCL' : analysisResult.incident.authority?.includes('BWSSB') ? 'BWSSB' : analysisResult.incident.authority?.includes('BESCOM') ? 'BESCOM' : 'BBMP'}
            roadName={analysisResult.incident.road}
            routingReason="Official maintenance covenant active. Automatically triaged and dispatched to municipal authority."
          />
        </div>
      )}
    </div>
  );
};
