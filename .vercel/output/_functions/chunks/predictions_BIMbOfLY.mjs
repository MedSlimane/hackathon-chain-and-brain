const basePrices = {
  "olive residues": 0.42,
  "wheat straw": 0.24,
  "date palm waste": 0.32,
  "almond shells": 0.58,
  "corn stalks": 0.27,
  "vegetable waste": 0.18
};
const emissionFactors = {
  "olive residues": 1.45,
  "wheat straw": 1.25,
  "date palm waste": 1.3,
  "almond shells": 1.65,
  "corn stalks": 1.2,
  "vegetable waste": 0.8
};
function normalizeType(type) {
  return type.trim().toLowerCase();
}
function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}
function predictBiomassPrice(input) {
  const key = normalizeType(input.biomassType);
  let price = basePrices[key] ?? 0.3;
  const factors = [`Base price for ${input.biomassType || "mixed biomass"}`];
  if ((input.qualityScore ?? 0) >= 80) {
    price *= 1.18;
    factors.push("high quality increased value");
  } else if ((input.qualityScore ?? 60) < 45) {
    price *= 0.9;
    factors.push("lower quality reduced value");
  }
  if ((input.moistureLevel ?? 0) > 35) {
    price *= 0.82;
    factors.push("high moisture reduced value");
  } else if ((input.moistureLevel ?? 25) < 15) {
    price *= 1.08;
    factors.push("dry storage improved value");
  }
  if (input.demandLevel === "high") {
    price *= 1.18;
    factors.push("high industrial demand");
  }
  if (input.demandLevel === "low") {
    price *= 0.9;
    factors.push("low demand");
  }
  if ((input.distanceKm ?? 0) > 120) {
    price *= 0.86;
    factors.push("long transport distance");
  }
  if (input.quantityKg > 2e4) {
    price *= 1.06;
    factors.push("bulk quantity premium");
  }
  const completeness = [
    input.biomassType,
    input.quantityKg,
    input.location,
    input.qualityScore,
    input.moistureLevel,
    input.demandLevel,
    input.distanceKm
  ].filter((value) => value !== void 0 && value !== null && value !== "").length;
  const confidence = Math.min(0.92, 0.45 + completeness * 0.07);
  const predictedPricePerKg = round(Math.max(price, 0.03));
  return {
    predictedPricePerKg,
    minPrice: round(predictedPricePerKg * 0.85),
    maxPrice: round(predictedPricePerKg * 1.15),
    confidence: round(confidence, 2),
    explanation: factors.join(", ") + "."
  };
}
function calculateCarbonSaved(quantityKg, biomassType) {
  const factor = emissionFactors[normalizeType(biomassType)] ?? 1.1;
  return round(quantityKg * factor, 1);
}
function calculateHealthRiskReduction(quantityKg, regionPollutionLevel) {
  const diversionScore = Math.min(60, quantityKg / 1200);
  const pollutionBonus = Math.min(40, regionPollutionLevel * 0.4);
  return Math.round(Math.min(100, diversionScore + pollutionBonus));
}
function classifyBiomassFromText(description) {
  const text = description.toLowerCase();
  if (/olive|olives|زيتون/.test(text)) return "Olive residues";
  if (/wheat|straw|ble|blé/.test(text)) return "Wheat straw";
  if (/dates|palm|dattes/.test(text)) return "Date palm waste";
  if (/almond|shells|amandes/.test(text)) return "Almond shells";
  if (/corn|maize|mais|maïs/.test(text)) return "Corn stalks";
  if (/vegetables|legumes|légumes/.test(text)) return "Vegetable waste";
  return "Mixed biomass";
}
function generateRecommendation(listing) {
  const moisture = listing.moisture_level ?? 25;
  const quality = listing.quality_score ?? 65;
  const predicted = listing.predicted_price_per_kg ?? listing.price_per_kg ?? 0;
  const price = listing.price_per_kg ?? predicted;
  if (moisture > 35) return "Reduce moisture before sale to improve buyer confidence and price.";
  if (quality < 45) return "Improve sorting and storage before listing a premium price.";
  if (price > predicted * 1.2) return "Adjust price closer to AI estimate or justify the premium with quality data.";
  if ((listing.quantity_kg ?? 0) > 15e3) return "Target nearby industries to reduce logistics cost for this bulk lot.";
  if (listing.demandLevel === "high") return "Sell now while demand is high.";
  return "Listing is balanced. Keep price stable and respond quickly to industry requests.";
}

export { calculateHealthRiskReduction as a, classifyBiomassFromText as b, calculateCarbonSaved as c, generateRecommendation as g, predictBiomassPrice as p };
