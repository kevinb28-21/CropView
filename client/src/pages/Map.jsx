import React, { useEffect, useState } from 'react';
import DashboardMap from '../components/DashboardMap.jsx';
import { api } from '../utils/api.js';

export default function MapPage() {
  const [telemetry, setTelemetry] = useState({ position: null, route: [], geofence: [] });
  const [drawMode, setDrawMode] = useState(false);
  const [draftGeofence, setDraftGeofence] = useState([]);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchTel = async () => {
      try {
        const tel = await api.get('/api/telemetry');
        if (mounted) setTelemetry(tel);
      } catch {}
    };
    fetchTel();
    const id = setInterval(fetchTel, 3000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <div className="container">
      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>Drone Telemetry Map</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              View drone location, route, and geofenced areas
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button 
              onClick={() => setDrawMode(v => !v)} 
              style={{ 
                background: drawMode ? '#059669' : '#4cdf20',
                color: '#152111'
              }}
            >
              {drawMode ? '✓ Drawing Mode' : 'Draw Geofence'}
            </button>
            <button 
              onClick={() => setDraftGeofence([])} 
              disabled={draftGeofence.length === 0}
              style={{ background: '#6b7280' }}
            >
              Reset
            </button>
            <button
              onClick={async () => {
                if (draftGeofence.length < 3) return;
                await api.post('/api/telemetry', { geofence: draftGeofence });
                const tel = await api.get('/api/telemetry');
                setTelemetry(tel);
                setDrawMode(false);
                setDraftGeofence([]);
              }}
              disabled={draftGeofence.length < 3}
              style={{ background: '#2563eb', color: 'white' }}
            >
              Save Geofence
            </button>
          </div>
        </div>
        
        {drawMode && (
          <div style={{ 
            padding: 12, 
            background: '#fef3c7', 
            border: '1px solid #fbbf24', 
            borderRadius: 8, 
            marginBottom: 16,
            fontSize: 14,
            color: '#92400e'
          }}>
            <strong>Drawing Mode Active:</strong> Click and drag on the map to draw a rectangular geofence area
          </div>
        )}
        
        <div className="map-wrapper">
          <DashboardMap 
            telemetry={telemetry} 
            drawMode={drawMode} 
            draftGeofence={draftGeofence} 
            onDraftChange={setDraftGeofence}
            rotation={rotation}
            onRotationChange={setRotation}
          />
        </div>
        
        {telemetry.position && (
          <div style={{ marginTop: 16, padding: 12, background: '#f9fafb', borderRadius: 8, fontSize: 13 }}>
            <strong>Current Position:</strong> {telemetry.position.lat.toFixed(6)}, {telemetry.position.lng.toFixed(6)}
            {telemetry.geofence.length > 0 && (
              <span style={{ marginLeft: 16 }}>
                <strong>Geofence:</strong> {telemetry.geofence.length} points defined
              </span>
            )}
            {telemetry.route.length > 0 && (
              <span style={{ marginLeft: 16 }}>
                <strong>Route:</strong> {telemetry.route.length} points
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
