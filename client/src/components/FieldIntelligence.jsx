import { TrendingDown, Droplets, Wind, AlertTriangle, Thermometer, CheckCircle } from 'lucide-react';

const FIELD_INSIGHTS = [
  {
    icon: Droplets,
    headline: 'Post-Rainfall Soil Saturation Detected',
    body: 'GNDVI readings show elevated near-infrared reflectance consistent with waterlogged soil conditions. Preceding 24-hour rainfall event (March 11) deposited approximately 18–22 mm across the monitored area. Saturation at root zone depth may be restricting oxygen availability. Monitor for standing water and consider delaying any ground equipment entry for 48–72 hours.',
    severity: 'ACTION REQUIRED',
    metric: 'GNDVI -0.02',
    metricLabel: 'below seasonal baseline 0.44'
  },
  {
    icon: Thermometer,
    headline: 'Cold Stress — Near-Freezing Canopy Temperatures',
    body: 'Ambient temperature recorded at -0.2°C with wind chill reaching -7°C during the capture window. At these temperatures, stomatal conductance is significantly reduced, suppressing photosynthetic activity. NDVI depression of this magnitude in early March is consistent with cold-induced temporary stress rather than structural crop damage. Reassess within 5–7 days as temperatures recover.',
    severity: 'MONITOR',
    metric: 'NDVI -0.04',
    metricLabel: 'cold-suppressed, recovery expected'
  },
  {
    icon: Wind,
    headline: 'Wind-Driven Canopy Stress',
    body: 'WNW winds sustained at 36 km/h with gusts to 52 km/h during the mission window. Mechanical stress from wind loading causes micro-tears in leaf tissue and accelerates transpiration water loss. Combined with low humidity (43%) and frozen soil restricting water uptake, mild desiccation stress is likely. No intervention required — monitor NDVI trend over next 2 missions.',
    severity: 'MONITOR',
    metric: 'SAVI -0.04',
    metricLabel: 'wind + low humidity signature'
  },
  {
    icon: CheckCircle,
    headline: 'Dormant Canopy — Deeper Index Depression',
    body: 'Spectral indices are uniformly negative, indicating minimal photosynthetic activity across the field. This is consistent with dormant or early-emerging crop canopy under near-freezing conditions rather than disease or structural degradation. The negative NDVI values reflect bare soil and residue interference. Current field health score of 48/100 is below the typical early-March baseline for Ontario — continue monitoring as temperatures rise above 5°C to confirm green-up onset.',
    severity: 'MONITOR',
    metric: 'Health Score 48/100',
    metricLabel: 'below seasonal norms — dormant canopy'
  }
];

const severityStyles = {
  'ACTION REQUIRED': { color: 'var(--status-poor)', bg: 'rgba(var(--status-poor-rgb), 0.08)' },
  'MONITOR': { color: 'var(--status-moderate)', bg: 'rgba(var(--status-moderate-rgb), 0.08)' },
  'OPTIMAL': { color: 'var(--status-healthy)', bg: 'rgba(var(--status-healthy-rgb), 0.08)' }
};

export default function FieldIntelligence() {
  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <span style={{ color: 'var(--accent)', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
          FIELD INTELLIGENCE — MISSION 2026-03-12
        </span>
        <span style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          marginLeft: 'auto'
        }}>
          Conditions: −0.2°C · WNW 36 km/h · Humidity 43% · Post-rain
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {FIELD_INSIGHTS.map((insight, i) => {
          const Icon = insight.icon;
          const style = severityStyles[insight.severity];
          return (
            <div key={i} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--bg-border)',
              borderRadius: '6px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon size={16} color="var(--accent)" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {insight.headline}
                  </span>
                </div>
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: style.color,
                  background: style.bg,
                  padding: '2px 7px',
                  borderRadius: '3px',
                  whiteSpace: 'nowrap'
                }}>
                  {insight.severity}
                </span>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                {insight.body}
              </p>

              <div style={{
                borderTop: '1px solid var(--bg-border)',
                paddingTop: '0.65rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                  {insight.metric}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {insight.metricLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
