import React from 'react';

/**
 * MLExplanation Component
 * Provides explainable AI insights for ML model predictions
 */
export default function MLExplanation({ analysis, image }) {
  if (!analysis || !analysis.healthStatus) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
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
      'very_healthy': '#059669',
      'healthy': '#10b981',
      'moderate': '#f59e0b',
      'poor': '#f97316',
      'very_poor': '#dc2626',
      'diseased': '#dc2626',
      'stressed': '#f59e0b',
      'weeds': '#f97316'
    };
    return colorMap[status] || '#6b7280';
  };

  const recommendations = getRecommendations();

  return (
    <div>
      {/* Main Explanation */}
      <div style={{
        padding: 16,
        background: '#f0f9ff',
        border: '1px solid #bfdbfe',
        borderRadius: 8,
        marginBottom: 20
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>
          Why this classification?
        </div>
        <div style={{ color: '#1e3a8a', lineHeight: 1.6 }}>
          {generateExplanation()}
        </div>
      </div>

      {/* Confidence and Status */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{
          padding: 16,
          background: '#f9fafb',
          borderRadius: 8,
          border: `2px solid ${getHealthColor(healthStatus)}`
        }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
            Predicted Status
          </div>
          <div style={{ 
            fontSize: 20, 
            fontWeight: 700,
            color: getHealthColor(healthStatus),
            textTransform: 'capitalize'
          }}>
            {healthStatus.replace('_', ' ')}
          </div>
        </div>

        {confidence > 0 && (
          <div style={{
            padding: 16,
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
              Model Confidence
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              {(confidence * 100).toFixed(1)}%
            </div>
            <div style={{ 
              marginTop: 8,
              height: 6,
              background: '#e5e7eb',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${confidence * 100}%`,
                height: '100%',
                background: getHealthColor(healthStatus),
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        )}

        {analysis.modelVersion && (
          <div style={{
            padding: 16,
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
              Model Version
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
              {analysis.modelVersion}
            </div>
          </div>
        )}
      </div>

      {/* Feature Importance */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 12, color: '#111827' }}>
          Feature Contribution
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['ndvi', 'savi', 'gndvi'].map(feature => {
            const contrib = contributions[feature];
            if (contrib === 0) return null;
            
            return (
              <div key={feature}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: 4,
                  fontSize: 12
                }}>
                  <span style={{ textTransform: 'uppercase', fontWeight: 500 }}>
                    {feature}
                  </span>
                  <span style={{ color: '#6b7280' }}>
                    {(contrib * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{
                  height: 8,
                  background: '#e5e7eb',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${contrib * 100}%`,
                    height: '100%',
                    background: feature === 'ndvi' ? '#3b82f6' : 
                               feature === 'savi' ? '#10b981' : '#f59e0b',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            );
          })}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: 4,
              fontSize: 12
            }}>
              <span style={{ fontWeight: 500 }}>Visual Features</span>
              <span style={{ color: '#6b7280' }}>
                {(contributions.visual * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{
              height: 8,
              background: '#e5e7eb',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${contributions.visual * 100}%`,
                height: '100%',
                background: '#8b5cf6',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div style={{ fontWeight: 600, marginBottom: 12, color: '#111827' }}>
          Recommendations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              style={{
                padding: 12,
                background: '#f9fafb',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                fontSize: 13,
                color: '#374151',
                display: 'flex',
                alignItems: 'start',
                gap: 8
              }}
            >
              <span style={{ color: '#3b82f6' }}>→</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

