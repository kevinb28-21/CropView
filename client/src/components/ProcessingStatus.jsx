import React from 'react';
import { Check, Loader2, XCircle, Upload } from 'lucide-react';

/**
 * ProcessingStatus — status with lucide icons, design system badges
 */
export default function ProcessingStatus({ status, uploadedAt, processedAt, error }) {
  const getStatusConfig = (s) => {
    switch (s) {
      case 'completed':
        return { icon: Check, label: 'Analysis Complete', badgeClass: 'badge-success' };
      case 'processing':
        return { icon: Loader2, label: 'Processing...', badgeClass: 'badge-warning' };
      case 'failed':
        return { icon: XCircle, label: 'Processing Failed', badgeClass: 'badge-error' };
      case 'uploaded':
      default:
        return { icon: Upload, label: 'Uploaded — Pending', badgeClass: 'badge-info' };
    }
  };

  const getProgressSteps = (s) => [
    { label: 'Uploaded', completed: true },
    { label: 'Calculating NDVI', completed: s === 'processing' || s === 'completed' },
    { label: 'Calculating SAVI', completed: s === 'processing' || s === 'completed' },
    { label: 'Calculating GNDVI', completed: s === 'processing' || s === 'completed' },
    { label: 'Running ML Model', completed: s === 'completed' },
    { label: 'Complete', completed: s === 'completed' },
  ];

  const currentStatus = status || 'uploaded';
  const config = getStatusConfig(currentStatus);
  const steps = getProgressSteps(currentStatus);
  const Icon = config.icon;

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          background: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--bg-border)',
        }}
      >
        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          {currentStatus === 'processing' ? (
            <Loader2 size={20} strokeWidth={2} className="animate-pulse" aria-hidden />
          ) : (
            <Icon size={20} strokeWidth={2} aria-hidden />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
            {config.label}
          </div>
          {uploadedAt && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Uploaded: {new Date(uploadedAt).toLocaleString()}
            </div>
          )}
          {processedAt && currentStatus === 'completed' && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Processed: {new Date(processedAt).toLocaleString()}
            </div>
          )}
        </div>
        <span className={`badge ${config.badgeClass}`}>{currentStatus}</span>
      </div>

      {currentStatus !== 'failed' && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
            Processing Steps
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  flex: '1 1 100px',
                  minWidth: '100px',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  background: step.completed ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)',
                  border: '1px solid var(--bg-border)',
                  fontSize: 'var(--font-size-xs)',
                  textAlign: 'center',
                  color: step.completed ? 'var(--text-secondary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {step.completed && <Check size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} aria-hidden />}
                {step.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStatus === 'failed' && error && (
        <div
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--status-poor)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-poor)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
