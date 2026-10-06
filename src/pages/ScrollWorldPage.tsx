import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Compass,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
  MapPin,
  ChevronDown,
  Video,
  Camera,
  Radio,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SceneWaypoint {
  id: string;
  chapter: string;
  altitude: string;
  title: string;
  subtitle: string;
  copy: string;
  telemetry: {
    label: string;
    value: string;
    highlight?: boolean;
  }[];
  cam: { x: number; y: number; z: number };
  color: string;
  defaultCctvId?: string;
}

interface CCTVCameraFeed {
  id: string;
  name: string;
  location: string;
  ward: string;
  coordinates: string;
  imageUrl: string;
  hazardId: string;
  hazardDepth: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  fps: number;
  zoom: string;
}

const CCTV_FEEDS: CCTVCameraFeed[] = [
  {
    id: 'CAM-BLR-ORR-04',
    name: 'ORR EcoSpace Flyover Descent',
    location: 'Outer Ring Road, Bellandur',
    ward: 'Ward 150 (Mahadevapura)',
    coordinates: '12.9279° N, 77.6828° E',
    imageUrl: '/sample_data/images/bellandur_outer_ring_road_severe.jpg',
    hazardId: 'BNG-PTH-1042',
    hazardDepth: '18.0 cm Cavity',
    severity: 'CRITICAL',
    fps: 30,
    zoom: '2.4x OPTICAL'
  },
  {
    id: 'CAM-BLR-IND-12',
    name: '100ft Road Corridor Signal',
    location: '100ft Road, Indiranagar',
    ward: 'Ward 82 (East)',
    coordinates: '12.9719° N, 77.6412° E',
    imageUrl: '/sample_data/images/indiranagar_100ft_road_cluster.jpg',
    hazardId: 'BNG-PTH-1088',
    hazardDepth: '14.2 cm Cluster',
    severity: 'HIGH',
    fps: 30,
    zoom: '1.8x OPTICAL'
  },
  {
    id: 'CAM-BLR-KOR-08',
    name: 'Sony World Signal Junction',
    location: '80ft Road, Koramangala 4th Block',
    ward: 'Ward 151 (South)',
    coordinates: '12.9352° N, 77.6245° E',
    imageUrl: '/sample_data/images/koramangala_80ft_road_moderate.jpg',
    hazardId: 'BNG-PTH-1031',
    hazardDepth: '9.5 cm Depression',
    severity: 'MEDIUM',
    fps: 25,
    zoom: '3.1x OPTICAL'
  },
  {
    id: 'CAM-BLR-WTF-02',
    name: 'ITPL Main Road Metro Pier #42',
    location: 'Near Hope Farm, Whitefield',
    ward: 'Ward 84 (Mahadevapura)',
    coordinates: '12.9854° N, 77.7312° E',
    imageUrl: '/sample_data/images/whitefield_itpl_critical.jpg',
    hazardId: 'BNG-PTH-1099',
    hazardDepth: '16.5 cm Crater',
    severity: 'CRITICAL',
    fps: 30,
    zoom: '2.0x OPTICAL'
  }
];

