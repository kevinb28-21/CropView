import React, { useState } from 'react';
import { api } from '../utils/api.js';

export default function UploadPanel({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload the image
      const data = await api.upload('/api/images', formData);
      
      // Immediately trigger processing (don't wait for background worker)
      if (data?.id) {
        try {
          const processed = await api.post(`/api/images/${data.id}/process`);
          onUploaded?.(processed);
        } catch (processErr) {
          console.warn('Auto-process failed, image queued for background worker:', processErr);
          onUploaded?.(data);
        }
      } else {
        onUploaded?.(data);
      }
      
      setFile(null);
      e.target.reset();
    } catch (err) {
      alert(err.message || 'Upload error');
    } finally {
      setBusy(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-4)',
          padding: 'var(--space-6)',
          border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-xl)',
          background: dragActive ? 'var(--color-bg-hover)' : 'var(--color-bg-tertiary)',
          transition: 'all var(--transition-base)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: 'var(--space-3)',
            filter: dragActive ? 'drop-shadow(0 0 8px var(--color-accent))' : 'none',
            transition: 'filter var(--transition-base)'
          }}>
            📸
          </div>
          <label style={{ 
            display: 'block', 
            fontSize: 'var(--font-size-sm)', 
            fontWeight: 'var(--font-weight-semibold)', 
            marginBottom: 'var(--space-2)', 
            color: 'var(--color-text-primary)',
            cursor: 'pointer'
          }}>
            Select Field Image
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ 
              width: '100%',
              padding: 'var(--space-3)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-bg-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)'
            }}
            disabled={busy}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!file || busy}
          className="btn btn-primary"
          style={{ 
            width: '100%',
            opacity: (!file || busy) ? 0.5 : 1,
            cursor: (!file || busy) ? 'not-allowed' : 'pointer'
          }}
        >
          {busy ? (
            <>
              <span className="animate-pulse">⏳</span>
              Uploading & Analyzing...
            </>
          ) : (
            <>
              📤 Upload & Analyze
            </>
          )}
        </button>
        
        {file && (
          <div style={{ 
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--color-text-secondary)', 
            padding: 'var(--space-3)', 
            background: 'var(--color-bg-secondary)', 
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}>
            <span style={{ fontSize: '1.2rem' }}>✓</span>
            <span style={{ flex: 1 }}>
              <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        )}
      </div>
    </form>
  );
}
