import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TrafficReport, RouteOption } from '../../types';
import { MIRA_BHAYANDAR_CENTER } from '../../lib/demoData';

interface TrafficMapProps {
  reports?: TrafficReport[];
  routes?: RouteOption[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  onSelectReport?: (report: TrafficReport) => void;
  center?: [number, number];
  zoom?: number;
  interactivePickLocation?: boolean;
  pickedLocation?: [number, number] | null;
  onLocationPicked?: (lat: number, lng: number) => void;
  origin?: [number, number] | null;
  destination?: [number, number] | null;
  heightClass?: string;
}

export const TrafficMap: React.FC<TrafficMapProps> = ({
  reports = [],
  routes = [],
  selectedRouteId,
  onSelectRoute,
  onSelectReport,
  center = [MIRA_BHAYANDAR_CENTER.latitude, MIRA_BHAYANDAR_CENTER.longitude],
  zoom = 13,
  interactivePickLocation = false,
  pickedLocation,
  onLocationPicked,
  origin,
  destination,
  heightClass = 'h-[500px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const pickedMarkerRef = useRef<L.Marker | null>(null);
  const waypointsLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);
    waypointsLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map click for coordinate picking
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (interactivePickLocation && onLocationPicked) {
        onLocationPicked(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [interactivePickLocation, onLocationPicked]);

  // Update Picked Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickedMarkerRef.current) {
      pickedMarkerRef.current.remove();
      pickedMarkerRef.current = null;
    }

    if (pickedLocation) {
      const pinIcon = L.divIcon({
        className: 'custom-picked-pin',
        html: `
          <div style="position: relative; transform: translate(-50%, -100%);">
            <div style="background-color: #6366f1; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
              <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 13px;">📍</div>
            </div>
            <div style="width: 8px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; margin: 2px auto 0;"></div>
          </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
      });

      pickedMarkerRef.current = L.marker([pickedLocation[0], pickedLocation[1]], {
        icon: pinIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      map.panTo([pickedLocation[0], pickedLocation[1]], { animate: true });
    }
  }, [pickedLocation]);

  // Update Origin and Destination Waypoints
  useEffect(() => {
    const waypointsLayer = waypointsLayerRef.current;
    if (!waypointsLayer) return;

    waypointsLayer.clearLayers();

    if (origin) {
      const originIcon = L.divIcon({
        className: 'origin-pin',
        html: `
          <div style="transform: translate(-50%, -100%); text-align: center;">
            <div style="background: #2563eb; color: white; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border-radius: 20px; padding: 3px 8px; font-size: 11px; font-weight: 700; white-space: nowrap;">
              🟢 Origin
            </div>
          </div>
        `,
        iconAnchor: [30, 24],
      });
      L.marker([origin[0], origin[1]], { icon: originIcon, zIndexOffset: 800 }).addTo(waypointsLayer);
    }

    if (destination) {
      const destIcon = L.divIcon({
        className: 'dest-pin',
        html: `
          <div style="transform: translate(-50%, -100%); text-align: center;">
            <div style="background: #dc2626; color: white; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border-radius: 20px; padding: 3px 8px; font-size: 11px; font-weight: 700; white-space: nowrap;">
              🏁 Destination
            </div>
          </div>
        `,
        iconAnchor: [42, 24],
      });
      L.marker([destination[0], destination[1]], { icon: destIcon, zIndexOffset: 800 }).addTo(waypointsLayer);
    }
  }, [origin, destination]);

  // Render Traffic Report Markers
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();

    reports.forEach((report) => {
      let color = '#10b981'; // green (low)
      let label = 'LOW';
      let ringColor = 'rgba(16, 185, 129, 0.25)';

      if (report.congestionLevel === 'heavy') {
        color = '#ef4444'; // red (heavy)
        label = 'HEAVY';
        ringColor = 'rgba(239, 68, 68, 0.35)';
      } else if (report.congestionLevel === 'moderate') {
        color = '#f59e0b'; // amber (moderate)
        label = 'MOD';
        ringColor = 'rgba(245, 158, 11, 0.3)';
      }

      const icon = L.divIcon({
        className: 'traffic-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
            <div style="position: absolute; width: 34px; height: 34px; background-color: ${ringColor}; border-radius: 50%; animation: pulse 2s infinite;"></div>
            <div style="width: 26px; height: 26px; background-color: ${color}; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.25); color: white; font-weight: 800; font-size: 9px; letter-spacing: -0.5px;">
              ${label[0]}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const timeAgo = formatTimeAgo(report.createdAt);
      const isDemoTag = report.isDemo || report.source === 'demo_data';

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 13px; line-height: 1.4; min-width: 210px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-weight: 700; font-size: 14px; color: #0f172a;">${escapeHtml(report.roadName)}</span>
            <span style="background: ${color}; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; text-transform: uppercase;">
              ${report.congestionLevel}
            </span>
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
            📍 ${escapeHtml(report.locationName || 'Mira-Bhayandar')}
          </div>
          ${
            report.description
              ? `<div style="background: #f8fafc; border-left: 3px solid ${color}; padding: 6px 8px; margin-bottom: 6px; color: #334155; font-size: 12px; border-radius: 0 4px 4px 0;">
                  ${escapeHtml(report.description)}
                </div>`
              : ''
          }
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 11px; color: #64748b;">
            <span>⏱ Delay: <b>${report.estimatedDelayMinutes || 0} min</b></span>
            <span>${timeAgo}</span>
          </div>
          ${
            isDemoTag
              ? `<div style="margin-top: 6px; font-size: 10px; color: #6366f1; background: #eef2ff; padding: 2px 6px; border-radius: 4px; text-align: center; font-weight: 600;">
                  Demo Dataset Record
                </div>`
              : ''
          }
        </div>
      `;

      const marker = L.marker([report.latitude, report.longitude], { icon })
        .bindPopup(popupContent)
        .addTo(markersLayer);

      if (onSelectReport) {
        marker.on('click', () => onSelectReport(report));
      }
    });
  }, [reports, onSelectReport]);

