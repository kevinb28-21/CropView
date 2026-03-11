import React, { useState, useRef, useEffect } from 'react';

/**
 * VegetationIndexMaps Component
 * Displays NDVI, SAVI, and GNDVI heatmaps with toggle functionality
 */
export default function VegetationIndexMaps({ imageUrl, analysis, onMapGenerated }) {
  const [activeMap, setActiveMap] = useState('original'); // 'original', 'ndvi', 'savi', 'gndvi'
  const [heatmapData, setHeatmapData] = useState(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imageUrl && analysis && canvasRef.current) {
      generateHeatmap();
    }
  }, [imageUrl, analysis, activeMap]);

  const generateHeatmap = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    
    if (!canvas || !img || !analysis) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

    if (activeMap === 'original') {
      ctx.drawImage(img, 0, 0);
      return;
    }

    // Draw original image first
    ctx.drawImage(img, 0, 0);

    // Get the appropriate index data
    let indexData = null;
    let indexName = '';
    
    if (activeMap === 'ndvi' && analysis.ndvi) {
      indexData = analysis.ndvi;
      indexName = 'NDVI';
    } else if (activeMap === 'savi' && analysis.savi) {
      indexData = analysis.savi;
      indexName = 'SAVI';
    } else if (activeMap === 'gndvi' && analysis.gndvi) {
      indexData = analysis.gndvi;
      indexName = 'GNDVI';
    }

    if (!indexData || indexData.mean === undefined) {
      return;
    }

    // Create heatmap overlay
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const mean = indexData.mean || 0;
    const min = indexData.min !== undefined ? indexData.min : mean - 0.3;
    const max = indexData.max !== undefined ? indexData.max : mean + 0.3;

    // Normalize value to 0-1 range
    const normalize = (value) => {
      const range = max - min;
      if (range === 0) return 0.5;
      return Math.max(0, Math.min(1, (value - min) / range));
    };

    // Apply color overlay based on vegetation index
    for (let i = 0; i < data.length; i += 4) {
      // Use a simplified approach: overlay color based on mean value
      // In a real implementation, you'd need pixel-level NDVI/SAVI/GNDVI data
      const normalized = normalize(mean);
      
      // Color scheme: red (low) -> yellow -> green (high)
      let r, g, b;
      if (normalized < 0.33) {
        // Red to Yellow
        const t = normalized / 0.33;
        r = 255;
        g = Math.floor(255 * t);
        b = 0;
      } else if (normalized < 0.66) {
        // Yellow to Green
        const t = (normalized - 0.33) / 0.33;
        r = Math.floor(255 * (1 - t));
        g = 255;
        b = 0;
      } else {
        // Green to Dark Green
        const t = (normalized - 0.66) / 0.34;
        r = 0;
        g = 255;
        b = Math.floor(100 * t);
      }

      // Blend with original image (50% opacity)
      data[i] = Math.floor(data[i] * 0.5 + r * 0.5);     // R
      data[i + 1] = Math.floor(data[i + 1] * 0.5 + g * 0.5); // G
      data[i + 2] = Math.floor(data[i + 2] * 0.5 + b * 0.5); // B
      // Alpha stays the same
    }

    ctx.putImageData(imageData, 0, 0);
    
    if (onMapGenerated) {
      onMapGenerated(activeMap, canvas.toDataURL());
    }
  };

  const getIndexValue = (indexName) => {
    if (!analysis) return null;
    const index = analysis[indexName.toLowerCase()];
    return index ? index.mean : null;
  };

  const getIndexColor = (value) => {
    if (value === null || value === undefined) return 'var(--text-muted)';
    if (value >= 0.7) return 'var(--status-healthy)';
    if (value >= 0.5) return 'var(--status-moderate)';
    if (value >= 0.3) return 'var(--status-moderate)';
    return 'var(--status-poor)';
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {['original', 'ndvi', 'savi', 'gndvi'].map(mapType => (
          <button
            key={mapType}
            onClick={() => setActiveMap(mapType)}
            className="btn btn-secondary"
            style={{
              borderColor: activeMap === mapType ? 'var(--accent)' : 'var(--bg-border)',
              background: activeMap === mapType ? 'var(--accent-muted)' : 'transparent',
              color: activeMap === mapType ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: activeMap === mapType ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            }}
          >
            {mapType === 'original' ? 'Original Image' : mapType.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
        <img ref={imgRef} src={imageUrl} alt="Crop image" style={{ display: 'none' }} onLoad={generateHeatmap} />
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bg-border)', maxHeight: '500px', objectFit: 'contain' }}
        />
        {activeMap !== 'original' && (
          <div style={{ position: 'absolute', top: 12, right: 12, padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {activeMap.toUpperCase()} Heatmap
          </div>
        )}
      </div>

      {analysis && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          {['ndvi', 'savi', 'gndvi'].map(indexName => {
            const index = analysis[indexName];
            if (!index || index.mean === undefined) return null;
            return (
              <div key={indexName} style={{ padding: 'var(--space-4)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bg-border)' }}>
                <div className="metric-label" style={{ marginBottom: 'var(--space-2)' }}>{indexName.toUpperCase()}</div>
                <div className="metric-value" style={{ color: getIndexColor(index.mean), marginBottom: 'var(--space-2)' }}>{index.mean.toFixed(3)}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <div>Min: {index.min !== undefined ? index.min.toFixed(3) : 'N/A'}</div>
                  <div>Max: {index.max !== undefined ? index.max.toFixed(3) : 'N/A'}</div>
                  <div>Std: {index.std !== undefined ? index.std.toFixed(3) : 'N/A'}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

