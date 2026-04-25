import { useMemo, useState } from "react";
import { Camera, ScanSearch, UploadCloud, X } from "lucide-react";
import { createBatchHash, createBlockchainRecord } from "@/lib/blockchain";
import { createListing } from "@/lib/listings";
import { calculateCarbonSaved, calculateHealthRiskReduction, classifyBiomassFromText, predictBiomassPrice } from "@/lib/predictions";
import { logSecurityEvent, detectListingAnomaly } from "@/lib/security";
import { hasSupabaseConfig } from "@/lib/supabaseClient";
import { uploadBiomassImage } from "@/lib/storage";
import { listingSchema, validateImageFile } from "@/lib/validators";

const biomassTypes = ["Olive residues", "Wheat straw", "Date palm waste", "Almond shells", "Corn stalks", "Vegetable waste"];

export function CreateListingForm({ farmerId }: { farmerId: string }) {
  const [message, setMessage] = useState("");
  const [detectedType, setDetectedType] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imagePreview = useMemo(() => {
    if (!selectedFile) return "";
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setSelectedFile(file);
    setMessage("");
    setIsModalOpen(true);
  }

  function detectTypeFromForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const description = `${formData.get("title") ?? ""} ${formData.get("description") ?? ""}`;
    const result = classifyBiomassFromText(description);
    setDetectedType(result);
    const select = form.elements.namedItem("biomass_type") as HTMLSelectElement | null;
    if (select && biomassTypes.includes(result)) select.value = result;
  }

  function closeModal() {
    if (!busy) {
      setIsModalOpen(false);
      setDetectedType("");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
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

      if (!hasSupabaseConfig) {
        setMessage("Demo mode: connect Supabase env vars to create real listings.");
        return;
      }

      const imageUrl = await uploadBiomassImage(selectedFile, farmerId);
      const prediction = predictBiomassPrice({
        biomassType: parsed.data.biomass_type,
        quantityKg: parsed.data.quantity_kg,
        location: parsed.data.location,
        qualityScore: parsed.data.quality_score,
        moistureLevel: parsed.data.moisture_level,
        demandLevel: parsed.data.demandLevel,
        distanceKm: parsed.data.distanceKm,
      });
      const carbonSaved = calculateCarbonSaved(parsed.data.quantity_kg, parsed.data.biomass_type);
      const riskReduction = calculateHealthRiskReduction(parsed.data.quantity_kg, 65);
      const batchHash = await createBatchHash({ farmer_id: farmerId, biomass_type: parsed.data.biomass_type, quantity_kg: parsed.data.quantity_kg });

      const listing = await createListing({
        farmer_id: farmerId,
        title: parsed.data.title,
        biomass_type: parsed.data.biomass_type,
        description: parsed.data.description,
        quantity_kg: parsed.data.quantity_kg,
        price_per_kg: parsed.data.price_per_kg,
        predicted_price_per_kg: prediction.predictedPricePerKg,
        location: parsed.data.location,
        moisture_level: parsed.data.moisture_level,
        quality_score: parsed.data.quality_score,
        image_url: imageUrl,
        carbon_saved_kg: carbonSaved,
        health_risk_reduction_score: riskReduction,
        blockchain_batch_hash: batchHash,
      });

      await createBlockchainRecord({
        entityType: "biomass_listing",
        entityId: listing.id,
        action: "batch_created",
        actorId: farmerId,
        payload: { biomass_type: listing.biomass_type, quantity_kg: listing.quantity_kg, carbon_saved_kg: carbonSaved },
      });
      await logSecurityEvent({ userId: farmerId, eventType: "listing_created", details: { listing_id: listing.id } });

      for (const alert of detectListingAnomaly(listing)) {
        await logSecurityEvent({ userId: farmerId, eventType: alert.eventType, severity: alert.severity, details: { reason: alert.reason, listing_id: listing.id } });
      }

      setMessage("Listing created with AI prediction and blockchain trace.");
      setSelectedFile(null);
      setDetectedType("");
      setIsModalOpen(false);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create listing.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Publish a biomass lot</h2>
          <p className="mt-1 text-sm text-slate-500">
            Start with a photo. Details are added in the next step so the farmer view stays fast and focused.
          </p>
        </div>
        <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-5 py-6 text-center hover:bg-emerald-100">
          <Camera className="text-emerald-700" size={28} />
          <span className="mt-3 text-sm font-medium text-emerald-950">Take or upload lot photo</span>
          <span className="mt-1 text-xs text-emerald-800">JPG, PNG, WEBP under 5 MB</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={handleFileChange} />
        </label>
      </div>

      {message ? <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">{message}</p> : null}

      {isModalOpen && selectedFile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Lot details</h3>
                <p className="text-sm text-slate-500">Add only the information needed to publish and price the lot.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <div className="grid max-h-[calc(92vh-73px)] overflow-y-auto lg:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-slate-100 p-5">
                <img src={imagePreview} alt="Selected biomass lot" className="aspect-[4/5] w-full rounded-lg object-cover shadow-sm" />
                <div className="mt-4 rounded-md bg-white p-3 text-sm text-slate-600">
                  This photo is uploaded to the farmer folder, then linked to the listing after validation.
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4 p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Title</span>
                    <input name="title" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Olive residues ready for collection" required />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Biomass type</span>
                    <select name="biomass_type" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required>
                      {biomassTypes.map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Quantity kg</span>
                    <input name="quantity_kg" type="number" min="1" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="12000" required />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Price TND/kg</span>
                    <input name="price_per_kg" type="number" min="0" step="0.01" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="0.35" required />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Location</span>
                    <input name="location" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Sfax" required />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Quality score</span>
                    <input name="quality_score" type="number" min="0" max="100" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="80" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Moisture %</span>
                    <input name="moisture_level" type="number" min="0" max="100" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="18" />
                  </label>
                </div>

                <textarea name="description" className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Short storage, quality, and pickup notes" />
                <input type="hidden" name="demandLevel" value="medium" />
                <input type="hidden" name="distanceKm" value="40" />

                <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                  <button type="button" onClick={(event) => detectTypeFromForm(event.currentTarget.form!)} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50">
                    <ScanSearch size={16} /> Detect type
                  </button>
                  <button disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
                    <UploadCloud size={16} /> {busy ? "Publishing..." : "Publish lot"}
                  </button>
                </div>
                {detectedType ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">Detected local AI type: {detectedType}</p> : null}
                {message ? <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">{message}</p> : null}
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CreateListingForm;
