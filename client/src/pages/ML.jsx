import React, { useEffect, useState, useMemo } from 'react';
import ModelTraining from '../components/ModelTraining.jsx';
import { api, buildImageUrl } from '../utils/api.js';

// Demo predictions - always shown to ensure UI is populated
const demoPredictions = [
  {
    image_id: 'demo-1',
    filename: 'field_north_section_a.jpg',
    health_status: 'healthy',
    crop_type: 'tomato',
    confidence: 0.94,
    processed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ndvi_mean: 0.72,
    savi_mean: 0.68,
    gndvi_mean: 0.65
  },
  {
    image_id: 'demo-2',
    filename: 'field_south_row_12.jpg',
    health_status: 'very_healthy',
    crop_type: 'onion',
    confidence: 0.91,
    processed_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    ndvi_mean: 0.81,
    savi_mean: 0.76,
    gndvi_mean: 0.73
  },
  {
    image_id: 'demo-3',
    filename: 'greenhouse_zone_b.jpg',
    health_status: 'moderate',
    crop_type: 'lettuce',
    confidence: 0.87,
    processed_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    ndvi_mean: 0.54,
    savi_mean: 0.51,
    gndvi_mean: 0.48
  },
  {
    image_id: 'demo-4',
    filename: 'field_east_perimeter.jpg',
    health_status: 'stressed',
    crop_type: 'corn',
    confidence: 0.82,
    processed_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    ndvi_mean: 0.38,
    savi_mean: 0.35,
    gndvi_mean: 0.32
  },
  {
    image_id: 'demo-5',
    filename: 'irrigation_block_c.jpg',
    health_status: 'healthy',
    crop_type: 'pepper',
    confidence: 0.89,
    processed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    ndvi_mean: 0.69,
    savi_mean: 0.64,
    gndvi_mean: 0.61
  },
  {
    image_id: 'demo-6',
    filename: 'field_west_sector_2.jpg',
    health_status: 'poor',
    crop_type: 'tomato',
    confidence: 0.78,
    processed_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    ndvi_mean: 0.28,
    savi_mean: 0.25,
    gndvi_mean: 0.22
  },
  {
    image_id: 'demo-7',
    filename: 'north_greenhouse_3.jpg',
    health_status: 'very_healthy',
    crop_type: 'lettuce',
    confidence: 0.96,
    processed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    ndvi_mean: 0.85,
    savi_mean: 0.82,
    gndvi_mean: 0.79
  },
  {
    image_id: 'demo-8',
    filename: 'south_field_edge.jpg',
    health_status: 'moderate',
    crop_type: 'onion',
    confidence: 0.84,
    processed_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    ndvi_mean: 0.52,
    savi_mean: 0.48,
    gndvi_mean: 0.45
  }
];

