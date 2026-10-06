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
  videoUrl?: string;
  fallbackUrl?: string;
  hazardId: string;
  hazardDepth: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  fps: number;
  zoom: string;
  region: string;
}

const CCTV_FEEDS: CCTVCameraFeed[] = [
  {
    id: 'CAM-BLR-ORR-04',
    name: 'ORR EcoSpace / Bellandur Arterial Corridor',
    location: 'Outer Ring Road, Bellandur, Bengaluru',
    ward: 'Ward 150 (Mahadevapura)',
    coordinates: '12.9279° N, 77.6828° E',
    imageUrl: '/sample_data/images/real/bellandur_orr_central.jpg',
    videoUrl: '/sample_data/images/real/cctv_highway_feed.webm',
    fallbackUrl: '/sample_data/images/real/bellandur_orr_flyover.jpg',
    hazardId: 'BNG-PTH-1042',
    hazardDepth: '18.0 cm Cavity',
    severity: 'CRITICAL',
    fps: 30,
    zoom: '2.4x OPTICAL',
    region: 'BELLANDUR ORR'
  },
  {
    id: 'CAM-BLR-IND-12',
    name: '100ft Road Corridor & Metro Signal',
    location: '100ft Road, Indiranagar, Bengaluru',
    ward: 'Ward 82 (East)',
    coordinates: '12.9719° N, 77.6412° E',
    imageUrl: '/sample_data/images/real/indiranagar_100ft_road.jpg',
    fallbackUrl: '/sample_data/images/real/bangalore_traffic_view.jpg',
    hazardId: 'BNG-PTH-1088',
    hazardDepth: '14.2 cm Cluster',
    severity: 'HIGH',
    fps: 30,
    zoom: '1.8x OPTICAL',
    region: 'INDIRANAGAR'
  },
  {
    id: 'CAM-BLR-SLK-01',
    name: 'Central Silk Board Flyover Junction',
    location: 'Silk Board Junction, Hosur Road, Bengaluru',
    ward: 'Ward 151 (South)',
    coordinates: '12.9172° N, 77.6228° E',
    imageUrl: '/sample_data/images/real/silkboard_junction.jpg',
    fallbackUrl: '/sample_data/images/real/bangalore_traffic_road.jpg',
    hazardId: 'BNG-PTH-1031',
    hazardDepth: '12.5 cm Depression',
    severity: 'HIGH',
    fps: 25,
    zoom: '3.1x OPTICAL',
    region: 'SILK BOARD'
  },
  {
    id: 'CAM-BLR-WTF-02',
    name: 'Kundalahalli Metro Flyover Corridor',
    location: 'Near Hope Farm / ITPL, Whitefield, Bengaluru',
    ward: 'Ward 84 (Mahadevapura)',
    coordinates: '12.9854° N, 77.7312° E',
    imageUrl: '/sample_data/images/real/whitefield_kundalahalli_flyover.jpg',
    fallbackUrl: '/sample_data/images/real/pothole_asphalt_heavy.jpg',
    hazardId: 'BNG-PTH-1099',
    hazardDepth: '16.5 cm Crater',
    severity: 'CRITICAL',
    fps: 30,
    zoom: '2.0x OPTICAL',
    region: 'WHITEFIELD'
  },
  {
    id: 'CAM-BLR-PTH-99',
    name: 'Bengaluru Road Surface Pothole Deep Scan',
    location: 'Bellandur-Marathahalli Service Road, Bengaluru',
    ward: 'Ward 150 (Mahadevapura)',
    coordinates: '12.9340° N, 77.6910° E',
    imageUrl: '/sample_data/images/real/blr_potholes_real.jpg',
    fallbackUrl: '/sample_data/images/real/pothole_crater_severe.jpg',
    hazardId: 'BNG-PTH-1042',
    hazardDepth: '18.0 cm Cavity',
    severity: 'CRITICAL',
    fps: 30,
    zoom: '4.5x MACRO',
    region: 'BENGALURU ROAD'
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
    cam: { x: 0, y: 130, z: -50 },
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
    cam: { x: 18, y: 42, z: 50 },
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
    cam: { x: 0, y: 7, z: 125 },
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
    cam: { x: -14, y: 22, z: 210 },
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
    cam: { x: 8, y: 14, z: 290 },
    color: '#2E8C42',
    defaultCctvId: 'CAM-BLR-SLK-01'
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
    cam: { x: 0, y: 85, z: 370 },
    color: '#2E8C42',
    defaultCctvId: 'CAM-BLR-WTF-02'
  }
];

