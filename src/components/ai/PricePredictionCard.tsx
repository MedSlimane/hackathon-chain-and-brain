import { Brain } from "lucide-react";
import Badge from "@/components/common/Badge";
import type { BiomassListing } from "@/lib/database.types";
import { generateRecommendation, predictBiomassPrice } from "@/lib/predictions";

export function PricePredictionCard({ listing }: { listing: BiomassListing }) {
  const prediction = predictBiomassPrice({
    biomassType: listing.biomass_type,
    quantityKg: listing.quantity_kg,
    location: listing.location,
    qualityScore: listing.quality_score,
    moistureLevel: listing.moisture_level,
    demandLevel: "medium",
    distanceKm: 40,
  });

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950"><Brain size={20} /> AI price prediction</h2>
        <Badge variant="info">{Math.round(prediction.confidence * 100)}% confidence</Badge>
      </div>
      <p className="mt-4 text-3xl font-semibold text-emerald-700">{prediction.predictedPricePerKg.toFixed(2)} TND/kg</p>
      <p className="mt-1 text-sm text-slate-500">Range: {prediction.minPrice.toFixed(2)}-{prediction.maxPrice.toFixed(2)} TND/kg</p>
      <p className="mt-4 text-sm text-slate-600">{prediction.explanation}</p>
      <div className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">{generateRecommendation(listing)}</div>
    </article>
  );
}

export default PricePredictionCard;
