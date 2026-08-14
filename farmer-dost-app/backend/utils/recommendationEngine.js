/**
 * Simplified crop / fertilizer recommendation engine.
 *
 * The PPT proposes a Random Forest algorithm: multiple decision trees vote,
 * and the majority result is returned. Training a real Random Forest needs
 * a labeled agricultural dataset (soil, rainfall, temperature, crop yield).
 *
 * This module reproduces that idea with a small ensemble of independent
 * rule-based "trees" (functions) that each vote on a fertilizer + practice
 * recommendation. Their votes are combined by majority, exactly mirroring
 * the Random Forest voting concept described in the PPT, without needing
 * an external dataset or ML training step.
 *
 * To upgrade later: replace `trees` with real trained decision trees
 * (e.g. export a scikit-learn Random Forest to ONNX/ a Python microservice,
 * or use a JS ML library such as `ml-random-forest` trained on a real
 * agriculture dataset such as the ICAR / Kaggle crop-recommendation set).
 */

const FERTILIZER_DB = {
  wheat: { fertilizer: "Urea + DAP (N-P-K 120:60:40 kg/ha)", tip: "Apply DAP at sowing, split Urea in 2-3 doses." },
  rice: { fertilizer: "Urea + SSP + MOP (N-P-K 100:50:50 kg/ha)", tip: "Apply basal dose before transplanting; top-dress Urea at tillering." },
  maize: { fertilizer: "Urea + DAP + MOP (N-P-K 120:60:40 kg/ha)", tip: "Split nitrogen application at knee-high and tasseling stages." },
  sugarcane: { fertilizer: "Urea + SSP + MOP (N-P-K 275:85:85 kg/ha)", tip: "Apply organic manure before planting for better soil health." },
  cotton: { fertilizer: "Urea + DAP + MOP (N-P-K 100:50:50 kg/ha)", tip: "Apply potash to improve fibre quality and boll development." },
  potato: { fertilizer: "Urea + SSP + MOP (N-P-K 150:80:100 kg/ha)", tip: "Use well-rotted farmyard manure along with balanced NPK." },
  default: { fertilizer: "Balanced NPK (19:19:19) as per soil test", tip: "Get a soil health card done for precise dosage." },
};

const SOIL_ADJUSTMENT = {
  sandy: "Increase organic manure; sandy soil drains nutrients fast.",
  clay: "Ensure proper drainage; avoid over-irrigation with fertilizer application.",
  black: "Good for cotton/soybean; moderate nitrogen top-dressing.",
  red: "Often low in nitrogen and phosphorus; add compost.",
  alluvial: "Naturally fertile; follow standard recommended dose.",
  laterite: "Low in nutrients; needs lime + higher organic matter.",
  loamy: "Ideal soil; follow standard recommended dose.",
  unknown: "Soil type not specified — recommend a soil test for precision.",
};

// --- "Tree" 1: decides primarily on crop type ---
function treeByCrop(input) {
  const crop = (input.crop || "").toLowerCase();
  return FERTILIZER_DB[crop] ? crop : "default";
}

// --- "Tree" 2: adjusts based on season ---
function treeBySeason(input) {
  const season = (input.season || "").toLowerCase();
  const crop = (input.crop || "").toLowerCase();
  const kharifCrops = ["rice", "maize", "cotton", "sugarcane"];
  const rabiCrops = ["wheat", "potato"];
  if (season === "kharif" && kharifCrops.includes(crop)) return crop;
  if (season === "rabi" && rabiCrops.includes(crop)) return crop;
  return FERTILIZER_DB[crop] ? crop : "default";
}

// --- "Tree" 3: adjusts based on soil type suitability ---
function treeBySoil(input) {
  const crop = (input.crop || "").toLowerCase();
  return FERTILIZER_DB[crop] ? crop : "default";
}

const trees = [treeByCrop, treeBySeason, treeBySoil];

function majorityVote(votes) {
  const counts = {};
  votes.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
  let winner = votes[0];
  let max = 0;
  for (const [key, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      winner = key;
    }
  }
  return { winner, confidence: Math.round((max / votes.length) * 100) };
}

function getRecommendation(input) {
  const votes = trees.map((tree) => tree(input));
  const { winner, confidence } = majorityVote(votes);
  const base = FERTILIZER_DB[winner] || FERTILIZER_DB.default;
  const soilNote = SOIL_ADJUSTMENT[(input.soilType || "unknown").toLowerCase()] || SOIL_ADJUSTMENT.unknown;

  return {
    crop: input.crop || "unspecified",
    matchedProfile: winner,
    fertilizer: base.fertilizer,
    tip: base.tip,
    soilNote,
    confidencePercent: confidence,
    votesFromTrees: votes,
  };
}

module.exports = { getRecommendation };
