import { Droplets, Wind, AlertTriangle, Thermometer, CheckCircle } from 'lucide-react';

/** Placeholder missions keyed by mission ID (Toronto Pearson / YYZ–style conditions). */
export const MISSION_DATASETS = {
  '2026-01-15': {
    missionId: '2026-01-15',
    conditions: '−12°C · N 38 km/h · Humidity 82% · Snow and ice fog',
    healthScore: 24,
    insights: [
      {
        icon: Thermometer,
        headline: 'Deep-Winter Thermal Lock — No Photosynthetic Signal',
        body: 'Pearson logged temperatures near −12 °C overnight with readings around −11 °C through midday, under persistent snow and ice fog. For a dormant onion field, NDVI this low is expected: frozen soil and zero canopy mean the sensor is dominated by bare ground and residue, not crop tissue.',
        severity: 'MONITOR',
        metric: 'NDVI −0.08',
        metricLabel: 'dormant / frozen ground signature'
      },
      {
        icon: Wind,
        headline: 'Strong Northerly Wind With Blowing Snow',
        body: 'Sustained winds near 24 mph (~39 km/h) from the north coincided with light snow and mile-scale visibility in ice fog. Wind strips any loose residue and can roughen the surface moisture film, which slightly depresses red-edge stability in the mosaic. No crop intervention is implied—this is meteorology-driven noise.',
        severity: 'MONITOR',
        metric: 'SAVI −0.06',
        metricLabel: 'wind + snow scatter on bare soil'
      },
      {
        icon: Droplets,
        headline: 'High Humidity, Subfreezing — No Evaporative Demand',
        body: 'Relative humidity stayed mostly in the 78–86% range while temperatures remained below freezing, so stomata are irrelevant and transpiration is effectively nil. GNDVI near zero simply confirms absence of a green canopy; spectral wetness from snow is the main NIR modifier.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.02',
        metricLabel: 'consistent with snow-covered dormant bed'
      },
      {
        icon: CheckCircle,
        headline: 'Field Health Index — Winter Baseline',
        body: 'The composite health score reflects dormant-crop physics, not failure. Indices should remain suppressed until soil temperatures sustain root activity. Schedule the next mission after a multi-day thaw above 0 °C to detect first green-up.',
        severity: 'MONITOR',
        metric: 'Health Score 24/100',
        metricLabel: 'expected mid-January dormant profile'
      }
    ]
  },
  '2026-01-28': {
    missionId: '2026-01-28',
    conditions: '−12°C · N 26 km/h · Humidity 62% · Partly sunny breaks',
    healthScore: 29,
    insights: [
      {
        icon: Thermometer,
        headline: 'Cold but Stable Air Mass — Still Pre-Canopy',
        body: 'Hourly observations showed lows near 9–10 °F (−13 to −12 °C) climbing only to about 14 °F (−10 °C) in the afternoon with partly sunny spells. That thermal band still blocks emergence; NDVI slightly below zero matches bare soil and frost without an active leaf area.',
        severity: 'MONITOR',
        metric: 'NDVI 0.01',
        metricLabel: 'trace noise above full dormancy'
      },
      {
        icon: Wind,
        headline: 'Moderate North Winds, Drier Midday Air',
        body: 'Winds ranged about 10–20 mph from the north with humidity dipping toward 57% when broken clouds allowed solar heating of the surface. The modest VPD uptick can desiccate surface residue but does not stress a crop that is not yet transpiring.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.00',
        metricLabel: 'stable bare-soil baseline'
      },
      {
        icon: AlertTriangle,
        headline: 'Low Sun Angle and Patchy Cloud — Mosaic Variance',
        body: 'Alternating broken clouds and partly sunny intervals create BRDF shifts on row structure. GNDVI reads slightly positive from soil moisture and sparse dead plant reflectance, not from onion foliage. Expect block-to-block variance until uniform green-up.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.05',
        metricLabel: 'illumination-driven scatter'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Late January Norm',
        body: 'Score remains in the high-20s, consistent with frozen ground and no canopy closure. Trend monitoring matters more than absolute value at this date.',
        severity: 'MONITOR',
        metric: 'Health Score 29/100',
        metricLabel: 'on track for dormant season'
      }
    ]
  },
  '2026-02-10': {
    missionId: '2026-02-10',
    conditions: '0°C · Variable 14 km/h · Humidity 86% · Morning snow tapering',
    healthScore: 36,
    insights: [
      {
        icon: Droplets,
        headline: 'Light Snow Through Morning, Moist Low Clouds',
        body: 'Pearson reported light snow and overcast skies from midnight through late morning with humidity often above 86% and visibility down to a few kilometres in the snow band. Wet soil darkens red reflectance and holds NDVI slightly negative to near flat even as air temperatures approached freezing by afternoon.',
        severity: 'MONITOR',
        metric: 'NDVI 0.03',
        metricLabel: 'moist soil + melting snow bias'
      },
      {
        icon: Thermometer,
        headline: 'First Afternoon at or Above Freezing',
        body: 'Temperatures rose from about −7 °C before dawn to roughly 2 °C by late afternoon under broken clouds. That thaw at the surface can initiate the earliest hypogeal activity, explaining a small uptick in SAVI versus January missions while the canopy remains visually absent.',
        severity: 'MONITOR',
        metric: 'SAVI 0.02',
        metricLabel: 'incipient thaw signal, not canopy'
      },
      {
        icon: Wind,
        headline: 'Light Winds — Limited Mechanical Stress',
        body: 'Wind speeds stayed mostly under 14 mph with only brief higher gusts, so windthrow or desiccation is negligible. The spectral story is dominated by cloud cover and melting snow rather than mechanical canopy damage (there is effectively no canopy yet).',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.09',
        metricLabel: 'low wind, moisture-driven NIR softening'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score Creep — Still Dormant Band',
        body: 'A mid-30s health score fits late-winter thaw without leaf area. Continue weekly captures to catch the inflection when NDVI crosses into sustained positive territory.',
        severity: 'MONITOR',
        metric: 'Health Score 36/100',
        metricLabel: 'early February transitional soil state'
      }
    ]
  },
  '2026-02-24': {
    missionId: '2026-02-24',
    conditions: '−6°C · NW 35 km/h · Humidity 58% · Sun then evening snow',
    healthScore: 44,
    insights: [
      {
        icon: Thermometer,
        headline: 'Cold Dawn, Midday Recovery Under Partly Sunny Skies',
        body: 'Morning temperatures near −15 °C improved to roughly −6 to −4 °C in the afternoon with partly sunny conditions before clouds thickened. Late evening brought light snow and ice fog with humidity climbing above 80%. The brief warm window can mobilize soil moisture without producing measurable LAI.',
        severity: 'MONITOR',
        metric: 'NDVI 0.11',
        metricLabel: 'late-February soil thaw bleed-through'
      },
      {
        icon: Wind,
        headline: 'Brisk Morning Winds Easing Late',
        body: 'Northerly winds near 35 km/h in the predawn hours dropped through the day, then picked up again with the evening snow shield. Wind stress on residue can elevate red-band variance; SAVI slightly positive suggests soil color adjustment more than vegetation.',
        severity: 'MONITOR',
        metric: 'SAVI 0.09',
        metricLabel: 'wind-aligned row texture noise'
      },
      {
        icon: Droplets,
        headline: 'Evening Snow and Fog — Quick Moisture Pulse',
        body: 'Light snow after 22:00 local increased NIR scatter from fresh crystals on furrows. GNDVI in the mid-teens is still consistent with sparse or pre-emergence cover, not a closed canopy.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.14',
        metricLabel: 'fresh snow crystal reflectance'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Approaching Green-Up Watch Zone',
        body: 'Scores in the mid-40s align with the late-February index band for Ontario alliums. Flag the next mission if NDVI accelerates faster than temperature warrants (possible weed flush).',
        severity: 'OPTIMAL',
        metric: 'Health Score 44/100',
        metricLabel: 'within expected late-February range'
      }
    ]
  },
  '2026-03-05': {
    missionId: '2026-03-05',
    conditions: '5°C · SW 24 km/h · Humidity 70% · Afternoon light rain',
    healthScore: 56,
    insights: [
      {
        icon: Droplets,
        headline: 'Light Rain From Midday Through Evening',
        body: 'After a cool, partly sunny morning near 1 °C, Pearson recorded light rain and drizzle from roughly 13:30 onward with humidity climbing into the 80–87% range. Wet soil lowers red reflectance and can depress NDVI versus true LAI, so pair imagery with drainage checks in low spots.',
        severity: 'MONITOR',
        metric: 'NDVI 0.22',
        metricLabel: 'early March sparse canopy + wet soil'
      },
      {
        icon: Thermometer,
        headline: 'Above-Freezing Window Expanding',
        body: 'Daytime highs near 5 °C under mostly cloudy skies support the first credible onion tissue reflectance in the series. SAVI in the low 20s matches sparse row coverage rather than full closure.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.20',
        metricLabel: 'temperature-aligned early emergence'
      },
      {
        icon: Wind,
        headline: 'Moderate Southwest Winds During Rain Bands',
        body: 'Winds near 20–24 km/h accompanied the light rain, helping canopy surfaces dry between cells but not creating windthrow risk at this growth stage. Mechanical motion can add micro-blur in the mosaic—expect cleaner stacks on calmer days.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.28',
        metricLabel: 'rain + wind texture on young leaves'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Early March Uptick',
        body: 'A mid-50s score is coherent with early sparse canopy and improving temperatures. Track slope versus thermal time; flattening with warm weather would warrant scouting.',
        severity: 'OPTIMAL',
        metric: 'Health Score 56/100',
        metricLabel: 'green-up onset band'
      }
    ]
  },
  '2026-03-12': {
    missionId: '2026-03-12',
    conditions: '1°C · NNW 39 km/h · Humidity 52% · Gusty, scattered showers',
    healthScore: 48,
    insights: [
      {
        icon: Droplets,
        headline: 'Post-Frontal Showers and Wet Soil Reflectance',
        body: 'GNDVI reads slightly negative because near-infrared is being pulled down by moist soil and residue immediately after a rainy spell upstream of this capture (March 11 system). Water in the furrow volume raises SWIR absorption cues that mimic poor vigor even when plants are simply cold-stressed, not diseased.',
        severity: 'ACTION REQUIRED',
        metric: 'GNDVI −0.02',
        metricLabel: 'below seasonal baseline 0.44'
      },
      {
        icon: Thermometer,
        headline: 'Cold Stress — Near-Freezing Canopy Temperatures',
        body: 'Ambient temperatures hovered near 0 to 1 °C with only brief solar relief under partly sunny skies. At these temperatures stomatal conductance is strongly limited, so NDVI depression is consistent with cold-induced photosynthetic slowdown rather than structural loss.',
        severity: 'MONITOR',
        metric: 'NDVI −0.04',
        metricLabel: 'cold-suppressed, recovery expected'
      },
      {
        icon: Wind,
        headline: 'Strong Northerly Gusts During Mission Window',
        body: 'Sustained winds near 37–43 km/h with scattered showers increased mechanical leaf motion and evaporative demand despite cool air. Relative humidity dipped toward the high 40% range midday, amplifying mild desiccation risk on tender tissue exiting winter.',
        severity: 'MONITOR',
        metric: 'SAVI −0.04',
        metricLabel: 'wind + cool dry slots signature'
      },
      {
        icon: CheckCircle,
        headline: 'Dormant-to-Transition Canopy — Indices Below Spring Target',
        body: 'Spectral indices remain negative to flat, indicating minimal closed canopy despite the calendar date. This matches a cold, windy post-frontal day more than a biological failure. Reassess after temperatures stabilize above ~5 °C for several days.',
        severity: 'MONITOR',
        metric: 'Health Score 48/100',
        metricLabel: 'below warm-spring norms — weather-limited'
      }
    ]
  },
  '2026-03-19': {
    missionId: '2026-03-19',
    conditions: '9°C · SW 23 km/h · Humidity 57% · Morning snow, mild afternoon',
    healthScore: 63,
    insights: [
      {
        icon: Droplets,
        headline: 'Overnight Light Snow Giving Way to Sun',
        body: 'Pearson showed light snow and overcast skies near −2 °C before dawn, then clearing to partly sunny conditions with an afternoon high near 9 °C (48 °F). Morning crystals on leaves suppress NIR until melt, after which NDVI jumps into the mid-20s—consistent with early onion row structure.',
        severity: 'MONITOR',
        metric: 'NDVI 0.27',
        metricLabel: 'post-snow melt green-up pulse'
      },
      {
        icon: Thermometer,
        headline: 'Thermal Relief — Stomata Begin to Respond',
        body: 'The +7 to +9 °C window is the first sustained physiologically meaningful warmth in the series. SAVI near 0.24 indicates soil brightness is still part of the signal, but leaf area is now material.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.24',
        metricLabel: 'temperature-aligned canopy growth'
      },
      {
        icon: Wind,
        headline: 'Afternoon Breeze, Moderate VPD',
        body: 'Southwesterly winds increased into the 20 km/h range midday with humidity falling toward 50%. Mild VPD encourages transpiration without the desiccation risk seen on the gustier March 12 flight.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.31',
        metricLabel: 'healthy NIR scaffold on young foliage'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — On Track for Early Spring',
        body: 'Low-60s scores align with the early-to-mid-March index envelope for sparse onion canopies. Continue monitoring nutrient strips if GNDVI lags NDVI.',
        severity: 'OPTIMAL',
        metric: 'Health Score 63/100',
        metricLabel: 'expected post-equinox trajectory'
      }
    ]
  },
  '2026-03-26': {
    missionId: '2026-03-26',
    conditions: '10°C · SW→NW 41 km/h · Humidity 87% · Rain, fog, evening frontal wind',
    healthScore: 67,
    insights: [
      {
        icon: Droplets,
        headline: 'Midday Rain, Fog, and Evening Wind Shift',
        body: 'Temperatures climbed near 10 °C before light rain and fog reduced visibility through the afternoon. Evening sprinkles and rain showers arrived with a wind shift and gusts near 41 km/h. Wet-canopy reflectance can inflate variability tile-to-tile even when mean NDVI rises.',
        severity: 'MONITOR',
        metric: 'NDVI 0.34',
        metricLabel: 'sparse-to-moderate canopy in wet weather'
      },
      {
        icon: Wind,
        headline: 'Late-Day Gusts After Calm Fog Period',
        body: 'Calm fog moments near 16:00 were replaced by 30–40 km/h winds from the west-northwest, mechanically agitating young leaves. SAVI in the high 20s still tracks increasing soil masking as rows close.',
        severity: 'MONITOR',
        metric: 'SAVI 0.30',
        metricLabel: 'wind + partial soil occlusion'
      },
      {
        icon: Thermometer,
        headline: 'Mild Air Mass — Physiology Unlocked',
        body: 'Despite the rain, temperatures stayed comfortably above freezing for most of the day, supporting photosynthetic gains. GNDVI approaching 0.38 indicates improving chlorophyll density along rows.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.38',
        metricLabel: 'chlorophyll signal strengthening'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Late March Gain',
        body: 'Upper-60s health fits late-March closure for overwintered onions. Watch drainage after repeated rain-fog cycles to avoid hypoxic root zones.',
        severity: 'OPTIMAL',
        metric: 'Health Score 67/100',
        metricLabel: 'late March improvement band'
      }
    ]
  },
  '2026-04-02': {
    missionId: '2026-04-02',
    conditions: '3°C · W 26 km/h · Humidity 93% · Drizzle and dense fog',
    healthScore: 71,
    insights: [
      {
        icon: Droplets,
        headline: 'All-Day Drizzle With Near-Saturation Humidity',
        body: 'Pearson stayed near 0–5 °C with drizzle, fog, and humidity repeatedly at 93–100% into the evening. Water films on leaves scatter NIR and can trim NDVI relative to dry-canopy potential even when biomass is accumulating.',
        severity: 'MONITOR',
        metric: 'NDVI 0.38',
        metricLabel: 'fog-wet canopy attenuation'
      },
      {
        icon: Wind,
        headline: 'West Winds ~24–30 km/h Through Fog',
        body: 'Moderate westerlies persisted under low stratus, ventilating fog layers enough to prevent total stagnation but not enough to dry the canopy fully. Wind-driven mixing reduces path radiance noise slightly versus dead-calm fog.',
        severity: 'MONITOR',
        metric: 'SAVI 0.34',
        metricLabel: 'moisture + moderate advection'
      },
      {
        icon: Thermometer,
        headline: 'Cool, Stable Boundary Layer',
        body: 'Lack of strong solar heating keeps stomatal opening conservative; nonetheless GNDVI in the low 40s shows nitrogen status is supporting greenness despite the grey sky.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.42',
        metricLabel: 'chlorophyll stable under cool overcast'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Early April Plateau Building',
        body: 'Low-70s scores match the expected April envelope for improving row closure. Revisit after the next clear day to separate weather attenuation from true vigor loss.',
        severity: 'OPTIMAL',
        metric: 'Health Score 71/100',
        metricLabel: 'early April on track'
      }
    ]
  },
  '2026-04-07': {
    missionId: '2026-04-07',
    conditions: '6°C · NW 37 km/h · Humidity 70% · Showers, improving breaks',
    healthScore: 76,
    insights: [
      {
        icon: Wind,
        headline: 'Gusty Post-System Winds (Same-Week Pearson Pattern)',
        body: 'Toronto Pearson’s public hourly log for the first week of April 2026 includes 5 April with gusts to about 46 km/h, scattered showers, and air temperatures near 5–6 °C—representative of the showery, windy regime around this mission date. Those conditions add canopy motion blur in the mosaic but are compatible with strong NDVI when drainage and nutrition are sound.',
        severity: 'MONITOR',
        metric: 'NDVI 0.41',
        metricLabel: 'mature sparse canopy, wind texture'
      },
      {
        icon: Droplets,
        headline: 'Residual Showery Moisture',
        body: 'Light rain and scattered showers within the same early-April cycle kept surface humidity elevated (~70% during breaks). Wet soil in wheel tracks still biases red light downward, so SAVI helps normalize soil contribution as rows fill in.',
        severity: 'MONITOR',
        metric: 'SAVI 0.36',
        metricLabel: 'soil brightness correction active'
      },
      {
        icon: Thermometer,
        headline: 'Mild Spring Temperatures Supporting Growth',
        body: 'Afternoon readings near 6 °C with intermittent sun match the expected warming trend for southern Ontario in early April. GNDVI near 0.45 indicates robust chlorophyll for the growth stage.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.45',
        metricLabel: 'NIR/green ratio favorable'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Current-Week Outlook',
        body: 'Mid-70s health is coherent with late dormant-season recovery into active spring growth. Continue missions after major rain to separate drainage issues from meteorological attenuation.',
        severity: 'OPTIMAL',
        metric: 'Health Score 76/100',
        metricLabel: 'early April optimal band'
      }
    ]
  }
};

