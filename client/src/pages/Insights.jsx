import React, { useEffect, useState, useRef } from 'react';
import { api } from '../utils/api.js';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  BarChart2,
} from 'lucide-react';
import FieldIntelligence, { MISSION_DATASETS } from '../components/FieldIntelligence.jsx';

const MISSION_IDS = Object.keys(MISSION_DATASETS).sort();
const LATEST_MISSION_ID = MISSION_IDS[MISSION_IDS.length - 1] || '';

function computeAverage(nums) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function computeTrendLabelFromHealth(missionsSorted) {
  if (missionsSorted.length < 6) return 'Stable';
  const first3 = missionsSorted.slice(0, 3).map((m) => m.healthScore);
  const last3 = missionsSorted.slice(-3).map((m) => m.healthScore);
  const a = computeAverage(first3);
  const b = computeAverage(last3);
  if (b > a) return 'Improving';
  if (b < a) return 'Declining';
  return 'Stable';
}

export default function InsightsPage() {
  const [, setImages] = useState([]);
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
      })
      .catch(() => {
        if (mounted) setImages([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // Keep the API call intact (latest mission) without gating page rendering behind a selector.
    if (!LATEST_MISSION_ID) return;
    let mounted = true;
    setLoadingInsights(true);
    api
      .get(`/api/insights/${encodeURIComponent(LATEST_MISSION_ID)}`)
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
  }, []);

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

  const missionsSorted = MISSION_IDS.map((id) => MISSION_DATASETS[id]).filter(Boolean);
  const totalMissions = missionsSorted.length;
  const totalImagesProcessed = totalMissions * 5;
  const avgHealthScore = computeAverage(missionsSorted.map((m) => m.healthScore));
  const overallTrendLabel = computeTrendLabelFromHealth(missionsSorted);
  const dateRange = totalMissions > 0 ? `${missionsSorted[0].missionId} → ${missionsSorted[missionsSorted.length - 1].missionId}` : '—';

  const actionRequiredMissions = missionsSorted.filter((m) => (m.insights || []).some((c) => c.severity === 'ACTION REQUIRED')).length;
  const actionRequiredPct = totalMissions ? actionRequiredMissions / totalMissions : 0;
  const anyWeedHeadline = missionsSorted.some((m) => (m.insights || []).some((c) => (c.headline || '').toLowerCase().includes('weed')));

  const recent3 = missionsSorted.slice(-3).map((m) => m.healthScore);
  const recent3Increasing = recent3.length === 3 && recent3[2] > recent3[1] && recent3[1] > recent3[0];

  const nowMonth = new Date().getMonth() + 1; // 1-12
  const monthRec =
    nowMonth >= 1 && nowMonth <= 3
      ? 'Early-season monitoring window is open. Establish baseline index values for comparison against mid-season data.'
      : nowMonth >= 4 && nowMonth <= 5
        ? 'Spring emergence period. Increase flight frequency to weekly to catch early stress events before canopy closes.'
        : nowMonth >= 6 && nowMonth <= 8
          ? 'Peak growing season. Prioritize NDVI and GNDVI monitoring over SAVI as canopy coverage increases.'
          : 'Late-season monitoring. Focus on stress detection and harvest readiness indicators.';

  const synthesizedRecs = [];
  if (actionRequiredPct > 0.4) synthesizedRecs.push('Multiple high-stress events detected across the season. Review irrigation and soil drainage history before next planting cycle.');
  if (avgHealthScore > 60) synthesizedRecs.push('Overall seasonal health is above baseline. Current management practices are producing consistent results.');
  if (avgHealthScore < 40) synthesizedRecs.push('Seasonal average health is critically low. Full agronomic review recommended before next season.');
  if (recent3Increasing) synthesizedRecs.push('Field is trending toward recovery. Continue current practices and monitor weekly.');
  if (anyWeedHeadline) synthesizedRecs.push('Weed pressure was detected during at least one mission this season. Evaluate pre-emergent treatment options.');
  synthesizedRecs.push(monthRec);

  const TrendIcon = overallTrendLabel === 'Improving' ? TrendingUp : overallTrendLabel === 'Declining' ? TrendingDown : Minus;

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
            {/* Summary stats across all missions */}
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
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Total missions</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)' }}>{totalMissions}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Total images processed</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)' }}>{totalImagesProcessed}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Average health score</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-2xl)', color: 'var(--accent)' }}>
                  {Number.isFinite(avgHealthScore) ? avgHealthScore.toFixed(1) : '—'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <TrendIcon size={20} strokeWidth={2} style={{ color: 'var(--text-secondary)' }} aria-hidden />
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Overall trend: {overallTrendLabel}</span>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Date range</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{dateRange}</div>
              </div>
            </div>

            {/* Optional API chart (latest mission payload) */}
            {insights?.profile_records?.length > 0 && (
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

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h3 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>Recommendations</h3>
              {synthesizedRecs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {synthesizedRecs.map((rec, idx) => {
                    const isPositive = /above baseline|producing consistent|recovery|continue current/i.test(rec);
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-4)',
                          background: 'var(--bg-surface-elevated)',
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
                  No synthesized recommendations available.
                </div>
              )}
            </div>

            {loadingInsights ? (
              <div style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                Loading latest mission insight payload…
              </div>
            ) : null}

            {/* Full mission timeline (all missions rendered, no selector) */}
            <FieldIntelligence />
          </>
        )}
      </div>
    </div>
  );
}
