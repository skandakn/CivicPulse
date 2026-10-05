import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { PotholeIncident } from '../../types';
import { useApp } from '../../context/AppContext';

interface BengaluruMapProps {
  incidents?: PotholeIncident[];
  selectedIncidentId?: string | null;
  onSelectIncident?: (incident: PotholeIncident) => void;
  height?: string;
  isPickerMode?: boolean;
  pickerCoordinates?: { lat: number; lng: number } | null;
  onPickCoordinates?: (coords: { lat: number; lng: number }) => void;
  className?: string;
}

export const BengaluruMap: React.FC<BengaluruMapProps> = ({
  incidents: propIncidents,
  selectedIncidentId,
  onSelectIncident,
  height = '100%',
  isPickerMode = false,
  pickerCoordinates,
  onPickCoordinates,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const { incidents: contextIncidents, selectIncidentById } = useApp();
  const incidents = propIncidents || contextIncidents;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Bengaluru
    const map = L.map(mapContainerRef.current, {
      center: [12.9550, 77.6350],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Dark Matter CartoDB Basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Zoom controls at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Marker Layer Group
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Set container dark background for seamless dark mode
    if (mapContainerRef.current) {
      mapContainerRef.current.style.backgroundColor = '#070912';
    }

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    // Initial size invalidations to handle parent animations/transitions
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

  // Render Incident Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (isPickerMode) return; // Do not clutter picker mode

    incidents.forEach((incident) => {
      const isSelected = selectedIncidentId === incident.id;

      // Color selection
      let color = '#00F0FF';
      let pulseColor = 'rgba(0, 240, 255, 0.4)';
      let size = 26;

      if (incident.status === 'AI_VERIFIED') {
        color = '#10B981'; // Green
        pulseColor = 'rgba(16, 185, 129, 0.4)';
      } else if (incident.severity === 'CRITICAL') {
        color = '#EF4444'; // Red
        pulseColor = 'rgba(239, 68, 68, 0.5)';
        size = 32;
      } else if (incident.severity === 'HIGH') {
        color = '#F59E0B'; // Orange
        pulseColor = 'rgba(245, 158, 11, 0.4)';
        size = 28;
      } else if (incident.severity === 'MEDIUM') {
        color = '#EAB308'; // Yellow
        pulseColor = 'rgba(234, 179, 8, 0.3)';
      }

      if (isSelected) {
        size += 6;
      }

      const iconHtml = `
        <div class="pothole-marker-container" style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background: ${pulseColor}; opacity: 0.75; transform: scale(1.4); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>
          <div style="position: relative; width: ${Math.round(size * 0.75)}px; height: ${Math.round(size * 0.75)}px; border-radius: 9999px; background: ${color}; border: 2px solid ${isSelected ? '#ffffff' : '#090a0f'}; box-shadow: 0 0 ${isSelected ? 20 : 12}px ${color}; display: flex; align-items: center; justify-content: center; color: #08090D; font-weight: 800; font-size: ${Math.round(size * 0.35)}px;">
            ${incident.priorityRank <= 3 ? `!${incident.priorityRank}` : incident.severity[0]}
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

      // Popup Content
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 240px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-family: monospace; font-size: 11px; color: #94A3B8; letter-spacing: 0.5px;">${incident.code}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${pulseColor}; color: ${color}; border: 1px solid ${color};">
              ${incident.severity} • ${incident.priorityDetails.overallScore}/100
            </span>
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #F8FAFC; margin-bottom: 4px; line-height: 1.3;">
            ${incident.roadName}
          </div>
          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px;">
            Ward ${incident.wardNumber}: ${incident.wardName} (${incident.zone})
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: rgba(255,255,255,0.04); padding: 6px; border-radius: 6px; margin-bottom: 10px; font-size: 11px;">
            <div>
              <div style="color: #64748B;">Depth</div>
              <div style="font-weight: 700; color: #F1F5F9;">${incident.depthCm} cm</div>
            </div>
            <div>
              <div style="color: #64748B;">Est. Fill</div>
              <div style="font-weight: 700; color: #00F0FF;">${incident.estimatedVolumeLiters} L</div>
            </div>
          </div>

          <div style="display: flex; gap: 6px;">
            <button id="btn-inspect-${incident.id}" style="flex: 1; padding: 6px 10px; background: #00F0FF; color: #08090D; font-weight: 700; font-size: 11px; border-radius: 4px; border: none; cursor: pointer;">
              Inspect Case
            </button>
            <button id="btn-verify-${incident.id}" style="padding: 6px 10px; background: rgba(16,185,129,0.15); color: #10B981; font-weight: 700; font-size: 11px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.3); cursor: pointer;">
              Verify Repair
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: 'dark-glass-popup'
      });

      marker.on('popupopen', () => {
        const btnInspect = document.getElementById(`btn-inspect-${incident.id}`);
        const btnVerify = document.getElementById(`btn-verify-${incident.id}`);

        if (btnInspect) {
          btnInspect.onclick = () => {
            selectIncidentById(incident.id, 'INCIDENT_DETAIL');
          };
        }
        if (btnVerify) {
          btnVerify.onclick = () => {
            selectIncidentById(incident.id, 'VERIFICATION');
          };
        }
      });

      marker.on('click', () => {
        if (onSelectIncident) {
          onSelectIncident(incident);
        }
      });

      layer.addLayer(marker);
    });

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
  }, [incidents, selectedIncidentId, isPickerMode, onSelectIncident, selectIncidentById]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className={`relative rounded-xl overflow-hidden shadow-2xl z-0 ${className}`}
    />
  );
};
