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
    let intervalId = null;
    let isFetching = false;
    
    const fetchTel = async () => {
      if (document.hidden || isFetching || !mounted) return;
      
      isFetching = true;
      try {
        const tel = await api.get('/api/telemetry').catch((e) => {
          console.error('Failed to fetch telemetry:', e);
          return null;
        });
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
        intervalId = setInterval(() => {
          if (!document.hidden && mounted) {
            fetchTel();
          }
        }, 30000);
      }
    };
    
    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    
    startPolling();
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
        fetchTel();
      }
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
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: 'var(--space-6)', 
          flexWrap: 'wrap', 
          gap: 'var(--space-4)'
        }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>
              Drone Telemetry Map
            </h2>
            <p style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--color-text-tertiary)',
              margin: 0
            }}>
              View drone location, route, and geofenced areas
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-3)', 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <button 
              onClick={() => setDrawMode(v => !v)} 
              className={`btn ${drawMode ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                minWidth: '160px',
                justifyContent: 'center'
              }}
            >
              {drawMode ? (
                <>
                  <span>✓</span>
                  <span>Drawing Mode</span>
                </>
              ) : (
                <>
                  <span>✏️</span>
                  <span>Draw Geofence</span>
                </>
              )}
            </button>
            
            {draftGeofence.length > 0 && (
              <>
                <button 
                  onClick={() => {
                    setDraftGeofence([]);
                    setDrawMode(false);
                  }}
                  className="btn btn-secondary"
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    minWidth: '110px',
                    justifyContent: 'center'
                  }}
                >
                  <span>↺</span>
                  <span>Clear</span>
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
                  className="btn btn-accent"
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    minWidth: '150px',
                    justifyContent: 'center',
                    opacity: draftGeofence.length < 3 ? 0.5 : 1,
                    cursor: draftGeofence.length < 3 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>💾</span>
                  <span>Save Geofence</span>
                  {draftGeofence.length < 3 && (
                    <span style={{ fontSize: 'var(--font-size-xs)', marginLeft: 'var(--space-1)' }}>
                      ({draftGeofence.length}/3)
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        
        {drawMode && (
          <div className="badge badge-warning" style={{ 
            padding: 'var(--space-4)', 
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            borderRadius: 'var(--radius-lg)',
            border: 'none'
          }}>
            <span style={{ fontSize: '1.2rem' }}>✏️</span>
            <div>
              <strong>Drawing Mode Active:</strong> Click and drag on the map to draw a rectangular geofence area
            </div>
          </div>
        )}
        
        <div className="badge badge-info" style={{ 
          padding: 'var(--space-3)', 
          marginBottom: 'var(--space-4)',
          fontSize: 'var(--font-size-xs)',
          display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            borderRadius: 'var(--radius-lg)',
            border: 'none'
        }}>
          <span>💡</span>
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
          <div style={{ 
            marginTop: 'var(--space-6)', 
            padding: 'var(--space-5)', 
            background: 'linear-gradient(135deg, var(--color-bg-tertiary) 0%, var(--color-bg-secondary) 100%)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', 
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-5)',
            alignItems: 'center'
          }}>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ 
                fontSize: 'var(--font-size-xs)', 
                color: 'var(--color-text-tertiary)', 
                marginBottom: 'var(--space-2)',
                fontWeight: 'var(--font-weight-medium)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--letter-spacing-wider)'
              }}>
                Drone Location
              </div>
              <div style={{ 
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)'
              }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-normal)' }}>Lat:</span> {telemetry.position.lat.toFixed(6)}
                <span style={{ marginLeft: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-normal)' }}>Lng:</span> {telemetry.position.lng.toFixed(6)}
              </div>
              {telemetry.position.altitude && (
                <div style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-text-tertiary)', 
                  marginTop: 'var(--space-2)'
                }}>
                  Altitude: {telemetry.position.altitude.toFixed(1)}m
                </div>
              )}
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-5)', 
              flexWrap: 'wrap',
              fontSize: 'var(--font-size-sm)'
            }}>
              {telemetry.geofence.length > 0 && (
                <div>
                  <div style={{ 
                    fontSize: 'var(--font-size-xs)', 
                    color: 'var(--color-text-tertiary)', 
                    marginBottom: 'var(--space-1)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--letter-spacing-wider)'
                  }}>
                    Geofence
                  </div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                    {telemetry.geofence.length} points
                  </div>
                </div>
              )}
              {telemetry.route.length > 0 && (
                <div>
                  <div style={{ 
                    fontSize: 'var(--font-size-xs)', 
                    color: 'var(--color-text-tertiary)', 
                    marginBottom: 'var(--space-1)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--letter-spacing-wider)'
                  }}>
                    Route
                  </div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                    {telemetry.route.length} points
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