  // Render Routes Polylines
  useEffect(() => {
    const routesLayer = routesLayerRef.current;
    const map = mapInstanceRef.current;
    if (!routesLayer || !map) return;

    routesLayer.clearLayers();

    if (routes.length === 0) return;

    const bounds = L.latLngBounds([]);

    routes.forEach((route, index) => {
      const isSelected = selectedRouteId ? route.id === selectedRouteId : index === 0;

      // Color coding:
      // Selected recommended: vibrant emerald / indigo
      // Other alternatives: dashed / muted slate
      let routeColor = '#64748b';
      let weight = 4;
      let opacity = 0.65;
      let dashArray: string | undefined = '6, 8';

      if (isSelected) {
        routeColor = route.congestionScore > 60 ? '#f59e0b' : '#3b82f6';
        weight = 7;
        opacity = 0.95;
        dashArray = undefined;
      } else if (route.isRecommended) {
        routeColor = '#10b981';
      }

      const polyline = L.polyline(route.geometry, {
        color: routeColor,
        weight,
        opacity,
        dashArray,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routesLayer);

      route.geometry.forEach(([lat, lng]) => bounds.extend([lat, lng]));

      polyline.on('click', () => {
        if (onSelectRoute) {
          onSelectRoute(route.id);
        }
      });

      polyline.bindTooltip(
        `<b>${route.name}</b><br/>${route.distanceKm.toFixed(1)} km • ${Math.round(
          route.durationMinutes
        )} min (Click to select)`,
        { sticky: true }
      );
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [routes, selectedRouteId, onSelectRoute]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [MIRA_BHAYANDAR_CENTER.latitude, MIRA_BHAYANDAR_CENTER.longitude],
        13,
        { animate: true }
      );
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className={`w-full ${heightClass}`} />

      {/* Recenter & Quick Controls Overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          type="button"
          title="Recenter on Mira-Bhayandar"
          className="bg-white/95 backdrop-blur-xs text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5"
        >
          <span>🎯</span> Center Mira-Bhayandar
        </button>
      </div>

      {/* Traffic Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs font-medium text-slate-700">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Reported Congestion
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
            <span>Heavy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatTimeAgo(timestamp: number): string {
  const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
