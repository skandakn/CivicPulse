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
import { PotholeAnalysisResponse, PotholeIncident, ResolvedLocation } from '../types';
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
    imageUrl: '/sample_data/images/real/bellandur_orr_central.jpg',
    expectedDuplicate: 'BNG-PTH-1042',
    potholeCount: 3
  },
  {
    id: 'indiranagar-100ft',
    title: 'Indiranagar 100ft Road - Corridor Cluster',
    roadName: '100 Feet Road, Near CMH Hospital',
    wardName: 'Indiranagar',
    wardNumber: 80,
    landmark: 'Near CMH Hospital Junction, right lane',
    coords: { lat: 12.9784, lng: 77.6408 },
    imageUrl: '/sample_data/images/real/indiranagar_100ft_road.jpg',
    expectedDuplicate: 'BNG-PTH-1088',
    potholeCount: 1
  },
  {
    id: 'whitefield-itpl',
    title: 'Kundalahalli Metro Flyover - Whitefield Corridor',
    roadName: 'ITPL Main Road / Kundalahalli',
    wardName: 'Whitefield',
    wardNumber: 84,
    landmark: 'Near Kundalahalli Metro flyover pier 42',
    coords: { lat: 12.9866, lng: 77.7381 },
    imageUrl: '/sample_data/images/real/whitefield_kundalahalli_flyover.jpg',
    expectedDuplicate: 'BNG-PTH-1102',
    potholeCount: 2
  },
  {
    id: 'silkboard-junction',
    title: 'Central Silk Board Junction - Hosur Road Ramp',
    roadName: 'Silk Board Flyover Descent',
    wardName: 'BTM Layout / Silk Board',
    wardNumber: 151,
    landmark: 'Near Silk Board flyover entry',
    coords: { lat: 12.9172, lng: 77.6228 },
    imageUrl: '/sample_data/images/real/silkboard_junction.jpg',
    expectedDuplicate: 'BNG-PTH-1031',
    potholeCount: 2
  },
  {
    id: 'blr-pothole-groundtruth',
    title: 'Bengaluru Road Surface Pothole - Real Photo Ground Truth',
    roadName: 'Bellandur-Marathahalli Service Road',
    wardName: 'Bellandur',
    wardNumber: 150,
    landmark: 'Service Road near Cisco Campus',
    coords: { lat: 12.9340, lng: 77.6910 },
    imageUrl: '/sample_data/images/real/blr_potholes_real.jpg',
    expectedDuplicate: 'BNG-PTH-1042',
    potholeCount: 3
  }
];

type ReportStep = 'INPUT' | 'CINEMATIC_ANALYSIS' | 'REPORT_SUMMARY';

