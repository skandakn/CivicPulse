import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Maximize2, Minimize2, Layers, AlertTriangle } from 'lucide-react';
import { PotholeIncident, MapMode } from '../../types';
import { useApp } from '../../context/AppContext';

interface BengaluruMapProps {
  incidents?: PotholeIncident[];
  selectedIncidentId?: string | null;
  onSelectIncident?: (incident: PotholeIncident) => void;
  height?: string;
  isPickerMode?: boolean;
  pickerCoordinates?: { lat: number; lng: number } | null;
  onPickCoordinates?: (coords: { lat: number; lng: number }) => void;
  mapMode?: MapMode;
  className?: string;
  allowFullscreen?: boolean;
}

// Major Bengaluru Arterial Road Network Corridors
const BENGALURU_ROAD_CORRIDORS = [
  {
    id: 'road-corr-orr',
    name: 'Outer Ring Road (Hebbal - Bellandur - Silk Board Arc)',
    category: 'Arterial Super-Corridor',
    coordinates: [
      [13.0358, 77.5970],
      [13.0180, 77.6350],
      [12.9900, 77.6650],
      [12.9550, 77.6850],
      [12.9279, 77.6833],
      [12.9200, 77.6550],
      [12.9172, 77.6228]
    ] as [number, number][],
    pci: 28,
    status: 'CRITICAL',
    color: '#EF4444',
    potholesCount: 68,
    trafficDensity: 'High (32,000 PCU/hr)',
    contractor: 'Infrastructure Partner Gamma',
    warranty: 'Active Clause 45.2'
  },
  {
    id: 'road-corr-hosur',
    name: 'Hosur Road Expressway (Silk Board to Electronic City)',
    category: 'National Highway 44 Connector',
    coordinates: [
      [12.9221, 77.6180],
      [12.9172, 77.6228],
      [12.8950, 77.6380],
      [12.8700, 77.6520],
      [12.8450, 77.6650]
    ] as [number, number][],
    pci: 42,
    status: 'HIGH_RISK',
    color: '#F59E0B',
    potholesCount: 41,
    trafficDensity: 'Extreme (45,000 PCU/hr)',
    contractor: 'L&T Transportation Infrastructure',
    warranty: 'Under Maintenance Period'
  },
  {
    id: 'road-corr-100ft',
    name: '100 Feet Road (Indiranagar Commercial Corridor)',
    category: 'Sub-Arterial Retail Spine',
    coordinates: [
      [12.9620, 77.6415],
      [12.9720, 77.6412],
      [12.9784, 77.6408],
      [12.9860, 77.6402]
    ] as [number, number][],
    pci: 58,
    status: 'DETERIORATED',
    color: '#EAB308',
    potholesCount: 19,
    trafficDensity: 'Moderate (18,000 PCU/hr)',
    contractor: 'Infrastructure Partner Beta',
    warranty: 'BBMP Municipal O&M'
  },
  {
    id: 'road-corr-itpl',
    name: 'ITPL Main Road (Whitefield Tech Corridor)',
    category: 'High-Tech Mobility Corridor',
    coordinates: [
      [12.9980, 77.6950],
      [12.9890, 77.7250],
      [12.9866, 77.7381],
      [12.9820, 77.7550]
    ] as [number, number][],
    pci: 31,
    status: 'CRITICAL',
    color: '#EF4444',
    potholesCount: 52,
    trafficDensity: 'High (28,000 PCU/hr)',
    contractor: 'KMV Projects Urban Division',
    warranty: 'Under Warranty'
  },
  {
    id: 'road-corr-80ft',
    name: '80 Feet Road (Koramangala 4th & 6th Block)',
    category: 'District Arterial',
    coordinates: [
      [12.9460, 77.6200],
      [12.9380, 77.6230],
      [12.9352, 77.6245],
      [12.9280, 77.6290]
    ] as [number, number][],
    pci: 66,
    status: 'MODERATE',
    color: '#10B981',
    potholesCount: 14,
    trafficDensity: 'Moderate (15,000 PCU/hr)',
    contractor: 'BBMP Division Works',
    warranty: 'Routine Maintenance'
  }
];

