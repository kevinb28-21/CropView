import React, { useEffect, useState } from 'react';
import DashboardMap from '../components/DashboardMap.jsx';
import { api } from '../utils/api.js';
import { Pencil, Check, RotateCcw, Save, Lightbulb, Navigation, MapPin, Layers, Battery, Activity } from 'lucide-react';

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

  const pos = telemetry.position;

  return (
    <div className="map-page">
      <div className="map-page-main">
        <div className="map-page-toolbar">
          <div className="map-page-toolbar-head">
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
                marginTop: 'var(--space-4)',
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
              marginTop: 'var(--space-4)',
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
        </div>

        <div className="map-page-map">
          <DashboardMap
            telemetry={telemetry}
            drawMode={drawMode}
            draftGeofence={draftGeofence}
            onDraftChange={setDraftGeofence}
            rotation={rotation}
            onRotationChange={setRotation}
          />
        </div>
      </div>

      <aside className="map-page-sidebar">
        <h3 className="map-page-sidebar-title">Live Telemetry</h3>
        <div className="map-page-telemetry-list">
          <div className="map-page-telemetry-row">
            <MapPin size={18} strokeWidth={2} className="map-page-telemetry-icon" aria-hidden />
            <div className="map-page-telemetry-label">Latitude</div>
            <div className="map-page-telemetry-value">
              {pos?.lat != null ? pos.lat.toFixed(6) : '--'}
            </div>
          </div>
          <div className="map-page-telemetry-row">
            <MapPin size={18} strokeWidth={2} className="map-page-telemetry-icon" aria-hidden />
            <div className="map-page-telemetry-label">Longitude</div>
            <div className="map-page-telemetry-value">
              {pos?.lng != null ? pos.lng.toFixed(6) : '--'}
            </div>
          </div>
          <div className="map-page-telemetry-row">
            <Layers size={18} strokeWidth={2} className="map-page-telemetry-icon" aria-hidden />
            <div className="map-page-telemetry-label">Altitude</div>
            <div className="map-page-telemetry-value">
              {pos?.altitude != null ? `${pos.altitude.toFixed(1)} m` : '--'}
            </div>
          </div>
          <div className="map-page-telemetry-row">
            <Navigation size={18} strokeWidth={2} className="map-page-telemetry-icon" aria-hidden />
            <div className="map-page-telemetry-label">Heading</div>
            <div className="map-page-telemetry-value">
              {pos?.heading != null ? `${pos.heading}°` : '--'}
            </div>
          </div>
          <div className="map-page-telemetry-row">
            <Battery size={18} strokeWidth={2} className="map-page-telemetry-icon" aria-hidden />
            <div className="map-page-telemetry-label">Battery</div>
            <div className="map-page-telemetry-value">
              {pos?.battery_level != null ? `${pos.battery_level}%` : '--'}
            </div>
          </div>
          <div className="map-page-telemetry-row">
            <Activity size={18} strokeWidth={2} className="map-page-telemetry-icon" aria-hidden />
            <div className="map-page-telemetry-label">Status</div>
            <div className="map-page-telemetry-value">
              {pos?.status != null && String(pos.status).trim() !== '' ? String(pos.status) : '--'}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