const WAYPOINTS: SceneWaypoint[] = [
  {
    id: 'orbit',
    chapter: '01 // ORBIT',
    altitude: 'ALT 45,000 M',
    title: 'ORBITING BENGALURU AIRSPACE',
    subtitle: '198 WARDS • 14,000 KM ROAD NETWORK',
    copy: 'High-altitude geospatial radar tracks citywide road vibrations, citizen smartphone telemetry, and municipal tenders across 8 administrative zones.',
    telemetry: [
      { label: 'RADAR GRID', value: '12.9716° N / 77.5946° E' },
      { label: 'ACTIVE WARDS', value: '198 WARDS' },
      { label: 'TELEMETRY INGEST', value: '78 REPORTS / HR', highlight: true },
      { label: 'SURFACE ANOMALIES', value: '3,412 DETECTED' },
    ],
    cam: { x: 0, y: 120, z: 280 },
    color: '#2E8C42',
    defaultCctvId: 'CAM-BLR-ORR-04'
  },
  {
    id: 'descent',
    chapter: '02 // DESCENT',
    altitude: 'ALT 850 M',
    title: 'DIVING INTO BELLANDUR ARTERIAL CORRIDOR',
    subtitle: 'OUTER RING ROAD • PEAK PCU 120,000',
    copy: 'Descending through smog and flyovers into Mahadevapura Zone. High-velocity commuter artery between Marathahalli and Silk Board with Sakra Hospital transit corridor.',
    telemetry: [
      { label: 'TARGET ZONE', value: 'WARD 150 (BELLANDUR)' },
      { label: 'CORRIDOR CLASSIFICATION', value: 'ARTERIAL (120K PCU)' },
      { label: 'EMERGENCY PROXIMITY', value: 'SAKRA WORLD HOSP 420M', highlight: true },
      { label: 'FATALITY RISK', value: 'ELEVATED (LEVEL 4)' },
    ],
    cam: { x: 25, y: 35, z: 110 },
    color: '#E8A030',
    defaultCctvId: 'CAM-BLR-ORR-04'
  },
  {
    id: 'fracture',
    chapter: '03 // FRACTURE',
    altitude: 'ALT 0.45 M',
    title: 'MICRO-DEPTH CRATER SCAN: BNG-PTH-1042',
    subtitle: 'STEREOSCOPIC LASER CV EXTRACTION',
    copy: 'Camera plunges directly into the asphalt cavity. Computer vision algorithms isolate bitumen fatigue, measure 18cm depth, and cluster 12 identical commuter reports into one Master Case.',
    telemetry: [
      { label: 'MEASURED DEPTH', value: '18.0 CM (LETHAL)', highlight: true },
      { label: 'SURFACE AREA', value: '1.45 M²' },
      { label: 'DEDUPLICATION', value: '94% SPATIAL CLUSTER (15M)' },
      { label: 'SEVERITY TIER', value: 'CRITICAL (SCORE 94/100)' },
    ],
    cam: { x: 0, y: 4, z: 22 },
    color: '#C03A3A',
    defaultCctvId: 'CAM-BLR-ORR-04'
  },
  {
    id: 'procurement',
    chapter: '04 // PROCUREMENT',
    altitude: 'SYS // AUDIT',
    title: 'KPPP TENDER MATCHING & DLP ENFORCEMENT',
    subtitle: 'BBMP CENTRAL LEDGER • ZERO-COST WORK ORDER',
    copy: 'Flying inside the municipal procurement archive. Algorithm cross-references KPPP Work Order IND6298. Awarded contractor KMV Infrastructures is under 24-month Defect Liability Period.',
    telemetry: [
      { label: 'KPPP TENDER REF', value: 'KPPP/2023-24/IND6298' },
      { label: 'AWARDED CONTRACTOR', value: 'KMV INFRASTRUCTURES LTD' },
      { label: 'DLP WARRANTY', value: 'CLAUSE 45.2 (ACTIVE)', highlight: true },
      { label: 'TAXPAYER LIABILITY', value: '₹0.00 (CONTRACTOR COST)' },
    ],
    cam: { x: -35, y: 22, z: 75 },
    color: '#E8A030',
    defaultCctvId: 'CAM-BLR-IND-12'
  },
  {
    id: 'verification',
    chapter: '05 // AUDIT',
    altitude: 'ALT 1.2 M',
    title: 'AI REPAIR VERIFICATION LAB',
    subtitle: 'STEREOSCOPIC FLATNESS & COMPACTION PROOF',
    copy: 'Post-repair hot mix compaction audited by computer vision. Laser grid sweeps across freshly rolled asphalt, verifying 0% crater volume and denying fraudulent closure without visual evidence.',
    telemetry: [
      { label: 'SURFACE FLATNESS', value: '98.4% COMPACTED', highlight: true },
      { label: 'REMAINING CRATER VOL', value: '0.0 CM³ (RESOLVED)' },
      { label: 'ASPHALT UNIFORMITY', value: 'GRADE A (IRC-SP-100)' },
      { label: 'AI CERTIFICATE', value: 'AUDIT HASH: #CP-88421' },
    ],
    cam: { x: 5, y: 12, z: 38 },
    color: '#2E8C42',
    defaultCctvId: 'CAM-BLR-KOR-08'
  },
  {
    id: 'victory',
    chapter: '06 // VICTORY',
    altitude: 'ALT 2,400 M',
    title: 'SECURED CORRIDOR & PUBLIC VICTORY',
    subtitle: 'SMOOTH STREETS • ₹42.8 CR RECOVERED',
    copy: 'Sunrise rises over a resilient Bengaluru. 1,240 road hazards eliminated, 96.1% AI audit accuracy, and direct public accountability enforced across every kilometer of the Garden City.',
    telemetry: [
      { label: 'RESOLVED MONTH', value: '1,240 SECURED CORRIDORS' },
      { label: 'TAXPAYER SAVINGS', value: '₹42,80,00,000 INR', highlight: true },
      { label: 'ORR TRANSIT SPEED', value: '+34% FLOW RESTORATION' },
      { label: 'PLATFORM STATUS', value: 'MUNICIPAL LEDGER READY' },
    ],
    cam: { x: 0, y: 80, z: 200 },
    color: '#2E8C42',
    defaultCctvId: 'CAM-BLR-WTF-02'
  }
];

