import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { ImageOff, Leaf, MapPin, ScanSearch, Store } from "lucide-react";
import Badge from "@/components/common/Badge";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import StatCard from "@/components/common/StatCard";
import { getCurrentProfile } from "@/lib/auth";
import type { BiomassListing, Profile } from "@/lib/database.types";
import { getListingsForHealthScan } from "@/lib/listings";
import {
  calculateCarbonSaved,
  calculateHealthRiskReduction,
  generateRecommendation,
  predictBiomassPrice,
} from "@/lib/predictions";
import { logSecurityEvent } from "@/lib/security";

interface ScanResult {
  listingId: string;
  biomassType: string;
  estimatedPricePerKg: number;
  estimatedTotalPrice: number;
  carbonSavedKg: number;
  healthRiskReduction: number;
  confidence: number;
  recommendation: string;
}

function formatMoney(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "TND" });
}

function statusVariant(status: BiomassListing["status"]): "success" | "warning" | "neutral" {
  if (status === "available") return "success";
  if (status === "reserved") return "warning";
  return "neutral";
}

export default function ScanDechetsDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<BiomassListing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanBusy, setScanBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) throw new Error("Login required.");
      if (currentProfile.role !== "health_actor" && currentProfile.role !== "admin") {
        throw new Error("Health actor access required.");
      }

      const existingListings = await getListingsForHealthScan();
      setProfile(currentProfile);
      setListings(existingListings);
      setSelectedListingId(existingListings[0]?.id ?? "");
    }

    load()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load farmer listings.")
      )
      .finally(() => setLoading(false));
  }, []);

  const selectedListing = useMemo(
    () => listings.find((listing) => listing.id === selectedListingId) ?? listings[0] ?? null,
    [listings, selectedListingId]
  );

  const totals = useMemo(
    () => ({
      quantity: listings.reduce((sum, listing) => sum + listing.quantity_kg, 0),
      withImages: listings.filter((listing) => Boolean(listing.image_url)).length,
      available: listings.filter((listing) => listing.status === "available").length,
    }),
    [listings]
  );

  async function handleScan(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedListing || !profile) return;

    setScanBusy(true);
    const prediction = predictBiomassPrice({
      biomassType: selectedListing.biomass_type,
      quantityKg: selectedListing.quantity_kg,
      location: selectedListing.location,
      demandLevel: "medium",
      qualityScore: selectedListing.quality_score,
      moistureLevel: selectedListing.moisture_level,
      distanceKm: 30,
    });

    try {
      await logSecurityEvent({
        userId: profile.id,
        eventType: "health_listing_scanned",
        details: {
          listing_id: selectedListing.id,
          biomass_type: selectedListing.biomass_type,
          has_supabase_image: Boolean(selectedListing.image_url),
        },
      });
    } catch {
      // The scan itself should still work if logging is blocked by policy or network.
    }

    window.setTimeout(() => {
      const carbonSaved =
        selectedListing.carbon_saved_kg ||
        calculateCarbonSaved(selectedListing.quantity_kg, selectedListing.biomass_type);
      const healthRiskReduction =
        selectedListing.health_risk_reduction_score ||
        calculateHealthRiskReduction(selectedListing.quantity_kg, 65);

      setResult({
        listingId: selectedListing.id,
        biomassType: selectedListing.biomass_type,
        estimatedPricePerKg: prediction.predictedPricePerKg,
        estimatedTotalPrice: prediction.predictedPricePerKg * selectedListing.quantity_kg,
        carbonSavedKg: carbonSaved,
        healthRiskReduction,
        confidence: prediction.confidence,
        recommendation: generateRecommendation({
          ...selectedListing,
          demandLevel: "medium",
        }),
      });
      setScanBusy(false);
    }, 350);
  }

  if (loading) return <LoadingState label="Loading farmer listings" />;
  if (error) return <EmptyState title="Waste scan unavailable" description={error} />;
  if (!listings.length) {
    return (
      <EmptyState
        title="No farmer listings to scan"
        description="Healthcare users scan existing farmer lots after farmers publish them."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Scan dechets
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Scan existing farmer listings.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Healthcare users do not create lots here. Select a farmer listing already stored
              in Supabase, review its image and data, then run the environmental scan.
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-medium">Read-only healthcare scan</p>
            <p className="mt-1">No listing upload or creation from this page.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Farmer lots" value={listings.length} icon={<Store size={20} />} />
        <StatCard title="Available lots" value={totals.available} icon={<ScanSearch size={20} />} />
        <StatCard
          title="Stored images"
          value={`${totals.withImages}/${listings.length}`}
          icon={<Leaf size={20} />}
          description={`${totals.quantity.toLocaleString()} kg listed across scanned lots.`}
        />
      </div>

      <form onSubmit={handleScan} className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="listing-select">
              Farmer listing
            </label>
            <select
              id="listing-select"
              value={selectedListing?.id ?? ""}
              onChange={(event) => {
                setSelectedListingId(event.target.value);
                setResult(null);
              }}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title} - {listing.location}
                </option>
              ))}
            </select>
          </div>

          {selectedListing ? (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              {selectedListing.image_url ? (
                <img
                  src={selectedListing.image_url}
                  alt={selectedListing.title}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="flex h-64 flex-col items-center justify-center bg-slate-50 text-slate-500">
                  <ImageOff size={28} />
                  <p className="mt-2 text-sm">No Supabase image linked to this listing.</p>
                </div>
              )}
              <div className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {selectedListing.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedListing.biomass_type}
                    </p>
                  </div>
                  <Badge variant={statusVariant(selectedListing.status)}>
                    {selectedListing.status}
                  </Badge>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <span>{selectedListing.quantity_kg.toLocaleString()} kg</span>
                  <span>{selectedListing.price_per_kg.toFixed(2)} TND/kg</span>
                  <span>Quality {selectedListing.quality_score ?? "N/A"}</span>
                  <span>Moisture {selectedListing.moisture_level ?? "N/A"}%</span>
                </div>
                <p className="flex items-center gap-1 text-sm text-slate-600">
                  <MapPin size={15} /> {selectedListing.location}
                </p>
                <button
                  type="submit"
                  disabled={scanBusy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <ScanSearch size={16} />
                  {scanBusy ? "Scanning..." : "Scan selected listing"}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Scan result
            </p>
            {result ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Type
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">{result.biomassType}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Confidence
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Estimated value
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {formatMoney(result.estimatedTotalPrice)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatMoney(result.estimatedPricePerKg)} / kg
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      CO2e avoided
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {result.carbonSavedKg.toLocaleString()} kg
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Health risk reduction
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {result.healthRiskReduction}/100
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                    Recommendation
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-emerald-900">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-slate-600">
                Select one of the existing farmer listings and scan it. This page reads
                stored Supabase listing data and images only.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
