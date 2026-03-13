import React, { useMemo, useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Polygon, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomControl, FullscreenControl } from './MapControls.jsx';

const ACCENT_HEX = '#7d8c4a';

function makeDroneIcon(heading = 0) {
  return L.divIcon({
    className: 'drone-marker-icon',
    html: `<div class="drone-marker" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:${ACCENT_HEX};transform:rotate(${heading}deg);"><svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="16" cy="16" r="10"/><line x1="16" y1="6" x2="16" y2="26"/><line x1="6" y1="16" x2="26" y2="16"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    tooltipAnchor: [0, -16],
  });
}

const TORONTO_CENTER = [43.6532, -79.3832];

function DragRectangle({ drawMode, onDraftChange }) {
  const map = useMap();
  const startRef = useRef(null);
  const rectangleRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!drawMode) {
      startRef.current = null;
      setIsDrawing(false);
      if (rectangleRef.current) {
        map.removeLayer(rectangleRef.current);
        rectangleRef.current = null;
      }
      return;
    }

    const handleMouseDown = (e) => {
      if (!drawMode || e.originalEvent.button !== 0) return;
      e.originalEvent.preventDefault();
      const latlng = e.latlng;
      startRef.current = latlng;
      setIsDrawing(true);

      if (rectangleRef.current) {
        map.removeLayer(rectangleRef.current);
      }
      rectangleRef.current = L.rectangle([latlng, latlng], {
        color: ACCENT_HEX,
        weight: 2,
        fillColor: ACCENT_HEX,
        fillOpacity: 0.15,
        dashArray: '6 6'
      }).addTo(map);
    };

    const handleMouseMove = (e) => {
      if (!drawMode || !isDrawing || !startRef.current) return;
      if (rectangleRef.current) {
        rectangleRef.current.setBounds([startRef.current, e.latlng]);
      }
    };

    const handleMouseUp = (e) => {
      if (!drawMode || !isDrawing || !startRef.current) return;
      const latlng = e.latlng;
      const start = startRef.current;

      const minLat = Math.min(start.lat, latlng.lat);
      const maxLat = Math.max(start.lat, latlng.lat);
      const minLng = Math.min(start.lng, latlng.lng);
      const maxLng = Math.max(start.lng, latlng.lng);

      const corners = [
        { lat: minLat, lng: minLng },
        { lat: minLat, lng: maxLng },
        { lat: maxLat, lng: maxLng },
        { lat: maxLat, lng: minLng }
      ];

      onDraftChange?.(corners);
      setIsDrawing(false);
      startRef.current = null;

      if (rectangleRef.current) {
        map.removeLayer(rectangleRef.current);
        rectangleRef.current = null;
      }
    };

    map.on('mousedown', handleMouseDown);
    map.on('mousemove', handleMouseMove);
    map.on('mouseup', handleMouseUp);

    if (drawMode) {
      map.dragging.disable();
    } else {
      map.dragging.enable();
    }

    const mapContainer = map.getContainer();
    mapContainer.style.cursor = drawMode ? 'crosshair' : '';

    return () => {
      map.off('mousedown', handleMouseDown);
      map.off('mousemove', handleMouseMove);
      map.off('mouseup', handleMouseUp);
      map.dragging.enable();
      mapContainer.style.cursor = '';
      if (rectangleRef.current) {
        map.removeLayer(rectangleRef.current);
      }
    };
  }, [drawMode, isDrawing, map, onDraftChange]);

  return null;
}


export default function DashboardMap({
  telemetry,
  drawMode = false,
  draftGeofence = [],
  onDraftChange,
}) {
  const center = useMemo(() => {
    return telemetry?.position ? [telemetry.position.lat, telemetry.position.lng] : TORONTO_CENTER;
  }, [telemetry]);

  const heading = telemetry?.position?.heading ?? 0;
  const droneIcon = useMemo(() => makeDroneIcon(heading), [heading]);

  const routeLatLngs = (telemetry?.route || []).map(p => [p.lat, p.lng]);
  const geofenceLatLngs = (telemetry?.geofence || []).map(p => [p.lat, p.lng]);

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: '100%', width: '100%', position: 'relative' }}
      scrollWheelZoom={true}
      zoomControl={false}
      preferCanvas={true}
      fadeAnimation={false}
      zoomAnimation={true}
      markerZoomAnimation={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        updateWhenZooming={false}
        updateWhenIdle={true}
        keepBuffer={3}
        maxZoom={19}
        minZoom={3}
        tileSize={256}
        zoomOffset={0}
        noWrap={false}
      />

      <DragRectangle drawMode={drawMode} onDraftChange={onDraftChange} />
      <ZoomControl />
      <FullscreenControl />

      {telemetry?.position && (
        <Marker
          position={[telemetry.position.lat, telemetry.position.lng]}
          icon={droneIcon}
          key={`drone-${telemetry.position.lat}-${telemetry.position.lng}`}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
            Drone
          </Tooltip>
        </Marker>
      )}

      {routeLatLngs.length > 1 && (
        <Polyline pathOptions={{ color: ACCENT_HEX, weight: 3 }} positions={routeLatLngs} />
      )}

      {geofenceLatLngs.length >= 3 && (
        <Polygon
          pathOptions={{
            color: ACCENT_HEX,
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '6, 4',
          }}
          positions={geofenceLatLngs}
        />
      )}

      {Array.isArray(draftGeofence) && draftGeofence.length >= 3 && (
        <Polygon
          pathOptions={{
            color: ACCENT_HEX,
            dashArray: '6, 4',
            weight: 1.5,
            fillOpacity: 0.08,
          }}
          positions={draftGeofence.map(p => [p.lat, p.lng])}
        />
      )}
    </MapContainer>
  );
}