// BBMP Priority Municipal Zones
const BENGALURU_MUNICIPAL_ZONES = [
  {
    id: 'zone-mahadevapura',
    name: 'Mahadevapura Zone (Ward 150, 84, 85)',
    center: [12.9850, 77.7000] as [number, number],
    radius: 4600,
    riskScore: 92,
    color: '#EF4444',
    activePotholes: 84,
    criticalCount: 22,
    chiefEngineer: 'Er. R. Manjunath',
    budgetUtilized: '68%'
  },
  {
    id: 'zone-bommanahalli',
    name: 'Bommanahalli Zone (Silk Board & BTM)',
    center: [12.9050, 77.6250] as [number, number],
    radius: 4100,
    riskScore: 88,
    color: '#F59E0B',
    activePotholes: 62,
    criticalCount: 17,
    chiefEngineer: 'Er. S. Narayanaswamy',
    budgetUtilized: '74%'
  },
  {
    id: 'zone-east',
    name: 'East Zone (Indiranagar / CV Raman Nagar)',
    center: [12.9750, 77.6300] as [number, number],
    radius: 3500,
    riskScore: 74,
    color: '#EAB308',
    activePotholes: 38,
    criticalCount: 9,
    chiefEngineer: 'Er. S. Chandrasekhar',
    budgetUtilized: '55%'
  },
  {
    id: 'zone-south',
    name: 'South Zone (Jayanagar & Basavanagudi)',
    center: [12.9300, 77.5800] as [number, number],
    radius: 3800,
    riskScore: 58,
    color: '#00F0FF',
    activePotholes: 26,
    criticalCount: 5,
    chiefEngineer: 'Er. M. Venkatesh',
    budgetUtilized: '48%'
  },
  {
    id: 'zone-west',
    name: 'West Zone (Malleshwaram & Rajajinagar)',
    center: [12.9900, 77.5600] as [number, number],
    radius: 3500,
    riskScore: 45,
    color: '#10B981',
    activePotholes: 18,
    criticalCount: 3,
    chiefEngineer: 'Er. P. Kumar',
    budgetUtilized: '41%'
  }
];

// Contractor Palette Mapping
const CONTRACTOR_COLORS: Record<string, { color: string; bg: string }> = {
  'Infrastructure Partner Gamma': { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.25)' },
  'L&T Transportation Infrastructure': { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.25)' },
  'Infrastructure Partner Beta': { color: '#F97316', bg: 'rgba(249, 115, 22, 0.25)' },
  'KMV Projects Urban Division': { color: '#EC4899', bg: 'rgba(236, 72, 153, 0.25)' },
  'BBMP In-House Hot Mix Plant': { color: '#10B981', bg: 'rgba(16, 185, 129, 0.25)' }
};

