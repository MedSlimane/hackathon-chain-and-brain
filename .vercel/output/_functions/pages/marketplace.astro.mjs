import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo, useEffect } from 'react';
import { E as EmptyState, L as LoadingState } from '../chunks/LoadingState_DsPIB6ym.mjs';
import { a as getCurrentProfile } from '../chunks/auth_DwlCj7dW.mjs';
import { e as getAvailableListings } from '../chunks/listings_Di9Iuo7a.mjs';
import { b as createTransactionHash } from '../chunks/blockchain_SnXJwiuI.mjs';
import { l as logSecurityEvent, a as detectTransactionAnomaly } from '../chunks/security_CFiqUYzX.mjs';
import { c as createTransaction, u as updateTransaction } from '../chunks/transactions_BwQG0AvW.mjs';
import { B as BiomassCard } from '../chunks/BiomassCard_Zw-Hk2cX.mjs';
import { $ as $$DashboardLayout } from '../chunks/DashboardLayout_DNSv8d_E.mjs';
export { renderers } from '../renderers.mjs';

function filterListings(listings, filters) {
  const search = filters.search.toLowerCase();
  const filtered = listings.filter((listing) => {
    const matchesSearch = !search || `${listing.title} ${listing.biomass_type} ${listing.location}`.toLowerCase().includes(search);
    const matchesType = !filters.type || listing.biomass_type === filters.type;
    const matchesLocation = !filters.location || listing.location === filters.location;
    const matchesPrice = !filters.maxPrice || listing.price_per_kg <= Number(filters.maxPrice);
    return matchesSearch && matchesType && matchesLocation && matchesPrice;
  });
  return filtered.sort((a, b) => {
    if (filters.sort === "price") return a.price_per_kg - b.price_per_kg;
    if (filters.sort === "quantity") return b.quantity_kg - a.quantity_kg;
    if (filters.sort === "carbon") return b.carbon_saved_kg - a.carbon_saved_kg;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
function BiomassFilters({
  filters,
  onChange,
  types,
  locations
}) {
  const set = (key, value) => onChange({ ...filters, [key]: value });
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5", children: [
    /* @__PURE__ */ jsx("input", { className: "rounded-md border border-slate-300 px-3 py-2 text-sm", placeholder: "Search biomass", value: filters.search, onChange: (event) => set("search", event.target.value) }),
    /* @__PURE__ */ jsxs("select", { className: "rounded-md border border-slate-300 px-3 py-2 text-sm", value: filters.type, onChange: (event) => set("type", event.target.value), children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "All types" }),
      types.map((type) => /* @__PURE__ */ jsx("option", { value: type, children: type }, type))
    ] }),
    /* @__PURE__ */ jsxs("select", { className: "rounded-md border border-slate-300 px-3 py-2 text-sm", value: filters.location, onChange: (event) => set("location", event.target.value), children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "All regions" }),
      locations.map((location) => /* @__PURE__ */ jsx("option", { value: location, children: location }, location))
    ] }),
    /* @__PURE__ */ jsx("input", { className: "rounded-md border border-slate-300 px-3 py-2 text-sm", placeholder: "Max TND/kg", type: "number", min: "0", step: "0.01", value: filters.maxPrice, onChange: (event) => set("maxPrice", event.target.value) }),
    /* @__PURE__ */ jsxs("select", { className: "rounded-md border border-slate-300 px-3 py-2 text-sm", value: filters.sort, onChange: (event) => set("sort", event.target.value), children: [
      /* @__PURE__ */ jsx("option", { value: "newest", children: "Newest" }),
      /* @__PURE__ */ jsx("option", { value: "price", children: "Price" }),
      /* @__PURE__ */ jsx("option", { value: "quantity", children: "Quantity" }),
      /* @__PURE__ */ jsx("option", { value: "carbon", children: "Carbon saved" })
    ] })
  ] });
}

function MarketplaceView({ buyerId, listings }) {
  const [filters, setFilters] = useState({ search: "", type: "", location: "", sort: "newest", maxPrice: "" });
  const [message, setMessage] = useState("");
  const [busyListingId, setBusyListingId] = useState("");
  const types = Array.from(new Set(listings.map((listing) => listing.biomass_type)));
  const locations = Array.from(new Set(listings.map((listing) => listing.location)));
  const visibleListings = useMemo(() => filterListings(listings, filters), [listings, filters]);
  async function requestPurchase(listing) {
    setBusyListingId(listing.id);
    setMessage("");
    try {
      const transaction = await createTransaction({
        listing_id: listing.id,
        farmer_id: listing.farmer_id,
        industry_id: buyerId,
        quantity_kg: Math.min(1e3, listing.quantity_kg),
        agreed_price_per_kg: listing.price_per_kg,
        delivery_location: "Industry receiving site"
      });
      const hash = await createTransactionHash(transaction);
      await updateTransaction(transaction.id, { blockchain_transaction_hash: hash });
      await logSecurityEvent({
        userId: buyerId,
        eventType: "transaction_created",
        details: { transaction_id: transaction.id, listing_id: listing.id, hash }
      });
      for (const alert of detectTransactionAnomaly(transaction)) {
        await logSecurityEvent({
          userId: buyerId,
          eventType: alert.eventType,
          severity: alert.severity,
          details: { reason: alert.reason, listing_id: listing.id }
        });
      }
      setMessage("Purchase request created from Marketplace with a traceable transaction hash.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to request purchase.");
    } finally {
      setBusyListingId("");
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(BiomassFilters, { filters, onChange: setFilters, types, locations }),
    message ? /* @__PURE__ */ jsx("div", { className: "rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900", children: message }) : null,
    visibleListings.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid gap-5 md:grid-cols-2 xl:grid-cols-3", children: visibleListings.map((listing) => /* @__PURE__ */ jsx(
      BiomassCard,
      {
        listing,
        onRequestPurchase: requestPurchase,
        purchaseBusy: busyListingId === listing.id
      },
      listing.id
    )) }) : /* @__PURE__ */ jsx(EmptyState, { title: "No listings match these filters", description: "Try a different biomass type, region, or price range." })
  ] });
}

function MarketplaceData() {
  const [buyerId, setBuyerId] = useState("");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const profile = await getCurrentProfile();
      if (!profile) throw new Error("Login required.");
      if (profile.role !== "industry" && profile.role !== "admin") {
        throw new Error("Marketplace purchases are available for industry buyers only.");
      }
      const availableListings = await getAvailableListings();
      setBuyerId(profile.id);
      setListings(availableListings);
    }
    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load marketplace.")).finally(() => setLoading(false));
  }, []);
  if (loading) return /* @__PURE__ */ jsx(LoadingState, { label: "Loading live Supabase listings" });
  if (error) return /* @__PURE__ */ jsx(EmptyState, { title: "Unable to load marketplace", description: error });
  return /* @__PURE__ */ jsx(MarketplaceView, { buyerId, listings });
}

const $$Marketplace = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Marketplace", "subtitle": "Find traceable biomass lots published by farmers, with AI price estimates and regional context.", "role": "industry" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MarketplaceData", MarketplaceData, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/marketplace/MarketplaceData", "client:component-export": "default" })} ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/marketplace.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/marketplace.astro";
const $$url = "/marketplace";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Marketplace,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
