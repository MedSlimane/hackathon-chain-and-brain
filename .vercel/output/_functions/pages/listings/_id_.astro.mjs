import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead } from '../../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { B as BlockchainTimeline, b as getBlockchainRecords } from '../../chunks/BlockchainTimeline_RbMhdE0n.mjs';
import { T as TransactionHash } from '../../chunks/TransactionHash_Blr1Ney8.mjs';
import { HeartPulse, Brain } from 'lucide-react';
import { B as Badge } from '../../chunks/Badge_CSrJEJIS.mjs';
import { p as predictBiomassPrice, g as generateRecommendation } from '../../chunks/predictions_BIMbOfLY.mjs';
import { L as LoadingState, E as EmptyState } from '../../chunks/LoadingState_DsPIB6ym.mjs';
import { B as BiomassCard } from '../../chunks/BiomassCard_Zw-Hk2cX.mjs';
import { c as getListingById } from '../../chunks/listings_Di9Iuo7a.mjs';
import { $ as $$MainLayout } from '../../chunks/MainLayout_DjVgWa-b.mjs';
export { renderers } from '../../renderers.mjs';

function HealthRiskCard({
  pollutionLevel,
  respiratoryRisk,
  carbonSaved,
  healthBenefitScore
}) {
  const variant = respiratoryRisk >= 70 ? "danger" : respiratoryRisk >= 50 ? "warning" : "success";
  return /* @__PURE__ */ jsxs("article", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-lg font-semibold text-slate-950", children: [
        /* @__PURE__ */ jsx(HeartPulse, { size: 20 }),
        " Health impact"
      ] }),
      /* @__PURE__ */ jsxs(Badge, { variant, children: [
        respiratoryRisk,
        "/100 risk"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("dl", { className: "mt-4 grid grid-cols-2 gap-3 text-sm", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Pollution level" }),
        /* @__PURE__ */ jsxs("dd", { className: "font-semibold text-slate-950", children: [
          pollutionLevel,
          "/100"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "CO2e avoided" }),
        /* @__PURE__ */ jsxs("dd", { className: "font-semibold text-slate-950", children: [
          carbonSaved.toLocaleString(),
          " kg"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Health benefit" }),
        /* @__PURE__ */ jsxs("dd", { className: "font-semibold text-slate-950", children: [
          healthBenefitScore,
          "/100"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Data model" }),
        /* @__PURE__ */ jsx("dd", { className: "font-semibold text-slate-950", children: "Aggregated" })
      ] })
    ] })
  ] });
}

function PricePredictionCard({ listing }) {
  const prediction = predictBiomassPrice({
    biomassType: listing.biomass_type,
    quantityKg: listing.quantity_kg,
    location: listing.location,
    qualityScore: listing.quality_score,
    moistureLevel: listing.moisture_level,
    demandLevel: "medium",
    distanceKm: 40
  });
  return /* @__PURE__ */ jsxs("article", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-lg font-semibold text-slate-950", children: [
        /* @__PURE__ */ jsx(Brain, { size: 20 }),
        " AI price prediction"
      ] }),
      /* @__PURE__ */ jsxs(Badge, { variant: "info", children: [
        Math.round(prediction.confidence * 100),
        "% confidence"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-4 text-3xl font-semibold text-emerald-700", children: [
      prediction.predictedPricePerKg.toFixed(2),
      " TND/kg"
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-slate-500", children: [
      "Range: ",
      prediction.minPrice.toFixed(2),
      "-",
      prediction.maxPrice.toFixed(2),
      " TND/kg"
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-slate-600", children: prediction.explanation }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-900", children: generateRecommendation(listing) })
  ] });
}

function ListingDetailData({ id }) {
  const [listing, setListing] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const [nextListing, nextRecords] = await Promise.all([getListingById(id), getBlockchainRecords()]);
      setListing(nextListing);
      setRecords(nextRecords.filter((record) => record.entity_id === id || record.payload?.listing_id === id));
    }
    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load listing.")).finally(() => setLoading(false));
  }, [id]);
  if (loading) return /* @__PURE__ */ jsx(LoadingState, { label: "Loading live listing" });
  if (error || !listing) return /* @__PURE__ */ jsx(EmptyState, { title: "Listing unavailable", description: error || "Listing was not found." });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("a", { href: "/marketplace", className: "text-sm font-medium text-emerald-700 hover:text-emerald-800", children: "Back to marketplace" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-2 text-3xl font-semibold text-slate-950", children: listing.title }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-3xl text-slate-600", children: "Detailed marketplace view with AI estimates, environmental impact, and blockchain traceability." })
      ] }),
      /* @__PURE__ */ jsx(Badge, { variant: listing.status === "available" ? "success" : "warning", children: listing.status })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]", children: [
      /* @__PURE__ */ jsxs("aside", { className: "space-y-5 lg:sticky lg:top-24 lg:self-start", children: [
        /* @__PURE__ */ jsx(BiomassCard, { listing }),
        /* @__PURE__ */ jsxs("section", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-semibold text-slate-950", children: "Buyer action" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Request purchase from the industry dashboard and create a traceable transaction hash." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-2", children: [
            /* @__PURE__ */ jsx("a", { href: "/dashboard/industry", className: "rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-800", children: "Request Purchase" }),
            /* @__PURE__ */ jsx("a", { href: "/dashboard/farmer", className: "rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-50", children: "Farmer dashboard" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("section", { className: "rounded-lg border border-slate-200 bg-white p-6 shadow-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-start justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-wide text-emerald-700", children: listing.biomass_type }),
            /* @__PURE__ */ jsx("h2", { className: "mt-2 text-2xl font-semibold text-slate-950", children: "Listing overview" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-2xl text-slate-600", children: listing.description })
          ] }) }),
          /* @__PURE__ */ jsxs("dl", { className: "mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-slate-50 p-3", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm text-slate-500", children: "Quantity" }),
              /* @__PURE__ */ jsxs("dd", { className: "mt-1 font-semibold text-slate-950", children: [
                listing.quantity_kg.toLocaleString(),
                " kg"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-slate-50 p-3", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm text-slate-500", children: "Price" }),
              /* @__PURE__ */ jsxs("dd", { className: "mt-1 font-semibold text-slate-950", children: [
                listing.price_per_kg.toFixed(2),
                " TND/kg"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-slate-50 p-3", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm text-slate-500", children: "Location" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 font-semibold text-slate-950", children: listing.location })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-slate-50 p-3", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm text-slate-500", children: "Batch hash" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1", children: /* @__PURE__ */ jsx(TransactionHash, { hash: listing.blockchain_batch_hash }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-2", children: [
          /* @__PURE__ */ jsx(PricePredictionCard, { listing }),
          /* @__PURE__ */ jsx(HealthRiskCard, { pollutionLevel: 65, respiratoryRisk: listing.health_risk_reduction_score, carbonSaved: listing.carbon_saved_kg, healthBenefitScore: listing.health_risk_reduction_score })
        ] }),
        /* @__PURE__ */ jsx(BlockchainTimeline, { records })
      ] })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$id = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Listing | AgriConnect Smart" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"> ${renderComponent($$result2, "ListingDetailData", ListingDetailData, { "id": id, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/marketplace/ListingDetailData", "client:component-export": "default" })} </main> ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/listings/[id].astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/listings/[id].astro";
const $$url = "/listings/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
