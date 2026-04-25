export interface ModelLotRequest {
  file: File;
  location: string;
  biomassType: string;
  quantityKg?: number;
  moistureLevel?: number | null;
}

export interface ModelLotPrediction {
  image?: {
    biomass_type?: string;
    confidence?: number;
    class_probabilities?: Record<string, number>;
    quality?: {
      dry_total?: number;
      dry_matter_fraction?: number;
    };
    model?: {
      framework?: string;
      device?: string;
      classifier_accuracy?: number;
    };
  };
  price?: {
    predicted_price?: number;
    target_column?: string;
    target_transform?: string;
    input_features?: string[];
    model?: {
      framework?: string;
      device?: string;
      metrics?: Record<string, number>;
    };
  };
  carbon?: {
    co2_kg: number;
    ch4_kg: number;
    n2o_kg: number;
    total_co2_eq_kg: number;
  };
}

class ModelApiError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
    this.name = "ModelApiError";
  }
}

const MODEL_API_URL = import.meta.env.PUBLIC_MODEL_API_URL || "http://127.0.0.1:8000";

const regionCoordinates: Record<string, { latitude: number; longitude: number; marketId: number }> = {
  sfax: { latitude: 34.74, longitude: 10.76, marketId: 1600 },
  sousse: { latitude: 35.82, longitude: 10.64, marketId: 1601 },
  kairouan: { latitude: 35.68, longitude: 10.1, marketId: 1602 },
  nabeul: { latitude: 36.45, longitude: 10.74, marketId: 1603 },
  gabes: { latitude: 33.89, longitude: 10.1, marketId: 1604 },
  tozeur: { latitude: 33.92, longitude: 8.13, marketId: 1605 },
};

const commodityIds: Record<string, number> = {
  "olive residues": 450,
  "wheat straw": 451,
  "date palm waste": 452,
  "almond shells": 453,
  "corn stalks": 454,
  "vegetable waste": 455,
};

function dateFeatures(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day_of_year: dayOfYear,
  };
}

function marketFeatures(location: string, biomassType: string) {
  const normalizedLocation = location.trim().toLowerCase();
  const normalizedType = biomassType.trim().toLowerCase();
  const coordinates = regionCoordinates[normalizedLocation] ?? regionCoordinates.sfax;
  return {
    market_id: coordinates.marketId,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    commodity_id: commodityIds[normalizedType] ?? 450,
    ...dateFeatures(),
  };
}

function estimateDryMassKg(quantityKg?: number, moistureLevel?: number | null) {
  if (!quantityKg || quantityKg <= 0) return undefined;
  const moistureFraction = Math.min(0.95, Math.max(0, (moistureLevel ?? 25) / 100));
  return Math.max(0.1, quantityKg * (1 - moistureFraction));
}

async function fetchJsonWithTimeout(url: string, options: RequestInit, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ModelApiError(error.detail || `Model API request failed with status ${response.status}`, response.status);
    }
    return response.json();
  } catch (error) {
    if (error instanceof ModelApiError) throw error;
    throw new ModelApiError("Model API is unavailable. Falling back to local demo engine.");
  } finally {
    window.clearTimeout(timeout);
  }
}

export function visualClassToMarketplaceType(visualClass?: string) {
  if (!visualClass) return null;
  if (visualClass.includes("grass")) return "Corn stalks";
  if (visualClass.includes("clover")) return "Vegetable waste";
  if (visualClass.includes("weed")) return "Vegetable waste";
  return null;
}

export function modelPriceToTndPerKg(prediction?: ModelLotPrediction) {
  const rawPrice = prediction?.price?.predicted_price;
  if (!rawPrice || rawPrice <= 0) return null;

  const target = prediction?.price?.target_column ?? "";
  const tndEstimate = target.toLowerCase().includes("usd") ? rawPrice * 3.1 : rawPrice;

  // Market training data can be for commodity units, not always biomass kg.
  // Keep marketplace suggestions in a realistic biomass range.
  if (tndEstimate > 5) return Number((tndEstimate / 100).toFixed(2));
  return Number(tndEstimate.toFixed(2));
}

export async function predictLotWithModelApi(input: ModelLotRequest): Promise<ModelLotPrediction> {
  const form = new FormData();
  form.append("file", input.file);
  const market = marketFeatures(input.location, input.biomassType);
  Object.entries(market).forEach(([key, value]) => form.append(key, String(value)));

  const dryMassKg = estimateDryMassKg(input.quantityKg, input.moistureLevel);
  if (dryMassKg) form.append("dry_mass_kg", String(dryMassKg));

  return fetchJsonWithTimeout(`${MODEL_API_URL}/predict/lot`, {
    method: "POST",
    body: form,
  });
}

export function getModelApiUrl() {
  return MODEL_API_URL;
}
