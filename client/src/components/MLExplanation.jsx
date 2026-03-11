import React from 'react';

/**
 * MLExplanation Component
 * Provides explainable AI insights for ML model predictions
 */
export default function MLExplanation({ analysis, image }) {
  if (!analysis || !analysis.healthStatus) {
    return (
      <div style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--text-muted)' }}>
        No ML analysis available for this image
      </div>
    );
  }

  const healthStatus = analysis.healthStatus;
  const confidence = analysis.confidence || 0;
  const ndvi = analysis.ndvi?.mean;
  const savi = analysis.savi?.mean;
  const gndvi = analysis.gndvi?.mean;

  // Generate natural language explanation
  const generateExplanation = () => {
    const parts = [];
    
    if (ndvi !== undefined) {
      parts.push(`NDVI of ${ndvi.toFixed(3)}`);
    }
    if (savi !== undefined) {
      parts.push(`SAVI of ${savi.toFixed(3)}`);
    }
    if (gndvi !== undefined) {
      parts.push(`GNDVI of ${gndvi.toFixed(3)}`);
    }

    let explanation = `The image shows ${parts.join(', ')}, which indicates `;
    
    // Health status interpretation
    const statusMap = {
      'very_healthy': 'excellent crop health with high vegetation vigor',
      'healthy': 'good crop health with adequate vegetation',
      'moderate': 'moderate crop health requiring monitoring',
      'poor': 'poor crop health requiring attention',
      'very_poor': 'critical crop health requiring immediate intervention',
      'diseased': 'signs of disease that need treatment',
      'stressed': 'crop stress likely due to environmental factors',
      'weeds': 'significant weed presence affecting crop health'
    };

    explanation += statusMap[healthStatus] || 'crop health status';
    
    if (confidence > 0) {
      explanation += `. The model is ${(confidence * 100).toFixed(0)}% confident in this classification.`;
    }

    return explanation;
  };

  // Calculate feature contributions (simplified)
  const calculateFeatureContributions = () => {
    const contributions = {
      ndvi: 0,
      savi: 0,
      gndvi: 0,
      visual: 0
    };

    if (ndvi !== undefined && savi !== undefined && gndvi !== undefined) {
      // Simplified: distribute weights based on which indices are most extreme
      const total = Math.abs(ndvi - 0.5) + Math.abs(savi - 0.5) + Math.abs(gndvi - 0.5);
      if (total > 0) {
        contributions.ndvi = Math.abs(ndvi - 0.5) / total * 0.7; // 70% to indices
        contributions.savi = Math.abs(savi - 0.5) / total * 0.7;
        contributions.gndvi = Math.abs(gndvi - 0.5) / total * 0.7;
        contributions.visual = 0.3; // 30% to visual features
      } else {
        contributions.visual = 1.0;
      }
    } else {
      contributions.visual = 1.0;
    }

    return contributions;
  };

  const contributions = calculateFeatureContributions();

  // Generate recommendations
  const getRecommendations = () => {
    const recommendations = [];
    
    if (healthStatus === 'very_poor' || healthStatus === 'poor') {
      recommendations.push('Consider applying fertilizer to improve crop nutrition');
      recommendations.push('Check soil moisture levels and irrigation systems');
      recommendations.push('Monitor for pest and disease presence');
    } else if (healthStatus === 'diseased') {
      recommendations.push('Apply appropriate fungicide or treatment');
      recommendations.push('Isolate affected areas to prevent spread');
      recommendations.push('Consult with agricultural extension service');
    } else if (healthStatus === 'stressed') {
      recommendations.push('Review environmental conditions (water, temperature)');
      recommendations.push('Check for nutrient deficiencies');
      recommendations.push('Consider stress mitigation strategies');
    } else if (healthStatus === 'weeds') {
      recommendations.push('Implement weed control measures');
      recommendations.push('Consider mechanical or chemical weed management');
    } else if (healthStatus === 'moderate') {
      recommendations.push('Continue monitoring crop health');
      recommendations.push('Maintain current management practices');
    } else {
      recommendations.push('Continue current management practices');
      recommendations.push('Maintain regular monitoring schedule');
    }

    return recommendations;
  };

  const getHealthColor = (status) => {
    const colorMap = {
      'very_healthy': 'var(--status-healthy)',
      'healthy': 'var(--status-healthy)',
      'moderate': 'var(--status-moderate)',
      'poor': 'var(--status-poor)',
      'very_poor': 'var(--status-poor)',
      'diseased': 'var(--status-poor)',
      'stressed': 'var(--status-moderate)',
      'weeds': 'var(--status-moderate)'
    };
    return colorMap[status] || 'var(--text-muted)';
  };

  const recommendations = getRecommendations();

  return (
    <div>
      <div style={{ padding: 'var(--space-4)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-5)' }}>
        <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>Why this classification?</div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>{generateExplanation()}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <div style={{ padding: 'var(--space-4)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bg-border)', borderLeftWidth: 3, borderLeftColor: getHealthColor(healthStatus) }}>
          <div className="metric-label" style={{ marginBottom: 'var(--space-2)' }}>Predicted Status</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: getHealthColor(healthStatus), textTransform: 'capitalize' }}>{healthStatus.replace('_', ' ')}</div>
        </div>

        {confidence > 0 && (
          <div style={{ padding: 'var(--space-4)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bg-border)' }}>
            <div className="metric-label" style={{ marginBottom: 'var(--space-2)' }}>Model Confidence</div>
            <div className="metric-value">{(confidence * 100).toFixed(1)}<span className="unit">%</span></div>
            <div style={{ marginTop: 'var(--space-2)', height: 6, background: 'var(--bg-border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${confidence * 100}%`, height: '100%', background: getHealthColor(healthStatus), transition: 'width 0.2s' }} />
            </div>
          </div>
        )}

        {analysis.modelVersion && (
          <div style={{ padding: 'var(--space-4)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bg-border)' }}>
            <div className="metric-label" style={{ marginBottom: 'var(--space-2)' }}>Model Version</div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)', wordBreak: 'break-word' }}>{analysis.modelVersion}</div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>Feature Contribution</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {['ndvi', 'savi', 'gndvi'].map(feature => {
            const contrib = contributions[feature];
            if (contrib === 0) return null;
            return (
              <div key={feature}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)', fontSize: 'var(--font-size-xs)' }}>
                  <span style={{ textTransform: 'uppercase', fontWeight: 'var(--font-weight-medium)' }}>{feature}</span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{(contrib * 100).toFixed(1)}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${contrib * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.2s' }} />
                </div>
              </div>
            );
          })}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)', fontSize: 'var(--font-size-xs)' }}>
              <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Visual Features</span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{(contributions.visual * 100).toFixed(1)}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${contributions.visual * 100}%`, height: '100%', background: 'var(--text-muted)', transition: 'width 0.2s' }} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>Recommendations</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {recommendations.map((rec, idx) => (
            <div key={idx} style={{ padding: 'var(--space-3)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-border)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0 }}>→</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