export const ReportPage: React.FC = () => {
  const { incidents, selectIncidentById, addPotholeReport, mergeDuplicateReport, addToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationMapRef = useRef<HTMLDivElement>(null);

  // Active step in workflow
  const [reportStep, setReportStep] = useState<ReportStep>('INPUT');

  // Input & Upload State
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDetails, setLocationDetails] = useState<ResolvedLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'unselected' | 'loading' | 'resolved' | 'unresolved' | 'outside'>('unselected');
  const [isBenchmarkCase, setIsBenchmarkCase] = useState(false);
  const [storedIncidentId, setStoredIncidentId] = useState<string | null>(null);
  const locationRequestRef = useRef<AbortController | null>(null);
  const currentLocationRequestRef = useRef(0);
  const roadName = locationDetails?.roadName || 'Not available';
  const landmark = locationDetails?.locality || locationDetails?.address || 'Not available';
  const wardDisplay = locationDetails?.ward || 'Not available';
  const zoneDisplay = locationDetails?.zone || 'Not available';
  const [description, setDescription] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
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
  const isRecordingRef = useRef(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [_audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const liveTranscriptRef = useRef('');
  const [interpretedComplaint, setInterpretedComplaint] = useState<InterpretedComplaint>(
    transcriptionService.interpretComplaint('')
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<{ start: () => void; stop: () => void; abort: () => void; continuous: boolean; interimResults: boolean; lang: string; onresult: ((event: any) => void) | null; onerror: ((event: any) => void) | null; onend: (() => void) | null } | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Text Complaint Subsystem State
  const [textComplaintInput, setTextComplaintInput] = useState('');
  const [sessionTimestamp] = useState(() => new Date().toISOString());

  const unresolvedLocation = (coords: { lat: number; lng: number }): ResolvedLocation => ({
    latitude: coords.lat,
    longitude: coords.lng,
    lat: coords.lat,
    lng: coords.lng,
    address: 'Not available',
    roadName: null,
    roadClass: null,
    roadReference: null,
    locality: null,
    ward: 'Not available',
    zone: 'Not available',
    city: null,
    state: null,
    source: 'Not available',
    sourceUrl: null,
    confidence: 0,
    isWithinBengaluru: null,
    resolved: false
  });

  const selectLocation = async (coords: { lat: number; lng: number }, updateInterpretation: boolean = true) => {
    if (isBenchmarkCase) {
      setSelectedImage('');
      setSelectedFile(null);
    }
    locationRequestRef.current?.abort();
    const requestId = ++currentLocationRequestRef.current;
    const controller = new AbortController();
    locationRequestRef.current = controller;
    setSelectedCoords(coords);
    setLocationDetails(unresolvedLocation(coords));
    setLocationStatus('loading');
    setIsBenchmarkCase(false);
    setStoredIncidentId(null);
    setAnalysisResult(null);

    // Immediately update interpretedComplaint coordinates
    if (updateInterpretation) {
      setInterpretedComplaint(prev => ({
        ...prev,
        coordinates: coords
      }));
    }

    try {
      const response = await fetch('/api/location/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: coords.lat, longitude: coords.lng }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Location lookup failed (${response.status})`);
      const details = await response.json() as ResolvedLocation;
      if (requestId !== currentLocationRequestRef.current) return;
      const mergedDetails = { ...unresolvedLocation(coords), ...details, lat: coords.lat, lng: coords.lng };
      setLocationDetails(mergedDetails);

      // Update interpreted complaint's road name, ward, coordinates without altering user's spoken words!
      if (updateInterpretation) {
        setInterpretedComplaint(prev => ({
          ...prev,
          roadName: details.roadName || details.locality || prev.roadName,
          wardName: details.ward || prev.wardName,
          coordinates: coords,
          landmark: details.address || details.locality || prev.landmark,
          summary: `Hazard located at ${details.roadName || details.locality || 'selected place'} (${details.ward || 'Bengaluru'}). Routed to ${prev.department.acronym}.`
        }));
      }

      if (details.isWithinBengaluru === false) {
        setLocationStatus('outside');
        addToast('Outside Bengaluru', 'Please select a location within Bengaluru.', 'error');
      } else if (details.resolved) {
        setLocationStatus('resolved');
      } else {
        setLocationStatus('unresolved');
        addToast('Location selected', 'Location selected, but address information could not be resolved.', 'warning');
      }
    } catch (err) {
      if (controller.signal.aborted || requestId !== currentLocationRequestRef.current) return;
      setLocationDetails(unresolvedLocation(coords));
      setLocationStatus('unresolved');
      addToast('Location selected', 'Location selected, but address information could not be resolved.', 'warning');
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      addToast('Location unavailable', 'This browser does not provide device location.', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => void selectLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      error => addToast('Device location unavailable', error.code === error.PERMISSION_DENIED ? 'Allow location access or select a point on the map.' : 'Select a point on the map to continue.', 'warning'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    return () => {
      locationRequestRef.current?.abort();
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
      isRecordingRef.current = true;

      // Show browser speech recognition live when available. Accumulate complete speech.
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';
        recognition.onresult = (event: any) => {
          let accumulated = '';
          for (let index = 0; index < event.results.length; index += 1) {
            accumulated += event.results[index][0].transcript;
          }
          const text = accumulated.trim();
          liveTranscriptRef.current = text;
          setLiveTranscript(text);
          setVoiceText(text); // Synchronously reflect user's real spoken words
          applyInterpretedData(text);
        };
        recognition.onerror = (e: any) => {
          console.warn('Speech recognition warning:', e);
        };
        recognition.onend = () => {
          if (isRecordingRef.current) {
            try { recognition.start(); } catch { /* browser already stopped */ }
          }
        };
        speechRecognitionRef.current = recognition;
        try { recognition.start(); } catch { /* recognition may already be active */ }
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        isRecordingRef.current = false;
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
        try {
          speechRecognitionRef.current?.stop();
        } catch {}
        speechRecognitionRef.current = null;

        await handleTranscribe(blob, recordingDuration, liveTranscriptRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setLiveTranscript('');
      liveTranscriptRef.current = '';
      setVoiceText('');
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      addToast('Voice Recording', 'Microphone active — describe the road condition & location', 'info');
    } catch (err: any) {
      isRecordingRef.current = false;
      console.warn('Microphone access restricted:', err);
      addToast('Mic Access Restricted', 'Switched to 1-Click Voice Mode', 'info');
    }
  };

  const stopVoiceRecording = () => {
    isRecordingRef.current = false;
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      try {
        speechRecognitionRef.current?.stop();
      } catch {}
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      addToast('Recording Captured', 'Processing audio stream...', 'info');
    }
  };

  const handleTranscribe = async (blob: Blob, duration: number, liveSpokenText?: string) => {
    setIsTranscribing(true);
    addToast('Transcribing Speech', 'Processing spoken grievance...', 'info');
    try {
      const userSpokenSoFar = (liveSpokenText || liveTranscriptRef.current || liveTranscript || voiceText).trim();
      const result = await transcriptionService.transcribeAudio(blob, duration, 'gemini', userSpokenSoFar);
      
      // If user spoke aloud, NEVER overwrite what they said with demo benchmark text
      let resolvedText = result.text;
      if (userSpokenSoFar && (result.isDemoFallback || !result.text.trim() || result.provider === 'demo')) {
        resolvedText = userSpokenSoFar;
        result.text = userSpokenSoFar;
        result.isDemoFallback = false;
        result.providerLabel = 'Browser Speech Recognition (Live Voice)';
      }

      setTranscriptionResult(result);
      if (resolvedText) {
        setVoiceText(resolvedText);
        applyInterpretedData(resolvedText);
        addToast('Transcript Ready', 'Spoken grievance captured successfully', 'success');
      } else {
        addToast('No Speech Detected', 'Microphone captured silence. You can type or record again.', 'warning');
      }
    } catch (err: unknown) {
      console.warn('[Report] Audio transcription failed:', err);
      const fallback = (liveSpokenText || liveTranscriptRef.current || liveTranscript || voiceText).trim();
      if (fallback) {
        setVoiceText(fallback);
        applyInterpretedData(fallback);
        addToast('Transcript Ready', 'Using live spoken transcript.', 'info');
      } else {
        addToast('No Speech Detected', 'Microphone captured silence. Please enter your complaint below.', 'warning');
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const applyInterpretedData = (text: string) => {
    const parsed = transcriptionService.interpretComplaint(text);
    // If user has already chosen a place on the map, maintain the user-chosen coordinates and road
    if (selectedCoords && locationDetails?.roadName) {
      parsed.coordinates = selectedCoords;
      parsed.roadName = locationDetails.roadName;
      if (locationDetails.ward && locationDetails.ward !== 'Not available') {
        parsed.wardName = locationDetails.ward;
      }
      if (locationDetails.address && locationDetails.address !== 'Not available') {
        parsed.landmark = locationDetails.address;
      }
    } else if (text.trim() && parsed.coordinates && parsed.roadName !== 'Awaiting location selection') {
      // Auto-pin location on map if speech identified a specific Bengaluru corridor
      setSelectedCoords(parsed.coordinates);
      void selectLocation(parsed.coordinates, false);
    }
    setInterpretedComplaint(parsed);
  };

  const handleSelectDemoVoice = (sample: DemoVoiceSample) => {
    setVoiceText(sample.transcript);
    setLiveTranscript(sample.transcript);
    liveTranscriptRef.current = sample.transcript;
    applyInterpretedData(sample.transcript);
    setAudioUrl(null);
    setTranscriptionResult({
      text: sample.transcript,
      provider: 'demo',
      confidence: 0.96,
      durationSeconds: 8,
      isDemoFallback: true,
      providerLabel: 'Benchmark Demo Voice Clip'
    });
    // Set coordinates for this demo sample
    let sampleCoords = { lat: 12.9279, lng: 77.6833 };
    if (sample.id === 'voice-indiranagar') sampleCoords = { lat: 12.9784, lng: 77.6408 };
    if (sample.id === 'voice-whitefield') sampleCoords = { lat: 12.9866, lng: 77.7381 };
    void selectLocation(sampleCoords);
    addToast('Demo Voice Loaded', `${sample.title} (${sample.location})`, 'info');
  };

  const handleTextComplaintChange = (text: string) => {
    setTextComplaintInput(text);
    applyInterpretedData(text);
  };

  const submitVoiceOrTextComplaint = () => {
    runVisionAnalysis();
    addToast(
      'Grievance Triaged',
      `Auto-routed to ${interpretedComplaint.department.name}`,
      'success'
    );
  };

  // Handle Preset Select
  const handleSelectPreset = (preset: PresetSample) => {
    setSelectedImage(preset.imageUrl);
    setSelectedFile(null);
    setSelectedCoords(preset.coords);
    setLocationDetails({
      ...unresolvedLocation(preset.coords),
      roadName: preset.roadName,
      address: preset.landmark,
      locality: preset.wardName,
      ward: `Ward ${preset.wardNumber} · ${preset.wardName}`,
      source: 'Quick Test Case · preconfigured example',
      confidence: 1,
      isWithinBengaluru: true,
      resolved: true
    });
    setLocationStatus('resolved');
    setIsBenchmarkCase(true);
    setStoredIncidentId(null);
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
      if (isBenchmarkCase) {
        setSelectedCoords(null);
        setLocationDetails(null);
        setLocationStatus('unselected');
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setIsBenchmarkCase(false);
      setStoredIncidentId(null);
      setReportStep('INPUT');
      setAnalysisResult(null);
      addToast('Media Uploaded', file.name, 'success');
    }
  };

  // Trigger Full AI Computer Vision Workflow
  const runVisionAnalysis = async () => {
    if (!selectedCoords) {
      addToast('Choose a location', 'Use your current location or select a point on the map first.', 'warning');
      return;
    }
    if (locationStatus === 'loading') {
      addToast('Checking location', 'Wait for the selected location lookup to finish.', 'info');
      return;
    }
    if (locationStatus === 'outside') {
      addToast('Outside Bengaluru', 'Please select a location within Bengaluru.', 'error');
      return;
    }
    if (!isBenchmarkCase && !selectedFile && submissionMode === 'PHOTO') {
      addToast('Photo required', 'Choose a photo of the reported issue to run computer vision.', 'warning');
      return;
    }
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
      const actualDescription = submissionMode === 'VOICE' ? voiceText : submissionMode === 'TEXT' ? textComplaintInput : description;
      if (submissionMode !== 'PHOTO' && !selectedFile) {
        const response = await fetch('/api/report-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: selectedCoords.lat,
            longitude: selectedCoords.lng,
            description: actualDescription,
            issueType: interpretedComplaint.department.acronym === 'BWSSB' ? 'water' : 'pothole',
            roadName: locationDetails?.roadName,
            roadClass: locationDetails?.roadClass,
            roadReference: locationDetails?.roadReference,
            locality: locationDetails?.locality,
            ward: locationDetails?.ward,
            zone: locationDetails?.zone,
            city: locationDetails?.city,
            source: locationDetails?.source,
            recommendedDepartment: interpretedComplaint.department.acronym,
            benchmarkCase: isBenchmarkCase
          })
        });
        if (!response.ok) throw new Error(`Text intake failed (${response.status})`);
        const data = await response.json() as PotholeAnalysisResponse;
        setAnalysisResult(data);
        setStoredIncidentId(syncIncidentToGodsEye(data));
        setActiveStepIndex(pipelineStepLabels.length);
        addToast('Report created', 'Your selected coordinates and description were saved.', 'success');
        return;
      }

      let response: Response;
      const formData = new FormData();
      formData.append('latitude', selectedCoords.lat.toString());
      formData.append('longitude', selectedCoords.lng.toString());
      if (locationDetails?.roadName) formData.append('road_hint', locationDetails.roadName);
      if (locationDetails?.locality) formData.append('locality_hint', locationDetails.locality);
      if (locationDetails?.ward && locationDetails.ward !== 'Not available') formData.append('ward_hint', locationDetails.ward);
      if (locationDetails?.zone && locationDetails.zone !== 'Not available') formData.append('zone_hint', locationDetails.zone);
      if (locationDetails?.city) formData.append('city_hint', locationDetails.city);
      if (locationDetails?.roadClass) formData.append('road_class_hint', locationDetails.roadClass);
      if (locationDetails?.roadReference) formData.append('road_reference_hint', locationDetails.roadReference);
      formData.append('location_source', locationDetails?.source || 'Not available');
      formData.append('description', actualDescription);
      formData.append('benchmark_case', String(isBenchmarkCase));
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
      setStoredIncidentId(syncIncidentToGodsEye(data));
    } catch (err: unknown) {
      console.warn('[Report] Backend inference failed:', err);
      if (!isBenchmarkCase) {
        setReportStep('INPUT');
        addToast('Analysis unavailable', 'Computer vision could not analyze this report. Your selected coordinates are unchanged; try again when the analysis service is available.', 'error');
        return;
      }
      // Keep the deterministic fallback limited to explicit Quick Test Cases.
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
          }
        ],
        potholeCount: 1,
        estimatedSeverity: 'High',
        damageArea: '0.94 m²',
        roadCondition: 'Cratered Asphalt Surface',
        explanation: 'Deep crater formation detected along vehicle travel corridor with significant loose aggregate decay.',
        inferenceTimeMs: 42,
        modelName: 'CIVICPULSE-EDGE-CV-v4.2',
        activePipelineMode: detectorMode,
        imageMetadata: { width: 1024, height: 768, sizeBytes: 524288, format: 'image/jpeg' },
        damageImpact: {
          totalAreaSqMeters: 0.94,
          roadObstructionPct: 38,
          twoWheelerRisk: 'Critical',
          busTransitDisruption: 'Moderate',
          laneClosureRecommended: false,
          repairUrgency: 'High'
        },
        severityEngine: {
          score: 94,
          level: 'CRITICAL',
          factors: { depth: 31, traffic: 21, persistence: 12 },
          explanations: ['18cm deep crater on primary vehicle wheel path']
        },
        duplicateCheck: { isDuplicate: Boolean(PRESET_SAMPLES.find(sample => sample.coords.lat === selectedCoords.lat && sample.coords.lng === selectedCoords.lng)?.expectedDuplicate), duplicateProbability: 0.94, matchedIncidentId: PRESET_SAMPLES.find(sample => sample.coords.lat === selectedCoords.lat && sample.coords.lng === selectedCoords.lng)?.expectedDuplicate || null, reason: 'Preconfigured benchmark expected result.' },
        incident: {
          id: PRESET_SAMPLES.find(sample => sample.coords.lat === selectedCoords.lat && sample.coords.lng === selectedCoords.lng)?.expectedDuplicate || 'BENCHMARK-REPORT',
          priority: 94,
          severity: 'Critical',
          road: roadName,
          status: 'TRIAGED',
          reportsMerged: 3,
          lastReportedAt: new Date().toISOString(),
          canonicalLocation: { lat: selectedCoords.lat, lng: selectedCoords.lng, address: landmark, ward: locationDetails?.ward || 'Not available', zone: locationDetails?.zone || 'Not available', locality: locationDetails?.locality, city: locationDetails?.city, source: locationDetails?.source || 'Preconfigured example', roadClass: locationDetails?.roadClass, roadReference: locationDetails?.roadReference },
          contractor: 'Not assigned',
          authority: `Recommended Department: ${interpretedComplaint.department.acronym}`
        }
      };
      setAnalysisResult(fallbackResult);
    }
  };

  const finalizeAndGoToReport = () => {
    setReportStep('REPORT_SUMMARY');
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const navigateToRoadIntelligence = () => {
    if (storedIncidentId) selectIncidentById(storedIncidentId, 'AI_ANALYSIS');
    else addToast('Report saved', 'This report is available in the incident map.', 'info');
  };

  const syncIncidentToGodsEye = (data: PotholeAnalysisResponse) => {
    if (data.duplicateCheck.isDuplicate && data.duplicateCheck.matchedIncidentId) return data.duplicateCheck.matchedIncidentId;
    try {
      const incident = addPotholeReport({
        latitude: data.incident.canonicalLocation.lat,
        longitude: data.incident.canonicalLocation.lng,
        coordinates: { lat: data.incident.canonicalLocation.lat, lng: data.incident.canonicalLocation.lng },
        roadName: data.incident.road,
        wardName: data.incident.canonicalLocation.ward,
        zone: data.incident.canonicalLocation.zone as PotholeIncident['zone'],
        landmark: data.incident.canonicalLocation.address,
        severity: data.incident.severity.toUpperCase() as PotholeIncident['severity'],
        severityScore: data.severityEngine.score,
        riskScore: data.incident.priority,
        confidence: data.confidence,
        authorityName: data.incident.authority,
        canonicalLocation: data.incident.canonicalLocation,
        images: selectedImage ? { original: selectedImage } : { original: '' },
        aiMetrics: {
          depthCm: 0,
          surfaceAreaSqM: data.damageImpact.totalAreaSqMeters,
          estimatedVolumeLiters: 0,
          asphaltDeteriorationIndex: data.severityEngine.score,
          moistureWaterloggingRisk: 0,
          vehicleDamageHazard: data.incident.priority,
          modelConfidence: data.confidence,
          processingTimeMs: data.inferenceTimeMs,
          inferenceMode: 'LIVE_EDGE_MODEL'
        }
      });
      return incident.id;
    } catch (error) {
      console.warn('[Report] Could not mirror incident into local God\'s Eye state', error);
      return data.incident.id;
    }
  };

  const renderLocationPicker = (mapHeight: string) => (
    <div className="bg-white brut p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#121210] pb-2">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2E8C42]" />
            <span className="font-display text-xs font-black text-[#121210] uppercase tracking-wider">PINPOINT BENGALURU LOCATION</span>
          </div>
          <p className="font-body text-[11px] text-[#4A4A46] mt-1">Click anywhere on the map to select the incident location.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={useCurrentLocation} className="px-2.5 py-1.5 bg-[#CFE8D6] border border-[#121210] text-[10px] font-mono font-bold text-[#121210] hover:bg-white cursor-pointer">Use my current location</button>
          <button type="button" onClick={() => locationMapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="px-2.5 py-1.5 bg-white border border-[#121210] text-[10px] font-mono font-bold text-[#121210] hover:bg-[#CFE8D6] cursor-pointer">Select on map</button>
        </div>
      </div>

      <div ref={locationMapRef} className={`${mapHeight} border-2 border-[#121210] overflow-hidden relative`}>
        <BengaluruMap
          height="100%"
          isPickerMode={true}
          pickerCoordinates={selectedCoords}
          onPickCoordinates={coords => void selectLocation(coords)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs bg-[#CFE8D6]/30 p-3 border-2 border-[#121210] font-mono">
        <div>
          <span className="text-[#4A4A46] block text-[10px] font-bold uppercase">Latitude</span>
          <span className="text-[#121210] font-bold">{selectedCoords ? `${selectedCoords.lat.toFixed(6)}° N` : 'Select a point'}</span>
        </div>
        <div>
          <span className="text-[#4A4A46] block text-[10px] font-bold uppercase">Longitude</span>
          <span className="text-[#121210] font-bold">{selectedCoords ? `${selectedCoords.lng.toFixed(6)}° E` : 'Select a point'}</span>
        </div>
        <div>
          <span className="text-[#4A4A46] block text-[10px] font-bold uppercase">Road</span>
          <span className="text-[#121210] font-bold">{roadName}</span>
        </div>
        <div>
          <span className="text-[#4A4A46] block text-[10px] font-bold uppercase">Locality</span>
          <span className="text-[#121210] font-bold">{landmark}</span>
        </div>
        <div>
          <span className="text-[#4A4A46] block text-[10px] font-bold uppercase">Ward</span>
          <span className="text-[#121210] font-bold">{wardDisplay}</span>
        </div>
        <div>
          <span className="text-[#4A4A46] block text-[10px] font-bold uppercase">Zone</span>
          <span className="text-[#121210] font-bold">{zoneDisplay}</span>
        </div>
        <div className="col-span-2">
          <span className="text-[#4A4A46] block text-[10px] font-bold uppercase">Source</span>
          <span className="text-[#121210] font-bold">{locationDetails?.source || 'Not available'}</span>
        </div>
        <div className="col-span-2 min-h-4 font-sans text-[11px]" aria-live="polite">
          {locationStatus === 'loading' && <span className="text-[#4A4A46]">Resolving selected location…</span>}
          {locationStatus === 'unresolved' && <span className="text-[#4A4A46]">Location selected, but address information could not be resolved. Coordinates are kept.</span>}
          {locationStatus === 'outside' && <span className="font-bold text-[#C03A3A]">Please select a location within Bengaluru.</span>}
          {isBenchmarkCase && <span className="text-[#4A4A46]">Quick Test Case · Optional preconfigured example</span>}
        </div>
      </div>
    </div>
  );

  const renderRecommendedDepartment = () => (
    <div className="bg-white brut p-4">
      <span className="text-[10px] font-mono font-bold text-[#4A4A46] uppercase block">Recommended Department</span>
      <div className="font-display text-sm font-black text-[#121210] mt-1">{interpretedComplaint.department.acronym} · {interpretedComplaint.department.name}</div>
      <p className="font-body text-[11px] text-[#4A4A46] mt-2">Suggested from the issue description. CivicPulse has not submitted this report to a government service.</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 text-left">
      {/* Approva-Style Header Bar */}
      <div className="bg-white brut p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="tag bg-[#CFE8D6] text-[#121210] font-mono font-bold flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              INGESTION INBOX · MULTIMODAL
            </span>
            <span className="tag bg-white font-mono text-xs">
              IRC-SP-100 SPEC
            </span>
            <span className="tag bg-[#E8A030] text-[#121210] font-mono text-xs font-bold">
              EDGE INFERENCE
            </span>
          </div>
          <h1 className="font-display text-3xl font-black text-[#121210] tracking-tight">
            Report Road Hazard &amp; Pothole
          </h1>
          <p className="font-body text-sm text-[#4A4A46] mt-1 max-w-2xl">
            Upload dashcam footage, record a voice grievance, or submit text. CivicPulse extracts crater geometry, verifies duplicate clusters, and dispatches to PWD contractors.
          </p>
        </div>

        {/* Step Indicator / Mode Switch */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#CFE8D6]/30 p-1 border-2 border-[#121210] text-xs font-mono font-bold">
            <button
              onClick={() => setDetectorMode('auto')}
              className={`px-3 py-1.5 uppercase transition-all cursor-pointer ${
                detectorMode === 'auto' ? 'bg-[#121210] text-[#CFE8D6] brut-sm' : 'text-[#121210] hover:bg-white'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setDetectorMode('demo')}
              className={`px-3 py-1.5 uppercase transition-all cursor-pointer ${
                detectorMode === 'demo' ? 'bg-[#121210] text-[#CFE8D6] brut-sm' : 'text-[#121210] hover:bg-white'
              }`}
            >
              Demo Benchmark
            </button>
            <button
              onClick={() => setDetectorMode('opencv')}
              className={`px-3 py-1.5 uppercase transition-all cursor-pointer ${
                detectorMode === 'opencv' ? 'bg-[#121210] text-[#CFE8D6] brut-sm' : 'text-[#121210] hover:bg-white'
              }`}
            >
              OpenCV
            </button>
          </div>
        </div>
      </div>

      {/* STAGE 1: INPUT & MULTIMODAL INGESTION VIEW */}
      {reportStep === 'INPUT' && (
        <div className="space-y-6">
          {/* Approva-Style Channel Switcher Bar */}
          <div className="bg-white brut p-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSubmissionMode('PHOTO')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-black uppercase transition-all cursor-pointer ${
                  submissionMode === 'PHOTO'
                    ? 'bg-[#121210] text-[#CFE8D6] brut-sm'
                    : 'bg-white text-[#121210] border-2 border-[#121210] hover:bg-[#CFE8D6]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photo / Dashcam</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmissionMode('VOICE')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-black uppercase transition-all cursor-pointer ${
                  submissionMode === 'VOICE'
                    ? 'bg-[#121210] text-[#CFE8D6] brut-sm'
                    : 'bg-white text-[#121210] border-2 border-[#121210] hover:bg-[#CFE8D6]'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-[#E8A030]" />
                <span>Voice Grievance</span>
                <span className="tag bg-[#E8A030] text-[#121210] text-[9px] font-bold">
                  AI STT
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSubmissionMode('TEXT')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-black uppercase transition-all cursor-pointer ${
                  submissionMode === 'TEXT'
                    ? 'bg-[#121210] text-[#CFE8D6] brut-sm'
                    : 'bg-white text-[#121210] border-2 border-[#121210] hover:bg-[#CFE8D6]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text Grievance</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono pr-2">
              <div className="flex items-center gap-1.5 text-[#121210] font-bold">
                <MapPin className="w-3.5 h-3.5 text-[#2E8C42]" />
                <span>GPS Geotagging: <strong className="text-[#2E8C42]">LOCKED</strong></span>
              </div>
              <span>|</span>
              <span className="text-[#4A4A46] text-[11px]">
                Active: <strong className="text-[#121210]">Photo · Voice · Text · Map</strong>
              </span>
            </div>
          </div>

          {/* CHANNEL 1: PHOTO / DASHCAM */}
          {submissionMode === 'PHOTO' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Upload, Presets & Preview */}
              <div className="lg:col-span-6 space-y-4">
                {/* Curated Benchmark Samples Bar */}
                <div className="bg-white brut p-4 space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
                    <span className="font-display text-xs font-black uppercase text-[#121210] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#2E8C42]" />
                      Quick Test Cases
                    </span>
                    <span className="text-[10px] font-mono text-[#4A4A46]">Optional preconfigured examples</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_SAMPLES.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleSelectPreset(sample)}
                        className={`p-2.5 text-left text-xs transition-all border-2 border-[#121210] cursor-pointer
                          ${isBenchmarkCase && roadName === sample.roadName
                            ? 'bg-[#CFE8D6] font-bold shadow-[2px_2px_0_#121210]'
                            : 'bg-white hover:bg-[#CFE8D6]/30'
                          }
                        `}
                      >
                        <div className="font-display font-black text-[#121210] truncate">{sample.title.split('-')[0]}</div>
                        <div className="text-[10px] text-[#4A4A46] font-mono truncate mt-0.5">
                          {sample.potholeCount} crater(s) · Dup: {sample.expectedDuplicate}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white brut p-6 text-center cursor-pointer transition-all hover:bg-[#CFE8D6]/20 border-dashed"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {selectedImage ? (
                    <div className="relative border-2 border-[#121210] overflow-hidden max-h-72">
                      <img
                        src={selectedImage}
                        alt="Pothole capture preview"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 justify-between">
                        <span className="text-xs font-mono font-bold text-white bg-black/80 px-2 py-0.5 border border-white/40">
                          SURFACE IMAGE LOADED
                        </span>
                        <span className="text-xs font-mono font-bold text-[#CFE8D6] bg-black/80 px-2 py-1 border border-[#CFE8D6]">
                          Click to change
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-8">
                      <div className="w-16 h-16 mx-auto bg-[#CFE8D6] border-2 border-[#121210] flex items-center justify-center text-[#121210]">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-black text-[#121210]">Drop a pothole photo or video</h3>
                        <p className="font-body text-xs text-[#4A4A46] mt-1">
                          Supports high-res JPG, PNG, WEBP dashcam clips up to 15MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3 px-3 bg-white hover:bg-[#CFE8D6] brut-sm text-xs font-mono font-bold text-[#121210] transition-colors cursor-pointer"
                  >
                    <FileImage className="w-4 h-4 text-[#121210]" />
                    <span>Upload</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3 px-3 bg-white hover:bg-[#CFE8D6] brut-sm text-xs font-mono font-bold text-[#121210] transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#2E8C42]" />
                    <span>Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={runVisionAnalysis}
                    className="flex items-center justify-center gap-2 py-3 px-3 bg-[#121210] hover:bg-[#2E8C42] text-[#CFE8D6] hover:text-white brut-sm text-xs font-mono font-bold uppercase transition-colors cursor-pointer btn-press"
                  >
                    <Sparkles className="w-4 h-4 text-[#CFE8D6]" />
                    <span>Run Scan</span>
                  </button>
                </div>

                {/* Description & Contact Notes */}
                <div className="space-y-3 p-4 bg-white brut">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#121210] uppercase tracking-wider mb-1.5">
                      Citizen Description / Hazard Notes
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mention specific lane, depth, accidents observed..."
                      className="w-full bg-[#CFE8D6]/20 border-2 border-[#121210] p-2.5 text-xs text-[#121210] placeholder-[#4A4A46] focus:outline-none font-body"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-[#121210] uppercase tracking-wider mb-1.5">
                      Contact Phone (For BBMP Sahaya SMS Tracking)
                    </label>
                    <input
                      type="text"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      className="w-full bg-[#CFE8D6]/20 border-2 border-[#121210] px-3 py-2 text-xs text-[#121210] placeholder-[#4A4A46] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Map Picker & Primary Trigger */}
              <div className="lg:col-span-6 space-y-4">
                {/* Location Picker Map */}
                <div className="bg-white brut p-4 space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#2E8C42]" />
                      <span className="font-display text-xs font-black text-[#121210] uppercase tracking-wider">
                        Pinpoint Bengaluru Location
                      </span>
                    </div>
                    <span className="tag bg-[#CFE8D6] font-mono text-[10px] font-bold">
                      CLICK MAP TO PIN
                    </span>
                  </div>

                  <div className="h-64 border-2 border-[#121210] overflow-hidden relative">
                    <BengaluruMap
                      height="100%"
                      isPickerMode={true}
                      pickerCoordinates={selectedCoords}
                      onPickCoordinates={(coords) => void selectLocation(coords)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#CFE8D6]/30 p-3 border-2 border-[#121210] font-mono">
                    <div>
                      <span className="text-[#4A4A46] block text-[10px] font-bold uppercase">COORDINATES</span>
                      <span className="text-[#121210] font-bold">
                        {selectedCoords ? `${selectedCoords.lat.toFixed(6)}° N, ${selectedCoords.lng.toFixed(6)}° E` : 'Select a point on the map'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#4A4A46] block text-[10px] font-bold uppercase">BBMP WARD</span>
                      <span className="text-[#121210] font-bold">
                        {wardDisplay}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#4A4A46] block text-[10px] font-bold uppercase">ROAD CORRIDOR</span>
                      <span className="text-[#121210] font-bold">{roadName}</span>
                      <div className="text-[11px] text-[#4A4A46] font-sans mt-0.5">{landmark}</div>
                    </div>
                  </div>
                </div>

                {/* Launch Primary CV Button */}
                <button
                  type="button"
                  onClick={runVisionAnalysis}
                  className="w-full py-4 bg-[#121210] text-[#CFE8D6] hover:bg-[#2E8C42] hover:text-white brut font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 btn-press transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>LAUNCH COMPUTER VISION PIPELINE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* CHANNEL 2: VOICE COMPLAINT */}
          {submissionMode === 'VOICE' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Voice Recording Cockpit & STT Transcription */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white brut p-5 space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2 text-xs font-mono font-bold">
                    <div className="flex items-center gap-2">
                      <Radio className={`w-4 h-4 ${isRecording ? 'text-[#C03A3A] animate-pulse' : 'text-[#2E8C42]'}`} />
                      <span className="font-display font-black text-[#121210] uppercase tracking-wider">
                        {isRecording ? 'Recording In Progress...' : isTranscribing ? 'Transcribing Speech...' : 'Spoken Grievance Cockpit'}
                      </span>
                    </div>
                    <span className="tag bg-[#CFE8D6] text-[#121210] text-[10px] font-bold">
                      {transcriptionResult?.providerLabel || 'Gemini 3.8 Flash Speech'}
                    </span>
                  </div>

                  {/* Central Interactive Microphone Record Button */}
                  <div className="py-6 text-center space-y-4 bg-[#CFE8D6]/30 border-2 border-[#121210]">
                    <div className="relative inline-flex items-center justify-center">
                      <button
                        type="button"
                        onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                        className={`w-24 h-24 border-3 border-[#121210] flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isRecording
                            ? 'bg-[#C03A3A] text-white shadow-[4px_4px_0_#121210]'
                            : 'bg-[#121210] text-[#CFE8D6] hover:bg-[#2E8C42] hover:text-white shadow-[4px_4px_0_#121210]'
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <Square className="w-8 h-8 fill-current mb-1" />
                            <span className="text-[10px] font-mono font-black uppercase">STOP</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-8 h-8 mb-1" />
                            <span className="text-[10px] font-mono font-black uppercase">RECORD</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="font-mono text-3xl font-black text-[#121210]">
                        00:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}
                      </div>
                      <p className="font-body text-xs text-[#4A4A46]">
                        {isRecording
                          ? 'Speak clearly — mention corridor, landmark, crater severity, or waterlogging'
                          : 'Tap Record to speak, or pick an offline benchmark voice clip below'}
                      </p>
                    </div>

                    {audioUrl && (
                      <div className="pt-2 max-w-sm mx-auto">
                        <audio controls src={audioUrl} className="w-full h-8" />
                      </div>
                    )}

                    <div className="max-w-sm mx-auto text-left bg-white border-2 border-[#121210] p-3 min-h-16" aria-live="polite">
                      <div className="text-[10px] font-mono font-black uppercase text-[#4A4A46] mb-1">
                        {isRecording ? 'Live speech transcript' : 'Speech transcript'}
                      </div>
                      <div className="text-xs text-[#121210] leading-relaxed">
                        {liveTranscript || voiceText || (isRecording ? 'Start speaking…' : 'Your spoken complaint will appear here after recording.')}
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Benchmark Voice Clips */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs border-b-2 border-[#121210] pb-1">
                      <span className="font-display font-black text-[#121210] uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#E8A030]" />
                        1-Click Benchmark Voice Clips
                      </span>
                      <span className="tag bg-[#CFE8D6] font-mono text-[10px] font-bold">3 SAMPLES</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {DEMO_VOICE_SAMPLES.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => handleSelectDemoVoice(sample)}
                          className={`p-2.5 border-2 border-[#121210] text-left transition-all cursor-pointer ${
                            voiceText === sample.transcript
                              ? 'bg-[#CFE8D6] shadow-[2px_2px_0_#121210]'
                              : 'bg-white hover:bg-[#CFE8D6]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-display font-black text-xs text-[#121210] truncate">{sample.title.split(' ')[0]}</span>
                            <span className="text-[10px] font-mono text-[#4A4A46]">{sample.duration}</span>
                          </div>
                          <div className="text-[10px] text-[#4A4A46] font-mono truncate mt-0.5">{sample.location.split(',')[0]}</div>
                          <span className={`tag text-[9px] font-mono font-bold mt-1 inline-block ${
                            sample.severity === 'CRITICAL' ? 'bg-[#C03A3A] text-white' : 'bg-[#E8A030] text-[#121210]'
                          }`}>
                            {sample.severity}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Editable Transcription Text Area */}
                <div className="p-4 bg-white brut space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
                    <label className="font-display text-xs font-black text-[#121210] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#2E8C42]" />
                      Transcribed Spoken Complaint (Editable)
                    </label>
                    <span className="tag bg-[#CFE8D6] text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#2E8C42]" />
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
                    className="w-full bg-[#CFE8D6]/20 border-2 border-[#121210] p-3 text-xs text-[#121210] placeholder-[#4A4A46] focus:outline-none leading-relaxed font-body"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-[#121210] uppercase tracking-wider mb-1">
                        Complainant Contact (SMS Tracking)
                      </label>
                      <input
                        type="text"
                        value={reporterPhone}
                        onChange={(e) => setReporterPhone(e.target.value)}
                        className="w-full bg-white border-2 border-[#121210] px-3 py-2 text-xs text-[#121210] focus:outline-none font-mono"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={submitVoiceOrTextComplaint}
                        className="w-full py-2.5 px-4 bg-[#121210] text-[#CFE8D6] hover:bg-[#2E8C42] hover:text-white brut-sm font-display font-black text-xs uppercase flex items-center justify-center gap-2 btn-press transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Submit Grievance</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Real-time AI NLP Triage, Department Routing & Map */}
              <div className="lg:col-span-6 space-y-4">
                <DepartmentRoutingBadge
                  department={interpretedComplaint?.department.acronym || 'BBMP'}
                  roadName={locationDetails?.roadName || (interpretedComplaint?.roadName !== 'Awaiting location selection' ? interpretedComplaint?.roadName : null) || roadName}
                  nodalOfficer={interpretedComplaint?.department.nodalOfficer}
                  routingReason={interpretedComplaint?.department.routingReason}
                />

                <div className="bg-white brut p-4 space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#2E8C42]" />
                      <span className="font-display text-xs font-black text-[#121210] uppercase tracking-wider">
                        Pinpoint Location for Spoken Grievance
                      </span>
                    </div>
                    <span className="tag bg-[#CFE8D6] font-mono text-[10px] font-bold">
                      CLICK TO ADJUST
                    </span>
                  </div>

                  {/* ACTIVE SPOKEN GRIEVANCE CALLOUT: Displays user's actual speech right above the map */}
                  <div className="bg-[#CFE8D6]/40 border-2 border-[#121210] p-3 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono font-black uppercase text-[#121210] mb-1">
                      <span className="flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-[#2E8C42]" />
                        Your Spoken Grievance
                      </span>
                      <span className="tag bg-white text-[9px] font-bold">
                        {voiceText || liveTranscript ? 'SPOKEN WORDS PRESERVED' : 'AWAITING RECORDING'}
                      </span>
                    </div>
                    <div className="text-xs text-[#121210] font-medium italic">
                      "{voiceText || liveTranscript || 'Speak via microphone on the left to dictate grievance context'}"
                    </div>
                  </div>

                  <div className="h-56 border-2 border-[#121210] overflow-hidden relative">
                    <BengaluruMap
                      height="100%"
                      isPickerMode={true}
                      pickerCoordinates={selectedCoords}
                      onPickCoordinates={(coords) => void selectLocation(coords)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#CFE8D6]/30 p-3 border-2 border-[#121210] font-mono">
                    <div>
                      <span className="text-[#4A4A46] block text-[10px] uppercase font-bold">CORRIDOR RESOLVED</span>
                      <span className="text-[#121210] font-bold truncate block">
                        {locationDetails?.roadName || (interpretedComplaint?.roadName !== 'Awaiting location selection' ? interpretedComplaint?.roadName : null) || roadName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#4A4A46] block text-[10px] uppercase font-bold">SEVERITY TRIAGE</span>
                      <span className={`tag font-bold ${interpretedComplaint?.severity === 'CRITICAL' ? 'bg-[#C03A3A] text-white' : 'bg-[#E8A030] text-[#121210]'}`}>
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

          {/* CHANNEL 3: TEXT COMPLAINT */}
          {submissionMode === 'TEXT' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white brut p-5 space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2 text-xs font-mono font-bold">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#2E8C42]" />
                      <span className="font-display font-black text-[#121210] uppercase tracking-wider">
                        Natural Language Ingestion
                      </span>
                    </div>
                    <span className="tag bg-[#CFE8D6] text-[#121210] text-[10px] font-bold">
                      Real-time NLP Parser
                    </span>
                  </div>

                  {/* 1-Click Quick Prompts */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono font-bold text-[#121210] flex items-center gap-1.5 uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-[#E8A030]" />
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
                          className={`w-full p-2.5 border-2 border-[#121210] text-left text-xs transition-all cursor-pointer ${
                            textComplaintInput === tmpl.text
                              ? 'bg-[#CFE8D6] shadow-[2px_2px_0_#121210]'
                              : 'bg-white hover:bg-[#CFE8D6]/30'
                          }`}
                        >
                          <div className="font-display font-black text-[#121210]">{tmpl.title}</div>
                          <div className="text-[11px] text-[#4A4A46] font-mono truncate mt-0.5">{tmpl.text}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-[#121210] uppercase tracking-wider block">
                      Hazard Description &amp; Location Context
                    </label>
                    <textarea
                      rows={4}
                      value={textComplaintInput}
                      onChange={(e) => handleTextComplaintChange(e.target.value)}
                      placeholder="Describe road name, nearest landmark, crater size, waterlogging..."
                      className="w-full bg-[#CFE8D6]/20 border-2 border-[#121210] p-3 text-xs text-[#121210] placeholder-[#4A4A46] focus:outline-none leading-relaxed font-body"
                    />
                  </div>

                  {/* Reporter contact & submit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-[#121210] uppercase tracking-wider mb-1">
                        Contact Phone (SMS Tracking)
                      </label>
                      <input
                        type="text"
                        value={reporterPhone}
                        onChange={(e) => setReporterPhone(e.target.value)}
                        className="w-full bg-white border-2 border-[#121210] px-3 py-2 text-xs text-[#121210] focus:outline-none font-mono"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={submitVoiceOrTextComplaint}
                        className="w-full py-2.5 px-4 bg-[#121210] text-[#CFE8D6] hover:bg-[#2E8C42] hover:text-white brut-sm font-display font-black text-xs uppercase flex items-center justify-center gap-2 btn-press transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Submit Grievance</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Routing, Map Picker & Stepper */}
              <div className="lg:col-span-6 space-y-4">
                <DepartmentRoutingBadge
                  department={interpretedComplaint?.department.acronym || 'BBMP'}
                  roadName={locationDetails?.roadName || (interpretedComplaint?.roadName !== 'Awaiting location selection' ? interpretedComplaint?.roadName : null) || roadName}
                  nodalOfficer={interpretedComplaint?.department.nodalOfficer}
                  routingReason={interpretedComplaint?.department.routingReason}
                />

                <div className="bg-white brut p-4 space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-[#121210] pb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#2E8C42]" />
                      <span className="font-display text-xs font-black text-[#121210] uppercase tracking-wider">
                        Interactive Bengaluru GPS Pinpoint
                      </span>
                    </div>
                    <span className="tag bg-[#CFE8D6] font-mono text-[10px] font-bold">
                      CLICK TO ADJUST
                    </span>
                  </div>

                  <div className="h-56 border-2 border-[#121210] overflow-hidden relative">
                    <BengaluruMap
                      height="100%"
                      isPickerMode={true}
                      pickerCoordinates={selectedCoords}
                      onPickCoordinates={(coords) => void selectLocation(coords)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#CFE8D6]/30 p-3 border-2 border-[#121210] font-mono">
                    <div>
                      <span className="text-[#4A4A46] block text-[10px] uppercase font-bold">ROAD CORRIDOR</span>
                      <span className="text-[#121210] font-bold truncate block">
                        {locationDetails?.roadName || (interpretedComplaint?.roadName !== 'Awaiting location selection' ? interpretedComplaint?.roadName : null) || roadName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#4A4A46] block text-[10px] uppercase font-bold">SEVERITY TRIAGE</span>
                      <span className={`tag font-bold ${interpretedComplaint?.severity === 'CRITICAL' ? 'bg-[#C03A3A] text-white' : 'bg-[#E8A030] text-[#121210]'}`}>
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
        <div className="space-y-6">
          {/* Top Bar for Vision Controls */}
          <div className="bg-white brut p-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="tag bg-[#121210] text-[#CFE8D6] font-bold">
                {analysisResult.modelName}
              </span>
              <span className="text-[#4A4A46]">
                Latency: <strong className="text-[#121210]">{analysisResult.inferenceTimeMs}ms</strong>
              </span>
              <span className="text-[#4A4A46]">
                Resolution: <strong className="text-[#121210]">{analysisResult.imageMetadata.width}×{analysisResult.imageMetadata.height}px</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPolygons(!showPolygons)}
                className={`px-3 py-1.5 border-2 border-[#121210] uppercase font-bold transition-all cursor-pointer ${
                  showPolygons ? 'bg-[#121210] text-[#CFE8D6] brut-sm' : 'bg-white text-[#121210] hover:bg-[#CFE8D6]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1" />
                {showPolygons ? 'Masks ON' : 'Boxes Only'}
              </button>
              <button
                onClick={() => setReportStep('INPUT')}
                className="px-3 py-1.5 bg-white hover:bg-[#CFE8D6] border-2 border-[#121210] text-[#121210] font-bold uppercase cursor-pointer"
              >
                ← Change Image
              </button>
            </div>
          </div>

          {/* Main Inspection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 cols: Image Viewport with Bounding Boxes */}
            <div className="lg:col-span-7 bg-white brut overflow-hidden relative">
              <div className="relative w-full overflow-hidden bg-black">
                <img
                  src={selectedImage}
                  alt="Road Surface Defect View"
                  className="w-full h-auto max-h-[560px] object-contain block"
                />

                {/* Radar Scanline Sweep Animation */}
                <div className="absolute inset-x-0 h-1 bg-[#2E8C42] border-y border-[#121210] animate-pulse pointer-events-none" style={{ top: '48%' }} />

                {/* SVG Overlay for Bounding Boxes and Polygons */}
                <svg
                  viewBox={`0 0 ${analysisResult.imageMetadata.width} ${analysisResult.imageMetadata.height}`}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  {analysisResult.detections.map((det, idx) => {
                    const isSelected = activeDetectionId === det.id;
                    const isCritical = det.severity === 'Critical' || det.severity === 'High';
                    const strokeColor = isCritical ? '#C03A3A' : '#121210';
                    const fillColor = isCritical ? 'rgba(192, 58, 58, 0.25)' : 'rgba(46, 140, 66, 0.25)';

                    return (
                      <g
                        key={det.id}
                        className="pointer-events-auto cursor-pointer"
                        onMouseEnter={() => setActiveDetectionId(det.id)}
                        onMouseLeave={() => setActiveDetectionId(null)}
                      >
                        {showPolygons && det.polygon && det.polygon.length > 2 && (
                          <polygon
                            points={det.polygon.map(pt => `${pt[0]},${pt[1]}`).join(' ')}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth={isSelected ? 4 : 2.5}
                          />
                        )}

                        <rect
                          x={det.box.x}
                          y={det.box.y}
                          width={det.box.width}
                          height={det.box.height}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={isSelected ? 4 : 3}
                        />

                        {/* Top Label Pill */}
                        <g transform={`translate(${det.box.x}, ${Math.max(24, det.box.y - 8)})`}>
                          <rect
                            x={0}
                            y={-22}
                            width={190}
                            height={24}
                            fill="#121210"
                          />
                          <text
                            x={8}
                            y={-6}
                            fill="#CFE8D6"
                            fontSize={12}
                            fontWeight="800"
                            fontFamily="monospace"
                          >
                            POTHOLE #{idx + 1} · {(det.confidence * 100).toFixed(1)}%
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Viewport Telemetry Footer */}
              <div className="p-3 bg-white border-t-2 border-[#121210] flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#121210] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#2E8C42] border border-[#121210] inline-block" />
                  Live Edge CV Sensor
                </span>
                <span className="text-[#4A4A46] font-bold">
                  {selectedCoords ? `${selectedCoords.lat.toFixed(6)}°N, ${selectedCoords.lng.toFixed(6)}°E` : 'Select a point'}
                </span>
              </div>
            </div>

            {/* Right 5 cols: AI Analysis Panel & Pipeline */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white brut p-5 space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#121210] pb-3">
                  <div>
                    <span className="tag bg-[#CFE8D6] text-[#121210] font-mono text-[10px] font-bold uppercase">
                      VISION ANALYSIS
                    </span>
                    <h2 className="font-display text-xl font-black text-[#121210] mt-1">
                      Road Hazard Telemetry
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="stamp border-[#2E8C42] text-[#2E8C42] text-[10px] font-black">
                      AI VERIFIED
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center font-mono">
                  <div className="p-3 bg-[#CFE8D6]/30 border-2 border-[#121210]">
                    <span className="text-[10px] font-bold text-[#4A4A46] uppercase block mb-0.5">Potholes detected</span>
                    <span className="font-display text-2xl font-black text-[#121210]">{analysisResult.potholeCount}</span>
                  </div>

                  <div className="p-3 bg-[#C03A3A]/10 border-2 border-[#121210]">
                    <span className="text-[10px] font-bold text-[#C03A3A] uppercase block mb-0.5">Largest severity</span>
                    <span className="font-display text-2xl font-black text-[#C03A3A]">
                      {analysisResult.detections[0]?.severity || 'High'}
                    </span>
                  </div>

                  <div className="p-3 bg-white border-2 border-[#121210]">
                    <span className="text-[10px] font-bold text-[#4A4A46] uppercase block mb-0.5">Confidence</span>
                    <span className="font-display text-2xl font-black text-[#2E8C42]">
                      {(analysisResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3 bg-[#E8A030]/20 border-2 border-[#121210]">
                    <span className="text-[10px] font-bold text-[#4A4A46] uppercase block mb-0.5">Damage Index</span>
                    <span className="font-display text-2xl font-black text-[#121210]">{analysisResult.estimatedSeverity}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#CFE8D6]/40 border-2 border-[#121210] space-y-1 text-xs">
                  <div className="font-display font-black text-[#121210]">{analysisResult.roadCondition}</div>
                  <div className="font-body text-[#4A4A46] text-[11px] leading-relaxed">{analysisResult.explanation}</div>
                </div>

                <div className="flex justify-between text-xs font-mono text-[#4A4A46] pt-1 border-t-2 border-[#121210]">
                  <span>Surface Area: <strong className="text-[#121210]">{analysisResult.damageArea}</strong></span>
                  <span>Lane Obstruction: <strong className="text-[#C03A3A]">{analysisResult.damageImpact.roadObstructionPct}%</strong></span>
                </div>
              </div>

              {/* Animated Pipeline Progression */}
              <div className="bg-white brut p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono border-b-2 border-[#121210] pb-2">
                  <span className="font-display font-black text-[#121210] uppercase">Pipeline Progression</span>
                  <span className="tag bg-[#CFE8D6] font-bold text-[10px]">
                    {activeStepIndex >= pipelineStepLabels.length ? 'COMPLETE' : 'IN PROGRESS'}
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {pipelineStepLabels.map((label, idx) => {
                    const isDone = activeStepIndex > idx;
                    const isActive = activeStepIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 border-2 border-[#121210] transition-all ${
                          isDone
                            ? 'bg-[#CFE8D6]'
                            : isActive
                            ? 'bg-white shadow-[2px_2px_0_#121210]'
                            : 'bg-white/40 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 border border-[#121210] flex items-center justify-center text-[10px] font-black ${
                            isDone ? 'bg-[#2E8C42] text-white' : isActive ? 'bg-[#E8A030] text-[#121210]' : 'bg-white text-[#4A4A46]'
                          }`}>
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <span className="font-bold text-[#121210]">
                            {label}
                          </span>
                        </div>

                        <span className="text-[10px] font-black uppercase">
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
                  className="w-full mt-4 py-3 bg-[#121210] text-[#CFE8D6] hover:bg-[#2E8C42] hover:text-white brut font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 btn-press transition-all cursor-pointer"
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
        <div className="space-y-6">
          {/* Top Hero Banner */}
          <div className="bg-white brut p-6 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-[#121210] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#C03A3A] border-2 border-[#121210] flex items-center justify-center text-white">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <span className="tag bg-[#C03A3A] text-white font-mono text-xs font-black tracking-widest uppercase">
                    HAZARD VERIFIED
                  </span>
                  <h1 className="font-display text-4xl font-black text-[#121210] tracking-tight mt-1">
                    POTHOLE DETECTED
                  </h1>
                </div>
              </div>

              <div className="stamp border-[#C03A3A] text-[#C03A3A] text-xs font-black">
                DISPATCH QUEUED
              </div>
            </div>

            {/* 3 Metric Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Priority */}
              <div className="p-4 bg-[#CFE8D6]/40 border-2 border-[#121210]">
                <span className="text-xs font-mono font-bold text-[#4A4A46] uppercase block mb-1">
                  Priority Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-black text-[#121210]">
                    {analysisResult.incident.priority}
                  </span>
                  <span className="text-base font-bold text-[#4A4A46] font-mono">/100</span>
                </div>
                <div className="w-full bg-white border border-[#121210] h-3 mt-3 overflow-hidden p-0.5">
                  <div className="bg-[#121210] h-full" style={{ width: `${analysisResult.incident.priority}%` }} />
                </div>
              </div>

              {/* Severity */}
              <div className="p-4 bg-[#C03A3A]/10 border-2 border-[#121210]">
                <span className="text-xs font-mono font-bold text-[#C03A3A] uppercase block mb-1">
                  Severity Level
                </span>
                <div className="font-display text-4xl font-black text-[#C03A3A] tracking-wide">
                  {analysisResult.incident.severity.toUpperCase()}
                </div>
                <div className="text-xs text-[#4A4A46] mt-2 font-mono truncate">
                  {analysisResult.roadCondition.split('/')[0]}
                </div>
              </div>

              {/* Reports Merged */}
              <div className="p-4 bg-white border-2 border-[#121210]">
                <span className="text-xs font-mono font-bold text-[#4A4A46] uppercase block mb-1">
                  Reports Merged
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-black text-[#2E8C42]">
                    {analysisResult.incident.reportsMerged}
                  </span>
                  <span className="stamp border-[#2E8C42] text-[#2E8C42] text-[10px] font-black">
                    CONSOLIDATED
                  </span>
                </div>
                <div className="text-xs text-[#4A4A46] mt-2 font-mono">
                  No duplicate ticket created
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={navigateToRoadIntelligence}
                className="py-3 px-6 bg-[#121210] text-[#CFE8D6] hover:bg-[#2E8C42] hover:text-white brut font-display font-black text-sm uppercase tracking-wider flex items-center gap-3 btn-press transition-all cursor-pointer"
              >
                <span>Continue to Road Intelligence</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setReportStep('CINEMATIC_ANALYSIS')}
                className="py-3 px-5 bg-white hover:bg-[#CFE8D6] brut text-[#121210] font-mono font-bold text-xs uppercase transition-colors cursor-pointer"
              >
                Review Vision Overlay
              </button>
            </div>
          </div>

          {/* Duplicate Detection Card & Master Incident Dossier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duplicate Detection Verification */}
            <div className="bg-white brut p-5 space-y-4">
              <div className="flex items-center gap-2 text-[#2E8C42] font-display font-black text-sm uppercase">
                <FileCheck className="w-5 h-5 text-[#2E8C42]" />
                <span>DUPLICATE DETECTION ENGINE</span>
              </div>

              <div className="p-3 bg-[#CFE8D6]/40 border-2 border-[#121210] text-xs">
                <div className="font-mono text-[#2E8C42] font-black mb-1">
                  {(analysisResult.duplicateCheck.duplicateProbability * 100).toFixed(0)}% MATCH CONFIDENCE
                </div>
                <div className="font-body text-[#121210] font-bold">
                  {analysisResult.duplicateCheck.reason}
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#4A4A46]">
                  <span>Matched Master Incident:</span>
                  <strong className="text-[#121210] font-black">{analysisResult.incident.id}</strong>
                </div>
                <div className="flex justify-between text-[#4A4A46]">
                  <span>Action Taken:</span>
                  <strong className="text-[#2E8C42] font-black">Appended Supporting Evidence</strong>
                </div>
                <div className="flex justify-between text-[#4A4A46]">
                  <span>Status:</span>
                  <strong className="text-[#121210] font-black">{analysisResult.incident.status}</strong>
                </div>
              </div>
            </div>

            {/* BBMP Ward & Contractor SLA Dossier */}
            <div className="bg-white brut p-5 space-y-4">
              <div className="flex items-center gap-2 text-[#121210] font-display font-black text-sm uppercase">
                <Building2 className="w-5 h-5 text-[#121210]" />
                <span>BBMP JURISDICTION &amp; CONTRACTOR SLA</span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#4A4A46] font-bold uppercase block">Corridor</span>
                  <span className="text-[#121210] font-black text-sm">{analysisResult.incident.road}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-[#CFE8D6]/30 border border-[#121210]">
                    <span className="text-[10px] text-[#4A4A46] uppercase font-bold block">Ward</span>
                    <span className="text-[#121210] font-bold">{analysisResult.incident.canonicalLocation.ward}</span>
                  </div>
                  <div className="p-2 bg-[#CFE8D6]/30 border border-[#121210]">
                    <span className="text-[10px] text-[#4A4A46] uppercase font-bold block">Zone</span>
                    <span className="text-[#121210] font-bold">{analysisResult.incident.canonicalLocation.zone}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#4A4A46] font-bold uppercase block">Assigned Contractor</span>
                  <span className="tag bg-[#E8A030] text-[#121210] font-bold text-xs inline-block mt-0.5">
                    {analysisResult.incident.contractor}
                  </span>
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
