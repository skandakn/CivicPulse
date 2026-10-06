import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
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
  ChevronUp,
  Maximize2
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
  cameraPos: [number, number, number];
  cameraLookAt: [number, number, number];
  color: string;
}

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
    cameraPos: [0, 42, 65],
    cameraLookAt: [0, 0, 0],
    color: '#2E8C42'
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
    cameraPos: [15, 12, 28],
    cameraLookAt: [8, 0, 8],
    color: '#E8A030'
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
    cameraPos: [5, 1.2, 7],
    cameraLookAt: [4.5, 0, 5.5],
    color: '#C03A3A'
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
    cameraPos: [-12, 8, 14],
    cameraLookAt: [-4, 3, 2],
    color: '#E8A030'
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
    cameraPos: [2, 3, 10],
    cameraLookAt: [0, 0, 0],
    color: '#2E8C42'
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
    cameraPos: [0, 24, 45],
    cameraLookAt: [0, 4, 0],
    color: '#2E8C42'
  }
];

export const ScrollWorldPage: React.FC = () => {
  const { setCurrentView, selectIncidentById } = useApp();
  const mountRef = useRef<HTMLDivElement>(null);

  // Scroll / Progress State (0 to 1 across all waypoints)
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState(0);

  // Audio Synth via Web Audio API for immersive spatial hum
  const audioContextRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Objects in 3D scene
  const gridMeshRef = useRef<THREE.LineSegments | null>(null);
  const buildingsGroupRef = useRef<THREE.Group | null>(null);
  const laserScannerRef = useRef<THREE.Mesh | null>(null);
  const roadMeshRef = useRef<THREE.Mesh | null>(null);
  const craterMeshRef = useRef<THREE.Mesh | null>(null);
  const pulseRingsRef = useRef<THREE.Mesh[]>([]);

  // Calculate current active waypoint based on progress
  const currentWaypoint = useMemo(() => {
    const rawIndex = scrollProgress * (WAYPOINTS.length - 1);
    const index = Math.min(Math.floor(rawIndex), WAYPOINTS.length - 1);
    return WAYPOINTS[index] || WAYPOINTS[0];
  }, [scrollProgress]);

  // Keep waypoint index state updated
  useEffect(() => {
    const rawIndex = scrollProgress * (WAYPOINTS.length - 1);
    const index = Math.min(Math.floor(rawIndex), WAYPOINTS.length - 1);
    setActiveWaypointIndex(index);
  }, [scrollProgress]);

  // Setup Web Audio spatial drone
  const toggleAudio = () => {
    if (isAudioMuted) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Ambient cyber drone oscillator
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A

        // Filter for deep rumble
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        droneOscRef.current = osc;
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

  // Three.js 3D World Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0e1410); // Deep cyber-moss green-black
    scene.fog = new THREE.FogExp2(0x0e1410, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(...WAYPOINTS[0].cameraPos);
    camera.lookAt(...WAYPOINTS[0].cameraLookAt);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe8a030, 2.2);
    dirLight.position.set(30, 60, 40);
    scene.add(dirLight);

    const cyanPointLight = new THREE.PointLight(0x00f0ff, 3.5, 60);
    cyanPointLight.position.set(5, 4, 6);
    scene.add(cyanPointLight);

    // 5. Build 3D Bengaluru City Grid & Topography
    const gridHelper = new THREE.GridHelper(180, 70, 0x2e8c42, 0x183b24);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);
    gridMeshRef.current = gridHelper;

    // Outer Ring Road Highway Mesh
    const roadGeometry = new THREE.PlaneGeometry(16, 160);
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x16181b,
      roughness: 0.9,
      metalness: 0.1
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(4, 0, 0);
    scene.add(road);
    roadMeshRef.current = road;

    // Road White Markings
    const lineGeo = new THREE.PlaneGeometry(0.35, 160);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const centerLine = new THREE.Mesh(lineGeo, lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(4, 0.02, 0);
    scene.add(centerLine);

    // 6. The Pothole Crater Geometry (Scene 3 focal point)
    const craterGeo = new THREE.CylinderGeometry(1.4, 0.8, 0.5, 24);
    const craterMat = new THREE.MeshStandardMaterial({
      color: 0x050607,
      roughness: 0.95,
      wireframe: false
    });
    const crater = new THREE.Mesh(craterGeo, craterMat);
    crater.position.set(5, -0.22, 6);
    scene.add(crater);
    craterMeshRef.current = crater;

    // Laser Scanner Grid over crater
    const laserGeo = new THREE.RingGeometry(0.2, 1.8, 32);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      wireframe: true
    });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.rotation.x = -Math.PI / 2;
    laserMesh.position.set(5, 0.05, 6);
    scene.add(laserMesh);
    laserScannerRef.current = laserMesh;

    // 15m Duplicate Clustering Pulse Rings
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(2 + i * 2.2, 2.15 + i * 2.2, 36);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xe8a030,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5 - i * 0.14
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(5, 0.04, 6);
      scene.add(ring);
      rings.push(ring);
    }
    pulseRingsRef.current = rings;

    // 7. Tech Hubs, Flyover Pillars & Bengaluru Skyline
    const buildingsGroup = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    // Procedural Tech Park Towers
    for (let i = 0; i < 55; i++) {
      const h = 4 + Math.random() * 22;
      const w = 3 + Math.random() * 4;
      const d = 3 + Math.random() * 4;
      const isEast = Math.random() > 0.5;
      const x = isEast ? 12 + Math.random() * 35 : -12 - Math.random() * 35;
      const z = -70 + Math.random() * 140;

      const buildingMat = new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? 0x1f2b24 : i % 2 === 0 ? 0x17211b : 0x243329,
        roughness: 0.8,
        wireframe: Math.random() > 0.85
      });
      const bldg = new THREE.Mesh(boxGeo, buildingMat);
      bldg.scale.set(w, h, d);
      bldg.position.set(x, h / 2, z);
      buildingsGroup.add(bldg);

      // Neon cyber edge along roof
      const edgeGeo = new THREE.EdgesGeometry(bldg.geometry);
      const edgeMat = new THREE.LineBasicMaterial({
        color: i % 4 === 0 ? 0x00f0ff : 0x2e8c42,
        transparent: true,
        opacity: 0.4
      });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      edges.scale.set(w, h, d);
      edges.position.copy(bldg.position);
      buildingsGroup.add(edges);
    }
    scene.add(buildingsGroup);
    buildingsGroupRef.current = buildingsGroup;

    // 8. Animation & Render Loop
    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.02;

      // Pulse crater laser scan
      if (laserScannerRef.current) {
        laserScannerRef.current.rotation.z += 0.03;
        const scale = 1 + Math.sin(time * 3) * 0.12;
        laserScannerRef.current.scale.set(scale, scale, 1);
      }

      // Expand duplicate detection rings
      pulseRingsRef.current.forEach((ring, idx) => {
        const ringScale = 1 + ((time * 0.8 + idx * 0.4) % 1.5);
        ring.scale.set(ringScale, ringScale, 1);
      });

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Scrub camera position smoothly based on scrollProgress
  useEffect(() => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;

    const totalSegments = WAYPOINTS.length - 1;
    const rawSegment = scrollProgress * totalSegments;
    const startIndex = Math.min(Math.floor(rawSegment), totalSegments - 1);
    const endIndex = Math.min(startIndex + 1, totalSegments);
    const segT = rawSegment - startIndex;

    const pA = WAYPOINTS[startIndex].cameraPos;
    const pB = WAYPOINTS[endIndex].cameraPos;
    const lA = WAYPOINTS[startIndex].cameraLookAt;
    const lB = WAYPOINTS[endIndex].cameraLookAt;

    // Smooth cubic easing between waypoints
    const smoothT = segT * segT * (3 - 2 * segT);

    camera.position.x = pA[0] + (pB[0] - pA[0]) * smoothT;
    camera.position.y = pA[1] + (pB[1] - pA[1]) * smoothT;
    camera.position.z = pA[2] + (pB[2] - pA[2]) * smoothT;

    const lookTarget = new THREE.Vector3(
      lA[0] + (lB[0] - lA[0]) * smoothT,
      lA[1] + (lB[1] - lA[1]) * smoothT,
      lA[2] + (lB[2] - lA[2]) * smoothT
    );
    camera.lookAt(lookTarget);
  }, [scrollProgress]);

  // Autopilot loop: smooth automatic camera flight
  useEffect(() => {
    if (!isAutoPilot) return;
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setScrollProgress((prev) => {
        const next = prev + dt * 0.05; // ~20 second cinematic loop
        return next >= 1 ? 0 : next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isAutoPilot]);

  // Wheel scrubbing handler
  const handleWheel = (e: React.WheelEvent) => {
    setIsAutoPilot(false);
    const delta = e.deltaY * 0.0006;
    setScrollProgress((prev) => Math.max(0, Math.min(1, prev + delta)));
  };

  const jumpToWaypoint = (idx: number) => {
    setIsAutoPilot(false);
    setScrollProgress(idx / (WAYPOINTS.length - 1));
  };

  return (
    <div
      onWheel={handleWheel}
      className="relative w-full h-[calc(100vh-100px)] min-h-[680px] bg-[#0E1410] border-[3px] border-[#121210] overflow-hidden select-none font-mono text-[#F8FAFC]"
    >
      {/* 1. Full-bleed 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* 2. Cybernetic Grid Watermark & Compass Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className="brut bg-[#CFE8D6] border-2 border-[#121210] px-3 py-1 text-xs font-bold text-[#121210] flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#2E8C42] animate-spin" style={{ animationDuration: '14s' }} />
          <span>CIVICPULSE 3D SCROLL-WORLD</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>REALTIME FLYTHROUGH ENGINE</span>
        </div>
      </div>

      {/* 3. Top Right Cockpit Controls */}
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
      <div className="absolute left-4 top-20 bottom-24 z-10 w-[340px] sm:w-[410px] flex flex-col justify-center pointer-events-none">
        <div className="pointer-events-auto brut bg-[#121210]/90 backdrop-blur-md border-[3px] border-[#CFE8D6] p-5 text-left text-white shadow-[6px_6px_0_0_#2E8C42] space-y-4 animate-in fade-in slide-in-from-left duration-300">
          {/* Header pill */}
          <div className="flex items-center justify-between border-b border-white/20 pb-2">
            <span className="text-xs font-black tracking-widest text-[#E8A030]">
              {currentWaypoint.chapter}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#CFE8D6] text-[#121210] border border-[#121210]">
              {currentWaypoint.altitude}
            </span>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-lg sm:text-xl font-display font-extrabold text-white leading-tight tracking-tight">
              {currentWaypoint.title}
            </h2>
            <div className="text-[10px] font-bold text-[#CFE8D6] mt-0.5">
              {currentWaypoint.subtitle}
            </div>
          </div>

          {/* Narrative copy */}
          <p className="text-xs text-slate-300 leading-relaxed font-body">
            {currentWaypoint.copy}
          </p>

          {/* Real-time Telemetry Grid */}
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

          {/* Context Action Button */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => {
                selectIncidentById('BNG-PTH-1042');
                setCurrentView('INCIDENT_DETAIL');
              }}
              className="flex-1 py-2 px-3 brut-sm bg-[#2E8C42] hover:bg-[#257336] text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>INSPECT INCIDENT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentView('PRIORITY_QUEUE')}
              className="py-2 px-3 brut-sm bg-white hover:bg-slate-200 text-[#121210] text-xs font-bold cursor-pointer"
            >
              OPS QUEUE
            </button>
          </div>
        </div>
      </div>

      {/* 5. Right Side: Interactive HUD Crosshairs & Live Coordinates */}
      <div className="hidden lg:flex absolute right-6 top-24 bottom-28 w-60 z-10 flex-col justify-between pointer-events-none text-right">
        {/* Sensor Box */}
        <div className="p-3 bg-black/60 border border-white/15 text-[10px] text-slate-400 space-y-1 backdrop-blur-sm">
          <div className="text-emerald-400 font-bold flex items-center justify-end gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>GEO-RADAR SYNCHRONIZED</span>
          </div>
          <div>BEARING: 042° NNE</div>
          <div>INSPECTION SPEED: 1.4 MACH</div>
          <div>CARTO MESH: 38,400 POLYS</div>
        </div>

        {/* Scroll Instruction */}
        <div className="space-y-1.5 p-3 bg-[#E8A030]/10 border border-[#E8A030]/40 text-[#E8A030] text-[11px] font-bold">
          <div className="flex items-center justify-end gap-1.5">
            <ChevronDown className="w-4 h-4 animate-bounce" />
            <span>SCROLL OR SCRUB TIMELINE</span>
          </div>
          <div className="text-[9px] text-slate-400 font-normal">
            Turn wheel to fly freely across Bengaluru coordinates
          </div>
        </div>
      </div>

      {/* 6. Bottom Timeline Scrubber Navigation Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-20">
        <div className="brut bg-[#121210] border-2 border-[#CFE8D6] p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[4px_4px_0_0_#2E8C42]">
          {/* Waypoint Chapter Pills */}
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

          {/* Interactive Range Slider */}
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

          {/* Quick Exit to Main App */}
          <button
            onClick={() => setCurrentView('GODS_EYE')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#2E8C42] hover:bg-[#257336] text-white text-[10px] font-extrabold border border-white cursor-pointer"
          >
            <span>GOD'S EYE 2D MAP</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