const severityStyles = {
  'ACTION REQUIRED': { color: 'var(--status-poor)', bg: 'rgba(var(--status-poor-rgb), 0.08)' },
  'MONITOR': { color: 'var(--status-moderate)', bg: 'rgba(var(--status-moderate-rgb), 0.08)' },
  'OPTIMAL': { color: 'var(--status-healthy)', bg: 'rgba(var(--status-healthy-rgb), 0.08)' }
};

export function getFieldMissionIdsChronological() {
  return Object.keys(MISSION_DATASETS).sort();
}

export default function FieldIntelligence({ selectedMissionId }) {
  const missionIds = getFieldMissionIdsChronological();
  const mission = selectedMissionId ? MISSION_DATASETS[selectedMissionId] : null;

  if (missionIds.length === 0 || !selectedMissionId || !mission) {
    return (
      <div style={{ marginTop: '2rem' }} className="empty-state">
        <div className="empty-state-icon">
          <Thermometer size={48} strokeWidth={1} aria-hidden />
        </div>
        <div className="empty-state-title">No field data yet</div>
        <div className="empty-state-description">
          {missionIds.length === 0
            ? 'No placeholder missions are configured.'
            : 'Select a mission to load field intelligence cards.'}
        </div>
      </div>
    );
  }

  const cards = mission.insights;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--accent)', fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
          FIELD INTELLIGENCE — MISSION {mission.missionId}
        </span>
        <span style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          marginLeft: 'auto'
        }}>
          Conditions: {mission.conditions}
        </span>
      </div>

      <div style={{
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-secondary)',
        marginBottom: '1rem'
      }}>
        Field health score: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{mission.healthScore}/100</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {cards.map((insight, i) => {
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
