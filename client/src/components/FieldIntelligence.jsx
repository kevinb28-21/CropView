import { Droplets, Wind, AlertTriangle, Thermometer, CheckCircle, TrendingUp, Leaf, Activity } from 'lucide-react';

/** Placeholder missions keyed by mission ID (Toronto Pearson / YYZ–style conditions). */
export const MISSION_DATASETS = {
  // --- Jan → Apr 2026 missions only (flight start window) ---
  '2026-01-03': {
    missionId: '2026-01-03',
    conditions: '-7°C · W 20 km/h · Humidity 74% · Light snow',
    healthScore: 16,
    insights: [
      {
        icon: 'Droplets',
        headline: 'Light Snow Cover — Indices Dominated by Ground Physics',
        body: 'Cold conditions with light snow and high humidity keep the scene dominated by snow crystals, residue, and frozen soil. NDVI near zero is expected with no canopy present and should be treated as a winter baseline. This mission is for seasonal floor reference, not crop diagnosis.',
        severity: 'MONITOR',
        metric: 'NDVI -0.02',
        metricLabel: 'snow/residue baseline'
      },
      {
        icon: 'Wind',
        headline: 'Moderate Winds Increase Surface Variability',
        body: 'Winds around 20 km/h can redistribute light snow and expose darker residue patches, creating tile-to-tile variance. SAVI stays negative, confirming no vegetative masking. Any “zones” are likely snow depth artifacts rather than agronomic issues.',
        severity: 'MONITOR',
        metric: 'SAVI -0.06',
        metricLabel: 'frozen soil, no canopy'
      },
      {
        icon: 'Activity',
        headline: 'Green/NIR Ratio Confirms No Chlorophyll Activity',
        body: 'GNDVI slightly below zero aligns with frozen ground reflectance and absence of chlorophyll-rich tissue. Overcast/snow illumination can flatten contrast but does not generate a true vegetation signal. Use this as the winter minimum benchmark.',
        severity: 'MONITOR',
        metric: 'GNDVI -0.03',
        metricLabel: 'winter floor'
      },
      {
        icon: 'CheckCircle',
        headline: 'Dormant Season Baseline Captured',
        body: 'A mid‑teens health score is expected in early January. This captures the seasonal floor that later missions should exceed as thaw and emergence begin. No intervention is required during dormancy.',
        severity: 'MONITOR',
        metric: 'Health Score 16/100',
        metricLabel: 'dormant baseline'
      }
    ]
  },
  '2026-01-07': {
    missionId: '2026-01-07',
    conditions: '-8°C · NW 22 km/h · Humidity 58% · Clear and cold',
    healthScore: 18,
    insights: [
      {
        icon: 'Thermometer',
        headline: 'Frozen Field — No Photosynthetic Activity',
        body: 'Clear, sub‑zero temperatures and wind keep the surface frozen and biologically inactive. Negative NDVI is consistent with bare, frozen soil and residue rather than crop stress. Treat this as an expected winter baseline point.',
        severity: 'MONITOR',
        metric: 'NDVI -0.08',
        metricLabel: 'frozen field baseline'
      },
      {
        icon: 'Wind',
        headline: 'Wind Chill Drives Surface Desiccation, Not Crop Stress',
        body: 'Northwest winds increase wind chill and can expose residue patches, adding mosaic texture. SAVI remains negative, confirming the absence of canopy. Variability is meteorology-driven in winter.',
        severity: 'MONITOR',
        metric: 'SAVI -0.06',
        metricLabel: 'frozen soil signature'
      },
      {
        icon: 'Activity',
        headline: 'No Chlorophyll Present',
        body: 'GNDVI remains negative, consistent with no green tissue. Clear sky increases scene brightness but does not change the dormant spectral composition. This point helps anchor later spring trend calculations.',
        severity: 'MONITOR',
        metric: 'GNDVI -0.04',
        metricLabel: 'chlorophyll absent'
      },
      {
        icon: 'CheckCircle',
        headline: 'Winter Dormancy — Expected',
        body: 'Health score in the high‑teens is normal for early January in Ontario. Continue winter missions only for baseline tracking and drainage/infrastructure observation. No agronomic action needed.',
        severity: 'MONITOR',
        metric: 'Health Score 18/100',
        metricLabel: 'dormant, no action'
      }
    ]
  },
  '2026-01-10': {
    missionId: '2026-01-10',
    conditions: '2°C · W 22 km/h · Humidity 81% · Light rain/fog late',
    healthScore: 22,
    insights: [
      {
        icon: 'Droplets',
        headline: 'Thaw + Moisture Films Reduce Contrast',
        body: 'Above-freezing air with overcast and late-day fog/rain creates wet soil and haze that compress index contrast. NDVI near zero reflects wet-ground physics rather than emergence. Use this mission to note low-spot saturation patterns.',
        severity: 'MONITOR',
        metric: 'NDVI 0.01',
        metricLabel: 'wet soil attenuation'
      },
      {
        icon: 'Wind',
        headline: 'Moderate Wind During Wet Conditions',
        body: 'Wind can move surface water and create patchy wetness that looks like “zones” in the mosaic. SAVI remains flat, confirming bare-field dominance. Recheck any anomalies on a dry follow-up mission.',
        severity: 'MONITOR',
        metric: 'SAVI 0.00',
        metricLabel: 'bare field under rain'
      },
      {
        icon: 'Activity',
        headline: 'No Chlorophyll Signal Yet',
        body: 'GNDVI stays low because green tissue is not present in January. Fog increases diffuse light but does not create chlorophyll signatures. Keep this as a thaw-event reference point.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.02',
        metricLabel: 'pre-emergence'
      },
      {
        icon: 'CheckCircle',
        headline: 'Winter Thaw — Monitoring Only',
        body: 'Low‑20s health is consistent with a brief thaw and wet surface conditions. This is normal for January and does not indicate field failure. Continue capturing for winter-to-spring context.',
        severity: 'MONITOR',
        metric: 'Health Score 22/100',
        metricLabel: 'winter thaw baseline'
      }
    ]
  },
  '2026-01-12': {
    missionId: '2026-01-12',
    conditions: '-1°C · W 35 km/h · Humidity 75% · Overcast, light snow',
    healthScore: 20,
    insights: [
      {
        icon: 'Thermometer',
        headline: 'Near-Freezing With Light Snow',
        body: 'Overcast with light snow keeps the surface reflective and reduces NIR contrast. NDVI remains near zero because the field is dormant and canopy is absent. Treat this as a clean winter baseline rather than stress.',
        severity: 'MONITOR',
        metric: 'NDVI -0.01',
        metricLabel: 'dormant winter read'
      },
      {
        icon: 'Wind',
        headline: 'Higher Winds Add BRDF Variance',
        body: 'Stronger winds can increase anisotropic reflectance over furrows and residue, adding striping in mosaics. SAVI stays negative, confirming no vegetation contribution. Expect variability without agronomic meaning.',
        severity: 'MONITOR',
        metric: 'SAVI -0.04',
        metricLabel: 'wind-texture baseline'
      },
      {
        icon: 'Activity',
        headline: 'Green/NIR Confirms Dormancy',
        body: 'GNDVI remains very low because chlorophyll is absent. Snow and clouds brighten the scene but do not alter the underlying dormant signature. Use for comparison against late-Feb thaw missions.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.01',
        metricLabel: 'winter floor stable'
      },
      {
        icon: 'CheckCircle',
        headline: 'Winter Baseline Maintained',
        body: 'A ~20/100 health score matches frozen field conditions. No intervention required. These winter points help set the seasonal floor before green-up.',
        severity: 'MONITOR',
        metric: 'Health Score 20/100',
        metricLabel: 'dormant baseline'
      }
    ]
  },
  '2026-01-20': {
    missionId: '2026-01-20',
    conditions: '-12°C · W 35 km/h · Humidity 56% · Very cold, partly sunny',
    healthScore: 19,
    insights: [
      {
        icon: 'Thermometer',
        headline: 'Arctic Air — Strong Cold Suppression',
        body: 'Very cold temperatures keep soil frozen and prevent any vegetative activity. NDVI remains negative, consistent with frozen bare ground and residue. This is winter physics, not agronomic stress.',
        severity: 'MONITOR',
        metric: 'NDVI -0.07',
        metricLabel: 'arctic dormant signature'
      },
      {
        icon: 'Wind',
        headline: 'Wind-Driven Surface Roughness',
        body: 'Strong winds increase surface texture and can expose darker residue patches, adding mosaic variance. SAVI remains negative, confirming no canopy masking. Treat sharp edges as wind/snow artifacts until repeated on calm days.',
        severity: 'MONITOR',
        metric: 'SAVI -0.05',
        metricLabel: 'wind-texture baseline'
      },
      {
        icon: 'Activity',
        headline: 'No Chlorophyll Signal in Clear Cold Slots',
        body: 'Lower humidity and clearer visibility improve measurement stability, but biology is still inactive. GNDVI remains slightly negative, consistent with a non-vegetated surface. Use this as a “clean air” winter reference point.',
        severity: 'MONITOR',
        metric: 'GNDVI -0.02',
        metricLabel: 'clear-air winter floor'
      },
      {
        icon: 'CheckCircle',
        headline: 'Dormancy Continues',
        body: 'Health score below 20 is expected under arctic air and strong winds. Continue baseline tracking only. No management action is implied during dormancy.',
        severity: 'MONITOR',
        metric: 'Health Score 19/100',
        metricLabel: 'winter dormancy'
      }
    ]
  },
  '2026-02-03': {
    missionId: '2026-02-03',
    conditions: '-4°C · W 29 km/h · Humidity 80% · Light snow then breaks',
    healthScore: 28,
    insights: [
      {
        icon: 'Droplets',
        headline: 'Intermittent Snow — Contrast Flattening Expected',
        body: 'Light snow and low cloud increase diffuse illumination and dampen red/NIR separation. NDVI remains low, consistent with dormancy and snow influence. Treat this as a late-winter baseline mission.',
        severity: 'MONITOR',
        metric: 'NDVI 0.04',
        metricLabel: 'snow-affected baseline'
      },
      {
        icon: 'Wind',
        headline: 'Afternoon Gusts Increase Surface Variance',
        body: 'Breezier periods can expose residue patches and create tile-to-tile variability. SAVI stays near zero, confirming no canopy contribution. Recheck any persistent anomalies after snow-free days.',
        severity: 'MONITOR',
        metric: 'SAVI 0.02',
        metricLabel: 'bare soil + drift effects'
      },
      {
        icon: 'Activity',
        headline: 'No Chlorophyll — GNDVI Remains Low',
        body: 'GNDVI stays in the low single digits, consistent with residue/soil rather than vegetation. Any slight positive value is reflectance noise, not emergence. Use for winter-to-thaw trend context.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.06',
        metricLabel: 'pre-emergence'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Early February Dormant Band',
        body: 'High‑20s health is appropriate for early February with intermittent snow. No interventions are implied. Continue weekly missions as thaw approaches later in February.',
        severity: 'MONITOR',
        metric: 'Health Score 28/100',
        metricLabel: 'dormant season'
      }
    ]
  },
  '2026-02-07': {
    missionId: '2026-02-07',
    conditions: '-18°C · W 40 km/h · Humidity 60% · Snow and wind',
    healthScore: 20,
    insights: [
      {
        icon: 'Thermometer',
        headline: 'Deep Freeze — Field Fully Locked',
        body: 'Extreme cold halts biological activity and keeps soil frozen. Negative NDVI is expected for frozen ground and snow. This is a winter minimum reference, not crop stress.',
        severity: 'MONITOR',
        metric: 'NDVI -0.09',
        metricLabel: 'deep-freeze baseline'
      },
      {
        icon: 'Wind',
        headline: 'High Winds With Snow — Drift Artifacts Likely',
        body: 'Strong winds during snow can create uneven snow depth across furrows, producing apparent spatial “zones”. SAVI remains negative, confirming bare field conditions. Validate any anomalies on calmer flights.',
        severity: 'MONITOR',
        metric: 'SAVI -0.07',
        metricLabel: 'drift noise'
      },
      {
        icon: 'Activity',
        headline: 'Chlorophyll Absent — GNDVI Below Zero',
        body: 'GNDVI stays negative because the scene contains no green tissue and is dominated by ice and residue. Clear breaks do not change the underlying dormant spectral floor. Use as a hard-winter anchor point.',
        severity: 'MONITOR',
        metric: 'GNDVI -0.05',
        metricLabel: 'winter minimum'
      },
      {
        icon: 'CheckCircle',
        headline: 'Winter Dormancy — Expected',
        body: 'A ~20 health score reflects weather, not management. No action is required during this cold snap. Continue to log conditions for comparison when thaw begins.',
        severity: 'MONITOR',
        metric: 'Health Score 20/100',
        metricLabel: 'arctic event baseline'
      }
    ]
  },
  '2026-02-14': {
    missionId: '2026-02-14',
    conditions: '2°C · W 10 km/h · Humidity 70% · Overcast to breaks',
    healthScore: 34,
    insights: [
      {
        icon: 'Thermometer',
        headline: 'Mild Thaw Day — Soil Surface Begins to Loosen',
        body: 'Above-freezing air can increase soil moisture mobility and slightly raise indices even without true emergence. NDVI moves modestly positive as snow cover becomes patchier. This is consistent with thaw physics rather than canopy growth.',
        severity: 'MONITOR',
        metric: 'NDVI 0.08',
        metricLabel: 'thaw-driven lift'
      },
      {
        icon: 'Droplets',
        headline: 'Moderate Humidity — Limited Drying',
        body: 'Humidity in the ~70% range keeps evaporation modest and can sustain wet soil films. SAVI remains low, indicating soil still dominates the scene. Expect improved interpretability on clearer, drier days.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.06',
        metricLabel: 'bare soil dominates'
      },
      {
        icon: 'Activity',
        headline: 'No Reliable Chlorophyll Signal Yet',
        body: 'GNDVI remains low and is consistent with residue/soil under mixed cloud. Any trace “green-up” this early would more likely be marginal weeds than onions. Maintain baseline monitoring into late February.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.12',
        metricLabel: 'trace pre-emergence'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Late Winter Transition',
        body: 'Low‑30s health aligns with occasional thaw days while the field remains dormant. This is normal for mid-February in southern Ontario. No intervention required.',
        severity: 'MONITOR',
        metric: 'Health Score 34/100',
        metricLabel: 'late-winter baseline'
      }
    ]
  },
  '2026-02-18': {
    missionId: '2026-02-18',
    conditions: '0°C · W 25 km/h · Humidity 87% · Sleet/freezing rain risk',
    healthScore: 40,
    insights: [
      {
        icon: 'Droplets',
        headline: 'Mixed Precipitation — Wet/Icy Surface Attenuation',
        body: 'Sleet/freezing rain risk implies ice films and wet soil that dampen NIR contrast and increase variability. NDVI in the low‑0.10s is consistent with thawing soil and moisture effects rather than canopy. Use this mission to flag drainage/ice crusting risk.',
        severity: 'MONITOR',
        metric: 'NDVI 0.12',
        metricLabel: 'ice/wet surface bias'
      },
      {
        icon: 'Wind',
        headline: 'Breezy Through Low Cloud',
        body: 'Moderate winds can create uneven wetness patterns across the field during mixed precipitation. SAVI remains modest, reflecting near-bare ground with soil adjustment. Avoid over-interpreting spatial “stress zones” on sleet days.',
        severity: 'MONITOR',
        metric: 'SAVI 0.10',
        metricLabel: 'low confidence wet day'
      },
      {
        icon: 'Activity',
        headline: 'Green/NIR Still Pre-Emergence',
        body: 'GNDVI rises slightly under thaw but remains consistent with residue/soil rather than green tissue. Any sustained rise above ~0.20 would be more suggestive of true green-up. Continue weekly monitoring toward late February.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.16',
        metricLabel: 'late-Feb thaw signature'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Late February Uplift',
        body: 'A 40/100 score matches late-February thaw conditions and index movement into positive territory. Continue weekly flights to catch the true green-up inflection. Monitor field access after icing.',
        severity: 'MONITOR',
        metric: 'Health Score 40/100',
        metricLabel: 'late-Feb transition'
      }
    ]
  },

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
  '2026-03-01': {
    missionId: '2026-03-01',
    conditions: '-8°C · W 22 km/h · Humidity 49% · Clear and cold',
    healthScore: 46,
    insights: [
      {
        icon: 'Thermometer',
        headline: 'Cold Start to March — Emergence Still Limited',
        body: 'A clear, cold day keeps green-up slow and leaves soil/residue as the dominant contributor. NDVI in the high‑0.10s is consistent with early March baseline, not canopy closure. Expect acceleration only after sustained above‑freezing highs.',
        severity: 'MONITOR',
        metric: 'NDVI 0.18',
        metricLabel: 'cold-limited green-up'
      },
      {
        icon: 'Wind',
        headline: 'Dry, Clear Air Improves Signal Confidence',
        body: 'Lower humidity and clear illumination reduce haze and wet-surface confounds. SAVI remains modest, indicating substantial soil exposure between rows. Use this mission as a “clean March” comparison point for later trends.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.15',
        metricLabel: 'soil still prominent'
      },
      {
        icon: 'Activity',
        headline: 'Trace Chlorophyll Contributions Begin',
        body: 'GNDVI around 0.22 supports early chlorophyll presence without a dense canopy. Under clear skies this is more reliable than readings under fog or drizzle. Watch for uniformity; patchy rises can indicate edge weeds.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.22',
        metricLabel: 'trace emergence'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Early March Baseline',
        body: 'Mid‑40s health aligns with sparse early tissue under cold conditions. Maintain weekly cadence to capture the inflection into strong green-up. No intervention recommended from this mission alone.',
        severity: 'MONITOR',
        metric: 'Health Score 46/100',
        metricLabel: 'early March floor'
      }
    ]
  },
  '2026-03-08': {
    missionId: '2026-03-08',
    conditions: '12°C · W 34 km/h · Humidity 54% · Mild, breezy',
    healthScore: 52,
    insights: [
      {
        icon: 'Thermometer',
        headline: 'Warm Spell — Green-Up Accelerates',
        body: 'Milder air supports early onion emergence and leaf expansion. NDVI moves into the mid‑0.20s, consistent with sparse but increasing canopy. This is the first meaningful step above the winter/thaw baseline.',
        severity: 'OPTIMAL',
        metric: 'NDVI 0.24',
        metricLabel: 'warm-spell green-up'
      },
      {
        icon: 'Wind',
        headline: 'Breezy Conditions Add Mosaic Texture',
        body: 'Stronger winds can increase canopy motion and reduce fine-scale stability. SAVI remains low‑0.20s, indicating soil is still visible between rows. Treat small anomalies cautiously on windy missions.',
        severity: 'MONITOR',
        metric: 'SAVI 0.21',
        metricLabel: 'soil still visible'
      },
      {
        icon: 'Activity',
        headline: 'Chlorophyll Signal Rising With Warmth',
        body: 'GNDVI approaches the high‑0.20s as chlorophyll-rich tissue contributes more to the green/NIR ratio. Mixed cloud and wind can soften contrast, but the magnitude indicates real greening. Track for evenness across blocks.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.28',
        metricLabel: 'chlorophyll increasing'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Early March Improvement',
        body: 'Low‑50s health fits early green-up during a mild spell. Continue weekly flights to separate weather-driven variation from true vigor trends. No corrective action indicated.',
        severity: 'OPTIMAL',
        metric: 'Health Score 52/100',
        metricLabel: 'warming-driven improvement'
      }
    ]
  },
  '2026-03-15': {
    missionId: '2026-03-15',
    conditions: '4°C · W 37 km/h · Humidity 70% · Snow to rain mix',
    healthScore: 56,
    insights: [
      {
        icon: 'Droplets',
        headline: 'Wintry Mix — Wet-Canopy Attenuation',
        body: 'Mixed precipitation introduces wet-leaf and wet-soil artifacts that can depress indices. NDVI around 0.30 remains consistent with improving canopy despite a wet weather mask. Use for trend direction rather than fine zonation.',
        severity: 'MONITOR',
        metric: 'NDVI 0.30',
        metricLabel: 'wet-mask on canopy'
      },
      {
        icon: 'Wind',
        headline: 'Gusty Periods Reduce Spatial Precision',
        body: 'Wind increases canopy motion and can add micro-blur. SAVI stays moderate, indicating soil exposure still matters. Recheck any sharp anomalies on a calmer follow-up flight.',
        severity: 'MONITOR',
        metric: 'SAVI 0.24',
        metricLabel: 'soil still visible'
      },
      {
        icon: 'Activity',
        headline: 'Chlorophyll Signal Holding Under Wet Weather',
        body: 'GNDVI in the low‑0.30s indicates chlorophyll contributions persist despite precipitation. Wetness can reduce contrast, so stable GNDVI here is a positive sign. Continue weekly missions as conditions dry.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.33',
        metricLabel: 'chlorophyll stable'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Mid-March Growth Band',
        body: 'Mid‑50s health matches mid-March canopy development under variable precipitation. No immediate action required. Confirm upward trend on the next dry, bright mission.',
        severity: 'OPTIMAL',
        metric: 'Health Score 56/100',
        metricLabel: 'mid-March baseline'
      }
    ]
  },
  '2026-03-17': {
    missionId: '2026-03-17',
    conditions: '-7°C · W 42 km/h · Humidity 58% · Snow flurries, windy',
    healthScore: 54,
    insights: [
      {
        icon: 'Wind',
        headline: 'Strong Wind Event — Temporary Suppression',
        body: 'Wind and subfreezing temperatures reduce photosynthetic activity and can temporarily suppress NDVI. Values in the high‑0.20s still indicate early canopy presence but under stress. Expect recovery on the next warm, calm mission.',
        severity: 'MONITOR',
        metric: 'NDVI 0.27',
        metricLabel: 'cold + wind suppression'
      },
      {
        icon: 'Thermometer',
        headline: 'Cold Reversal Stalls Green-Up',
        body: 'Temperatures below freezing can stall emergence progression. SAVI stays modest, confirming soil exposure remains. Track slope over the next two missions to confirm rebound.',
        severity: 'MONITOR',
        metric: 'SAVI 0.22',
        metricLabel: 'growth stalled by cold'
      },
      {
        icon: 'Activity',
        headline: 'Chlorophyll Signal Still Present',
        body: 'GNDVI near 0.30 suggests the canopy is not lost, just weather-limited. Flurries and low cloud can add noise; interpret across multiple missions. No intervention beyond monitoring is suggested.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.30',
        metricLabel: 'canopy intact'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Weather-Driven Dip',
        body: 'A mid‑50s score is consistent with a cold, windy mid-March mission. This is likely transient. Reassess under calmer conditions to confirm recovery.',
        severity: 'MONITOR',
        metric: 'Health Score 54/100',
        metricLabel: 'transient weather dip'
      }
    ]
  },
  '2026-03-22': {
    missionId: '2026-03-22',
    conditions: '4°C · W 24 km/h · Humidity 93% · Rain and fog',
    healthScore: 60,
    insights: [
      {
        icon: 'Droplets',
        headline: 'Rain and Fog — Wet-Canopy Mask',
        body: 'Rain/fog with near-saturation humidity adds wet-leaf scatter and reduces index contrast. NDVI around 0.30 still supports an improving canopy under a wet mask. Prioritize drainage observation after repeated wet missions.',
        severity: 'MONITOR',
        metric: 'NDVI 0.30',
        metricLabel: 'rain/fog suppression'
      },
      {
        icon: 'Wind',
        headline: 'Moderate Wind in Low Cloud',
        body: 'Wind through fog can create uneven wetness patterns and motion blur. SAVI remains mid‑0.20s, consistent with soil still visible but decreasing. Recheck zonation on a dry mission for higher confidence.',
        severity: 'MONITOR',
        metric: 'SAVI 0.26',
        metricLabel: 'soil + wetness mix'
      },
      {
        icon: 'Activity',
        headline: 'Chlorophyll Signal Continues Upward',
        body: 'GNDVI in the mid‑0.30s indicates chlorophyll contribution is growing despite wet weather. Fog can soften green-band separation, so stable values under fog are encouraging. Maintain weekly cadence.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.35',
        metricLabel: 'chlorophyll rising'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Growth Continuing',
        body: 'A ~60 score fits mid-March canopy development with wet-weather attenuation. No immediate action required. Confirm trend once conditions dry.',
        severity: 'OPTIMAL',
        metric: 'Health Score 60/100',
        metricLabel: 'mid-March growth'
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
  '2026-03-29': {
    missionId: '2026-03-29',
    conditions: '10°C · SW 14 km/h · Humidity 43% · Mostly cloudy',
    healthScore: 66,
    insights: [
      {
        icon: 'Thermometer',
        headline: 'Mild Late-March Day — Canopy Fills In',
        body: 'Mild temperatures with mostly cloudy skies support continued leaf expansion and more consistent photosynthesis. NDVI in the upper 0.30s is consistent with improving emergence and early row fill. Expect faster gains as soils continue warming into April.',
        severity: 'OPTIMAL',
        metric: 'NDVI 0.37',
        metricLabel: 'late-March canopy gain'
      },
      {
        icon: 'Wind',
        headline: 'Modest Winds Improve Mosaic Stability',
        body: 'Light-to-moderate winds reduce motion blur compared to stormier missions and help keep illumination consistent. SAVI remains low‑0.30s, indicating soil is still visible between rows but decreasing. This is a good mission for checking spatial uniformity.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.32',
        metricLabel: 'soil masking increasing'
      },
      {
        icon: 'Activity',
        headline: 'Chlorophyll Signal Strengthening',
        body: 'GNDVI in the high‑0.30s indicates rising chlorophyll density as green-up accelerates. Cloud cover increases diffuse lighting, which can improve uniformity across the mosaic. Watch for zones lagging behind the field mean.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.39',
        metricLabel: 'chlorophyll increasing'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — End-of-March Baseline',
        body: 'Mid‑60s health matches late-March development for an early-season onion field in Ontario. Continue weekly flights into early April to catch stress events early. No action required from this mission.',
        severity: 'OPTIMAL',
        metric: 'Health Score 66/100',
        metricLabel: 'late March baseline'
      }
    ]
  },
  '2026-04-01': {
    missionId: '2026-04-01',
    conditions: '4°C · W 33 km/h · Humidity 75% · Fog early, clearing',
    healthScore: 68,
    insights: [
      {
        icon: 'Droplets',
        headline: 'Foggy Start — Moisture Films Reduce Contrast',
        body: 'Early fog and higher humidity can dampen NIR contrast and bias NDVI slightly low relative to dry-canopy potential. As fog clears, index stability improves. Values near 0.39 still align with early April green-up.',
        severity: 'MONITOR',
        metric: 'NDVI 0.39',
        metricLabel: 'fog-wet attenuation'
      },
      {
        icon: 'Wind',
        headline: 'Breezy Day Improves Mixing',
        body: 'Moderate winds help ventilate low clouds and dry surfaces later in the day, improving confidence in index readings. SAVI rises as canopy coverage improves while soil contribution persists. Use this as a transition baseline into April cadence.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.33',
        metricLabel: 'spring green-up'
      },
      {
        icon: 'Activity',
        headline: 'Chlorophyll Signal Enters April Band',
        body: 'GNDVI in the low‑0.40s indicates increasing chlorophyll density as temperatures remain above freezing. Mixed cloud can increase diffuse uniformity. Monitor low spots that stay wet after fog/rain cycles.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.41',
        metricLabel: 'April chlorophyll rise'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Early April Improvement',
        body: 'Upper‑60s health is consistent with early April green-up beginning to accelerate. Continue weekly missions to separate weather attenuation from true vigor changes. No corrective action indicated.',
        severity: 'OPTIMAL',
        metric: 'Health Score 68/100',
        metricLabel: 'early April baseline'
      }
    ]
  },
  '2026-04-03': {
    missionId: '2026-04-03',
    conditions: '23°C · SW 39 km/h · Humidity 61% · Warm, windy',
    healthScore: 74,
    insights: [
      {
        icon: 'Thermometer',
        headline: 'Unseasonable Warmth — Rapid Green-Up Potential',
        body: 'Warm temperatures accelerate spring metabolism and leaf expansion, increasing vegetation signal rapidly. NDVI in the mid‑0.40s fits a warm-event jump for early April. Ensure trend persistence on the next cooler-day mission.',
        severity: 'OPTIMAL',
        metric: 'NDVI 0.45',
        metricLabel: 'warm-spell jump'
      },
      {
        icon: 'Wind',
        headline: 'High Winds Can Add Motion Blur',
        body: 'Sustained strong winds increase canopy motion and can reduce spatial precision of zonation, even when field mean improves. SAVI remains elevated, indicating improved coverage while some soil still contributes. Recheck sharp anomalies on calmer flights.',
        severity: 'MONITOR',
        metric: 'SAVI 0.38',
        metricLabel: 'windy, canopy filling'
      },
      {
        icon: 'Activity',
        headline: 'Chlorophyll Signal Strong for Stage',
        body: 'GNDVI in the mid‑0.40s suggests robust chlorophyll contribution during the warm spell. Wind can soften measurement at the edges, so focus on field-average trend. This is consistent with improving nitrogen status and active photosynthesis.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.46',
        metricLabel: 'chlorophyll strong'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Strong Early April Performance',
        body: 'Mid‑70s health aligns with rapid spring green-up during a warm event. Continue weekly flights to verify gains persist as temperatures normalize. No action required beyond monitoring.',
        severity: 'OPTIMAL',
        metric: 'Health Score 74/100',
        metricLabel: 'early April strong'
      }
    ]
  },
  '2026-04-04': {
    missionId: '2026-04-04',
    conditions: '7°C · W 22 km/h · Humidity 87% · Heavy rain/fog bands',
    healthScore: 70,
    insights: [
      {
        icon: 'Droplets',
        headline: 'Heavy Rain — Wet-Soil Bias Likely',
        body: 'Heavy rain and fog increase wet soil and canopy water films, reducing index contrast and potentially biasing NDVI low. Values around 0.40 remain consistent with ongoing green-up despite wet-weather masking. Prioritize drainage observation after heavy rain events.',
        severity: 'MONITOR',
        metric: 'NDVI 0.40',
        metricLabel: 'rain/fog attenuation'
      },
      {
        icon: 'Wind',
        headline: 'Moderate Winds During Rain',
        body: 'Wind during rain can create uneven wetness across the field and increase variance in low spots. SAVI helps normalize soil brightness and stays in the mid‑0.30s as canopy improves. Validate patterns after soils dry.',
        severity: 'MONITOR',
        metric: 'SAVI 0.34',
        metricLabel: 'wet soil correction'
      },
      {
        icon: 'Activity',
        headline: 'Chlorophyll Signal Maintained',
        body: 'GNDVI remains strong despite wet weather, indicating chlorophyll contribution continues. Fog softens green-band separation, so stable values are encouraging. Monitor for persistent low zones after the next clear mission.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.44',
        metricLabel: 'chlorophyll maintained'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Wet-Weather Stable',
        body: 'A ~70 score fits early April growth under rain/fog masking. No immediate action required beyond drainage checks. Reassess on a clear day to confirm underlying vigor.',
        severity: 'OPTIMAL',
        metric: 'Health Score 70/100',
        metricLabel: 'wet-weather baseline'
      }
    ]
  },
  '2026-04-05': {
    missionId: '2026-04-05',
    conditions: '5°C · W 46 km/h · Humidity 70% · Showers, brief flurries',
    healthScore: 72,
    insights: [
      {
        icon: 'Wind',
        headline: 'High-Gust Day — Motion Artifacts Expected',
        body: 'Strong winds and showers (with brief flurries) can add motion blur and wet-surface scatter, reducing spatial precision. NDVI remains strong, suggesting canopy gains persist despite gusts. Use this mission for field-mean trend more than micro-zonation.',
        severity: 'MONITOR',
        metric: 'NDVI 0.42',
        metricLabel: 'wind-texture on canopy'
      },
      {
        icon: 'Droplets',
        headline: 'Showers Keep Soil Wet',
        body: 'Repeated showers maintain surface wetness and can create low-spot variance. SAVI stays elevated as canopy covers more soil, but wet soil correction still matters. Recheck drainage corridors if wet patterns persist across missions.',
        severity: 'MONITOR',
        metric: 'SAVI 0.36',
        metricLabel: 'wet soil correction active'
      },
      {
        icon: 'Activity',
        headline: 'Chlorophyll Signal Remains Robust',
        body: 'GNDVI remains in the mid‑0.40s, consistent with active chlorophyll during early April. Wind and wetness can soften contrast, so stable values under these conditions are favorable. Continue weekly monitoring.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.45',
        metricLabel: 'chlorophyll robust'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Holding in Optimal Band',
        body: 'Low‑70s health fits early April canopy development despite gusty, showery weather. No intervention required; confirm trend on the next calmer flight. Keep an eye on drainage after repeated wet missions.',
        severity: 'OPTIMAL',
        metric: 'Health Score 72/100',
        metricLabel: 'early April optimal band'
      }
    ]
  },
  '2026-04-06': {
    missionId: '2026-04-06',
    conditions: '8°C · W 17 km/h · Humidity 62% · Partly cloudy',
    healthScore: 73,
    insights: [
      {
        icon: 'Thermometer',
        headline: 'Cooler, Drier Slot — Cleaner Read',
        body: 'Partly cloudy conditions with moderate humidity improve index confidence compared to rain/fog days. NDVI in the low‑0.40s suggests continued canopy improvement. Use this mission to validate whether wet-day dips were meteorology-driven.',
        severity: 'OPTIMAL',
        metric: 'NDVI 0.43',
        metricLabel: 'cleaner spring signal'
      },
      {
        icon: 'Wind',
        headline: 'Reduced Wind Improves Spatial Precision',
        body: 'Lighter winds reduce canopy motion and improve mosaic sharpness. SAVI rises as soil contribution decreases with canopy fill. This is a good mission for comparing uniformity across management zones.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.37',
        metricLabel: 'soil masking improving'
      },
      {
        icon: 'Activity',
        headline: 'Chlorophyll Stable-to-Up',
        body: 'GNDVI remains in the mid‑0.40s, consistent with active chlorophyll and improving nitrogen status for the stage. Partly cloudy illumination reduces hot-spot artifacts. Watch for any zones where GNDVI lags NDVI (possible nutrition variability).',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.46',
        metricLabel: 'chlorophyll stable'
      },
      {
        icon: 'CheckCircle',
        headline: 'Health Score — Early April Trend Holds',
        body: 'Low‑70s health indicates continued improvement into early April. Maintain weekly flights to catch early stress before canopy closes. No corrective action required from this mission.',
        severity: 'OPTIMAL',
        metric: 'Health Score 73/100',
        metricLabel: 'trend holding'
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

const ICON_MAP = {
  TrendingUp,
  Droplets,
  Leaf,
  Wind,
  AlertTriangle,
  Thermometer,
  CheckCircle,
  Activity,
};

function resolveIcon(icon) {
  if (!icon) return AlertTriangle;
  if (typeof icon === 'string') return ICON_MAP[icon] || AlertTriangle;
  return icon;
}

export default function FieldIntelligence() {
  const missionIds = getFieldMissionIdsChronological(); // oldest → newest

  if (missionIds.length === 0) {
    return (
      <div style={{ marginTop: '2rem' }} className="empty-state">
        <div className="empty-state-icon">
          <Thermometer size={48} strokeWidth={1} aria-hidden />
        </div>
        <div className="empty-state-title">No field data yet</div>
        <div className="empty-state-description">
          No placeholder missions are configured.
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {missionIds.map((missionId, idx) => {
          const mission = MISSION_DATASETS[missionId];
          const cards = mission?.insights || [];

          const showTopLine = idx !== 0;
          const showBottomLine = idx !== missionIds.length - 1;

          return (
            <div key={missionId} style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
              {/* Timeline rail */}
              <div style={{ width: 18, position: 'relative', display: 'flex', justifyContent: 'center' }}>
                {showTopLine && (
                  <div style={{ position: 'absolute', top: 0, bottom: '50%', width: 2, background: 'var(--bg-border)' }} />
                )}
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: 999, background: 'var(--accent)' }} />
                {showBottomLine && (
                  <div style={{ position: 'absolute', top: '50%', bottom: 0, width: 2, background: 'var(--bg-border)' }} />
                )}
              </div>

              {/* Mission card */}
              <div style={{
                flex: 1,
                background: 'var(--bg-surface)',
                border: '1px solid var(--bg-border)',
                borderRadius: '6px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '15px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                    {mission.missionId}
                  </span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {mission.conditions}
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)',
                    background: 'rgba(var(--accent-rgb), 0.10)',
                    border: '1px solid rgba(var(--accent-rgb), 0.25)',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap'
                  }}>
                    Health {mission.healthScore}/100
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(280px, 1fr))',
                  gap: '1rem'
                }}>
                  {cards.map((insight, i) => {
                    const Icon = resolveIcon(insight.icon);
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

                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--bg-border)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
