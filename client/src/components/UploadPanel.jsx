import React, { useState } from 'react';

export default function UploadPanel({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/images', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onUploaded?.(data);
      setFile(null);
      e.target.reset();
    } catch (err) {
      alert(err.message || 'Upload error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }}>
            Select Field Image
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ width: '100%' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={!file || busy}
          style={{ width: '100%' }}
        >
          {busy ? '⏳ Uploading & Analyzing...' : '📤 Upload & Analyze'}
        </button>
        {file && (
          <div style={{ fontSize: 12, color: '#6b7280', padding: 8, background: '#f9fafb', borderRadius: 6 }}>
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>
    </form>
  );
}
