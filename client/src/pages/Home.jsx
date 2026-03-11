import React, { useEffect, useState } from 'react';
import { api, buildImageUrl, formatDate } from '../utils/api.js';
import { ImageIcon, ArrowRight, Wifi, WifiOff } from 'lucide-react';

export default function HomePage() {
  const [images, setImages] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    let intervalId = null;
    let isFetching = false;

    const checkBackendHealth = async () => {
      try {
        const health = await api.get('/api/health');
        if (health && health.status === 'ok') {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    checkBackendHealth();

    const fetchData = async () => {
      if (document.hidden || isFetching) return;
      isFetching = true;
      try {
        const [imgs, tel] = await Promise.all([
          api.get('/api/images').catch(() => []),
          api.get('/api/telemetry').catch(() => null),
        ]);
        const imagesArray = Array.isArray(imgs) ? imgs : (imgs?.images || []);
        setImages(imagesArray);
        setTelemetry(tel);
        if (imagesArray.length >= 0 || tel !== null) setBackendStatus('online');
      } catch (e) {
        setBackendStatus('offline');
      } finally {
        isFetching = false;
      }
    };

    fetchData();
    const startPolling = () => {
      if (!document.hidden && !intervalId) {
        intervalId = setInterval(() => { if (!document.hidden) fetchData(); }, 30000);
      }
    };
    const stopPolling = () => {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
    };
    startPolling();
    const handleVisibilityChange = () => {
      if (document.hidden) stopPolling();
      else { startPolling(); fetchData(); }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const processedImages = images.filter(img => img.processingStatus === 'completed' && img.analysis);
  const avgNDVI = processedImages.length > 0
    ? (processedImages.reduce((sum, img) => sum + (img?.analysis?.ndvi?.mean || 0), 0) / processedImages.length).toFixed(3)
    : null;
  const avgSAVI = processedImages.length > 0
    ? (processedImages.reduce((sum, img) => sum + (img?.analysis?.savi?.mean || 0), 0) / processedImages.length).toFixed(3)
    : null;
  const avgGNDVI = processedImages.length > 0
    ? (processedImages.reduce((sum, img) => sum + (img?.analysis?.gndvi?.mean || 0), 0) / processedImages.length).toFixed(3)
    : null;
  const avgHealthScore = processedImages.length > 0
    ? (processedImages.reduce((sum, img) => sum + (img?.analysis?.healthScore || 0), 0) / processedImages.length).toFixed(2)
    : null;
  const avgConfidence = processedImages.filter(img => img.analysis?.confidence).length > 0
    ? (processedImages.filter(img => img.analysis?.confidence).reduce((sum, img) => sum + (img.analysis.confidence || 0), 0) / processedImages.filter(img => img.analysis?.confidence).length * 100).toFixed(1)
    : null;

  const today = new Date().toDateString();
  const imagesToday = images.filter(img => {
    if (!img.createdAt) return false;
    try {
      return new Date(img.createdAt).toDateString() === today && img.processingStatus === 'completed';
    } catch (e) { return false; }
  }).length;

  return (
    <div className="container animate-fade-in">
      <div className="container-grid">
        <div>
          <div className="card card-elevated animate-fade-in-up" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <h2 className="section-title" style={{ margin: 0 }}>CropView Dashboard</h2>
              {backendStatus !== 'checking' && (
                <span
                  className={`badge ${backendStatus === 'online' ? 'badge-success' : 'badge-error'}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}
                  title={backendStatus === 'online' ? 'Backend reachable' : 'Backend connection failed'}
                >
                  {backendStatus === 'online' ? <Wifi size={12} aria-hidden /> : <WifiOff size={12} aria-hidden />}
                  {backendStatus === 'online' ? 'Online' : 'Offline'}
                </span>
              )}
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)', fontSize: 'var(--font-size-base)' }}>
              Precision agriculture drone analytics. Upload field imagery for NDVI/SAVI/GNDVI analysis, stress zones, and ML-based crop health classification.
            </p>
            {backendStatus === 'offline' && import.meta.env.DEV && (
              <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--status-moderate)', border: '1px solid var(--status-moderate)' }}>
                <strong>Debug:</strong> Backend connection failed. Check console. In production, verify Netlify proxy and CORS.
              </div>
            )}
          </div>

          <div className="card card-elevated animate-fade-in-up stagger-1">
            <h3 className="section-title">Performance Metrics</h3>
            <div className="metrics">
              <div className="metric">
                <div className="metric-label">Images Analyzed</div>
                <div className="metric-value">{processedImages.length}</div>
              </div>
              {imagesToday > 0 && (
                <div className="metric">
                  <div className="metric-label">Processed Today</div>
                  <div className="metric-value">{imagesToday}</div>
                </div>
              )}
              {avgNDVI && (
                <div className="metric">
                  <div className="metric-label">Avg NDVI</div>
                  <div className="metric-value">{avgNDVI}</div>
                </div>
              )}
              {avgSAVI && (
                <div className="metric">
                  <div className="metric-label">Avg SAVI</div>
                  <div className="metric-value">{avgSAVI}</div>
                </div>
              )}
              {avgGNDVI && (
                <div className="metric">
                  <div className="metric-label">Avg GNDVI</div>
                  <div className="metric-value">{avgGNDVI}</div>
                </div>
              )}
              {avgHealthScore && (
                <div className="metric">
                  <div className="metric-label">Health Score</div>
                  <div className="metric-value">{avgHealthScore}</div>
                </div>
              )}
              {avgConfidence && (
                <div className="metric">
                  <div className="metric-label">ML Confidence</div>
                  <div className="metric-value">{avgConfidence}<span className="unit">%</span></div>
                </div>
              )}
            </div>
          </div>

          <div className="card animate-fade-in-up stagger-2">
            <h3 className="section-title">Quick Start</h3>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
              <li style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <ArrowRight size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} aria-hidden />
                <span style={{ color: 'var(--text-secondary)' }}>Go to <strong style={{ color: 'var(--text-primary)' }}>Analytics</strong> to upload field images</span>
              </li>
              <li style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <ArrowRight size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} aria-hidden />
                <span style={{ color: 'var(--text-secondary)' }}>View <strong style={{ color: 'var(--text-primary)' }}>Map</strong> for drone location and geofences</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <ArrowRight size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} aria-hidden />
                <span style={{ color: 'var(--text-secondary)' }}>Open <strong style={{ color: 'var(--text-primary)' }}>ML Insights</strong> for predictions</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="card card-elevated animate-fade-in-up stagger-3">
          <h3 className="section-title">Recent Activity</h3>
          {images.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><ImageIcon size={48} strokeWidth={1} aria-hidden /></div>
              <div className="empty-state-title">No Recent Activity</div>
              <div className="empty-state-description">Upload your first field image to begin crop health analysis</div>
            </div>
          )}
          {images.length > 0 && (
            <div className="list">
              {images.slice(0, 5).map((img, idx) => (
                <div key={img.id} className="list-item animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s`, cursor: 'default' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <img
                      src={buildImageUrl(img) || '/placeholder.png'}
                      alt=""
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-border)' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="text-sm truncate" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                        {img.originalName || img.filename || 'Untitled Image'}
                      </div>
                      <div className="text-xs text-muted">{formatDate(img.createdAt, 'date')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexShrink: 0 }}>
                    {img.processingStatus && (
                      <span className={`badge ${img.processingStatus === 'completed' ? 'badge-success' : img.processingStatus === 'processing' ? 'badge-warning' : 'badge-info'}`}>
                        {img.processingStatus}
                      </span>
                    )}
                    {img?.analysis?.ndvi?.mean !== undefined && (
                      <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)' }}>
                        NDVI {img.analysis?.ndvi?.mean?.toFixed(2) || 'N/A'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
