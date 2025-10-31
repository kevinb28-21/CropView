import React, { useEffect, useMemo, useState } from 'react';
import UploadPanel from '../components/UploadPanel.jsx';

const api = {
  listImages: async () => (await fetch('/api/images')).json()
};

export default function AnalyticsPage() {
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const selectedImage = useMemo(() => images.find(i => i.id === selectedImageId) || images[0], [images, selectedImageId]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const imgs = await api.listImages();
        if (mounted) setImages(imgs);
      } catch {}
    };
    load();
    const id = setInterval(load, 3000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <div className="container">
      <div className="container-grid">
        <div className="card">
          <div className="section-title">Upload & Image Analyses</div>
          <UploadPanel onUploaded={(item) => setImages(prev => [item, ...prev])} />
          <div style={{ marginTop: 20 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Recent Analyses</div>
            <div className="list">
              {images.map(img => (
                <div 
                  className="list-item" 
                  key={img.id}
                  onClick={() => setSelectedImageId(img.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
                    <img 
                      src={img.path} 
                      alt={img.originalName} 
                      style={{ 
                        width: 56, 
                        height: 56, 
                        objectFit: 'cover', 
                        borderRadius: 8, 
                        border: '1px solid #e5e7eb' 
                      }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                        {img.originalName || img.filename}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                        {new Date(img.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="badge">
                    NDVI {img?.analysis?.ndvi?.toFixed(2) ?? '-'}
                  </span>
                </div>
              ))}
              {images.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📸</div>
                  <div>No images analyzed yet</div>
                  <div style={{ fontSize: 14, marginTop: 8 }}>Upload images to get started</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Analysis Details</div>
          {!selectedImage && (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div>Select an image to view analysis</div>
            </div>
          )}
          {selectedImage && (
            <>
              <div className="metrics">
                <div className="metric">
                  <div className="metric-label">NDVI Value</div>
                  <div className="metric-value">{selectedImage.analysis?.ndvi?.toFixed(2) ?? 'N/A'}</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Health Status</div>
                  <div className="metric-value" style={{ fontSize: 18 }}>
                    {selectedImage.analysis?.summary ?? 'N/A'}
                  </div>
                </div>
              </div>
              
              {selectedImage.path && (
                <div style={{ marginBottom: 20 }}>
                  <img 
                    src={selectedImage.path} 
                    alt={selectedImage.originalName}
                    style={{ 
                      width: '100%', 
                      borderRadius: 8, 
                      border: '1px solid #e5e7eb',
                      marginBottom: 16
                    }} 
                  />
                </div>
              )}
              
              <div className="section-title" style={{ marginTop: 24 }}>Stress Zones Visualization</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                10×10 grid showing stress zones (red indicates higher stress)
              </div>
              <div className="grid">
                {Array.from({ length: 100 }).map((_, idx) => {
                  const x = idx % 10;
                  const y = Math.floor(idx / 10);
                  const zone = selectedImage.analysis?.stressZones?.find(z => z.x === x && z.y === y);
                  const color = zone ? `rgba(220,38,38,${zone.severity})` : '#f3f4f6';
                  return (
                    <div 
                      key={idx} 
                      className="grid-cell" 
                      style={{ background: color }}
                      title={zone ? `Stress: ${(zone.severity * 100).toFixed(0)}%` : 'No stress'}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
