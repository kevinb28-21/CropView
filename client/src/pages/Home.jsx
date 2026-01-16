import React, { useEffect, useState } from 'react';
import { api, buildImageUrl, formatDate } from '../utils/api.js';

export default function HomePage() {
  const [images, setImages] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'online' | 'offline'

  useEffect(() => {
    let intervalId = null;
    let isFetching = false;
    
    // Health check function
    const checkBackendHealth = async () => {
      try {
        const health = await api.get('/api/health');
        if (health && health.status === 'ok') {
          setBackendStatus('online');
          console.log('✓ Backend health check passed:', health);
        } else {
          setBackendStatus('offline');
          console.warn('⚠️ Backend health check returned unexpected response:', health);
        }
      } catch (error) {
        setBackendStatus('offline');
        console.error('✗ Backend health check failed:', error);
      }
    };
    
    // Run health check once on mount
    checkBackendHealth();
    
    const fetchData = async () => {
      if (document.hidden || isFetching) return;
      
      isFetching = true;
      try {
        const [imgs, tel] = await Promise.all([
          api.get('/api/images').catch((e) => {
            console.error('Failed to fetch images:', e);
            return [];
          }),
          api.get('/api/telemetry').catch((e) => {
            console.error('Failed to fetch telemetry:', e);
            return null;
          })
        ]);
        const imagesArray = Array.isArray(imgs) ? imgs : (imgs?.images || []);
        setImages(imagesArray);
        setTelemetry(tel);
        
        // Update backend status based on successful API calls
        if (imagesArray.length >= 0 || tel !== null) {
          setBackendStatus('online');
        }
      } catch (e) {
        console.error('Error fetching data:', e);
        setBackendStatus('offline');
      } finally {
        isFetching = false;
      }
    };
    
    fetchData();
    
    const startPolling = () => {
      if (!document.hidden && !intervalId) {
        intervalId = setInterval(() => {
          if (!document.hidden) {
            fetchData();
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
        fetchData();
      }
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
    ? (processedImages
        .filter(img => img.analysis?.confidence)
        .reduce((sum, img) => sum + (img.analysis.confidence || 0), 0) / 
       processedImages.filter(img => img.analysis?.confidence).length * 100).toFixed(1)
    : null;
  
  const today = new Date().toDateString();
  const imagesToday = images.filter(img => {
    if (!img.createdAt) return false;
    try {
      const imgDate = new Date(img.createdAt).toDateString();
      return imgDate === today && img.processingStatus === 'completed';
    } catch (e) {
      return false;
    }
  }).length;

  return (
    <div className="container animate-fade-in">
      <div className="container-grid">
        <div>
          <div className="card card-elevated animate-fade-in-up" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-4)' }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                Welcome to Precision Agriculture
              </h2>
              {backendStatus !== 'checking' && (
                <span 
                  className={`badge badge-${backendStatus === 'online' ? 'success' : 'error'}`}
                  style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-1)' }}
                  title={backendStatus === 'online' ? 'Backend is reachable' : 'Backend connection failed'}
                >
                  {backendStatus === 'online' ? '✓ Backend Online' : '✗ Backend Offline'}
                </span>
              )}
            </div>
            <p style={{ 
              margin: 0, 
              color: 'var(--color-text-secondary)', 
              lineHeight: 'var(--line-height-relaxed)',
              fontSize: 'var(--font-size-base)'
            }}>
              Advanced drone-based crop health monitoring and analysis platform. 
              Upload field imagery for real-time NDVI analysis, stress zone detection, 
              and comprehensive agricultural intelligence.
            </p>
            {backendStatus === 'offline' && import.meta.env.DEV && (
              <div style={{ 
                marginTop: 'var(--space-4)', 
                padding: 'var(--space-3)', 
                background: 'var(--color-bg-warning)', 
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-warning)'
              }}>
                <strong>Debug Info:</strong> Backend connection failed. Check console for details. 
                In production, verify Netlify proxy and CORS configuration.
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
                  <div className="metric-value" style={{ fontSize: 'var(--font-size-2xl)' }}>
                    {avgConfidence}%
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card animate-fade-in-up stagger-2">
            <h3 className="section-title">Quick Start Guide</h3>
            <ul style={{ 
              margin: 0, 
              paddingLeft: 'var(--space-6)', 
              color: 'var(--color-text-secondary)', 
              lineHeight: 'var(--line-height-relaxed)',
              listStyle: 'none'
            }}>
              <li style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                <span style={{ color: 'var(--color-accent)', fontSize: 'var(--font-size-lg)' }}>→</span>
                <span>Navigate to <strong style={{ color: 'var(--color-primary)' }}>Analytics</strong> to upload field images for comprehensive analysis</span>
              </li>
              <li style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                <span style={{ color: 'var(--color-accent)', fontSize: 'var(--font-size-lg)' }}>→</span>
                <span>View <strong style={{ color: 'var(--color-primary)' }}>Map</strong> to monitor drone location and define geofenced areas</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                <span style={{ color: 'var(--color-accent)', fontSize: 'var(--font-size-lg)' }}>→</span>
                <span>Explore <strong style={{ color: 'var(--color-primary)' }}>ML Insights</strong> for advanced model predictions and recommendations</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="card card-elevated animate-fade-in-up stagger-3">
          <h3 className="section-title">Recent Activity</h3>
          {images.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🌾</div>
              <div className="empty-state-title">No Recent Activity</div>
              <div className="empty-state-description">
                Upload your first field image to begin crop health analysis
              </div>
            </div>
          )}
          {images.length > 0 && (
            <div className="list">
              {images.slice(0, 5).map((img, idx) => (
                <div 
                  key={img.id} 
                  className="list-item animate-fade-in-up"
                  style={{ 
                    animationDelay: `${idx * 0.1}s`,
                    cursor: 'default'
                  }}
                >
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flex: 1 }}>
                    <img 
                      src={buildImageUrl(img) || '/placeholder.png'} 
                      alt="" 
                      style={{ 
                        width: 48, 
                        height: 48, 
                        objectFit: 'cover', 
                        borderRadius: 'var(--radius-md)', 
                        border: '2px solid var(--color-border)',
                        background: 'var(--color-bg-tertiary)'
                      }} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-1)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {img.originalName || img.filename || 'Untitled Image'}
                      </div>
                      <div style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--color-text-tertiary)'
                      }}>
                        {formatDate(img.createdAt, 'date')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexShrink: 0 }}>
                    {img.processingStatus && (
                      <span className={`badge badge-${img.processingStatus === 'completed' ? 'success' : img.processingStatus === 'processing' ? 'info' : 'warning'}`}>
                        {img.processingStatus}
                      </span>
                    )}
                    {img?.analysis?.ndvi?.mean !== undefined && (
                      <span className="badge badge-info" style={{ fontSize: 'var(--font-size-xs)' }}>
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