export const ScrollWorldPage: React.FC = () => {
  const { setCurrentView, selectIncidentById } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneryImagesRef = useRef<HTMLImageElement[]>([]);

  // Scroll Progress (0 to 1)
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState(0);

  // CCTV Surveillance Feed State
  const [activeCctvId, setActiveCctvId] = useState<string>('CAM-BLR-ORR-04');
  const [isCctvExpanded, setIsCctvExpanded] = useState<boolean>(false);
  const [mediaMode, setMediaMode] = useState<'VIDEO' | 'PHOTO'>('VIDEO');
  const [imgLoadError, setImgLoadError] = useState<Record<string, boolean>>({});
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

    // Fixed starfield for atmospheric night sky
    const STARS = Array.from({ length: 85 }, (_, i) => ({
      x: ((i * 37 + 13) % 100) / 100,
      y: ((i * 47 + 7) % 55) / 100,
      size: 0.8 + ((i * 17) % 3) * 0.6,
      twinkle: 1 + (i % 5) * 0.6,
      isCyan: i % 7 === 0
    }));

    const scenerySources = [
      '/sample_data/images/real/bellandur_orr_flyover.jpg',
      '/sample_data/images/real/indiranagar_100ft_road.jpg',
      '/sample_data/images/real/silkboard_junction.jpg',
      '/sample_data/images/real/whitefield_kundalahalli_flyover.jpg'
    ];
    sceneryImagesRef.current = scenerySources.map((source) => {
      const image = new Image();
      image.src = source;
      return image;
    });

    // City tech park buildings configuration along Outer Ring Road
    const TECH_BUILDINGS = [
      { x: -38, z: 30, w: 18, d: 18, h: 45, name: 'ECOSPACE WING A', color: '#00f0ff' },
      { x: -48, z: 85, w: 22, d: 20, h: 65, name: 'CISCO BENGALURU', color: '#e8a030' },
      { x: -36, z: 155, w: 20, d: 18, h: 52, name: 'INTEL SRR3 DESIGN', color: '#00f0ff' },
      { x: -46, z: 235, w: 24, d: 22, h: 72, name: 'KPPP LEDGER TOWER', color: '#2e8c42' },
      { x: -38, z: 310, w: 20, d: 18, h: 54, name: 'BBMP CONTROL HQ', color: '#e8a030' },
      { x: -50, z: 380, w: 26, d: 24, h: 78, name: 'PRESTIGE TECH CLOUD', color: '#00f0ff' },
      { x: 38, z: 40, w: 16, d: 16, h: 40, name: 'BAGMANE TECH PARK', color: '#e8a030' },
      { x: 48, z: 95, w: 22, d: 20, h: 58, name: 'EMBASSY TECH VILLAGE', color: '#00f0ff' },
      { x: 36, z: 160, w: 18, d: 18, h: 46, name: 'SAKRA HOSP TRANSIT', color: '#c03a3a' },
      { x: 46, z: 225, w: 20, d: 18, h: 64, name: 'INNOVATION LAB 150', color: '#2e8c42' },
      { x: 38, z: 295, w: 18, d: 18, h: 48, name: 'BBMP WARD 150', color: '#e8a030' },
      { x: 48, z: 370, w: 24, d: 22, h: 70, name: 'BENGALURU SMART CITY', color: '#00f0ff' }
    ];

    const render = () => {
      tick += 0.025;
      const width = canvas.width;
      const height = canvas.height;
      const fov = 380;

      const cam = getCamera(scrollProgress);

      // 3D Perspective Projection with near-plane guard
      const project = (px: number, py: number, pz: number) => {
        const dx = px - cam.x;
        const dy = py - cam.y;
        const dz = pz - cam.z;
        if (dz <= 1.5) return null;
        const scale = fov / dz;
        return {
          x: width / 2 + dx * scale,
          y: height / 2 - dy * scale,
          scale,
          z: dz
        };
      };

      // Horizon line Y in 2D screen space
      const horizonY = height * 0.46;

      // 1. ATMOSPHERIC NIGHT SKY GRADIENT (Rich Bengaluru cyber-atmosphere)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#040b08');
      skyGrad.addColorStop(0.55, '#0a1a13');
      skyGrad.addColorStop(0.85, '#132e22');
      skyGrad.addColorStop(1, '#1b402e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Real Bengaluru streetscape: photographic horizon crossfades slowly
      // behind the radar and 3D road overlays.
      const sceneryImages = sceneryImagesRef.current;
      if (sceneryImages.length) {
        const sceneryFrame = (tick / 0.025) / 360;
        const sceneryIndex = Math.floor(sceneryFrame) % sceneryImages.length;
        const nextSceneryIndex = (sceneryIndex + 1) % sceneryImages.length;
        const sceneryProgress = sceneryFrame % 1;
        const drawScenery = (image: HTMLImageElement, alpha: number, drift: number) => {
          if (!image.complete || image.naturalWidth === 0) return;
          const imageRatio = image.naturalWidth / image.naturalHeight;
          const targetRatio = width / horizonY;
          let drawWidth = width;
          let drawHeight = horizonY;
          if (imageRatio > targetRatio) drawWidth = horizonY * imageRatio;
          else drawHeight = width / imageRatio;
          const pan = Math.sin(tick * 0.45) * 18 + drift;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.filter = 'saturate(0.72) contrast(1.08) brightness(0.62)';
          ctx.drawImage(image, (width - drawWidth) / 2 + pan, horizonY - drawHeight, drawWidth, drawHeight);
          ctx.restore();
        };
        drawScenery(sceneryImages[sceneryIndex], 0.28 * (1 - sceneryProgress), 0);
        drawScenery(sceneryImages[nextSceneryIndex], 0.28 * sceneryProgress, -8);
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = '#082218';
        ctx.fillRect(0, 0, width, horizonY);
        ctx.restore();
      }

      // 2. WARM AMBER & EMERALD HORIZON GLOW BLOOM
      const horizonBloom = ctx.createRadialGradient(width / 2, horizonY, 20, width / 2, horizonY, width * 0.7);
      horizonBloom.addColorStop(0, 'rgba(232, 160, 48, 0.28)');
      horizonBloom.addColorStop(0.4, 'rgba(46, 140, 66, 0.22)');
      horizonBloom.addColorStop(1, 'rgba(10, 20, 15, 0)');
      ctx.fillStyle = horizonBloom;
      ctx.fillRect(0, horizonY - 120, width, 180);

      // 3. PARALLAX STARRY SKY & SATELLITE TELEMETRY
      STARS.forEach((star) => {
        const sx = star.x * width;
        const sy = star.y * horizonY;
        const twinkleAlpha = star.twinkle * (0.4 + Math.sin(tick * 3 + star.x * 20) * 0.3);
        ctx.fillStyle = star.isCyan ? `rgba(0, 240, 255, ${twinkleAlpha})` : `rgba(255, 255, 255, ${twinkleAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Orbiting Geospatial Satellite Path
      const satX = ((tick * 18) % (width + 100)) - 50;
      const satY = horizonY * 0.25;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(0, satY + 15);
      ctx.lineTo(width, satY - 15);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(satX, satY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.fillText('SAT-ISRO-BLR-09', satX + 6, satY - 4);

      // 4. DISTANT BENGALURU CITY SKYLINE SILHOUETTE (Horizon profile)
      ctx.fillStyle = '#0a1610';
      const skylinePoints = [
        { x: 0, h: 25 }, { x: 0.08, h: 42 }, { x: 0.14, h: 28 }, { x: 0.22, h: 55 },
        { x: 0.28, h: 35 }, { x: 0.36, h: 48 }, { x: 0.44, h: 62 }, { x: 0.52, h: 38 },
        { x: 0.60, h: 58 }, { x: 0.68, h: 32 }, { x: 0.76, h: 50 }, { x: 0.84, h: 45 },
        { x: 0.92, h: 30 }, { x: 1.0, h: 25 }
      ];
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      skylinePoints.forEach((pt) => {
        ctx.lineTo(pt.x * width, horizonY - pt.h * 0.6);
      });
      ctx.lineTo(width, horizonY);
      ctx.closePath();
      ctx.fill();

      // Blinking red aviation warning beacons on distant towers
      [0.22, 0.44, 0.60, 0.76].forEach((ratio, idx) => {
        const beaconX = ratio * width;
        const beaconY = horizonY - skylinePoints.find((p) => p.x === ratio)!.h * 0.6;
        const beaconGlow = Math.sin(tick * 5 + idx) > 0 ? 1 : 0.2;
        ctx.fillStyle = `rgba(239, 68, 68, ${beaconGlow})`;
        ctx.beginPath();
        ctx.arc(beaconX, beaconY, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. GROUND BASE PLANE
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      groundGrad.addColorStop(0, '#0c1712');
      groundGrad.addColorStop(0.4, '#101e17');
      groundGrad.addColorStop(1, '#0e1813');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // 6. INFINITE 3D CYBERNETIC GROUND GRID
      ctx.lineWidth = 1;
      const minGridZ = Math.max(0, Math.floor(cam.z / 20) * 20);
      const maxGridZ = cam.z + 320;

      // Transverse Grid Lines (facing camera with smooth distance fade)
      for (let gz = minGridZ; gz <= maxGridZ; gz += 20) {
        const pLeft = project(-180, 0, gz);
        const pRight = project(180, 0, gz);
        if (pLeft && pRight) {
          const dist = gz - cam.z;
          const alpha = Math.max(0, Math.min(0.45, (1 - dist / 320) * 0.5));
          ctx.strokeStyle = `rgba(46, 140, 66, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(pLeft.x, pLeft.y);
          ctx.lineTo(pRight.x, pRight.y);
          ctx.stroke();
        }
      }

      // Longitudinal Grid Lines
      for (let gx = -160; gx <= 160; gx += 20) {
        if (Math.abs(gx) < 14) continue; // Leave road corridor clear
        const pNear = project(gx, 0, Math.max(cam.z + 5, 0));
        const pFar = project(gx, 0, cam.z + 280);
        if (pNear && pFar) {
          ctx.strokeStyle = 'rgba(46, 140, 66, 0.22)';
          ctx.beginPath();
          ctx.moveTo(pNear.x, pNear.y);
          ctx.lineTo(pFar.x, pFar.y);
          ctx.stroke();
        }
      }

      // 7. 6-LANE OUTER RING ROAD HIGHWAY (The Arterial Transit Corridor)
      const roadW = 22;
      const roadZStart = Math.max(0, Math.floor(cam.z / 15) * 15);
      const roadZEnd = cam.z + 280;

      for (let rz = roadZStart; rz <= roadZEnd; rz += 15) {
        const p0 = project(-roadW / 2, 0.15, rz);
        const p1 = project(roadW / 2, 0.15, rz);
        const p2 = project(roadW / 2, 0.15, rz + 15);
        const p3 = project(-roadW / 2, 0.15, rz + 15);

        if (p0 && p1 && p2 && p3) {
          // Asphalt road slab
          ctx.fillStyle = '#141a16';
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();

          // Glowing road edge crash barriers (Amber)
          ctx.strokeStyle = 'rgba(232, 160, 48, 0.65)';
          ctx.lineWidth = Math.max(1, p0.scale * 0.1);
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Concrete median divider with green shrubbery
          const medLeft = project(-0.6, 0.3, rz);
          const medRight = project(0.6, 0.3, rz);
          const medNextLeft = project(-0.6, 0.3, rz + 15);
          const medNextRight = project(0.6, 0.3, rz + 15);
          if (medLeft && medRight && medNextLeft && medNextRight) {
            ctx.fillStyle = '#223828';
            ctx.beginPath();
            ctx.moveTo(medLeft.x, medLeft.y);
            ctx.lineTo(medRight.x, medRight.y);
            ctx.lineTo(medNextRight.x, medNextRight.y);
            ctx.lineTo(medNextLeft.x, medNextLeft.y);
            ctx.closePath();
            ctx.fill();
          }

          // Animated white dashed lane markers
          [-4.5, 4.5].forEach((laneX) => {
            const dashZ0 = rz + ((tick * 20) % 15);
            const dashZ1 = dashZ0 + 6;
            const d0 = project(laneX, 0.25, dashZ0);
            const d1 = project(laneX, 0.25, dashZ1);
            if (d0 && d1) {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.lineWidth = Math.max(1, d0.scale * 0.08);
              ctx.beginPath();
              ctx.moveTo(d0.x, d0.y);
              ctx.lineTo(d1.x, d1.y);
              ctx.stroke();
            }
          });
        }
      }

      // 8. ACTIVE MOVING HIGHWAY VEHICLES (Dynamic traffic simulation)
      for (let v = 0; v < 12; v++) {
        const isSouthbound = v % 2 === 0;
        const laneX = isSouthbound ? -4.5 + (v % 3 === 0 ? -2.5 : 1.5) : 4.5 + (v % 3 === 0 ? 2.5 : -1.5);
        const speed = isSouthbound ? 14 + (v % 4) * 3 : -(16 + (v % 3) * 4);
        const vZ = ((cam.z + v * 32 + tick * speed) % 360 + 360) % 360;

        const vPos = project(laneX, 0.5, vZ);
        if (vPos && vPos.z > 3 && vPos.z < 260) {
          const vw = 2.4 * vPos.scale;
          const vh = 1.4 * vPos.scale;

          // Vehicle body
          ctx.fillStyle = isSouthbound ? '#1a2920' : '#232b26';
          ctx.fillRect(vPos.x - vw / 2, vPos.y - vh, vw, vh);

          // Headlights or Taillights
          if (isSouthbound) {
            // Taillights (Red)
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(vPos.x - vw * 0.35, vPos.y - vh * 0.35, Math.max(1, vPos.scale * 0.15), 0, Math.PI * 2);
            ctx.arc(vPos.x + vw * 0.35, vPos.y - vh * 0.35, Math.max(1, vPos.scale * 0.15), 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Headlights (White/Yellow Beam)
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(vPos.x - vw * 0.35, vPos.y - vh * 0.35, Math.max(1, vPos.scale * 0.18), 0, Math.PI * 2);
            ctx.arc(vPos.x + vw * 0.35, vPos.y - vh * 0.35, Math.max(1, vPos.scale * 0.18), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 9. ELEVATED NAMMA METRO VIADUCT & GLIDING TRAIN
      const metroX = -24;
      const metroY = 8.5;
      for (let mz = Math.max(0, Math.floor(cam.z / 35) * 35); mz <= cam.z + 260; mz += 35) {
        const pillarBase = project(metroX, 0, mz);
        const pillarTop = project(metroX, metroY, mz);
        if (pillarBase && pillarTop) {
          // Concrete support column
          const colW = 3.2 * pillarBase.scale;
          ctx.fillStyle = '#1c2822';
          ctx.strokeStyle = '#2e8c42';
          ctx.lineWidth = 1;
          ctx.fillRect(pillarBase.x - colW / 2, pillarTop.y, colW, pillarBase.y - pillarTop.y);
          ctx.strokeRect(pillarBase.x - colW / 2, pillarTop.y, colW, pillarBase.y - pillarTop.y);
        }
      }

      // Metro Elevated Track Bed
      const trackNear = project(metroX, metroY, Math.max(cam.z + 2, 0));
      const trackFar = project(metroX, metroY, cam.z + 280);
      if (trackNear && trackFar) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trackNear.x, trackNear.y);
        ctx.lineTo(trackFar.x, trackFar.y);
        ctx.stroke();
      }

      // Gliding Metro Train with glowing windows
      const trainZ = ((cam.z + tick * 32) % 320);
      const trainHead = project(metroX, metroY + 1.2, trainZ);
      const trainTail = project(metroX, metroY + 1.2, trainZ + 36);
      if (trainHead && trainTail && trainHead.z > 4) {
        const tw = 4 * trainHead.scale;
        const th = 2.8 * trainHead.scale;
        ctx.fillStyle = '#122e23';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.fillRect(trainHead.x - tw / 2, trainHead.y - th, tw, th);
        ctx.strokeRect(trainHead.x - tw / 2, trainHead.y - th, tw, th);

        // Train glowing window strip
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(trainHead.x - tw * 0.4, trainHead.y - th * 0.7, tw * 0.8, th * 0.35);
      }

      // 10. 3D TECH PARK SKYSCRAPERS WITH ILLUMINATED WINDOWS & SIGNAGE
      TECH_BUILDINGS.forEach((b) => {
        const base = project(b.x, 0, b.z);
        const top = project(b.x, b.h, b.z);

        if (base && top && base.z > 3 && base.z < 340) {
          const bw = b.w * base.scale;
          const bh = base.y - top.y;
          const bx = base.x - bw / 2;

          // Building front facade
          const facadeGrad = ctx.createLinearGradient(bx, top.y, bx + bw, base.y);
          facadeGrad.addColorStop(0, '#10241a');
          facadeGrad.addColorStop(1, '#0b1711');
          ctx.fillStyle = facadeGrad;
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 1.5;
          ctx.fillRect(bx, top.y, bw, bh);
          ctx.strokeRect(bx, top.y, bw, bh);

          // Grid of lit office windows
          const cols = Math.min(8, Math.max(3, Math.floor(bw / 8)));
          const rows = Math.min(14, Math.max(4, Math.floor(bh / 10)));
          const winW = bw / (cols * 1.8);
          const winH = bh / (rows * 2.2);

          for (let r = 1; r < rows; r++) {
            for (let c = 1; c < cols; c++) {
              // Deterministic light on/off state
              const isLit = (c * 17 + r * 31 + Math.floor(b.z)) % 3 !== 0;
              if (isLit) {
                const wx = bx + c * (bw / cols);
                const wy = top.y + r * (bh / rows);
                ctx.fillStyle = (c + r) % 4 === 0 ? 'rgba(0, 240, 255, 0.8)' : 'rgba(232, 160, 48, 0.75)';
                ctx.fillRect(wx, wy, Math.max(1.5, winW), Math.max(1.5, winH));
              }
            }
          }

          // Rooftop beacon antenna with flashing red light
          const beaconPos = project(b.x, b.h + 4, b.z);
          if (beaconPos) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(top.x, top.y);
            ctx.lineTo(beaconPos.x, beaconPos.y);
            ctx.stroke();

            const beaconFlash = Math.sin(tick * 4 + b.x) > 0 ? 1 : 0.2;
            ctx.fillStyle = `rgba(239, 68, 68, ${beaconFlash})`;
            ctx.beginPath();
            ctx.arc(beaconPos.x, beaconPos.y, Math.max(2, beaconPos.scale * 0.35), 0, Math.PI * 2);
            ctx.fill();
          }

          // Rooftop Tech Park Signage
          if (base.scale > 1.2) {
            ctx.fillStyle = b.color;
            ctx.font = `bold ${Math.max(8, Math.min(11, base.scale * 0.7))}px monospace`;
            ctx.fillText(b.name, bx, top.y - 6);
          }
        }
      });

      // 11. WAYPOINT 3 FOCUS: THE BNG-PTH-1042 CRATER & CV LASER DEPTH SCANNER
      const craterCenter = project(0, 0, 150);
      if (craterCenter && craterCenter.z > 2 && craterCenter.z < 200) {
        const craterScale = craterCenter.scale;
        const outerR = 6.5 * craterScale;

        // Outer fractured road fissure lips
        ctx.fillStyle = '#060a08';
        ctx.strokeStyle = '#c03a3a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(craterCenter.x, craterCenter.y, outerR * 1.3, outerR * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Mid fracture basin (-8.0cm depression)
        ctx.fillStyle = '#0a0d0b';
        ctx.strokeStyle = '#e8a030';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(craterCenter.x, craterCenter.y + outerR * 0.1, outerR * 0.85, outerR * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Deep cavity core (-18.0cm void)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(craterCenter.x, craterCenter.y + outerR * 0.2, outerR * 0.45, outerR * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated oscillating cyan laser scanner
        const laserAngle = tick * 3;
        const scanWidth = outerR * 1.4;
        const scanYOffset = Math.sin(laserAngle) * (outerR * 0.55);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(craterCenter.x - scanWidth, craterCenter.y + scanYOffset);
        ctx.lineTo(craterCenter.x + scanWidth, craterCenter.y + scanYOffset);
        ctx.stroke();

        // Pulsing Sonar Warning Waves
        for (let ring = 1; ring <= 3; ring++) {
          const ringProgress = (tick * 0.7 + ring * 0.33) % 1;
          const currentR = outerR * (1.1 + ringProgress * 3.2);
          ctx.strokeStyle = `rgba(239, 68, 68, ${1 - ringProgress})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(craterCenter.x, craterCenter.y, currentR * 1.3, currentR * 0.7, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 3D Holographic HUD Callout Box
        const calloutX = craterCenter.x + outerR * 1.6;
        const calloutY = craterCenter.y - outerR * 0.8;
        const boxW = Math.max(160, craterScale * 18);
        const boxH = Math.max(70, craterScale * 8);

        ctx.fillStyle = 'rgba(18, 18, 16, 0.9)';
        ctx.strokeStyle = '#c03a3a';
        ctx.lineWidth = 2;
        ctx.strokeRect(calloutX, calloutY, boxW, boxH);
        ctx.fillRect(calloutX, calloutY, boxW, boxH);

        // Leader line connecting crater to HUD
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(craterCenter.x, craterCenter.y);
        ctx.lineTo(calloutX, calloutY + boxH / 2);
        ctx.stroke();

        ctx.fillStyle = '#c03a3a';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('▼ BNG-PTH-1042 (-18.0cm)', calloutX + 8, calloutY + 18);

        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.fillText('CCTV DETECT: CAM-BLR-ORR-04', calloutX + 8, calloutY + 34);
        ctx.fillStyle = '#e8a030';
        ctx.fillText('SEVERITY: CRITICAL (SCORE 94)', calloutX + 8, calloutY + 48);
        ctx.fillStyle = '#2e8c42';
        ctx.fillText('DEDUP: 12 CITIZEN REPORTS', calloutX + 8, calloutY + 62);
      }

      // 12. WAYPOINT 4 FOCUS: FLOATING KPPP MUNICIPAL CONTRACT PLAQUE
      const docPos = project(-16, 14, 240);
      if (docPos && docPos.z > 3 && docPos.z < 180) {
        const dw = Math.max(150, docPos.scale * 16);
        const dh = Math.max(85, docPos.scale * 9);

        ctx.fillStyle = 'rgba(18, 18, 16, 0.92)';
        ctx.strokeStyle = '#e8a030';
        ctx.lineWidth = 2;
        ctx.fillRect(docPos.x - dw / 2, docPos.y - dh / 2, dw, dh);
        ctx.strokeRect(docPos.x - dw / 2, docPos.y - dh / 2, dw, dh);

        ctx.fillStyle = '#e8a030';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('★ KPPP CONTRACT IND6298', docPos.x - dw / 2 + 8, docPos.y - dh / 2 + 18);
        ctx.fillStyle = '#2e8c42';
        ctx.fillText('CLAUSE 45.2 DLP ENFORCED', docPos.x - dw / 2 + 8, docPos.y - dh / 2 + 34);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('KMV INFRASTRUCTURES LTD', docPos.x - dw / 2 + 8, docPos.y - dh / 2 + 50);
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('TAXPAYER LIABILITY: ₹0', docPos.x - dw / 2 + 8, docPos.y - dh / 2 + 66);
      }

      // 13. WAYPOINT 5 FOCUS: AI REPAIR VERIFICATION SCANNER
      const auditPos = project(0, 0.2, 320);
      if (auditPos && auditPos.z > 2 && auditPos.z < 160) {
        const auditR = 7 * auditPos.scale;
        ctx.strokeStyle = '#2e8c42';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(auditPos.x, auditPos.y, auditR * 1.4, auditR * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#2e8c42';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('✓ AI REPAIR AUDIT: 98.4% COMPACTION PROVEN', auditPos.x - 110, auditPos.y - auditR * 0.8);
      }

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
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-amber-300/30 text-[10px] text-amber-200 font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
          <span>REAL BENGALURU SCENERY · CROSSFADE FEED</span>
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
            ? 'w-[440px] sm:w-[540px] max-w-[calc(100vw-32px)]'
            : 'w-[290px] sm:w-[350px]'
        }`}
      >
        <div className="brut bg-[#121210]/95 backdrop-blur-md border-[2.5px] border-[#E8A030] text-left text-white shadow-[4px_4px_0_0_#121210] overflow-hidden">
          {/* CCTV Monitor Topbar */}
          <div className="bg-[#1a1c1a] border-b border-white/20 p-2.5 flex items-center justify-between gap-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-red-400 truncate">
                <Video className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">REC // {activeCctvFeed.videoUrl && mediaMode === 'VIDEO' ? 'LIVE VIDEO STREAM' : 'GEO CCTV CAMERA'}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {activeCctvFeed.videoUrl && (
                <div className="flex items-center border border-white/20 bg-black/60 overflow-hidden">
                  <button
                    onClick={() => setMediaMode('VIDEO')}
                    className={`px-1.5 py-0.5 text-[8px] font-mono font-bold transition-colors cursor-pointer ${
                      mediaMode === 'VIDEO' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Live Traffic Video Loop"
                  >
                    ▶ VIDEO
                  </button>
                  <button
                    onClick={() => setMediaMode('PHOTO')}
                    className={`px-1.5 py-0.5 text-[8px] font-mono font-bold transition-colors cursor-pointer ${
                      mediaMode === 'PHOTO' ? 'bg-[#E8A030] text-[#121210]' : 'text-slate-400 hover:text-white'
                    }`}
                    title="High-Res Geo Photograph"
                  >
                    📷 PHOTO
                  </button>
                </div>
              )}
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
            {activeCctvFeed.videoUrl && mediaMode === 'VIDEO' ? (
              <video
                key={activeCctvFeed.id + '-video'}
                src={activeCctvFeed.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover filter contrast-110 brightness-95"
              />
            ) : (
              <img
                key={activeCctvFeed.id + '-img'}
                src={imgLoadError[activeCctvFeed.id] ? (activeCctvFeed.fallbackUrl || '/sample_data/images/real/blr_potholes_real.jpg') : activeCctvFeed.imageUrl}
                alt={activeCctvFeed.name}
                className="w-full h-full object-cover filter contrast-110 brightness-95 animate-cctv-pan"
                onError={() => {
                  if (!imgLoadError[activeCctvFeed.id]) {
                    setImgLoadError(prev => ({ ...prev, [activeCctvFeed.id]: true }));
                  }
                }}
              />
            )}

            {/* Scanlines Effect Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px, #000 4px)',
                backgroundSize: '100% 4px'
              }}
            />

            {/* CCTV Timestamp & Telemetry HUD Overlay */}
            <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400 drop-shadow-md flex flex-col gap-0.5 pointer-events-none bg-black/70 px-1.5 py-1 border border-white/20">
              <div className="font-bold flex items-center gap-1">
                <Camera className="w-3 h-3 text-red-500" />
                <span>{activeCctvFeed.id}</span>
              </div>
              <div className="text-[9px] text-white/90">{timeStr}</div>
              <div className="text-[8px] text-slate-300">{activeCctvFeed.coordinates}</div>
            </div>

            {/* Optical Zoom & Verified Real Location Badge */}
            <div className="absolute top-2 right-2 text-right pointer-events-none flex flex-col items-end gap-1">
              <div className="bg-[#2E8C42] text-white px-1.5 py-0.5 border border-[#CFE8D6]/40 text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>REAL BENGALURU FEED</span>
              </div>
              <div className="bg-black/70 px-1.5 py-0.5 border border-white/20 text-[9px] text-[#E8A030] font-bold">
                {activeCctvFeed.zoom}
              </div>
            </div>

            {/* AI Real-time Bounding Box Crosshair on Pothole */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-36 h-22 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse">
                <div className="absolute -top-4 left-0 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                  HAZARD: {activeCctvFeed.hazardId}
                </div>
                <div className="absolute -bottom-4 right-0 bg-black/90 text-yellow-300 text-[8px] font-bold px-1 border border-yellow-500/50">
                  DEPTH: {activeCctvFeed.hazardDepth}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                </div>
              </div>
            </div>

            {/* Bottom Feed Label */}
            <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between text-[9px] font-mono bg-black/80 px-2 py-1 text-slate-200 pointer-events-none border border-white/10">
              <span className="truncate max-w-[200px]">{activeCctvFeed.name}</span>
              <span className="text-[#E8A030] font-bold shrink-0">{activeCctvFeed.region}</span>
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
                    onClick={() => {
                      setActiveCctvId(feed.id);
                      if (feed.videoUrl) {
                        setMediaMode('VIDEO');
                      } else {
                        setMediaMode('PHOTO');
                      }
                    }}
                    className={`flex-1 py-1 px-1.5 text-[9px] font-bold border transition-colors cursor-pointer text-center truncate ${
                      isSelected
                        ? 'bg-[#E8A030] text-[#121210] border-[#121210]'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/20'
                    }`}
                    title={`${feed.id} — ${feed.name} (${feed.location})`}
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
