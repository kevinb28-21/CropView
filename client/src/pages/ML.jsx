import React from 'react';

export default function MLPage() {
  return (
    <div className="container">
      <div className="card">
        <div className="section-title">Machine Learning Integration</div>
        <p style={{ margin: '0 0 16px', color: '#6b7280', lineHeight: 1.6 }}>
          This page will host model configuration and inference controls once a dataset
          and trained model are available. For now, image analysis uses placeholder NDVI
          and stress zones generated on upload.
        </p>
        
        <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginTop: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, color: '#111827' }}>Planned Features:</div>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#6b7280', lineHeight: 1.8 }}>
            <li>Upload model files or configure endpoint</li>
            <li>Inference job queue and status monitoring</li>
            <li>Model performance metrics and comparison</li>
            <li>Result overlays on map and analytics comparison</li>
          </ul>
        </div>

        <div style={{ marginTop: 24, padding: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Current Status:</div>
          <div style={{ color: '#1e3a8a', fontSize: 14 }}>
            Using placeholder analysis with mock NDVI calculations. Replace with Python Flask API 
            image processing service when ready.
          </div>
        </div>
      </div>
    </div>
  );
}