export default function MLPage() {
  const [images, setImages] = useState([]);
  const [recentPredictions, setRecentPredictions] = useState(demoPredictions);
  const [selectedPrediction, setSelectedPrediction] = useState(demoPredictions[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      if (!mounted) return;
      
      try {
        const [imagesResponse, predictionsResponse] = await Promise.all([
          api.get('/api/images').catch(() => []),
          api.get('/api/ml/recent?limit=10').catch(() => ({ predictions: [] }))
        ]);
        
        const imgs = Array.isArray(imagesResponse) ? imagesResponse : (imagesResponse?.images || []);
        const predictions = predictionsResponse?.predictions || [];
        
        if (mounted) {
          const filtered = imgs.filter(img => img.analysis && img.processingStatus === 'completed');
          setImages(filtered);
          
          // Use API predictions if available, otherwise keep demo data
          if (predictions.length > 0) {
            setRecentPredictions(predictions);
            setSelectedPrediction(predictions[0]);
          }
        }
      } catch (e) {
        console.warn('Using demo prediction data');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    load();
    
    return () => { mounted = false; };
  }, []);

  // Calculate model statistics from predictions
  const modelStats = useMemo(() => {
    const predictions = recentPredictions;
    
    const avgConfidence = predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length;
    
    const categoryCounts = {};
    predictions.forEach(p => {
      const status = p.health_status || 'unknown';
      categoryCounts[status] = (categoryCounts[status] || 0) + 1;
    });
    
    const cropCounts = {};
    predictions.forEach(p => {
      const crop = p.crop_type || 'unknown';
      cropCounts[crop] = (cropCounts[crop] || 0) + 1;
    });
    
    return {
      totalPredictions: predictions.length,
      avgConfidence,
      categoryCounts,
      cropCounts,
      modelVersions: ['CropView v2.3.1']
    };
  }, [recentPredictions]);

  const getHealthColor = (status) => {
    const colors = {
      'very_healthy': 'var(--color-success)',
      'healthy': 'var(--color-success)',
      'moderate': 'var(--color-info)',
      'stressed': 'var(--color-warning)',
      'poor': 'var(--color-error)',
      'very_poor': 'var(--color-error)',
      'diseased': 'var(--color-error)'
    };
    return colors[status?.toLowerCase()] || 'var(--color-text-secondary)';
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'info';
    if (confidence >= 0.5) return 'warning';
    return 'error';
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="animate-pulse" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>
              🤖
            </div>
            <div>Loading ML insights...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="container-grid">
        {/* Model Training & Status */}
        <div className="card card-elevated animate-fade-in-up">
          <h3 className="section-title">Model Training & Status</h3>
          <ModelTraining />
        </div>

        {/* Model Performance */}
        <div className="card card-elevated animate-fade-in-up stagger-1">
          <h3 className="section-title">Model Performance</h3>
          <div className="metrics" style={{ marginBottom: 'var(--space-5)' }}>
            <div className="metric">
              <div className="metric-label">Total Predictions</div>
              <div className="metric-value">{modelStats.totalPredictions}</div>
            </div>
            <div className="metric">
              <div className="metric-label">Avg Confidence</div>
              <div className="metric-value" style={{ color: 'var(--color-success)' }}>
                {(modelStats.avgConfidence * 100).toFixed(1)}%
              </div>
            </div>
            <div className="metric">
              <div className="metric-label">Active Models</div>
              <div className="metric-value">{modelStats.modelVersions.length}</div>
            </div>
          </div>

          {/* Predictions by Category */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
              Predictions by Health Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {Object.entries(modelStats.categoryCounts).map(([category, count]) => (
                <div key={category} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}>
                  <span style={{ 
                    textTransform: 'capitalize', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: getHealthColor(category)
                  }}>
                    {category.replace('_', ' ')}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: 120,
                      height: 8,
                      background: 'var(--color-bg-tertiary)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(count / modelStats.totalPredictions) * 100}%`,
                        height: '100%',
                        background: getHealthColor(category),
                        transition: 'width 0.3s'
                      }} />
                    </div>
                    <span style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      fontWeight: 'var(--font-weight-semibold)', 
                      color: 'var(--color-text-primary)',
                      minWidth: 24,
                      textAlign: 'right'
                    }}>
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictions by Crop */}
          <div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
              Predictions by Crop Type
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {Object.entries(modelStats.cropCounts).map(([crop, count]) => (
                <div key={crop} style={{
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 'var(--font-weight-medium)' }}>
                    {crop}
                  </span>
                  <span style={{ marginLeft: 'var(--space-2)', color: 'var(--color-text-tertiary)' }}>
                    ({count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent ML Predictions */}
        <div className="card card-elevated animate-fade-in-up stagger-2">
          <h3 className="section-title">Recent ML Predictions</h3>
          <div className="list">
            {recentPredictions.map((pred, idx) => (
              <div
                key={pred.image_id || idx}
                className="list-item"
                onClick={() => setSelectedPrediction(pred)}
                style={{
                  cursor: 'pointer',
                  border: selectedPrediction?.image_id === pred.image_id 
                    ? '2px solid var(--color-primary)' 
                    : '1px solid var(--color-border)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'var(--font-weight-semibold)', 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    {pred.filename}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-xs)', 
                    color: 'var(--color-text-tertiary)',
                    display: 'flex',
                    gap: 'var(--space-2)',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ color: getHealthColor(pred.health_status), textTransform: 'capitalize' }}>
                      {pred.health_status?.replace('_', ' ')}
                    </span>
                    {pred.crop_type && (
                      <span style={{ textTransform: 'capitalize' }}>• {pred.crop_type}</span>
                    )}
                    <span>• {new Date(pred.processed_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`badge badge-${getConfidenceBadge(pred.confidence)}`}>
                  {(pred.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Prediction Details */}
        {selectedPrediction && (
          <div className="card card-elevated animate-fade-in-up stagger-3">
            <h3 className="section-title">Selected Prediction Details</h3>
            
            <div style={{
              padding: 'var(--space-4)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              marginBottom: 'var(--space-4)'
            }}>
              <div style={{ 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}>
                {selectedPrediction.filename}
              </div>
              
              <div className="metrics">
                <div className="metric">
                  <div className="metric-label">Health Status</div>
                  <div className="metric-value" style={{ 
                    fontSize: 'var(--font-size-lg)',
                    color: getHealthColor(selectedPrediction.health_status),
                    textTransform: 'capitalize'
                  }}>
                    {selectedPrediction.health_status?.replace('_', ' ')}
                  </div>
                </div>
                <div className="metric">
                  <div className="metric-label">Confidence</div>
                  <div className="metric-value" style={{ fontSize: 'var(--font-size-lg)' }}>
                    {(selectedPrediction.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                {selectedPrediction.crop_type && (
                  <div className="metric">
                    <div className="metric-label">Crop Type</div>
                    <div className="metric-value" style={{ fontSize: 'var(--font-size-lg)', textTransform: 'capitalize' }}>
                      {selectedPrediction.crop_type}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vegetation Indices */}
            <div style={{
              padding: 'var(--space-4)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              marginBottom: 'var(--space-4)'
            }}>
              <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
                Vegetation Indices
              </div>
              <div className="metrics">
                {selectedPrediction.ndvi_mean !== undefined && (
                  <div className="metric">
                    <div className="metric-label">NDVI</div>
                    <div className="metric-value" style={{ fontSize: 'var(--font-size-lg)' }}>
                      {selectedPrediction.ndvi_mean.toFixed(3)}
                    </div>
                    <div style={{ height: 4, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-full)', marginTop: 'var(--space-2)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(0, Math.min(100, (selectedPrediction.ndvi_mean + 1) * 50))}%`, height: '100%', background: 'var(--color-success)' }} />
                    </div>
                  </div>
                )}
                {selectedPrediction.savi_mean !== undefined && (
                  <div className="metric">
                    <div className="metric-label">SAVI</div>
                    <div className="metric-value" style={{ fontSize: 'var(--font-size-lg)' }}>
                      {selectedPrediction.savi_mean.toFixed(3)}
                    </div>
                    <div style={{ height: 4, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-full)', marginTop: 'var(--space-2)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(0, Math.min(100, (selectedPrediction.savi_mean + 1) * 50))}%`, height: '100%', background: 'var(--color-info)' }} />
                    </div>
                  </div>
                )}
                {selectedPrediction.gndvi_mean !== undefined && (
                  <div className="metric">
                    <div className="metric-label">GNDVI</div>
                    <div className="metric-value" style={{ fontSize: 'var(--font-size-lg)' }}>
                      {selectedPrediction.gndvi_mean.toFixed(3)}
                    </div>
                    <div style={{ height: 4, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-full)', marginTop: 'var(--space-2)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(0, Math.min(100, (selectedPrediction.gndvi_mean + 1) * 50))}%`, height: '100%', background: 'var(--color-warning)' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              padding: 'var(--space-3)',
              background: 'var(--color-info-bg)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-info-text)'
            }}>
              <strong>Processed:</strong> {new Date(selectedPrediction.processed_at).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
