import React, { useEffect, useState } from 'react';
import DashboardMap from '../components/DashboardMap.jsx';
import { api } from '../utils/api.js';
import { Pencil, Check, RotateCcw, Save, Lightbulb } from 'lucide-react';

export default function MapPage() {
  const [telemetry, setTelemetry] = useState({ position: null, route: [], geofence: [] });
  const [drawMode, setDrawMode] = useState(false);
  const [draftGeofence, setDraftGeofence] = useState([]);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let mounted = true;
    let intervalId = null;
    let isFetching = false;

    const fetchTel = async () => {
      if (document.hidden || isFetching || !mounted) return;
      isFetching = true;
      try {
        const tel = await api.get('/api/telemetry').catch(() => null);
        const telemetryData = tel || { position: null, route: [], geofence: [] };
        if (mounted) setTelemetry(telemetryData);
      } catch (e) {
        console.error('Error fetching telemetry:', e);
      } finally {
        isFetching = false;
      }
    };

    fetchTel();
    const startPolling = () => {
      if (!document.hidden && !intervalId && mounted) {
        intervalId = setInterval(() => { if (!document.hidden && mounted) fetchTel(); }, 30000);
      }
    };
    const stopPolling = () => {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
    };
    startPolling();
    const handleVisibilityChange = () => {
      if (document.hidden) stopPolling();
      else { startPolling(); fetchTel(); }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      mounted = false;
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="container animate-fade-in">
      <div className="card card-elevated" style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>Drone Telemetry Map</h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', margin: 0 }}>
              View drone location, route, and geofenced areas
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setDrawMode((v) => !v)}
              className={drawMode ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: '160px', justifyContent: 'center' }}
            >
              {drawMode ? <Check size={18} aria-hidden /> : <Pencil size={18} aria-hidden />}
              {drawMode ? 'Drawing Mode' : 'Draw Geofence'}
            </button>

            {draftGeofence.length > 0 && (
              <>
                <button
                  onClick={() => { setDraftGeofence([]); setDrawMode(false); }}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: '110px', justifyContent: 'center' }}
                >
                  <RotateCcw size={18} aria-hidden />
                  Clear
                </button>
                <button
                  onClick={async () => {
                    if (draftGeofence.length < 3) return;
                    try {
                      await api.post('/api/telemetry', { geofence: draftGeofence });
                      const tel = await api.get('/api/telemetry');
                      setTelemetry(tel);
                      setDrawMode(false);
                      setDraftGeofence([]);
                    } catch (err) {
                      console.error('Failed to save geofence:', err);
                      alert('Failed to save geofence. Please try again.');
                    }
                  }}
                  disabled={draftGeofence.length < 3}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    minWidth: '150px',
                    justifyContent: 'center',
                    opacity: draftGeofence.length < 3 ? 0.5 : 1,
                    cursor: draftGeofence.length < 3 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Save size={18} aria-hidden />
                  Save Geofence
                  {draftGeofence.length < 3 && (
                    <span style={{ fontSize: 'var(--font-size-xs)', marginLeft: 'var(--space-1)' }}>({draftGeofence.length}/3)</span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {drawMode && (
          <div
            style={{
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
              fontSize: 'var(--font-size-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--status-moderate)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-secondary)',
            }}
          >
            <Pencil size={20} style={{ color: 'var(--status-moderate)', flexShrink: 0 }} aria-hidden />
            <span><strong>Drawing mode:</strong> Click and drag on the map to draw a rectangular geofence</span>
          </div>
        )}

        <div
          style={{
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--font-size-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--bg-border)',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-muted)',
          }}
        >
          <Lightbulb size={16} aria-hidden />
          <span><strong>Tip:</strong> Right-click and drag (or Ctrl/Cmd + left-click drag) to rotate the map</span>
        </div>

        <div className="map-wrapper" style={{ position: 'relative' }}>
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
          <div
            style={{
              marginTop: 'var(--space-6)',
              padding: 'var(--space-5)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--font-size-sm)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-5)',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: '1 1 300px' }}>
              <div className="metric-label" style={{ marginBottom: 'var(--space-2)' }}>Drone Location</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 'var(--font-weight-normal)' }}>Lat:</span> {telemetry.position.lat.toFixed(6)}
                <span style={{ marginLeft: 'var(--space-4)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-normal)' }}>Lng:</span> {telemetry.position.lng.toFixed(6)}
              </div>
              {telemetry.position.altitude && (
                <div className="text-muted text-sm" style={{ marginTop: 'var(--space-2)' }}>
                  Altitude: {telemetry.position.altitude.toFixed(1)} m
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap', fontSize: 'var(--font-size-sm)' }}>
              {telemetry.geofence.length > 0 && (
                <div>
                  <div className="metric-label" style={{ marginBottom: 'var(--space-1)' }}>Geofence</div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{telemetry.geofence.length} points</div>
                </div>
              )}
              {telemetry.route.length > 0 && (
                <div>
                  <div className="metric-label" style={{ marginBottom: 'var(--space-1)' }}>Route</div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{telemetry.route.length} points</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
