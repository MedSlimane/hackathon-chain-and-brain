import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { Store, Boxes, Leaf } from 'lucide-react';
import { B as Badge } from '../chunks/Badge_CSrJEJIS.mjs';
import { C as Card } from '../chunks/Card_BUbElGB8.mjs';
import { L as LoadingState, E as EmptyState } from '../chunks/LoadingState_DsPIB6ym.mjs';
import { S as StatCard } from '../chunks/StatCard_CuLZLHBx.mjs';
import { C as CreateListingForm } from '../chunks/CreateListingForm_BC5hVdwc.mjs';
import { a as getCurrentProfile } from '../chunks/auth_DwlCj7dW.mjs';
import { g as getListingsByFarmer } from '../chunks/listings_Di9Iuo7a.mjs';
import { $ as $$DashboardLayout } from '../chunks/DashboardLayout_DNSv8d_E.mjs';
export { renderers } from '../renderers.mjs';

function ListingsOverview() {
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) throw new Error("Login required.");
      if (currentProfile.role !== "farmer" && currentProfile.role !== "admin") {
        throw new Error("Farmer listing access required.");
      }
      const nextListings = await getListingsByFarmer(currentProfile.id);
      setProfile(currentProfile);
      setListings(nextListings);
    }
    load().catch(
      (err) => setError(err instanceof Error ? err.message : "Unable to load listings.")
    ).finally(() => setLoading(false));
  }, []);
  if (loading) return /* @__PURE__ */ jsx(LoadingState, { label: "Loading listings" });
  if (error || !profile) {
    return /* @__PURE__ */ jsx(EmptyState, { title: "Listings unavailable", description: error || "Login required." });
  }
  const availableCount = listings.filter((listing) => listing.status === "available").length;
  const totalCarbon = listings.reduce((sum, listing) => sum + listing.carbon_saved_kg, 0);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    profile.role === "farmer" ? /* @__PURE__ */ jsx("div", { id: "create-listing", children: /* @__PURE__ */ jsx(CreateListingForm, { farmerId: profile.id }) }) : null,
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsx(StatCard, { title: "Listing Count", value: listings.length, icon: /* @__PURE__ */ jsx(Store, { size: 20 }) }),
      /* @__PURE__ */ jsx(StatCard, { title: "Available Lots", value: availableCount, icon: /* @__PURE__ */ jsx(Boxes, { size: 20 }) }),
      /* @__PURE__ */ jsx(StatCard, { title: "Carbon Saved", value: `${totalCarbon.toLocaleString()} kg`, icon: /* @__PURE__ */ jsx(Leaf, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "border-b border-slate-200/80 px-6 py-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700", children: "Listings" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 text-xl font-semibold text-slate-950", children: "Biomass inventory" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50/80 text-slate-500", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Title" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Type" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Quantity" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: listings.map((listing) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-slate-100", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 font-medium text-slate-950", children: listing.title }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-slate-600", children: listing.biomass_type }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 text-slate-600", children: [
            listing.quantity_kg.toLocaleString(),
            " kg"
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(Badge, { variant: listing.status === "available" ? "success" : "warning", children: listing.status }) })
        ] }, listing.id)) })
      ] }) })
    ] })
  ] });
}

const $$Listings = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "My Listings", "subtitle": "Manage biomass inventory, lot status, and carbon impact from one place." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ListingsOverview", ListingsOverview, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/dashboard/ListingsOverview", "client:component-export": "default" })} ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/listings.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/listings.astro";
const $$url = "/listings";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Listings,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
