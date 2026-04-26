import { e as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { Store, ScanSearch, Leaf, ImageOff, MapPin } from 'lucide-react';
import { B as Badge } from '../../chunks/Badge_CSrJEJIS.mjs';
import { L as LoadingState, E as EmptyState } from '../../chunks/LoadingState_DsPIB6ym.mjs';
import { S as StatCard } from '../../chunks/StatCard_CuLZLHBx.mjs';
import { a as getCurrentProfile } from '../../chunks/auth_DwlCj7dW.mjs';
import { b as getListingsForHealthScan } from '../../chunks/listings_Di9Iuo7a.mjs';
import { p as predictBiomassPrice, c as calculateCarbonSaved, a as calculateHealthRiskReduction, g as generateRecommendation } from '../../chunks/predictions_BIMbOfLY.mjs';
import { l as logSecurityEvent } from '../../chunks/security_CFiqUYzX.mjs';
import { $ as $$DashboardLayout } from '../../chunks/DashboardLayout_DNSv8d_E.mjs';
export { renderers } from '../../renderers.mjs';

function formatMoney(value) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "TND" });
}
function statusVariant(status) {
  if (status === "available") return "success";
  if (status === "reserved") return "warning";
  return "neutral";
}
function ScanDechetsDashboard() {
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanBusy, setScanBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
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
    load().catch(
      (err) => setError(err instanceof Error ? err.message : "Unable to load farmer listings.")
    ).finally(() => setLoading(false));
  }, []);
  const selectedListing = useMemo(
    () => listings.find((listing) => listing.id === selectedListingId) ?? listings[0] ?? null,
    [listings, selectedListingId]
  );
  const totals = useMemo(
    () => ({
      quantity: listings.reduce((sum, listing) => sum + listing.quantity_kg, 0),
      withImages: listings.filter((listing) => Boolean(listing.image_url)).length,
      available: listings.filter((listing) => listing.status === "available").length
    }),
    [listings]
  );
  async function handleScan(event) {
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
      distanceKm: 30
    });
    try {
      await logSecurityEvent({
        userId: profile.id,
        eventType: "health_listing_scanned",
        details: {
          listing_id: selectedListing.id,
          biomass_type: selectedListing.biomass_type,
          has_supabase_image: Boolean(selectedListing.image_url)
        }
      });
    } catch {
    }
    window.setTimeout(() => {
      const carbonSaved = selectedListing.carbon_saved_kg || calculateCarbonSaved(selectedListing.quantity_kg, selectedListing.biomass_type);
      const healthRiskReduction = selectedListing.health_risk_reduction_score || calculateHealthRiskReduction(selectedListing.quantity_kg, 65);
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
          demandLevel: "medium"
        })
      });
      setScanBusy(false);
    }, 350);
  }
  if (loading) return /* @__PURE__ */ jsx(LoadingState, { label: "Loading farmer listings" });
  if (error) return /* @__PURE__ */ jsx(EmptyState, { title: "Waste scan unavailable", description: error });
  if (!listings.length) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        title: "No farmer listings to scan",
        description: "Healthcare users scan existing farmer lots after farmers publish them."
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("section", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700", children: "Scan dechets" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 text-xl font-semibold text-slate-950", children: "Scan existing farmer listings." }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-slate-600", children: "Healthcare users do not create lots here. Select a farmer listing already stored in Supabase, review its image and data, then run the environmental scan." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Read-only healthcare scan" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1", children: "No listing upload or creation from this page." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsx(StatCard, { title: "Farmer lots", value: listings.length, icon: /* @__PURE__ */ jsx(Store, { size: 20 }) }),
      /* @__PURE__ */ jsx(StatCard, { title: "Available lots", value: totals.available, icon: /* @__PURE__ */ jsx(ScanSearch, { size: 20 }) }),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "Stored images",
          value: `${totals.withImages}/${listings.length}`,
          icon: /* @__PURE__ */ jsx(Leaf, { size: 20 }),
          description: `${totals.quantity.toLocaleString()} kg listed across scanned lots.`
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleScan, className: "grid gap-6 xl:grid-cols-[0.9fr_1.1fr]", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-slate-700", htmlFor: "listing-select", children: "Farmer listing" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              id: "listing-select",
              value: selectedListing?.id ?? "",
              onChange: (event) => {
                setSelectedListingId(event.target.value);
                setResult(null);
              },
              className: "mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm",
              children: listings.map((listing) => /* @__PURE__ */ jsxs("option", { value: listing.id, children: [
                listing.title,
                " - ",
                listing.location
              ] }, listing.id))
            }
          )
        ] }),
        selectedListing ? /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-lg border border-slate-200", children: [
          selectedListing.image_url ? /* @__PURE__ */ jsx(
            "img",
            {
              src: selectedListing.image_url,
              alt: selectedListing.title,
              className: "h-64 w-full object-cover"
            }
          ) : /* @__PURE__ */ jsxs("div", { className: "flex h-64 flex-col items-center justify-center bg-slate-50 text-slate-500", children: [
            /* @__PURE__ */ jsx(ImageOff, { size: 28 }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm", children: "No Supabase image linked to this listing." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-950", children: selectedListing.title }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: selectedListing.biomass_type })
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: statusVariant(selectedListing.status), children: selectedListing.status })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 text-sm sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                selectedListing.quantity_kg.toLocaleString(),
                " kg"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                selectedListing.price_per_kg.toFixed(2),
                " TND/kg"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Quality ",
                selectedListing.quality_score ?? "N/A"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Moisture ",
                selectedListing.moisture_level ?? "N/A",
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1 text-sm text-slate-600", children: [
              /* @__PURE__ */ jsx(MapPin, { size: 15 }),
              " ",
              selectedListing.location
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: scanBusy,
                className: "inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60",
                children: [
                  /* @__PURE__ */ jsx(ScanSearch, { size: 16 }),
                  scanBusy ? "Scanning..." : "Scan selected listing"
                ]
              }
            )
          ] })
        ] }) : null
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-slate-500", children: "Scan result" }),
        result ? /* @__PURE__ */ jsxs("div", { className: "mt-5 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-slate-500", children: "Type" }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 font-semibold text-slate-950", children: result.biomassType })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-slate-500", children: "Confidence" }),
              /* @__PURE__ */ jsxs("p", { className: "mt-2 font-semibold text-slate-950", children: [
                Math.round(result.confidence * 100),
                "%"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-slate-500", children: "Estimated value" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-xl font-semibold text-slate-950", children: formatMoney(result.estimatedTotalPrice) }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-slate-500", children: [
              formatMoney(result.estimatedPricePerKg),
              " / kg"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-slate-500", children: "CO2e avoided" }),
              /* @__PURE__ */ jsxs("p", { className: "mt-2 font-semibold text-slate-950", children: [
                result.carbonSavedKg.toLocaleString(),
                " kg"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-slate-500", children: "Health risk reduction" }),
              /* @__PURE__ */ jsxs("p", { className: "mt-2 font-semibold text-slate-950", children: [
                result.healthRiskReduction,
                "/100"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-emerald-100 bg-emerald-50 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-emerald-700", children: "Recommendation" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-medium leading-6 text-emerald-900", children: result.recommendation })
          ] })
        ] }) : /* @__PURE__ */ jsx("p", { className: "mt-5 text-sm leading-6 text-slate-600", children: "Select one of the existing farmer listings and scan it. This page reads stored Supabase listing data and images only." })
      ] }) })
    ] })
  ] });
}

const $$ScanDechets = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Scan d\xE9chets", "subtitle": "Analysez un lot de d\xE9chets agricoles et estimez sa valeur de valorisation.", "role": "health_actor" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ScanDechetsDashboard", ScanDechetsDashboard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/dashboards/ScanDechetsDashboard", "client:component-export": "default" })} ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/dashboard/scan-dechets.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/dashboard/scan-dechets.astro";
const $$url = "/dashboard/scan-dechets";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ScanDechets,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
