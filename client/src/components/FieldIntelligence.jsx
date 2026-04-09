import { Droplets, Wind, AlertTriangle, Thermometer, CheckCircle, TrendingUp, Leaf } from 'lucide-react';

/** Placeholder missions keyed by mission ID (Toronto Pearson / YYZ–style conditions). */
export const MISSION_DATASETS = {
  // --- Backdated missions (Sep 2025 → Jan 2026) ---
  '2025-09-05': {
    missionId: '2025-09-05',
    conditions: '24°C · SW 14 km/h · Humidity 68% · Partly cloudy',
    healthScore: 84,
    insights: [
      {
        icon: 'TrendingUp',
        headline: 'Strong Late-Summer Canopy Health',
        body: 'NDVI of 0.68 is consistent with a mature onion canopy in the final weeks before harvest initiation. Partly cloudy conditions on September 5 kept temperatures near 24°C, which is within the optimal range for late bulbing. NIR reflectance is high relative to red, confirming active chlorophyll across the majority of the monitored area.',
        severity: 'OPTIMAL',
        metric: 'NDVI 0.68',
        metricLabel: 'peak late-season canopy'
      },
      {
        icon: 'Droplets',
        headline: 'Moderate Soil Moisture — Balanced',
        body: 'Surface humidity of 68% and southwest winds at 14 km/h indicate moderate evapotranspiration demand. SAVI of 0.61 reflects a well-covered field with limited bare soil visible between rows. Soil moisture appears adequate for this growth stage without signs of waterlogging or drought stress.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.61',
        metricLabel: 'adequate soil coverage'
      },
      {
        icon: 'Leaf',
        headline: 'Chlorophyll Concentration Near Seasonal Peak',
        body: 'GNDVI of 0.65 is in the upper range for Ontario onion crops at this growth stage, indicating strong nitrogen uptake and active photosynthesis. No nitrogen stress signatures are detectable in the green-to-NIR ratio. This result is consistent with well-managed fertility programs entering the final growth phase.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.65',
        metricLabel: 'strong chlorophyll signal'
      },
      {
        icon: 'CheckCircle',
        headline: 'Harvest Window Assessment — On Track',
        body: 'Current index levels and health score of 84/100 suggest the field is approaching the optimal harvest readiness window. Begin monitoring for lodge rate and top-down senescence over the next two to three weeks. No stress events or anomalous zones detected in the current mission.',
        severity: 'OPTIMAL',
        metric: 'Health Score 84/100',
        metricLabel: 'harvest window approaching'
      }
    ]
  },
  '2025-09-12': {
    missionId: '2025-09-12',
    conditions: '21°C · W 10 km/h · Humidity 64% · Broken clouds',
    healthScore: 86,
    insights: [
      {
        icon: TrendingUp,
        headline: 'Late-Season Vigor Sustained Under Mild Temperatures',
        body: 'Toronto Pearson reported afternoon temperatures around 72–73 °F (22–23 °C) with broken to scattered clouds and light winds near 6–10 mph. NDVI remains high, consistent with a mature canopy still carrying active chlorophyll late in the bulbing window. Cloud breaks reduce hot-spot artifacts and support stable index reads.',
        severity: 'OPTIMAL',
        metric: 'NDVI 0.70',
        metricLabel: 'healthy late-season canopy'
      },
      {
        icon: Droplets,
        headline: 'Evapotranspiration Demand Moderate',
        body: 'Humidity stayed mostly in the low‑60% range through midday with gentle winds, indicating moderate evaporative draw. SAVI suggests strong soil masking with minimal row gap exposure. No drought signature is evident in the soil-adjusted signal.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.63',
        metricLabel: 'good soil cover'
      },
      {
        icon: Leaf,
        headline: 'Chlorophyll Signal Stable',
        body: 'With temperatures staying above 20 °C and no rain-driven canopy wetness noted in the hourly log, the green-to-NIR ratio is clean. GNDVI in the mid‑0.60s is consistent with strong nitrogen status late season. Monitor for decline only as tops begin to lodge closer to harvest.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.66',
        metricLabel: 'chlorophyll near peak'
      },
      {
        icon: CheckCircle,
        headline: 'Harvest Readiness — Continue Weekly Watch',
        body: 'Health score remains in the mid‑80s, matching a managed late-summer onion field. Keep flights weekly to catch any abrupt decline after wind events. No stress interventions indicated from this mission.',
        severity: 'OPTIMAL',
        metric: 'Health Score 86/100',
        metricLabel: 'late-season baseline strong'
      }
    ]
  },
  '2025-09-18': {
    missionId: '2025-09-18',
    conditions: '29°C · S 19 km/h · Humidity 48% · Warm, partly sunny',
    healthScore: 82,
    insights: [
      {
        icon: Thermometer,
        headline: 'Heat Load Day — Canopy Still Performing',
        body: 'Pearson reached 84 °F (29 °C) by mid‑afternoon with partly sunny skies and humidity dipping into the high‑40% range. High temperatures can reduce stomatal conductance, but NDVI remains strong, indicating canopy integrity is still intact. Expect slight midday suppression versus cooler September flights.',
        severity: 'MONITOR',
        metric: 'NDVI 0.66',
        metricLabel: 'heat-influenced but healthy'
      },
      {
        icon: Wind,
        headline: 'Breezy Afternoon Raises Transpiration Demand',
        body: 'Winds increased into the 12–16 mph range later in the day while temperatures stayed near 28–29 °C. That combination elevates evapotranspiration and can accelerate top-down senescence. SAVI remains high, indicating row closure is still strong despite the demand spike.',
        severity: 'MONITOR',
        metric: 'SAVI 0.59',
        metricLabel: 'high cover, higher VPD'
      },
      {
        icon: Leaf,
        headline: 'Nitrogen Status Remains Adequate',
        body: 'GNDVI in the low‑0.60s supports continued chlorophyll density. With clear skies at night and warm afternoons, watch for any accelerated decline in GNDVI over the next two missions as the crop transitions toward harvest prep. No localized deficiency signature is implied today.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.62',
        metricLabel: 'fertility holding'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Slight Softening From Thermal Stress',
        body: 'Score is still above 80, but slightly below the early-September peak consistent with a warm, drier afternoon. Maintain irrigation scheduling awareness if soils are light-textured. Continue flights through the senescence onset period.',
        severity: 'OPTIMAL',
        metric: 'Health Score 82/100',
        metricLabel: 'managed decline onset'
      }
    ]
  },
  '2025-09-26': {
    missionId: '2025-09-26',
    conditions: '24°C · SW 13 km/h · Humidity 53% · Partly sunny',
    healthScore: 79,
    insights: [
      {
        icon: TrendingUp,
        headline: 'Late-September Canopy Still Dense',
        body: 'Toronto Pearson logged afternoon highs around 75 °F (24 °C) with partly sunny skies and light winds (6–13 mph). NDVI remains in the mid‑0.60s, consistent with a mature onion canopy with substantial leaf area. This is typical just before senescence accelerates into October.',
        severity: 'OPTIMAL',
        metric: 'NDVI 0.64',
        metricLabel: 'dense canopy maintained'
      },
      {
        icon: Droplets,
        headline: 'Balanced Surface Moisture — No Waterlogging Signal',
        body: 'Humidity eased from early-morning 80–90% into the low‑50% range while winds stayed modest. SAVI suggests soil is well masked, with no indication of saturation artifacts that would depress NIR. Maintain drainage checks only if repeated rain follows in early October.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.57',
        metricLabel: 'stable soil-adjusted vigor'
      },
      {
        icon: Leaf,
        headline: 'Chlorophyll Signal Slightly Below Peak',
        body: 'GNDVI in the low‑0.60s indicates chlorophyll remains strong but is beginning to soften relative to early September. With shorter day length and cooler nights, minor decline is agronomically expected. Track for uniformity—patchy drops would be abnormal.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.60',
        metricLabel: 'early senescence hint'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Late-Season Monitoring',
        body: 'High‑70s health aligns with managed late-season crop performance. Begin planning harvest timing and monitor for lodging rate changes. No acute stress events detected in today’s conditions.',
        severity: 'OPTIMAL',
        metric: 'Health Score 79/100',
        metricLabel: 'late-season steady'
      }
    ]
  },
  '2025-10-02': {
    missionId: '2025-10-02',
    conditions: '19°C · S 17 km/h · Humidity 49% · Partly sunny',
    healthScore: 70,
    insights: [
      {
        icon: TrendingUp,
        headline: 'Early October — Start of Managed Decline',
        body: 'Pearson observed a mild day topping out near 19 °C with partly sunny skies and light winds (generally under 17 km/h). NDVI in the low‑0.50s is consistent with early senescence and the first reduction in green leaf area as harvest prep begins. The signal remains uniform, indicating planned seasonal change rather than disease.',
        severity: 'OPTIMAL',
        metric: 'NDVI 0.52',
        metricLabel: 'senescence initiation'
      },
      {
        icon: Wind,
        headline: 'Light Wind — Minimal Mechanical Damage Risk',
        body: 'Winds stayed light for most of the capture window, reducing canopy motion and improving index stability. SAVI indicates soil is becoming more visible between rows compared to September, matching top-down drydown. No wind-driven desiccation spike is apparent.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.45',
        metricLabel: 'row gaps increasing'
      },
      {
        icon: Leaf,
        headline: 'Chlorophyll Trending Down With Season',
        body: 'GNDVI in the high‑0.40s aligns with the seasonal transition out of peak chlorophyll. Under clear-to-partly sunny conditions, this is a reliable read rather than a cloud artifact. Scout only if you see localized yellowing beyond the uniform decline pattern.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.49',
        metricLabel: 'seasonal chlorophyll decline'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Managed Early October State',
        body: 'A 70/100 score reflects a crop moving from peak vigor into harvest preparation while remaining well-managed. Continue flights every 1–2 weeks to track uniformity through senescence. No intervention indicated by today’s meteorology.',
        severity: 'OPTIMAL',
        metric: 'Health Score 70/100',
        metricLabel: 'declining but controlled'
      }
    ]
  },
  '2025-10-09': {
    missionId: '2025-10-09',
    conditions: '12°C · N 15 km/h · Humidity 41% · Clear',
    healthScore: 66,
    insights: [
      {
        icon: Thermometer,
        headline: 'Cool, Clear Day — Photosynthesis Slows',
        body: 'Pearson recorded clear skies with temperatures around 4–5 °C in the morning rising to roughly 12 °C midday. Cooler air temperatures reduce photosynthetic capacity and accelerate senescence progression. NDVI drops further into the high‑0.40s, consistent with early October drydown.',
        severity: 'MONITOR',
        metric: 'NDVI 0.48',
        metricLabel: 'cool-driven seasonal decline'
      },
      {
        icon: Wind,
        headline: 'Light Northerly Breeze Improves Image Stability',
        body: 'Winds were generally 9–17 km/h with low humidity near 38–44% in the afternoon. That favors canopy drying and less wet-leaf scatter, making SAVI a clean representation of soil exposure. Soil-adjusted values confirm increasing row gap visibility.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.41',
        metricLabel: 'soil exposure rising'
      },
      {
        icon: Leaf,
        headline: 'Chlorophyll Signal Moderating',
        body: 'GNDVI reflects a step down from September as chlorophyll content decreases during the senescence phase. With clear skies and stable illumination, this is unlikely to be cloud noise. Track for spatial hotspots that could indicate nutrient remobilization irregularities.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.46',
        metricLabel: 'senescence‑aligned chlorophyll'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Continue Harvest Prep Monitoring',
        body: 'Mid‑60s health is typical for early October as leaf area declines. Prioritize uniformity checks and harvest timing decisions. No evidence of an acute stress event based on weather and indices.',
        severity: 'OPTIMAL',
        metric: 'Health Score 66/100',
        metricLabel: 'early October baseline'
      }
    ]
  },
  '2025-10-16': {
    missionId: '2025-10-16',
    conditions: '13°C · W 10 km/h · Humidity 33% · Sunny',
    healthScore: 61,
    insights: [
      {
        icon: Thermometer,
        headline: 'Dry, Sunny Mid-October — Senescence Advances',
        body: 'Toronto Pearson observed clear skies with humidity dropping to ~33% early afternoon while temperatures climbed to ~57–59 °F (14–15 °C). Under dry air, onion tops dry down faster, increasing soil visibility and reducing canopy vigor indices. NDVI continues its seasonal slide into the low‑0.40s.',
        severity: 'MONITOR',
        metric: 'NDVI 0.43',
        metricLabel: 'dry-air senescence acceleration'
      },
      {
        icon: Wind,
        headline: 'Low Humidity, Light Wind — Higher Desiccation Risk',
        body: 'With light winds and very low humidity, evaporative demand rises even at modest temperatures. SAVI indicates substantial soil contribution as leaf area retreats. If harvest is pending, expect rapid top-down drydown during similar air masses.',
        severity: 'MONITOR',
        metric: 'SAVI 0.36',
        metricLabel: 'row exposure increasing'
      },
      {
        icon: Leaf,
        headline: 'Chlorophyll Decline Consistent With Season',
        body: 'GNDVI in the low‑0.40s matches reduced chlorophyll concentration as tops begin to lodge. Sunny conditions support a clean green-to-NIR ratio reading, making this a reliable baseline for mid-October. Scout only if there are sharp spatial edges in the map.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.43',
        metricLabel: 'uniform senescence pattern'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Managed Mid-October State',
        body: 'Low‑60s health is coherent with a crop transitioning toward harvest readiness. Maintain mission cadence through the end of October to capture any first frost impacts on residue reflectance. No immediate intervention implied.',
        severity: 'OPTIMAL',
        metric: 'Health Score 61/100',
        metricLabel: 'mid‑October trajectory'
      }
    ]
  },
  '2025-10-23': {
    missionId: '2025-10-23',
    conditions: '12°C · W 20 km/h · Humidity 67% · Sprinkles',
    healthScore: 44,
    insights: [
      {
        icon: Droplets,
        headline: 'Intermittent Sprinkles and Elevated Humidity',
        body: 'Pearson showed sprinkles around midday with humidity frequently in the 60–80% range and temperatures near 10–12 °C. Wet residue and soil can suppress NIR contrast and lower NDVI even if remaining green tissue is unchanged. Index values in the low‑0.20s align with late senescence or post-harvest residue exposure.',
        severity: 'MONITOR',
        metric: 'NDVI 0.24',
        metricLabel: 'wet residue + late senescence'
      },
      {
        icon: Wind,
        headline: 'Gustier Periods Around Midday',
        body: 'A brief wind spike to ~33 km/h was recorded during the sprinkles window. Wind-driven canopy motion plus wet surfaces can add mosaic variance and reduce index confidence. SAVI indicates soil is now the dominant background, consistent with late October.',
        severity: 'MONITOR',
        metric: 'SAVI 0.18',
        metricLabel: 'soil-dominant signal'
      },
      {
        icon: Leaf,
        headline: 'Chlorophyll Signal Near Post-Peak Floor',
        body: 'GNDVI in the low‑0.20s is typical when chlorophyll-rich leaf area has largely senesced or been removed. Under humid, showery conditions, green-band noise can increase; nonetheless the magnitude is consistent with end-of-season physiology. No nutrient intervention is relevant at this stage.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.22',
        metricLabel: 'post-peak chlorophyll'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Late October / Post-Harvest Band',
        body: 'Mid‑40s health aligns with late October residue visibility and reduced active canopy. Use this mission as a baseline for overwinter ground conditions and drainage assessment. Plan spring flights to compare thaw transition to this late-season endpoint.',
        severity: 'OPTIMAL',
        metric: 'Health Score 44/100',
        metricLabel: 'late-season baseline'
      }
    ]
  },
  '2025-10-30': {
    missionId: '2025-10-30',
    conditions: '8°C · W 28 km/h · Humidity 93% · Rain and fog',
    healthScore: 36,
    insights: [
      {
        icon: Droplets,
        headline: 'Cold Rain and Fog — Wet Soil Dominates Signal',
        body: 'Pearson logged persistent light rain and fog through much of the day with temperatures holding near 7–9 °C and humidity around 87–93%. Under wet soil and fog, red reflectance drops and NIR is scattered, compressing vegetation indices. NDVI in the low‑0.20s is consistent with residue + wet background rather than active canopy.',
        severity: 'MONITOR',
        metric: 'NDVI 0.20',
        metricLabel: 'wet-soil attenuation'
      },
      {
        icon: Wind,
        headline: 'Moderate Winds Through Precipitation',
        body: 'Winds increased into the 24–35 km/h range during drizzle and rain, which can drive surface water redistribution in low spots. SAVI stays low, reflecting that soil is highly exposed and moisture is the primary spectral driver. Verify drainage before freeze-up if ponding is observed.',
        severity: 'ACTION REQUIRED',
        metric: 'SAVI 0.14',
        metricLabel: 'low cover + wet background'
      },
      {
        icon: Thermometer,
        headline: 'Near-Frost Thermal Regime',
        body: 'Daytime temperatures stayed well below 10 °C, accelerating senescence completion and limiting any remaining photosynthetic activity. GNDVI near 0.20 matches low chlorophyll presence and wet-residue conditions. This is a typical late-October endpoint for Ontario fields.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.21',
        metricLabel: 'post-senescence signature'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — End-of-October Transition',
        body: 'A score in the mid‑30s is expected as the field shifts to residue and soil exposure with repeated rain/fog. This mission provides a useful pre-winter reference for spring comparisons. No crop-preservation action is expected at this stage beyond drainage review.',
        severity: 'MONITOR',
        metric: 'Health Score 36/100',
        metricLabel: 'late October baseline'
      }
    ]
  },
  '2025-11-03': {
    missionId: '2025-11-03',
    conditions: '11°C · SW 32 km/h · Humidity 76% · Scattered showers',
    healthScore: 30,
    insights: [
      {
        icon: Droplets,
        headline: 'Showery Mix — Wet Residue Artifacts',
        body: 'Pearson recorded sprinkles and scattered showers from late morning into the evening with humidity frequently above 70% and temperatures in the 6–11 °C range. Wet residue can mimic “low vigor” by damping NIR contrast. NDVI near 0.10 indicates minimal living canopy, consistent with early November in Ontario.',
        severity: 'MONITOR',
        metric: 'NDVI 0.10',
        metricLabel: 'near-bare field'
      },
      {
        icon: Wind,
        headline: 'Windy Periods Increase Surface Roughness',
        body: 'Winds reached ~20–24 mph (32–39 km/h) during the showery period, which can redistribute debris and surface water. SAVI near 0.06 confirms soil is the primary signal with limited vegetation masking. Monitor for erosion risk in exposed areas after repeated rain + wind days.',
        severity: 'MONITOR',
        metric: 'SAVI 0.06',
        metricLabel: 'soil-dominant baseline'
      },
      {
        icon: Leaf,
        headline: 'Chlorophyll Signal at Seasonal Floor',
        body: 'GNDVI is low as expected after harvest/senescence; the green-to-NIR ratio is primarily influenced by residue coloration and wetness. Under mixed cloud and showers, index precision can vary, but the magnitude supports a near-bare field. No nutrient or pest interpretation should be drawn from this read.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.09',
        metricLabel: 'residue-driven response'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Early November Baseline',
        body: 'A ~30/100 score reflects seasonal dormancy onset and minimal canopy. Use this mission for drainage and compaction checks rather than crop health decisions. Plan winter maintenance based on observed low-spot saturation patterns.',
        severity: 'MONITOR',
        metric: 'Health Score 30/100',
        metricLabel: 'post-harvest baseline'
      }
    ]
  },
  '2025-11-10': {
    missionId: '2025-11-10',
    conditions: '−4°C · W 30 km/h · Humidity 80% · Light snow',
    healthScore: 22,
    insights: [
      {
        icon: Thermometer,
        headline: 'First Hard Freeze — Photosynthesis Offline',
        body: 'Toronto Pearson recorded temperatures around −4 °C for most of the day with light snow at multiple intervals. Under freezing conditions, onion tissue is dormant and the sensor reads soil/residue/snow physics. NDVI near zero is expected and should not be interpreted as crop failure.',
        severity: 'MONITOR',
        metric: 'NDVI 0.02',
        metricLabel: 'freeze-driven dormancy'
      },
      {
        icon: Droplets,
        headline: 'Snowfall and High Humidity Reduce Contrast',
        body: 'Humidity stayed in the 74–86% range with visibility reductions during snow bands. Snow and low clouds increase diffuse light and can flatten NIR vs red separation. SAVI close to zero matches bare ground under early winter precipitation.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.01',
        metricLabel: 'snow/soil baseline'
      },
      {
        icon: Wind,
        headline: 'Breezy Conditions With Snow',
        body: 'Winds held around 19–30 km/h, which can cause drifting and uneven snow cover across furrows. That creates spatial index noise at block edges. GNDVI remains low, consistent with no green canopy present.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.04',
        metricLabel: 'no green canopy detected'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Expected Early Winter Drop',
        body: 'Low‑20s health is normal once freezing weather and snow arrive. Focus on overwinter field condition monitoring rather than agronomic interventions. Resume vegetative interpretation after sustained thaws in late winter.',
        severity: 'MONITOR',
        metric: 'Health Score 22/100',
        metricLabel: 'early winter baseline'
      }
    ]
  },
  '2025-11-20': {
    missionId: '2025-11-20',
    conditions: '6°C · E 15 km/h · Humidity 76% · Partly sunny',
    healthScore: 26,
    insights: [
      {
        icon: Thermometer,
        headline: 'Brief Thaw Window Without Canopy Return',
        body: 'Pearson warmed to ~6 °C under partly sunny conditions after sub‑zero early morning temperatures. Despite the thaw, there is no active onion canopy in late November, so NDVI remains low and stable. Any increase is attributable to soil moisture and illumination, not regrowth.',
        severity: 'OPTIMAL',
        metric: 'NDVI 0.07',
        metricLabel: 'thaw noise, not canopy'
      },
      {
        icon: Wind,
        headline: 'Light Winds, Stable Illumination',
        body: 'Winds were generally light (single digits to ~15 km/h), reducing BRDF swings and making this mission a clean baseline. SAVI stays low, indicating soil exposure is complete. Use this as a pre-snow reference for winter comparisons.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.05',
        metricLabel: 'bare-field baseline'
      },
      {
        icon: Leaf,
        headline: 'GNDVI Low — No Chlorophyll Signature',
        body: 'GNDVI remains in the ~0.08 range, consistent with residue color and a lack of chlorophyll-rich tissue. Under partly sunny skies the ratio is reliable. Any future rise above ~0.15 at this time would be more consistent with winter weeds than onions.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.08',
        metricLabel: 'residue-dominant signal'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Late November Floor',
        body: 'Mid‑20s health aligns with a dormant, post-harvest field. Prioritize drainage and compaction observations after freeze–thaw cycles rather than crop actions. Continue monthly flights if needed for overwinter site condition logs.',
        severity: 'MONITOR',
        metric: 'Health Score 26/100',
        metricLabel: 'late November baseline'
      }
    ]
  },
  '2025-11-28': {
    missionId: '2025-11-28',
    conditions: '2°C · WNW 41 km/h · Humidity 70% · Snow flurries',
    healthScore: 20,
    insights: [
      {
        icon: Wind,
        headline: 'Strong Winds With Flurries — Surface Noise Expected',
        body: 'Pearson reported persistent winds frequently 37–48 km/h with intermittent snow flurries and temperatures around −1 to 2 °C. Blowing snow and moving surface debris introduce spatial variance in the mosaic. NDVI remains near zero, consistent with no active canopy.',
        severity: 'MONITOR',
        metric: 'NDVI 0.01',
        metricLabel: 'wind + flurry scatter'
      },
      {
        icon: Droplets,
        headline: 'Cold Showers/Flurries Add Wetness Artifacts',
        body: 'Flurries and scattered showers were logged in the early afternoon, with humidity around 60–75%. Wet and partially snow-dusted soil can depress SAVI and reduce contrast. Treat this as a winter baseline mission, not a crop diagnostic read.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.00',
        metricLabel: 'winter soil baseline'
      },
      {
        icon: Thermometer,
        headline: 'Near-Freezing Thermal Regime',
        body: 'Temperatures stayed clustered around 0–2 °C, which does not support onion photosynthetic activity. GNDVI remains minimal and is driven by residue and snow crystals rather than chlorophyll. Expect improved interpretability on clear, calm winter days.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.03',
        metricLabel: 'no chlorophyll activity'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Late November Winterized Field',
        body: 'A 20/100 health score matches seasonal dormancy and flurry-driven sensor conditions. Use this mission for infrastructure/drainage documentation rather than agronomic decisions. Resume vegetation interpretation after spring green-up begins.',
        severity: 'MONITOR',
        metric: 'Health Score 20/100',
        metricLabel: 'winter baseline'
      }
    ]
  },
  '2025-12-01': {
    missionId: '2025-12-01',
    conditions: '−3°C · WNW 33 km/h · Humidity 74% · Light snow, ice fog',
    healthScore: 18,
    insights: [
      {
        icon: Droplets,
        headline: 'Light Snow Bands With Ice Fog',
        body: 'Pearson recorded light snow from early afternoon through late evening, with ice fog noted near the end of the day and humidity rising into the 80–90% range. Snow and fog flatten spectral contrast and increase diffuse light. NDVI stays near zero, consistent with dormant ground.',
        severity: 'MONITOR',
        metric: 'NDVI 0.00',
        metricLabel: 'snow/fog dominated'
      },
      {
        icon: Wind,
        headline: 'Breezy Start to December',
        body: 'Overnight winds were high (33–39 km/h) with sub‑zero temperatures, which can create uneven snow distribution across furrows. SAVI remains near zero, indicating soil + snow cover rather than vegetation. Treat spatial anomalies as snow drift artifacts unless repeated on clear days.',
        severity: 'MONITOR',
        metric: 'SAVI −0.01',
        metricLabel: 'snow drift variability'
      },
      {
        icon: Thermometer,
        headline: 'Subfreezing Surface Temperatures',
        body: 'Temperatures ranged roughly from −7 °C to −1 °C, keeping soil frozen. GNDVI remains minimal, consistent with absence of green tissue. Any positive bump is likely due to residue coloration under diffuse illumination.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.02',
        metricLabel: 'dormant baseline'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Early December Dormancy',
        body: 'A sub‑20 score is expected once persistent snow and freeze arrive. Use this period to validate storage, access roads, and drainage routes for spring. No crop interventions apply.',
        severity: 'MONITOR',
        metric: 'Health Score 18/100',
        metricLabel: 'dormant season floor'
      }
    ]
  },
  '2025-12-05': {
    missionId: '2025-12-05',
    conditions: '−1°C · W 18 km/h · Humidity 59% · Partly sunny',
    healthScore: 19,
    insights: [
      {
        icon: Thermometer,
        headline: 'Cold, Mostly Dry Air — Clean Winter Baseline',
        body: 'Pearson warmed from ~12 °F (−11 °C) overnight to around 30 °F (−1 °C) in the afternoon with partly sunny skies. Lower humidity (mid‑50s to low‑60s) reduces fog scatter and makes indices more repeatable. NDVI remains close to zero, consistent with dormant soil/residue.',
        severity: 'OPTIMAL',
        metric: 'NDVI 0.01',
        metricLabel: 'stable winter baseline'
      },
      {
        icon: Wind,
        headline: 'Moderate Winds, No Precipitation Signal',
        body: 'Winds increased into the mid‑teens mph in the afternoon with no persistent precipitation bands noted. SAVI sits near zero as expected for bare ground with occasional frost. Use this mission as a reference for detecting later snow-cover artifacts.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.00',
        metricLabel: 'bare soil + frost'
      },
      {
        icon: Leaf,
        headline: 'No Chlorophyll Signature Present',
        body: 'GNDVI stays low, consistent with residue-only signal. Under partly sunny conditions, the green band is less affected by diffuse cloud lighting, improving confidence in the absence of vegetation. Any increase later in winter would more likely indicate winter weeds along edges than onions.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.03',
        metricLabel: 'residue baseline'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Winter Monitoring Mode',
        body: 'A ~19/100 health score is normal in early December for Ontario fields. Keep monitoring cadence low and focus on site condition mapping. Plan spring baseline flights for thaw onset.',
        severity: 'MONITOR',
        metric: 'Health Score 19/100',
        metricLabel: 'winter baseline'
      }
    ]
  },
  '2025-12-12': {
    missionId: '2025-12-12',
    conditions: '−1°C · WNW 30 km/h · Humidity 64% · Partly sunny',
    healthScore: 17,
    insights: [
      {
        icon: Wind,
        headline: 'Blustery Mid-December — Surface Texture Noise',
        body: 'Pearson reported afternoon winds near 28–32 km/h while temperatures rose from about −12 °C overnight to around −1 °C midday. Wind over frozen furrows increases anisotropic reflectance and can add striping in mosaics. NDVI remains near zero as expected with no canopy.',
        severity: 'MONITOR',
        metric: 'NDVI 0.00',
        metricLabel: 'frozen-ground signature'
      },
      {
        icon: Thermometer,
        headline: 'Freeze With Minor Daytime Moderation',
        body: 'Despite the midday moderation, subzero nights keep soils locked, preventing biological activity. SAVI stays slightly negative to flat, consistent with frost-brightened soil. This mission is best used for winter surface condition documentation.',
        severity: 'OPTIMAL',
        metric: 'SAVI −0.01',
        metricLabel: 'frost/soil baseline'
      },
      {
        icon: Droplets,
        headline: 'No Wet-Leaf Confounds',
        body: 'No rain bands or dense fog were logged, and humidity hovered around the mid‑60% range. That makes this a cleaner comparison point than snow/fog missions. GNDVI remains minimal, confirming no green canopy.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.01',
        metricLabel: 'no vegetation present'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Dormant Mid-December',
        body: 'A mid‑teens score is expected given frozen soil and short-day conditions. Use this as a consistent winter baseline for detecting spring thaw movement. No intervention required.',
        severity: 'MONITOR',
        metric: 'Health Score 17/100',
        metricLabel: 'dormant winter floor'
      }
    ]
  },
  '2025-12-17': {
    missionId: '2025-12-17',
    conditions: '4°C · W 35 km/h · Humidity 75% · Overcast',
    healthScore: 21,
    insights: [
      {
        icon: Thermometer,
        headline: 'Mid-December Thaw Day — Still No Canopy',
        body: 'Pearson held near 3–4 °C for most of the day with overcast conditions and moderate winds. Even with above-freezing air, onion canopy is absent and soils remain cold, so NDVI stays low. Small positive shifts mainly reflect soil moisture and illumination rather than growth.',
        severity: 'OPTIMAL',
        metric: 'NDVI 0.03',
        metricLabel: 'thaw noise only'
      },
      {
        icon: Wind,
        headline: 'Windy Overcast Improves Mixing',
        body: 'Winds reached ~35–37 km/h in the afternoon, limiting stagnant fog buildup and improving visibility. SAVI remains near zero, reinforcing the bare-field state. If soils are saturated from thaw, avoid heavy equipment traffic to prevent compaction.',
        severity: 'MONITOR',
        metric: 'SAVI 0.01',
        metricLabel: 'bare field with thaw moisture'
      },
      {
        icon: Droplets,
        headline: 'High Humidity Without Persistent Precipitation',
        body: 'Humidity stayed around 75–81% under overcast skies, which can add slight haze but not as much scatter as dense fog. GNDVI remains low, consistent with non-vegetated surfaces. This is a good checkpoint for drainage performance under thaw cycles.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.04',
        metricLabel: 'residue + moisture'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Winter Thaw Baseline',
        body: 'Low‑20s health reflects seasonal dormancy with temporary thaw. Use this mission to identify water pooling areas for spring mitigation. No crop health actions apply.',
        severity: 'MONITOR',
        metric: 'Health Score 21/100',
        metricLabel: 'winter thaw baseline'
      }
    ]
  },
  '2025-12-22': {
    missionId: '2025-12-22',
    conditions: '3°C · W 30 km/h · Humidity 87% · Drizzle and fog',
    healthScore: 20,
    insights: [
      {
        icon: Droplets,
        headline: 'Solstice-Week Drizzle and Fog',
        body: 'Pearson logged drizzle and light rain late evening with fog and humidity rising into the 87–93% range while temperatures hovered around 1–3 °C. Wet surfaces and fog scatter reduce index contrast, keeping NDVI low even if residue is bright. This mission is primarily a moisture-condition baseline.',
        severity: 'MONITOR',
        metric: 'NDVI 0.02',
        metricLabel: 'fog/wet attenuation'
      },
      {
        icon: Thermometer,
        headline: 'Above-Freezing Afternoon Without Vegetation Response',
        body: 'Despite the afternoon reaching ~3 °C, short day length and cold soils prevent any meaningful vegetative activity. SAVI remains near zero, consistent with bare ground and wet residue. Avoid interpreting low indices as stress during this season.',
        severity: 'OPTIMAL',
        metric: 'SAVI 0.00',
        metricLabel: 'winter bare-field signature'
      },
      {
        icon: Wind,
        headline: 'Moderate Winds During Moist Regime',
        body: 'Winds increased toward ~22–30 km/h in the afternoon, which can help ventilate but also move surface moisture into depressions. GNDVI stays minimal as expected. Use this mission to flag low-spot drainage risk before deep freeze.',
        severity: 'MONITOR',
        metric: 'GNDVI 0.03',
        metricLabel: 'no chlorophyll present'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Late December Dormancy',
        body: 'A 20/100 score aligns with a winterized field under drizzle and fog. Maintain low-frequency monitoring and document ponding zones. Resume crop interpretation only after spring emergence.',
        severity: 'MONITOR',
        metric: 'Health Score 20/100',
        metricLabel: 'late December baseline'
      }
    ]
  },
  '2025-12-29': {
    missionId: '2025-12-29',
    conditions: '0°C · W 42 km/h · Humidity 93% · Rain→snow, dense fog',
    healthScore: 16,
    insights: [
      {
        icon: Droplets,
        headline: 'Rain-to-Snow Transition With Dense Fog',
        body: 'Pearson recorded light rain and drizzle overnight with dense fog (near 0–1 mi visibility) before a transition to light snow as temperatures fell toward 0 °C and below. These conditions strongly flatten reflectance contrast. NDVI near zero is expected and should be treated as weather-dominated, not agronomic.',
        severity: 'MONITOR',
        metric: 'NDVI 0.00',
        metricLabel: 'fog + mixed precip'
      },
      {
        icon: Wind,
        headline: 'High Winds During Temperature Crash',
        body: 'Winds surged into the 30–36 mph range during the late morning, coinciding with the rain-to-snow transition. Blowing snow and moving surface water create spatial artifacts in index layers. SAVI slightly negative reflects frozen wet soil and snow crystals.',
        severity: 'MONITOR',
        metric: 'SAVI −0.02',
        metricLabel: 'wind-driven scatter'
      },
      {
        icon: Thermometer,
        headline: 'Rapid Cooling Locks Soil Surface',
        body: 'Temperatures dropped from ~4–5 °C early to below freezing by afternoon/evening, freezing surface films. GNDVI stays minimal; any variation is residue and ice-driven. This mission is best used to document winter storm impacts rather than field health.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.01',
        metricLabel: 'dormant / frozen response'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Year-End Winter Floor',
        body: 'A mid‑teens score is appropriate under dense fog, mixed precipitation, and high winds. Expect clearer winter baseline missions on calm, dry cold days. No intervention required.',
        severity: 'MONITOR',
        metric: 'Health Score 16/100',
        metricLabel: 'storm-affected winter baseline'
      }
    ]
  },
  '2026-01-05': {
    missionId: '2026-01-05',
    conditions: '0°C · W 13 km/h · Humidity 86% · Light snow, ice fog',
    healthScore: 18,
    insights: [
      {
        icon: Droplets,
        headline: 'Light Snow and Ice Fog Suppress Contrast',
        body: 'Pearson logged light snow from early morning through late morning with ice fog and humidity around 86–93%, then overcast conditions near 0 °C through the afternoon. Under these conditions the scene is dominated by wet soil, snow crystals, and diffuse light. NDVI stays near zero, consistent with dormancy.',
        severity: 'MONITOR',
        metric: 'NDVI 0.00',
        metricLabel: 'snow/fog attenuation'
      },
      {
        icon: Thermometer,
        headline: 'Near-Freezing Day — Biology Dormant',
        body: 'Temperatures hovered near 0 °C for most of the afternoon with limited solar forcing. That keeps onion physiology offline and limits interpretability of vegetation indices. SAVI remains near zero, matching bare ground and residue.',
        severity: 'OPTIMAL',
        metric: 'SAVI −0.01',
        metricLabel: 'winter soil baseline'
      },
      {
        icon: Wind,
        headline: 'Light Winds Keep Snow Cover Patchy',
        body: 'Winds stayed generally below ~12 mph, meaning snow distribution is more dependent on microtopography than drift. GNDVI remains minimal, as expected for a dormant field. Use this mission as an early-January winter baseline for later comparisons.',
        severity: 'OPTIMAL',
        metric: 'GNDVI 0.02',
        metricLabel: 'no green canopy'
      },
      {
        icon: CheckCircle,
        headline: 'Health Score — Early January Dormancy',
        body: 'A high‑teens score aligns with winter dormancy and weather-dominated imagery. Focus on infrastructure and drainage observations rather than crop actions. Resume interpretation when thaw cycles begin in late winter.',
        severity: 'MONITOR',
        metric: 'Health Score 18/100',
        metricLabel: 'early January baseline'
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

const ICON_MAP = {
  TrendingUp,
  Droplets,
  Leaf,
  Wind,
  AlertTriangle,
  Thermometer,
  CheckCircle,
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
