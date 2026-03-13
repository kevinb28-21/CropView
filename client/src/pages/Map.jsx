import React, { useEffect, useState } from 'react';
import DashboardMap from '../components/DashboardMap.jsx';
import { api } from '../utils/api.js';
import { Pencil, Check, RotateCcw, Save, MapPin, Shield } from 'lucide-react';

const formatCoord = (val) => val != null ? val.toFixed(6) : '--';

export default function MapPage() {
  const [telemetry, setTelemetry] = useState({ position: null, route: [], geofence: [] });
  const [drawMode, setDrawMode] = useState(false);
  const [draftGeofence, setDraftGeofence] = useState([]);

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
  const geofencePoints = telemetry.geofence || [];

  const geofenceBounds = (() => {
    if (!geofencePoints.length) return null;
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    geofencePoints.forEach(p => {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    });
    return { nwLat: maxLat, nwLng: minLng, seLat: minLat, seLng: maxLng };
  })();

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    paddingBottom: 'var(--space-2)',
    marginBottom: 'var(--space-3)',
    borderBottom: '1px solid var(--bg-border)',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
  };

  const dataRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '3px 0',
  };

  const labelStyle = {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
  };

  const valueStyle = {
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
  };

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
        </div>

        <div className="map-page-map">
          <DashboardMap
            telemetry={telemetry}
            drawMode={drawMode}
            draftGeofence={draftGeofence}
            onDraftChange={setDraftGeofence}
          />
        </div>
      </div>

      <aside className="map-page-sidebar">
        <h3 className="map-page-sidebar-title">Live Telemetry</h3>

        {/* Drone Position */}
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <div style={sectionHeaderStyle}>
            <MapPin size={14} aria-hidden />
            DRONE POSITION
          </div>
          <div style={dataRowStyle}>
            <span style={labelStyle}>LAT</span>
            <span style={valueStyle}>{formatCoord(pos?.lat)}</span>
          </div>
          <div style={dataRowStyle}>
            <span style={labelStyle}>LNG</span>
            <span style={valueStyle}>{formatCoord(pos?.lng)}</span>
          </div>
          <div style={dataRowStyle}>
            <span style={labelStyle}>ALT</span>
            <span style={valueStyle}>{pos?.altitude != null ? `${pos.altitude.toFixed(1)} m` : '--'}</span>
          </div>
          <div style={dataRowStyle}>
            <span style={labelStyle}>HDG</span>
            <span style={valueStyle}>{pos?.heading != null ? `${pos.heading}°` : '--'}</span>
          </div>
          <div style={dataRowStyle}>
            <span style={labelStyle}>BATT</span>
            <span style={valueStyle}>{pos?.battery_level != null ? `${pos.battery_level}%` : '--'}</span>
          </div>
          <div style={dataRowStyle}>
            <span style={labelStyle}>STATUS</span>
            <span style={valueStyle}>
              {pos?.status != null && String(pos.status).trim() !== '' ? String(pos.status) : '--'}
            </span>
          </div>
        </div>

        {/* Geofence */}
        <div>
          <div style={sectionHeaderStyle}>
            <Shield size={14} aria-hidden />
            GEOFENCE
          </div>
          {geofencePoints.length > 0 ? (
            <>
              <div style={dataRowStyle}>
                <span style={labelStyle}>POINTS</span>
                <span style={valueStyle}>{geofencePoints.length}</span>
              </div>
              {geofenceBounds && (
                <>
                  <div style={{ ...dataRowStyle, marginTop: '4px' }}>
                    <span style={labelStyle}>NW</span>
                    <span style={valueStyle}>
                      {formatCoord(geofenceBounds.nwLat)}, {formatCoord(geofenceBounds.nwLng)}
                    </span>
                  </div>
                  <div style={dataRowStyle}>
                    <span style={labelStyle}>SE</span>
                    <span style={valueStyle}>
                      {formatCoord(geofenceBounds.seLat)}, {formatCoord(geofenceBounds.seLng)}
                    </span>
                  </div>
                </>
              )}
              <div style={{ ...dataRowStyle, marginTop: '4px' }}>
                <span style={labelStyle}>STATUS</span>
                <span style={{
                  ...valueStyle,
                  color: telemetry.is_active !== false ? 'var(--status-healthy)' : 'var(--status-poor)',
                  fontWeight: 600,
                }}>
                  {telemetry.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </>
          ) : (
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', padding: '4px 0' }}>
              No geofence defined
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
