import React, { useEffect, useState, useRef } from 'react';
import { api } from '../utils/api.js';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  BarChart2,
} from 'lucide-react';

export default function InsightsPage() {
  const [images, setImages] = useState([]);
  const [missionOptions, setMissionOptions] = useState([{ value: 'default', label: 'Default (no mission)' }]);
  const [selectedMission, setSelectedMission] = useState('default');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    api
      .get('/api/images')
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.images || data?.data || []);
        if (mounted) setImages(list);
        const ids = new Set();
        (list || []).forEach((img) => {
          const id = img.missionId || img.mission_id;
          if (id) ids.add(id);
        });
        const options = [{ value: 'default', label: 'Default (no mission)' }];
        ids.forEach((id) => options.push({ value: id, label: id }));
        if (mounted) setMissionOptions(options);
      })
      .catch(() => {
        if (mounted) setMissionOptions([{ value: 'default', label: 'Default (no mission)' }]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedMission) return;
    let mounted = true;
    setLoadingInsights(true);
    api
      .get(`/api/insights/${encodeURIComponent(selectedMission)}`)
      .then((data) => {
        if (mounted) setInsights(data);
      })
      .catch(() => {
        if (mounted) setInsights(null);
      })
      .finally(() => {
        if (mounted) setLoadingInsights(false);
      });
    return () => { mounted = false; };
  }, [selectedMission]);

  // Canvas timeline chart
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas || !insights?.profile_records?.length) return;

    const records = [...(insights.profile_records || [])].sort((a, b) => {
      const ta = a.captured_at ? new Date(a.captured_at).getTime() : 0;
      const tb = b.captured_at ? new Date(b.captured_at).getTime() : 0;
      return ta - tb;
    });
    const scores = records.map((r) => (r.health_score != null ? Number(r.health_score) : null)).filter((v) => v != null);
    if (scores.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    const padding = { top: 16, right: 16, bottom: 24, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    const minScore = Math.min(...scores, 0);
    const maxScore = Math.max(...scores, 100);
    const range = maxScore - minScore || 1;
    const toY = (v) => padding.top + chartH - ((v - minScore) / range) * chartH;
    const toX = (i) => padding.left + (i / (scores.length - 1 || 1)) * chartW;

    ctx.strokeStyle = 'var(--bg-border)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    ctx.fillStyle = 'var(--text-muted)';
    ctx.font = '11px var(--font-mono)';
    ctx.textAlign = 'right';
    ctx.fillText(minScore.toFixed(0), padding.left - 6, padding.top + chartH + 4);
    ctx.textAlign = 'right';
    ctx.fillText(maxScore.toFixed(0), padding.left - 6, padding.top + 4);

    ctx.strokeStyle = 'var(--accent)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    let started = false;
    scores.forEach((v, i) => {
      const x = toX(i);
      const y = toY(v);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = 'var(--accent)';
    scores.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(toX(i), toY(v), 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [insights]);

  const TrendIcon = insights?.ndvi_trend === 'improving' ? TrendingUp : insights?.ndvi_trend === 'declining' ? TrendingDown : Minus;

  return (
    <div className="container animate-fade-in">
      <div className="card card-elevated">
        <h2 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>
          Field Insights
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
          Aggregate health and recommendations by mission
        </p>

        {loading ? (
          <div className="insights-skeleton">
            <div style={{ height: 48, background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }} />
            <div style={{ height: 200, background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }} />
            <div style={{ height: 120, background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }} />
          </div>
        ) : (
          <>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              Mission
            </label>
            <select
              value={selectedMission}
              onChange={(e) => setSelectedMission(e.target.value)}
              className="input"
              style={{ maxWidth: 360, marginBottom: 'var(--space-6)' }}
            >
              {missionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {loadingInsights ? (
              <div className="insights-skeleton">
                <div style={{ height: 100, background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }} />
                <div style={{ height: 220, background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }} />
                <div style={{ height: 80, background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }} />
              </div>
            ) : insights?.image_count === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Lightbulb size={48} strokeWidth={1} aria-hidden />
                </div>
                <div className="empty-state-title">No field data yet</div>
                <div className="empty-state-description">
                  Upload and process images to generate insights for this mission.
                </div>
              </div>
            ) : insights ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 'var(--space-6)',
                    padding: 'var(--space-5)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--bg-border)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--space-6)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Images</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)' }}>{insights.image_count}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Avg health score</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-2xl)', color: 'var(--accent)' }}>
                      {insights.avg_health_score != null ? insights.avg_health_score.toFixed(1) : '—'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <TrendIcon size={20} strokeWidth={2} style={{ color: 'var(--text-secondary)' }} aria-hidden />
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>NDVI {insights.ndvi_trend}</span>
                  </div>
                  {insights.dominant_status && (
                    <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{insights.dominant_status.replace('_', ' ')}</span>
                  )}
                </div>

                {insights.profile_records?.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <h3 className="section-title" style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <BarChart2 size={20} strokeWidth={2} aria-hidden />
                      Health score over time
                    </h3>
                    <div
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--bg-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-4)',
                        height: 240,
                      }}
                    >
                      <canvas
                        ref={chartRef}
                        style={{ width: '100%', height: '100%', display: 'block' }}
                        aria-label="Health score timeline chart"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>Recommendations</h3>
                  {insights.recommendations?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {insights.recommendations.map((rec, idx) => {
                        const isPositive = /strong|continue current/i.test(rec);
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 'var(--space-3)',
                              padding: 'var(--space-4)',
                              background: isPositive ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-elevated)',
                              border: `1px solid ${isPositive ? 'var(--bg-border)' : 'var(--status-moderate)'}`,
                              borderRadius: 'var(--radius-md)',
                            }}
                          >
                            {isPositive ? (
                              <CheckCircle size={20} style={{ color: 'var(--status-healthy)', flexShrink: 0, marginTop: 2 }} aria-hidden />
                            ) : (
                              <AlertTriangle size={20} style={{ color: 'var(--status-moderate)', flexShrink: 0, marginTop: 2 }} aria-hidden />
                            )}
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', lineHeight: 1.5 }}>{rec}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                      No recommendations for this mission.
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
