import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

/**
 * ModelTraining Component
 * Displays ML model training status and information
 */
export default function ModelTraining() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch model info from an API
    // For now, we'll show placeholder structure
    setLoading(false);
    setModelInfo({
      loaded: false,
      version: null,
      lastTrained: null,
      accuracy: null,
      datasetSize: null
    });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div>Loading model information...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Model Status */}
      <div style={{
        padding: 16,
        background: modelInfo?.loaded ? '#d1fae5' : '#fef3c7',
        border: `1px solid ${modelInfo?.loaded ? '#059669' : '#f59e0b'}`,
        borderRadius: 8,
        marginBottom: 20
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          marginBottom: 8
        }}>
          <span style={{ fontSize: 20 }}>
            {modelInfo?.loaded ? '✓' : '⚠'}
          </span>
          <div style={{ fontWeight: 600, color: '#111827' }}>
            Model Status: {modelInfo?.loaded ? 'Loaded' : 'Not Available'}
          </div>
        </div>
        {!modelInfo?.loaded && (
          <div style={{ fontSize: 13, color: '#92400e', marginTop: 8 }}>
            No trained model found. Train a model using the TOM2024 dataset to enable ML-based classification.
          </div>
        )}
      </div>

      {/* Model Information */}
      {modelInfo?.loaded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 20
        }}>
          {modelInfo.version && (
            <div style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                Model Version
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
                {modelInfo.version}
              </div>
            </div>
          )}

          {modelInfo.lastTrained && (
            <div style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                Last Trained
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                {new Date(modelInfo.lastTrained).toLocaleDateString()}
              </div>
            </div>
          )}

          {modelInfo.accuracy !== null && (
            <div style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                Test Accuracy
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#059669' }}>
                {(modelInfo.accuracy * 100).toFixed(1)}%
              </div>
            </div>
          )}

          {modelInfo.datasetSize && (
            <div style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                Training Dataset
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                {modelInfo.datasetSize.toLocaleString()} images
              </div>
            </div>
          )}
        </div>
      )}

      {/* Training Instructions */}
      <div style={{
        padding: 16,
        background: '#f9fafb',
        borderRadius: 8,
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 12, color: '#111827' }}>
          How to Train the Model
        </div>
        <ol style={{ 
          margin: 0, 
          paddingLeft: 20, 
          color: '#374151',
          lineHeight: 1.8,
          fontSize: 13
        }}>
          <li>Prepare the TOM2024 dataset:
            <pre style={{
              marginTop: 8,
              padding: 12,
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: 6,
              fontSize: 11,
              overflow: 'auto'
            }}>
{`python prepare_tom2024_data.py \\
  ~/Downloads/TOM2024 \\
  ./training_data \\
  --use-ndvi`}
            </pre>
          </li>
          <li>Train the model:
            <pre style={{
              marginTop: 8,
              padding: 12,
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: 6,
              fontSize: 11,
              overflow: 'auto'
            }}>
{`python train_model.py \\
  ./training_data/train \\
  ./models \\
  50`}
            </pre>
          </li>
          <li>The trained model will be saved to <code>./models/onion_crop_health_model.h5</code></li>
          <li>Restart the background worker to use the new model</li>
        </ol>
      </div>
    </div>
  );
}