export const ScrollWorldPage: React.FC = () => {
  const { setCurrentView, selectIncidentById } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scroll Progress (0 to 1)
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState(0);

  // CCTV Surveillance Feed State
  const [activeCctvId, setActiveCctvId] = useState<string>('CAM-BLR-ORR-04');
  const [isCctvExpanded, setIsCctvExpanded] = useState<boolean>(false);
  const [timeStr, setTimeStr] = useState<string>('');

  // Web Audio Context for spatial drone hum
  const audioContextRef = useRef<AudioContext | null>(null);

  const activeCctvFeed = useMemo(() => {
    return CCTV_FEEDS.find((c) => c.id === activeCctvId) || CCTV_FEEDS[0];
  }, [activeCctvId]);

  // Active Waypoint calculation
  const currentWaypoint = useMemo(() => {
    const rawIndex = scrollProgress * (WAYPOINTS.length - 1);
    const index = Math.min(Math.floor(rawIndex), WAYPOINTS.length - 1);
    return WAYPOINTS[index] || WAYPOINTS[0];
  }, [scrollProgress]);

  useEffect(() => {
    const rawIndex = scrollProgress * (WAYPOINTS.length - 1);
    const index = Math.min(Math.floor(rawIndex), WAYPOINTS.length - 1);
    setActiveWaypointIndex(index);
    if (WAYPOINTS[index]?.defaultCctvId) {
      setActiveCctvId(WAYPOINTS[index].defaultCctvId);
    }
  }, [scrollProgress]);

  // Live CCTV Timestamp clock with running milliseconds
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number, z = 2) => String(n).padStart(z, '0');
      const d = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const t = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)}`;
      setTimeStr(`${d} ${t} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 45);
    return () => clearInterval(interval);
  }, []);

  // Audio Synth Toggle
  const toggleAudio = () => {
    if (isAudioMuted) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        setIsAudioMuted(false);
      } catch (e) {
        console.warn('Audio init error:', e);
      }
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsAudioMuted(true);
    }
  };

  // Autopilot Animation Loop
  useEffect(() => {
    if (!isAutoPilot) return;
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setScrollProgress((prev) => {
        const next = prev + dt * 0.05; // 20s cinematic cycle
        return next >= 1 ? 0 : next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isAutoPilot]);

  // Wheel scrubbing
  const handleWheel = (e: React.WheelEvent) => {
    setIsAutoPilot(false);
    const delta = e.deltaY * 0.0006;
    setScrollProgress((prev) => Math.max(0, Math.min(1, prev + delta)));
  };

  const jumpToWaypoint = (idx: number) => {
    setIsAutoPilot(false);
    setScrollProgress(idx / (WAYPOINTS.length - 1));
  };

  // 3D Canvas Rendering Loop (Native 3D Perspective Projection Engine)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const getCamera = (progress: number) => {
      const total = WAYPOINTS.length - 1;
      const raw = progress * total;
      const i0 = Math.min(Math.floor(raw), total - 1);
      const i1 = Math.min(i0 + 1, total);
      const t = raw - i0;
      const s = t * t * (3 - 2 * t);

      const c0 = WAYPOINTS[i0].cam;
      const c1 = WAYPOINTS[i1].cam;

      return {
        x: c0.x + (c1.x - c0.x) * s,
        y: c0.y + (c1.y - c0.y) * s,
        z: c0.z + (c1.z - c0.z) * s
      };
    };

    const render = () => {
      tick += 0.03;
      const width = canvas.width;
      const height = canvas.height;
      const fov = 420;

      ctx.fillStyle = '#0a100d';
      ctx.fillRect(0, 0, width, height);

      const cam = getCamera(scrollProgress);

      const project = (px: number, py: number, pz: number) => {
        const dx = px - cam.x;
        const dy = py - cam.y;
        const dz = pz - cam.z;
        if (dz <= 2) return null;
        const scale = fov / dz;
        return {
          x: width / 2 + dx * scale,
          y: height / 2 - dy * scale,
          scale,
          z: dz
        };
      };

      // 1. Draw 3D Ground Cyber Grid
      ctx.lineWidth = 1;
      const gridSpacing = 16;
      const gridRange = 160;

      for (let gx = -gridRange; gx <= gridRange; gx += gridSpacing) {
        const p1 = project(gx, 0, -gridRange);
        const p2 = project(gx, 0, gridRange);
        if (p1 && p2) {
          const alpha = Math.max(0, 1 - (p1.z + p2.z) / (gridRange * 3));
          ctx.strokeStyle = `rgba(46, 140, 66, ${alpha * 0.45})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      for (let gz = -gridRange; gz <= gridRange; gz += gridSpacing) {
        const p1 = project(-gridRange, 0, gz);
        const p2 = project(gridRange, 0, gz);
        if (p1 && p2) {
          const alpha = Math.max(0, 1 - (p1.z + p2.z) / (gridRange * 3));
          ctx.strokeStyle = `rgba(46, 140, 66, ${alpha * 0.45})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // 2. Draw 3D Outer Ring Road Corridor
      const roadW = 14;
      for (let zSeg = -120; zSeg <= 120; zSeg += 15) {
        const left = project(-roadW / 2 + 5, 0.2, zSeg);
        const right = project(roadW / 2 + 5, 0.2, zSeg);
        const nextLeft = project(-roadW / 2 + 5, 0.2, zSeg + 15);
        const nextRight = project(roadW / 2 + 5, 0.2, zSeg + 15);

        if (left && right && nextLeft && nextRight) {
          ctx.fillStyle = '#141816';
          ctx.beginPath();
          ctx.moveTo(left.x, left.y);
          ctx.lineTo(right.x, right.y);
          ctx.lineTo(nextRight.x, nextRight.y);
          ctx.lineTo(nextLeft.x, nextLeft.y);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'rgba(232, 160, 48, 0.4)';
          ctx.stroke();

          // Animated center line
          const c1 = project(5, 0.3, zSeg + ((tick * 15) % 15));
          const c2 = project(5, 0.3, zSeg + 6 + ((tick * 15) % 15));
          if (c1 && c2) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(1, c1.scale * 0.2);
            ctx.beginPath();
            ctx.moveTo(c1.x, c1.y);
            ctx.lineTo(c2.x, c2.y);
            ctx.stroke();
          }
        }
      }

      // 3. Draw 3D Tech Park Buildings / Cityscape Skyline
      const buildings = [
        { x: -30, z: 20, w: 14, d: 14, h: 45 },
        { x: -45, z: 60, w: 16, d: 16, h: 60 },
        { x: -35, z: 110, w: 20, d: 18, h: 50 },
        { x: 38, z: 15, w: 16, d: 16, h: 55 },
        { x: 48, z: 75, w: 22, d: 20, h: 70 },
        { x: 42, z: 130, w: 18, d: 18, h: 48 },
        { x: -25, z: -50, w: 16, d: 14, h: 38 },
        { x: 32, z: -40, w: 14, d: 14, h: 42 },
      ];

      buildings.forEach((b) => {
        const base = project(b.x, 0, b.z);
        const top = project(b.x, b.h, b.z);
        if (base && top) {
          const bw = b.w * base.scale;
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
          ctx.fillStyle = 'rgba(18, 30, 24, 0.85)';
          ctx.beginPath();
          ctx.rect(base.x - bw / 2, top.y, bw, base.y - top.y);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(top.x, top.y, Math.max(2, top.scale * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Focus: The BNG-PTH-1042 Crater & Laser Depth Scanner (x=5, z=20)
      const craterCenter = project(5, 0, 20);
      if (craterCenter) {
        const craterR = 3.5 * craterCenter.scale;
        ctx.fillStyle = '#050706';
        ctx.strokeStyle = '#c03a3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(craterCenter.x, craterCenter.y, craterR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const laserR = craterR * (1.2 + Math.sin(tick * 4) * 0.15);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(craterCenter.x, craterCenter.y, laserR, 0, Math.PI * 2);
        ctx.stroke();

        const angle = tick * 2;
        ctx.beginPath();
        ctx.moveTo(craterCenter.x + Math.cos(angle) * (laserR + 8), craterCenter.y + Math.sin(angle) * (laserR + 8));
        ctx.lineTo(craterCenter.x - Math.cos(angle) * (laserR + 8), craterCenter.y - Math.sin(angle) * (laserR + 8));
        ctx.stroke();

        for (let ring = 1; ring <= 3; ring++) {
          const ringProgress = (tick * 0.6 + ring * 0.33) % 1;
          const currentR = craterR * (1.5 + ringProgress * 4.5);
          ctx.strokeStyle = `rgba(232, 160, 48, ${1 - ringProgress})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(craterCenter.x, craterCenter.y, currentR, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#c03a3a';
        ctx.fillText('▼ BNG-PTH-1042 (-18.0cm)', craterCenter.x + laserR + 10, craterCenter.y - 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.fillText('CCTV DETECT: CAM-BLR-ORR-04 • SCORE 94', craterCenter.x + laserR + 10, craterCenter.y + 4);
      }

      // 5. Floating KPPP Tender Data Plane
      if (scrollProgress >= 0.45 && scrollProgress <= 0.75) {
        const docPos = project(-15, 14, 55);
        if (docPos) {
          const dw = 140 * (docPos.scale * 0.08);
          const dh = 85 * (docPos.scale * 0.08);
          ctx.fillStyle = 'rgba(18, 18, 16, 0.85)';
          ctx.strokeStyle = '#e8a030';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(docPos.x - dw / 2, docPos.y - dh / 2, dw, dh);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#e8a030';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('★ KPPP CONTRACT IND6298', docPos.x - dw / 2 + 8, docPos.y - dh / 2 + 18);
          ctx.fillStyle = '#2e8c42';
          ctx.fillText('CLAUSE 45.2 DLP ENFORCED', docPos.x - dw / 2 + 8, docPos.y - dh / 2 + 34);
          ctx.fillStyle = '#ffffff';
          ctx.fillText('KMV INFRASTRUCTURES LTD', docPos.x - dw / 2 + 8, docPos.y - dh / 2 + 50);
          ctx.fillText('TAXPAYER LIABILITY: ₹0', docPos.x - dw / 2 + 8, docPos.y - dh / 2 + 66);
        }
      }

      // 6. Horizon Glow & Atmospheric Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height / 2);
      grad.addColorStop(0, 'rgba(14, 20, 16, 0.9)');
      grad.addColorStop(1, 'rgba(14, 20, 16, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height / 2);

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [scrollProgress]);

  return (
    <div
      onWheel={handleWheel}
      className="relative w-full h-[calc(100vh-100px)] min-h-[680px] bg-[#0A100D] border-[3px] border-[#121210] overflow-hidden select-none font-mono text-[#F8FAFC]"
    >
      {/* 1. Full-bleed 3D HTML5 Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing w-full h-full" />

      {/* 2. Cybernetic Grid Watermark & Compass Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className="brut bg-[#CFE8D6] border-2 border-[#121210] px-3 py-1 text-xs font-bold text-[#121210] flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#2E8C42] animate-spin" style={{ animationDuration: '14s' }} />
          <span>CIVICPULSE 3D SCROLL-WORLD</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>GOD'S EYE CCTV RADAR SYNCHRONIZED</span>
        </div>
      </div>

      {/* 3. Top Right Global Flight Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={toggleAudio}
          className={`p-2 border-2 border-[#121210] brut-sm transition-all cursor-pointer ${
            !isAudioMuted ? 'bg-[#2E8C42] text-white' : 'bg-white text-[#121210]'
          }`}
          title={isAudioMuted ? 'Activate Sound' : 'Mute Sound'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setIsAutoPilot(!isAutoPilot)}
          className={`px-3 py-1.5 border-2 border-[#121210] brut-sm font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
            isAutoPilot ? 'bg-[#E8A030] text-[#121210]' : 'bg-white text-[#121210]'
          }`}
        >
          {isAutoPilot ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isAutoPilot ? 'AUTOPILOT ON' : 'MANUAL SCRUB'}</span>
        </button>

        <button
          onClick={() => {
            setScrollProgress(0);
            setIsAutoPilot(true);
          }}
          className="p-2 border-2 border-[#121210] bg-white hover:bg-slate-200 text-[#121210] brut-sm cursor-pointer"
          title="Reset Camera"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Left Side: Active Scene Story Dossier (Neo-Brutalist HUD Card) */}
      <div className="absolute left-4 top-20 bottom-24 z-10 w-[330px] sm:w-[390px] flex flex-col justify-center pointer-events-none">
        <div className="pointer-events-auto brut bg-[#121210]/92 backdrop-blur-md border-[3px] border-[#CFE8D6] p-4 sm:p-5 text-left text-white shadow-[6px_6px_0_0_#2E8C42] space-y-3.5 animate-in fade-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between border-b border-white/20 pb-2">
            <span className="text-xs font-black tracking-widest text-[#E8A030]">
              {currentWaypoint.chapter}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#CFE8D6] text-[#121210] border border-[#121210]">
              {currentWaypoint.altitude}
            </span>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-display font-extrabold text-white leading-tight tracking-tight">
              {currentWaypoint.title}
            </h2>
            <div className="text-[10px] font-bold text-[#CFE8D6] mt-0.5">
              {currentWaypoint.subtitle}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-body">
            {currentWaypoint.copy}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
            {currentWaypoint.telemetry.map((t, idx) => (
              <div
                key={idx}
                className={`p-2 border ${
                  t.highlight
                    ? 'border-[#E8A030] bg-[#E8A030]/10 text-white'
                    : 'border-white/15 bg-white/5 text-slate-300'
                }`}
              >
                <div className="text-[8px] text-slate-400 font-bold uppercase">{t.label}</div>
                <div className={`text-[10px] font-black truncate mt-0.5 ${t.highlight ? 'text-[#E8A030]' : 'text-white'}`}>
                  {t.value}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => {
                selectIncidentById(activeCctvFeed.hazardId);
                setCurrentView('INCIDENT_DETAIL');
              }}
              className="flex-1 py-2 px-3 brut-sm bg-[#2E8C42] hover:bg-[#257336] text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>INSPECT DOSSIER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentView('GODS_EYE')}
              className="py-2 px-3 brut-sm bg-white hover:bg-slate-200 text-[#121210] text-xs font-bold cursor-pointer"
            >
              RADAR MAP
            </button>
          </div>
        </div>
      </div>

      {/* 5. Right Side: LIVE CCTV SURVEILLANCE FEED TERMINAL (God's Eye Ingest) */}
      <div
        className={`absolute right-4 top-20 z-20 transition-all duration-300 ${
          isCctvExpanded
            ? 'w-[420px] sm:w-[500px] max-w-[calc(100vw-32px)]'
            : 'w-[290px] sm:w-[340px]'
        }`}
      >
        <div className="brut bg-[#121210]/95 backdrop-blur-md border-[2.5px] border-[#E8A030] text-left text-white shadow-[4px_4px_0_0_#121210] overflow-hidden">
          {/* CCTV Monitor Topbar */}
          <div className="bg-[#1a1c1a] border-b border-white/20 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-red-400">
                <Video className="w-3.5 h-3.5" />
                <span>REC // LIVE CCTV STREAM</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono text-[#E8A030] px-1.5 py-0.5 bg-black border border-[#E8A030]/40">
                {activeCctvFeed.fps} FPS
              </span>
              <button
                onClick={() => setIsCctvExpanded(!isCctvExpanded)}
                className="p-1 text-slate-300 hover:text-white cursor-pointer"
                title={isCctvExpanded ? 'Minimize CCTV' : 'Expand CCTV'}
              >
                {isCctvExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Actual CCTV Video Stream Frame */}
          <div className="relative aspect-video bg-black overflow-hidden border-b border-white/10 group">
            <img
              src={activeCctvFeed.imageUrl}
              alt={activeCctvFeed.name}
              className="w-full h-full object-cover filter contrast-110 brightness-95"
              onError={(e) => {
                // Fallback to high-contrast canvas pattern if local file proxy delayed
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Scanlines Effect Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px, #000 4px)',
                backgroundSize: '100% 4px'
              }}
            />

            {/* CCTV Timestamp & Telemetry HUD Overlay */}
            <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400 drop-shadow-md flex flex-col gap-0.5 pointer-events-none bg-black/60 px-1.5 py-1 border border-white/20">
              <div className="font-bold flex items-center gap-1">
                <Camera className="w-3 h-3 text-red-500" />
                <span>{activeCctvFeed.id}</span>
              </div>
              <div className="text-[9px] text-white/80">{timeStr}</div>
              <div className="text-[8px] text-slate-300">{activeCctvFeed.coordinates}</div>
            </div>

            {/* Optical Zoom & Signal HUD */}
            <div className="absolute top-2 right-2 text-right pointer-events-none">
              <div className="bg-black/60 px-1.5 py-0.5 border border-white/20 text-[9px] text-[#E8A030] font-bold">
                {activeCctvFeed.zoom}
              </div>
            </div>

            {/* AI Real-time Bounding Box Crosshair on Pothole */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-32 h-20 border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse">
                <div className="absolute -top-4 left-0 bg-red-600 text-white text-[8px] font-bold px-1 py-0.2">
                  HAZARD: {activeCctvFeed.hazardId}
                </div>
                <div className="absolute -bottom-4 right-0 bg-black/80 text-yellow-300 text-[8px] font-bold px-1 border border-yellow-500/50">
                  DEPTH: {activeCctvFeed.hazardDepth}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
              </div>
            </div>

            {/* Bottom Feed Label */}
            <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between text-[9px] font-mono bg-black/70 px-2 py-1 text-slate-200 pointer-events-none">
              <span className="truncate">{activeCctvFeed.name}</span>
              <span className="text-[#E8A030] font-bold shrink-0">{activeCctvFeed.ward}</span>
            </div>
          </div>

          {/* CCTV Camera Channel Switcher Buttons */}
          <div className="p-2 bg-[#121210] flex items-center justify-between gap-1.5 overflow-x-auto">
            <span className="text-[9px] text-slate-400 font-bold shrink-0">CHANNEL:</span>
            <div className="flex items-center gap-1 w-full">
              {CCTV_FEEDS.map((feed, idx) => {
                const isSelected = activeCctvId === feed.id;
                return (
                  <button
                    key={feed.id}
                    onClick={() => setActiveCctvId(feed.id)}
                    className={`flex-1 py-1 px-1.5 text-[9px] font-bold border transition-colors cursor-pointer text-center truncate ${
                      isSelected
                        ? 'bg-[#E8A030] text-[#121210] border-[#121210]'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/20'
                    }`}
                    title={`${feed.id} — ${feed.name}`}
                  >
                    CAM {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Bottom Timeline Scrubber Navigation Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-20">
        <div className="brut bg-[#121210] border-2 border-[#CFE8D6] p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[4px_4px_0_0_#2E8C42]">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {WAYPOINTS.map((wp, idx) => {
              const isActive = activeWaypointIndex === idx;
              return (
                <button
                  key={wp.id}
                  onClick={() => jumpToWaypoint(idx)}
                  className={`px-2.5 py-1 text-[10px] font-extrabold whitespace-nowrap transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-[#E8A030] text-[#121210] border-[#121210] shadow-[2px_2px_0_0_#ffffff]'
                      : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/20'
                  }`}
                >
                  {wp.chapter}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-72">
            <span className="text-[10px] text-slate-400 font-bold">SCRUB:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={scrollProgress}
              onChange={(e) => {
                setIsAutoPilot(false);
                setScrollProgress(parseFloat(e.target.value));
              }}
              className="flex-1 accent-[#E8A030] cursor-ew-resize h-2 bg-white/20 rounded-none"
            />
            <span className="text-[10px] font-mono text-[#E8A030] font-bold w-12 text-right">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          <button
            onClick={() => setCurrentView('GODS_EYE')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#2E8C42] hover:bg-[#257336] text-white text-[10px] font-extrabold border border-white cursor-pointer"
          >
            <span>GOD'S EYE RADAR</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
