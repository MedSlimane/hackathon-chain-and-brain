import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
import { Camera, X, ScanSearch, UploadCloud } from 'lucide-react';
import { c as createBatchHash, a as createBlockchainRecord } from './blockchain_SnXJwiuI.mjs';
import { d as createListing } from './listings_Di9Iuo7a.mjs';
import { p as predictBiomassPrice, c as calculateCarbonSaved, a as calculateHealthRiskReduction, b as classifyBiomassFromText } from './predictions_BIMbOfLY.mjs';
import { l as logSecurityEvent, d as detectListingAnomaly } from './security_CFiqUYzX.mjs';
import { nanoid } from 'nanoid';
import { b as assertSupabaseConfig, s as supabase } from './auth_DwlCj7dW.mjs';
import { v as validateImageFile, l as listingSchema } from './validators_BsKMdSsQ.mjs';

async function uploadBiomassImage(file, userId) {
  assertSupabaseConfig();
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${nanoid(12)}.${extension}`;
  const { error } = await supabase.storage.from("biomass-images").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false
  });
  if (error) throw error;
  const { data } = supabase.storage.from("biomass-images").getPublicUrl(path);
  return {
    publicUrl: data.publicUrl,
    storagePath: path
  };
}

class ModelApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
    this.name = "ModelApiError";
  }
}
const MODEL_API_URL = "http://127.0.0.1:8000";
const regionCoordinates = {
  sfax: { latitude: 34.74, longitude: 10.76, marketId: 1600 },
  sousse: { latitude: 35.82, longitude: 10.64, marketId: 1601 },
  kairouan: { latitude: 35.68, longitude: 10.1, marketId: 1602 },
  nabeul: { latitude: 36.45, longitude: 10.74, marketId: 1603 },
  gabes: { latitude: 33.89, longitude: 10.1, marketId: 1604 },
  tozeur: { latitude: 33.92, longitude: 8.13, marketId: 1605 }
};
const commodityIds = {
  "olive residues": 450,
  "wheat straw": 451,
  "date palm waste": 452,
  "almond shells": 453,
  "corn stalks": 454,
  "vegetable waste": 455
};
function dateFeatures(date = /* @__PURE__ */ new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 864e5);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day_of_year: dayOfYear
  };
}
function marketFeatures(location, biomassType) {
  const normalizedLocation = location.trim().toLowerCase();
  const normalizedType = biomassType.trim().toLowerCase();
  const coordinates = regionCoordinates[normalizedLocation] ?? regionCoordinates.sfax;
  return {
    market_id: coordinates.marketId,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    commodity_id: commodityIds[normalizedType] ?? 450,
    ...dateFeatures()
  };
}
function estimateDryMassKg(quantityKg, moistureLevel) {
  if (!quantityKg || quantityKg <= 0) return void 0;
  const moistureFraction = Math.min(0.95, Math.max(0, (moistureLevel ?? 25) / 100));
  return Math.max(0.1, quantityKg * (1 - moistureFraction));
}
async function fetchJsonWithTimeout(url, options, timeoutMs = 8e3) {
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
function visualClassToMarketplaceType(visualClass) {
  if (!visualClass) return null;
  if (visualClass.includes("grass")) return "Corn stalks";
  if (visualClass.includes("clover")) return "Vegetable waste";
  if (visualClass.includes("weed")) return "Vegetable waste";
  return null;
}
function modelPriceToTndPerKg(prediction) {
  const rawPrice = prediction?.price?.predicted_price;
  if (!rawPrice || rawPrice <= 0) return null;
  const target = prediction?.price?.target_column ?? "";
  const tndEstimate = target.toLowerCase().includes("usd") ? rawPrice * 3.1 : rawPrice;
  if (tndEstimate > 5) return Number((tndEstimate / 100).toFixed(2));
  return Number(tndEstimate.toFixed(2));
}
async function predictLotWithModelApi(input) {
  const form = new FormData();
  form.append("file", input.file);
  const market = marketFeatures(input.location, input.biomassType);
  Object.entries(market).forEach(([key, value]) => form.append(key, String(value)));
  const dryMassKg = estimateDryMassKg(input.quantityKg, input.moistureLevel);
  if (dryMassKg) form.append("dry_mass_kg", String(dryMassKg));
  return fetchJsonWithTimeout(`${MODEL_API_URL}/predict/lot`, {
    method: "POST",
    body: form
  });
}

const biomassTypes = ["Olive residues", "Wheat straw", "Date palm waste", "Almond shells", "Corn stalks", "Vegetable waste"];
function CreateListingForm({ farmerId }) {
  const [message, setMessage] = useState("");
  const [detectedType, setDetectedType] = useState("");
  const [busy, setBusy] = useState(false);
  const [modelBusy, setModelBusy] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelPrediction, setModelPrediction] = useState(null);
  const imagePreview = useMemo(() => {
    if (!selectedFile) return "";
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);
  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setMessage(validationError);
      return;
    }
    setSelectedFile(file);
    setModelPrediction(null);
    setMessage("");
    setIsModalOpen(true);
  }
  function detectTypeFromForm(form) {
    const formData = new FormData(form);
    const description = `${formData.get("title") ?? ""} ${formData.get("description") ?? ""}`;
    const result = classifyBiomassFromText(description);
    setDetectedType(result);
    const select = form.elements.namedItem("biomass_type");
    if (select && biomassTypes.includes(result)) select.value = result;
  }
  function closeModal() {
    if (!busy) {
      setIsModalOpen(false);
      setDetectedType("");
      setModelPrediction(null);
    }
  }
  async function analyzeWithModels(form) {
    if (!selectedFile) return;
    setModelBusy(true);
    setMessage("");
    try {
      const formData = new FormData(form);
      const title = String(formData.get("title") ?? "");
      const biomassType = String(formData.get("biomass_type") ?? "Olive residues");
      const location = String(formData.get("location") ?? "Sfax");
      const quantityKg = Number(formData.get("quantity_kg") || 0);
      const moistureLevel = Number(formData.get("moisture_level") || 0) || void 0;
      const prediction = await predictLotWithModelApi({
        file: selectedFile,
        location,
        biomassType,
        quantityKg,
        moistureLevel
      });
      setModelPrediction(prediction);
      const mappedType = visualClassToMarketplaceType(prediction.image?.biomass_type);
      const localType = classifyBiomassFromText(title);
      const suggestedType = biomassTypes.includes(localType) ? localType : mappedType;
      const typeSelect = form.elements.namedItem("biomass_type");
      if (typeSelect && suggestedType && biomassTypes.includes(suggestedType)) {
        typeSelect.value = suggestedType;
        setDetectedType(`${suggestedType} (${prediction.image?.biomass_type ?? "vision model"})`);
      }
      const dryMatterFraction = prediction.image?.quality?.dry_matter_fraction;
      const moistureInput = form.elements.namedItem("moisture_level");
      if (moistureInput && !moistureInput.value && dryMatterFraction) {
        moistureInput.value = String(Math.round(Math.max(0, Math.min(100, 100 - dryMatterFraction * 100))));
      }
      const qualityInput = form.elements.namedItem("quality_score");
      if (qualityInput && !qualityInput.value && dryMatterFraction) {
        qualityInput.value = String(Math.round(Math.max(0, Math.min(100, dryMatterFraction * 100))));
      }
      const priceInput = form.elements.namedItem("price_per_kg");
      const modelPrice = modelPriceToTndPerKg(prediction);
      if (priceInput && !priceInput.value && modelPrice) {
        priceInput.value = String(modelPrice);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Model API unavailable. Local prediction will be used on publish.");
    } finally {
      setModelBusy(false);
    }
  }
  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const parsed = listingSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check the form.");
      setBusy(false);
      return;
    }
    try {
      if (!selectedFile) {
        setMessage("Add a lot photo before publishing.");
        return;
      }
      const uploadedImage = await uploadBiomassImage(selectedFile, farmerId);
      let apiPrediction = modelPrediction;
      if (!apiPrediction) {
        try {
          apiPrediction = await predictLotWithModelApi({
            file: selectedFile,
            location: parsed.data.location,
            biomassType: parsed.data.biomass_type,
            quantityKg: parsed.data.quantity_kg,
            moistureLevel: parsed.data.moisture_level
          });
          setModelPrediction(apiPrediction);
        } catch {
          apiPrediction = null;
        }
      }
      const localPrediction = predictBiomassPrice({
        biomassType: parsed.data.biomass_type,
        quantityKg: parsed.data.quantity_kg,
        location: parsed.data.location,
        qualityScore: parsed.data.quality_score,
        moistureLevel: parsed.data.moisture_level,
        demandLevel: parsed.data.demandLevel,
        distanceKm: parsed.data.distanceKm
      });
      const modelPrice = modelPriceToTndPerKg(apiPrediction ?? void 0);
      const modelMoisture = apiPrediction?.image?.quality?.dry_matter_fraction ? Math.round(100 - apiPrediction.image.quality.dry_matter_fraction * 100) : void 0;
      const modelQuality = apiPrediction?.image?.quality?.dry_matter_fraction ? Math.round(apiPrediction.image.quality.dry_matter_fraction * 100) : void 0;
      const carbonSaved = apiPrediction?.carbon?.total_co2_eq_kg ?? calculateCarbonSaved(parsed.data.quantity_kg, parsed.data.biomass_type);
      const riskReduction = calculateHealthRiskReduction(parsed.data.quantity_kg, 65);
      const batchHash = await createBatchHash({ farmer_id: farmerId, biomass_type: parsed.data.biomass_type, quantity_kg: parsed.data.quantity_kg });
      const listing = await createListing({
        farmer_id: farmerId,
        title: parsed.data.title,
        biomass_type: parsed.data.biomass_type,
        description: parsed.data.description,
        quantity_kg: parsed.data.quantity_kg,
        price_per_kg: parsed.data.price_per_kg,
        predicted_price_per_kg: modelPrice ?? localPrediction.predictedPricePerKg,
        location: parsed.data.location,
        moisture_level: parsed.data.moisture_level ?? modelMoisture,
        quality_score: parsed.data.quality_score ?? modelQuality,
        image_url: uploadedImage.publicUrl,
        carbon_saved_kg: carbonSaved,
        health_risk_reduction_score: riskReduction,
        blockchain_batch_hash: batchHash
      });
      await createBlockchainRecord({
        entityType: "biomass_listing",
        entityId: listing.id,
        action: "batch_created",
        actorId: farmerId,
        payload: {
          biomass_type: listing.biomass_type,
          quantity_kg: listing.quantity_kg,
          carbon_saved_kg: carbonSaved,
          image_storage_path: uploadedImage.storagePath
        }
      });
      await logSecurityEvent({
        userId: farmerId,
        eventType: "listing_created",
        details: {
          listing_id: listing.id,
          image_storage_path: uploadedImage.storagePath
        }
      });
      for (const alert of detectListingAnomaly(listing)) {
        await logSecurityEvent({ userId: farmerId, eventType: alert.eventType, severity: alert.severity, details: { reason: alert.reason, listing_id: listing.id } });
      }
      setMessage("Listing created with Supabase image, AI prediction, and blockchain trace.");
      setSelectedFile(null);
      setDetectedType("");
      setModelPrediction(null);
      setIsModalOpen(false);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create listing.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxs("section", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "Publish a biomass lot" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Start with a photo. Details are added in the next step so the farmer view stays fast and focused." })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-5 py-6 text-center hover:bg-emerald-100", children: [
        /* @__PURE__ */ jsx(Camera, { className: "text-emerald-700", size: 28 }),
        /* @__PURE__ */ jsx("span", { className: "mt-3 text-sm font-medium text-emerald-950", children: "Take or upload lot photo" }),
        /* @__PURE__ */ jsx("span", { className: "mt-1 text-xs text-emerald-800", children: "JPG, PNG, WEBP under 5 MB" }),
        /* @__PURE__ */ jsx("input", { type: "file", accept: "image/jpeg,image/png,image/webp", capture: "environment", className: "sr-only", onChange: handleFileChange })
      ] })
    ] }),
    message ? /* @__PURE__ */ jsx("p", { className: "mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600", children: message }) : null,
    isModalOpen && selectedFile ? /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4", children: /* @__PURE__ */ jsxs("div", { className: "max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-slate-200 px-5 py-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-950", children: "Lot details" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Add only the information needed to publish and price the lot." })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: closeModal, className: "rounded-md p-2 text-slate-500 hover:bg-slate-100", "aria-label": "Close modal", children: /* @__PURE__ */ jsx(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid max-h-[calc(92vh-73px)] overflow-y-auto lg:grid-cols-[0.9fr_1.1fr]", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-100 p-5", children: [
          /* @__PURE__ */ jsx("img", { src: imagePreview, alt: "Selected biomass lot", className: "aspect-[4/5] w-full rounded-lg object-cover shadow-sm" }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-md bg-white p-3 text-sm text-slate-600", children: "This photo is uploaded to the farmer folder, then linked to the listing after validation." })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4 p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("label", { className: "space-y-1 md:col-span-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-700", children: "Title" }),
              /* @__PURE__ */ jsx("input", { name: "title", className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm", placeholder: "Olive residues ready for collection", required: true })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-700", children: "Biomass type" }),
              /* @__PURE__ */ jsx("select", { name: "biomass_type", className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm", required: true, children: biomassTypes.map((type) => /* @__PURE__ */ jsx("option", { children: type }, type)) })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-700", children: "Quantity kg" }),
              /* @__PURE__ */ jsx("input", { name: "quantity_kg", type: "number", min: "1", className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm", placeholder: "12000", required: true })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-700", children: "Price TND/kg" }),
              /* @__PURE__ */ jsx("input", { name: "price_per_kg", type: "number", min: "0", step: "0.01", className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm", placeholder: "0.35", required: true })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-700", children: "Location" }),
              /* @__PURE__ */ jsx("input", { name: "location", className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm", placeholder: "Sfax", required: true })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-700", children: "Quality score" }),
              /* @__PURE__ */ jsx("input", { name: "quality_score", type: "number", min: "0", max: "100", className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm", placeholder: "80" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-700", children: "Moisture %" }),
              /* @__PURE__ */ jsx("input", { name: "moisture_level", type: "number", min: "0", max: "100", className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm", placeholder: "18" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("textarea", { name: "description", className: "min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm", placeholder: "Short storage, quality, and pickup notes" }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "demandLevel", value: "medium" }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "distanceKm", value: "40" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 border-t border-slate-100 pt-4", children: [
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: (event) => analyzeWithModels(event.currentTarget.form), className: "inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60", disabled: modelBusy, children: [
              /* @__PURE__ */ jsx(ScanSearch, { size: 16 }),
              " ",
              modelBusy ? "Analyzing..." : "Analyze with models"
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: (event) => detectTypeFromForm(event.currentTarget.form), className: "inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50", children: "Local fallback" }),
            /* @__PURE__ */ jsxs("button", { disabled: busy, className: "inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60", children: [
              /* @__PURE__ */ jsx(UploadCloud, { size: 16 }),
              " ",
              busy ? "Publishing..." : "Publish lot"
            ] })
          ] }),
          detectedType ? /* @__PURE__ */ jsxs("p", { className: "rounded-md bg-emerald-50 p-3 text-sm text-emerald-900", children: [
            "Detected local AI type: ",
            detectedType
          ] }) : null,
          modelPrediction ? /* @__PURE__ */ jsxs("div", { className: "grid gap-3 rounded-md bg-sky-50 p-3 text-sm text-sky-950 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Vision model" }),
              /* @__PURE__ */ jsxs("p", { children: [
                modelPrediction.image?.biomass_type ?? "unknown",
                " · ",
                Math.round((modelPrediction.image?.confidence ?? 0) * 100),
                "% confidence"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Quality regressor" }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Dry matter ",
                Math.round((modelPrediction.image?.quality?.dry_matter_fraction ?? 0) * 100),
                "% · dry total ",
                modelPrediction.image?.quality?.dry_total?.toFixed(1) ?? "-"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Price model" }),
              /* @__PURE__ */ jsxs("p", { children: [
                modelPriceToTndPerKg(modelPrediction)?.toFixed(2) ?? "-",
                " TND/kg signal · raw ",
                modelPrediction.price?.predicted_price?.toFixed(3) ?? "-",
                " ",
                modelPrediction.price?.target_column ?? ""
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Carbon engine" }),
              /* @__PURE__ */ jsxs("p", { children: [
                modelPrediction.carbon?.total_co2_eq_kg?.toFixed(1) ?? "-",
                " kg CO2e avoided"
              ] })
            ] })
          ] }) : null,
          message ? /* @__PURE__ */ jsx("p", { className: "rounded-md bg-slate-50 p-3 text-sm text-slate-600", children: message }) : null
        ] })
      ] })
    ] }) }) : null
  ] });
}

export { CreateListingForm as C };