export const BengaluruMap: React.FC<BengaluruMapProps> = ({
  incidents: propIncidents,
  selectedIncidentId,
  onSelectIncident,
  height = '100%',
  isPickerMode = false,
  pickerCoordinates,
  onPickCoordinates,
  mapMode = 'INCIDENTS',
  className = '',
  allowFullscreen = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const roadHealthLayerRef = useRef<L.LayerGroup | null>(null);
  const priorityZonesLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const { incidents: contextIncidents, selectIncidentById } = useApp();
  const incidents = propIncidents || contextIncidents;

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on central Bengaluru (Vidhana Soudha / MG Road axis)
    const map = L.map(mapContainerRef.current, {
      center: [12.9550, 77.6350],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Dark Matter CartoDB Basemap for high-contrast dark cyberpunk aesthetic
    const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY || '';
    const tileUrl = cartoApiKey 
      ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${cartoApiKey}`
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      
    L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Zoom controls at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initialize Dedicated Feature Layer Groups
    markersLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);
    roadHealthLayerRef.current = L.layerGroup().addTo(map);
    priorityZonesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    if (mapContainerRef.current) {
      mapContainerRef.current.style.backgroundColor = '#070912';
    }

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map clicks in picker mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isPickerMode && onPickCoordinates) {
        onPickCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPickerMode, onPickCoordinates]);

  // Update Picker Pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isPickerMode && pickerCoordinates) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([pickerCoordinates.lat, pickerCoordinates.lng]);
      } else {
        const pinIcon = L.divIcon({
          className: 'custom-picker-pin',
          html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <span style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background: rgba(0, 240, 255, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <div style="width: 20px; height: 20px; border-radius: 9999px; background: #00F0FF; border: 3px solid #08090D; box-shadow: 0 0 15px #00F0FF; display: flex; align-items: center; justify-content: center;">
                <div style="width: 6px; height: 6px; border-radius: 9999px; background: #08090D;"></div>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const newMarker = L.marker([pickerCoordinates.lat, pickerCoordinates.lng], { icon: pinIcon }).addTo(map);
        pickerMarkerRef.current = newMarker;
      }
    } else if (!isPickerMode && pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [isPickerMode, pickerCoordinates]);

  // Render Map Features based on Active Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const heatmapLayer = heatmapLayerRef.current;
    const roadHealthLayer = roadHealthLayerRef.current;
    const priorityZonesLayer = priorityZonesLayerRef.current;

    if (!map || !markersLayer || !heatmapLayer || !roadHealthLayer || !priorityZonesLayer) return;

    // Reset all layers
    markersLayer.clearLayers();
    heatmapLayer.clearLayers();
    roadHealthLayer.clearLayers();
    priorityZonesLayer.clearLayers();

    if (isPickerMode) return;

    // -------------------------------------------------------------
    // MODE 1 & 5: INCIDENTS / CONTRACTOR VIEW
    // -------------------------------------------------------------
    if (mapMode === 'INCIDENTS' || mapMode === 'CONTRACTORS') {
      incidents.forEach((incident) => {
        const isSelected = selectedIncidentId === incident.id;

        let color = '#00F0FF';
        let pulseColor = 'rgba(0, 240, 255, 0.4)';
        let size = 26;

        if (mapMode === 'CONTRACTORS') {
          const cfg = CONTRACTOR_COLORS[incident.contractorName || ''] || { color: '#00F0FF', bg: 'rgba(0,240,255,0.25)' };
          color = cfg.color;
          pulseColor = cfg.bg;
          size = 28;
        } else {
          if (incident.status === 'AI_VERIFIED') {
            color = '#10B981';
            pulseColor = 'rgba(16, 185, 129, 0.4)';
          } else if (incident.severity === 'CRITICAL') {
            color = '#EF4444';
            pulseColor = 'rgba(239, 68, 68, 0.55)';
            size = 32;
          } else if (incident.severity === 'HIGH') {
            color = '#F59E0B';
            pulseColor = 'rgba(245, 158, 11, 0.45)';
            size = 28;
          } else if (incident.severity === 'MEDIUM') {
            color = '#EAB308';
            pulseColor = 'rgba(234, 179, 8, 0.35)';
          }
        }

        if (isSelected) {
          size += 8;
        }

        const iconHtml = `
          <div class="pothole-marker-container" style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background: ${pulseColor}; opacity: 0.85; transform: scale(1.4); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>
            <div style="position: relative; width: ${Math.round(size * 0.76)}px; height: ${Math.round(size * 0.76)}px; border-radius: 9999px; background: ${color}; border: 2.5px solid ${isSelected ? '#ffffff' : '#070912'}; box-shadow: 0 0 ${isSelected ? 22 : 12}px ${color}; display: flex; align-items: center; justify-content: center; color: #08090D; font-weight: 800; font-size: ${Math.round(size * 0.36)}px;">
              ${mapMode === 'CONTRACTORS' ? 'C' : (incident.priorityRank <= 3 ? `!${incident.priorityRank}` : incident.severity[0])}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-pothole-marker',
          html: iconHtml,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        });

        const marker = L.marker([incident.coordinates.lat, incident.coordinates.lng], { icon: customIcon });

        const popupHtml = `
          <div style="font-family: system-ui, sans-serif; min-width: 250px; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-family: monospace; font-size: 11px; color: #94A3B8; font-weight: 700;">${incident.code}</span>
              <span style="font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; background: ${pulseColor}; color: ${color}; border: 1px solid ${color};">
                ${mapMode === 'CONTRACTORS' ? (incident.isUnderWarranty ? 'WARRANTY ACTIVE' : 'BBMP O&M') : `${incident.severity} • ${incident.priorityDetails.overallScore}/100`}
              </span>
            </div>
            <div style="font-weight: 800; font-size: 13px; color: #FFFFFF; margin-bottom: 3px; line-height: 1.3;">
              ${incident.roadName}
            </div>
            <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px;">
              Ward ${incident.wardNumber}: ${incident.wardName} (${incident.zone})
            </div>

            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 7px; border-radius: 8px; margin-bottom: 10px; font-size: 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div>
                <span style="color: #64748B; font-size: 10px; display: block;">CONTRACTOR</span>
                <strong style="color: #F8FAFC; font-size: 11px;">${incident.contractorName?.split(' ')[0] || 'BBMP'}</strong>
              </div>
              <div>
                <span style="color: #64748B; font-size: 10px; display: block;">DEPTH & FILL</span>
                <strong style="color: #00F0FF; font-size: 11px;">${incident.depthCm} cm / ${incident.estimatedVolumeLiters}L</strong>
              </div>
            </div>

            <div style="display: flex; gap: 6px;">
              <button id="btn-inspect-${incident.id}" style="flex: 1; padding: 7px 10px; background: #00F0FF; color: #08090D; font-weight: 800; font-size: 11px; border-radius: 6px; border: none; cursor: pointer;">
                Inspect Case
              </button>
              <button id="btn-verify-${incident.id}" style="padding: 7px 10px; background: rgba(16,185,129,0.15); color: #10B981; font-weight: 700; font-size: 11px; border-radius: 6px; border: 1px solid rgba(16,185,129,0.3); cursor: pointer;">
                Verify Repair
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, { closeButton: true, className: 'dark-glass-popup' });

        marker.on('popupopen', () => {
          const btnInspect = document.getElementById(`btn-inspect-${incident.id}`);
          const btnVerify = document.getElementById(`btn-verify-${incident.id}`);
          if (btnInspect) {
            btnInspect.onclick = () => selectIncidentById(incident.id, 'INCIDENT_DETAIL');
          }
          if (btnVerify) {
            btnVerify.onclick = () => selectIncidentById(incident.id, 'VERIFICATION');
          }
        });

        marker.on('click', () => {
          if (onSelectIncident) onSelectIncident(incident);
        });

        markersLayer.addLayer(marker);
      });
    }

    // -------------------------------------------------------------
    // MODE 2: SEVERITY HEATMAP
    // -------------------------------------------------------------
    if (mapMode === 'HEATMAP') {
      incidents.forEach((incident) => {
        const weight = (incident.depthCm * incident.priorityDetails.overallScore) / 100.0;
        const radiusMeters = Math.min(1200, Math.max(350, weight * 16));

        let fillColor = '#00F0FF';
        if (incident.severity === 'CRITICAL') fillColor = '#EF4444';
        else if (incident.severity === 'HIGH') fillColor = '#F59E0B';
        else if (incident.severity === 'MEDIUM') fillColor = '#EAB308';

        const heatHalo = L.circle([incident.coordinates.lat, incident.coordinates.lng], {
          radius: radiusMeters,
          color: fillColor,
          weight: 1.5,
          opacity: 0.65,
          fillColor: fillColor,
          fillOpacity: 0.28
        });

        heatHalo.bindTooltip(`
          <div style="font-family: monospace; font-size: 11px; padding: 2px;">
            <strong style="color: ${fillColor}">${incident.severity} CLUSTER HOTSPOT</strong><br/>
            ${incident.roadName}<br/>
            Severity Weight: ${Math.round(weight)} • ${incident.depthCm} cm deep
          </div>
        `, { sticky: true });

        heatmapLayer.addLayer(heatHalo);
      });
    }

    // -------------------------------------------------------------
    // MODE 3: ROAD HEALTH
    // -------------------------------------------------------------
    if (mapMode === 'ROAD_HEALTH') {
      BENGALURU_ROAD_CORRIDORS.forEach((road) => {
        const polyline = L.polyline(road.coordinates, {
          color: road.color,
          weight: 7,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round'
        });

        // Add subtle outer glow line
        const glowLine = L.polyline(road.coordinates, {
          color: road.color,
          weight: 15,
          opacity: 0.25,
          lineCap: 'round'
        });

        const tooltipContent = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 4px; min-width: 220px;">
            <div style="font-weight: 800; color: #FFFFFF; margin-bottom: 2px;">${road.name}</div>
            <div style="color: ${road.color}; font-weight: 700; font-size: 11px; margin-bottom: 6px;">
              PCI Score: ${road.pci}/100 (${road.status})
            </div>
            <div style="font-size: 11px; color: #94A3B8; line-height: 1.4;">
              Active Craters: <strong style="color: #F8FAFC;">${road.potholesCount}</strong><br/>
              Traffic Volume: ${road.trafficDensity}<br/>
              Contractor: ${road.contractor} (${road.warranty})
            </div>
          </div>
        `;

        polyline.bindTooltip(tooltipContent, { sticky: true });
        roadHealthLayer.addLayer(glowLine);
        roadHealthLayer.addLayer(polyline);
      });
    }

    // -------------------------------------------------------------
    // MODE 4: PRIORITY ZONES
    // -------------------------------------------------------------
    if (mapMode === 'PRIORITY_ZONES') {
      BENGALURU_MUNICIPAL_ZONES.forEach((zone) => {
        const zoneCircle = L.circle(zone.center, {
          radius: zone.radius,
          color: zone.color,
          weight: 2,
          opacity: 0.8,
          fillColor: zone.color,
          fillOpacity: 0.15,
          dashArray: '6, 6'
        });

        const zoneLabelIcon = L.divIcon({
          className: 'zone-center-label',
          html: `
            <div style="background: rgba(9, 12, 22, 0.85); backdrop-filter: blur(8px); border: 1px solid ${zone.color}; padding: 6px 10px; border-radius: 8px; box-shadow: 0 0 15px ${zone.color}40; text-align: center; min-width: 140px; transform: translate(-50%, -50%);">
              <div style="font-size: 10px; font-family: monospace; color: ${zone.color}; font-weight: 800;">${zone.name.split(' ')[0].toUpperCase()} ZONE</div>
              <div style="font-size: 13px; font-weight: 900; color: #FFFFFF; font-family: monospace;">RISK ${zone.riskScore}/100</div>
              <div style="font-size: 9px; color: #94A3B8;">${zone.activePotholes} Active • ${zone.criticalCount} Critical</div>
            </div>
          `,
          iconSize: [0, 0]
        });

        const labelMarker = L.marker(zone.center, { icon: zoneLabelIcon });

        priorityZonesLayer.addLayer(zoneCircle);
        priorityZonesLayer.addLayer(labelMarker);
      });
    }

    // If an incident is selected, fly to it gently
    if (selectedIncidentId) {
      const selected = incidents.find(i => i.id === selectedIncidentId);
      if (selected) {
        map.flyTo([selected.coordinates.lat, selected.coordinates.lng], 14, {
          animate: true,
          duration: 1.2
        });
      }
    }
  }, [incidents, selectedIncidentId, isPickerMode, onSelectIncident, selectIncidentById, mapMode]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: isFullscreen ? '100vh' : height, width: '100%' }}
      className={`relative rounded-xl overflow-hidden shadow-2xl z-0 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      } ${className}`}
    >
      {/* Map Mode Watermark Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none p-2.5 rounded-xl bg-[#070912]/85 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 space-y-0.5 shadow-xl">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>MAP LAYER: {mapMode.replace('_', ' ')}</span>
        </div>
        <div className="text-slate-400">BBMP GIS GRID • CARTOGRAPHY HYPER-RES</div>
      </div>

      {/* Fullscreen Toggle Button */}
      {allowFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-[#070912]/85 hover:bg-[#070912] backdrop-blur-md border border-white/15 text-slate-300 hover:text-cyan-400 transition-colors shadow-lg cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};
