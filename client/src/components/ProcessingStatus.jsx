import React from 'react';

/**
 * ProcessingStatus Component
 * Displays real-time processing status for image analysis
 */
export default function ProcessingStatus({ status, uploadedAt, processedAt, error }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#059669'; // green
      case 'processing':
        return '#f59e0b'; // amber
      case 'failed':
        return '#dc2626'; // red
      case 'uploaded':
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'processing':
        return '⏳';
      case 'failed':
        return '✗';
      case 'uploaded':
      default:
        return '📤';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Analysis Complete';
      case 'processing':
        return 'Processing...';
      case 'failed':
        return 'Processing Failed';
      case 'uploaded':
      default:
        return 'Uploaded - Pending';
    }
  };

  const getProgressSteps = (status) => {
    const steps = [
      { label: 'Uploaded', completed: true },
      { label: 'Calculating NDVI', completed: status === 'processing' || status === 'completed' },
      { label: 'Calculating SAVI', completed: status === 'processing' || status === 'completed' },
      { label: 'Calculating GNDVI', completed: status === 'processing' || status === 'completed' },
      { label: 'Running ML Model', completed: status === 'completed' },
      { label: 'Complete', completed: status === 'completed' }
    ];
    return steps;
  };

  const currentStatus = status || 'uploaded';
  const steps = getProgressSteps(currentStatus);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 16,
        padding: 12,
        background: '#f9fafb',
        borderRadius: 8,
        border: `1px solid ${getStatusColor(currentStatus)}`
      }}>
        <span style={{ fontSize: 20 }}>{getStatusIcon(currentStatus)}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>
            {getStatusLabel(currentStatus)}
          </div>
          {uploadedAt && (
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Uploaded: {new Date(uploadedAt).toLocaleString()}
            </div>
          )}
          {processedAt && currentStatus === 'completed' && (
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Processed: {new Date(processedAt).toLocaleString()}
            </div>
          )}
        </div>
        <div style={{
          padding: '4px 12px',
          borderRadius: 12,
          background: getStatusColor(currentStatus),
          color: 'white',
          fontSize: 12,
          fontWeight: 500
        }}>
          {currentStatus.toUpperCase()}
        </div>
      </div>

      {/* Progress Steps */}
      {currentStatus !== 'failed' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 8,
            fontSize: 12,
            color: '#6b7280'
          }}>
            <span>Processing Steps</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: step.completed ? '#d1fae5' : '#f3f4f6',
                  border: `1px solid ${step.completed ? '#059669' : '#e5e7eb'}`,
                  fontSize: 11,
                  textAlign: 'center',
                  color: step.completed ? '#065f46' : '#6b7280',
                  fontWeight: step.completed ? 500 : 400
                }}
              >
                {step.completed && <span style={{ marginRight: 4 }}>✓</span>}
                {step.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {currentStatus === 'failed' && error && (
        <div style={{
          marginTop: 12,
          padding: 12,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 6,
          color: '#991b1b',
          fontSize: 13
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

