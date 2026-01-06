import React, { useMemo, useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Polygon, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomControl, CompassControl, FullscreenControl } from './MapControls.jsx';
import { MouseRotation } from './MouseRotation.jsx';
import { MapMarkerUpdater } from './MapMarkerUpdater.jsx';

const droneIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Toronto coordinates
const TORONTO_CENTER = [43.6532, -79.3832];

// Drag rectangle component
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
      if (!drawMode || e.originalEvent.button !== 0) return; // Only left mouse button
      e.originalEvent.preventDefault();
      const latlng = e.latlng;
      startRef.current = latlng;
      setIsDrawing(true);
      
      // Create rectangle layer
      if (rectangleRef.current) {
        map.removeLayer(rectangleRef.current);
      }
      rectangleRef.current = L.rectangle([latlng, latlng], {
        color: '#10b981',
        weight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.2,
        dashArray: '6 6'
      }).addTo(map);
    };

    const handleMouseMove = (e) => {
      if (!drawMode || !isDrawing || !startRef.current) return;
      const latlng = e.latlng;
      
      if (rectangleRef.current) {
        rectangleRef.current.setBounds([startRef.current, latlng]);
      }
    };

    const handleMouseUp = (e) => {
      if (!drawMode || !isDrawing || !startRef.current) return;
      const latlng = e.latlng;
      const start = startRef.current;
      
      // Create rectangular geofence
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
    
    // Prevent map dragging when in draw mode
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
      map.dragging.enable(); // Re-enable dragging when cleaning up
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
  rotation = 0,
  onRotationChange 
}) {
  const center = useMemo(() => {
    // Use telemetry position if available, otherwise use a default center
    // Note: TORONTO_CENTER is just a fallback - in production, use actual field location
    return telemetry?.position ? [telemetry.position.lat, telemetry.position.lng] : TORONTO_CENTER;
  }, [telemetry]);

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
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        attribution="&copy; OpenStreetMap contributors"
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
      <MouseRotation rotation={rotation} onRotationChange={onRotationChange} />
      <MapMarkerUpdater rotation={rotation} />
      <ZoomControl />
      <CompassControl rotation={rotation} onRotationChange={onRotationChange} />
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
        <Polyline pathOptions={{ color: '#2563eb', weight: 3 }} positions={routeLatLngs} />
      )}

      {geofenceLatLngs.length >= 3 && (
        <Polygon pathOptions={{ color: '#f59e0b', weight: 2, fillOpacity: 0.08 }} positions={geofenceLatLngs} />
      )}

      {Array.isArray(draftGeofence) && draftGeofence.length >= 3 && (
        <Polygon 
          pathOptions={{ color: '#10b981', dashArray: '6 6', weight: 2, fillOpacity: 0.06 }} 
          positions={draftGeofence.map(p => [p.lat, p.lng])} 
        />
      )}
    </MapContainer>
  );
}
