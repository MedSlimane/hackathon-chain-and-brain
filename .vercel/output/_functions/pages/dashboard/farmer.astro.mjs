import { e as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { L as LoadingState, E as EmptyState } from '../../chunks/LoadingState_DsPIB6ym.mjs';
import { a as getCurrentProfile } from '../../chunks/auth_DwlCj7dW.mjs';
import { g as getListingsByFarmer } from '../../chunks/listings_Di9Iuo7a.mjs';
import { g as getTransactionsForUser } from '../../chunks/transactions_BwQG0AvW.mjs';
import { ArrowUpRight, Leaf, RefreshCcw, Package, Lightbulb, DollarSign, ReceiptText } from 'lucide-react';
import { B as Badge } from '../../chunks/Badge_CSrJEJIS.mjs';
import { C as Card } from '../../chunks/Card_BUbElGB8.mjs';
import { S as StatCard } from '../../chunks/StatCard_CuLZLHBx.mjs';
import { C as CreateListingForm } from '../../chunks/CreateListingForm_BC5hVdwc.mjs';
import { g as generateRecommendation } from '../../chunks/predictions_BIMbOfLY.mjs';
import { $ as $$DashboardLayout } from '../../chunks/DashboardLayout_DNSv8d_E.mjs';
export { renderers } from '../../renderers.mjs';

const activityStyles = {
  listing: {
    icon: Package,
    tone: "bg-emerald-50 text-emerald-700"
  },
  transaction: {
    icon: RefreshCcw,
    tone: "bg-sky-50 text-sky-700"
  },
  carbon: {
    icon: Leaf,
    tone: "bg-lime-50 text-lime-700"
  }
};
function RecentActivity({ items }) {
  return /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700", children: "Recent Activity" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 text-xl font-semibold text-slate-950", children: "Latest marketplace actions" })
      ] }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/transactions",
          className: "inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700",
          children: [
            "View all",
            /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 space-y-3", children: items.map((item) => {
      const style = activityStyles[item.type];
      const Icon = style.icon;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4",
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${style.tone}`,
                children: /* @__PURE__ */ jsx(Icon, { size: 18 })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-900", children: item.title }),
                /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap text-xs text-slate-400", children: item.time })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-6 text-slate-500", children: item.description })
            ] })
          ]
        },
        item.id
      );
    }) })
  ] });
}

function RecommendationCard({ title = "Recommendation", recommendation }) {
  return /* @__PURE__ */ jsxs("article", { className: "rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950", children: [
    /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 font-semibold", children: [
      /* @__PURE__ */ jsx(Lightbulb, { size: 18 }),
      " ",
      title
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm", children: recommendation })
  ] });
}

function formatRelativeDate(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(date);
}
function buildRecentActivity(listings, transactions) {
  const listingItems = listings.slice(0, 3).map((listing) => ({
    id: `listing-${listing.id}`,
    title: `${listing.title} was updated`,
    description: `${listing.quantity_kg.toLocaleString()} kg listed at ${listing.price_per_kg.toFixed(2)} TND/kg.`,
    time: formatRelativeDate(listing.updated_at),
    type: "listing"
  }));
  const transactionItems = transactions.slice(0, 3).map((transaction) => ({
    id: `transaction-${transaction.id}`,
    title: `Transaction ${transaction.status}`,
    description: `${transaction.quantity_kg.toLocaleString()} kg for ${transaction.total_price.toLocaleString()} TND.`,
    time: formatRelativeDate(transaction.updated_at),
    type: "transaction"
  }));
  const carbonItems = listings.slice(0, 2).map((listing) => ({
    id: `carbon-${listing.id}`,
    title: `Carbon impact recorded for ${listing.biomass_type}`,
    description: `${listing.carbon_saved_kg.toLocaleString()} kg CO2e avoided through traceable biomass reuse.`,
    time: formatRelativeDate(listing.created_at),
    type: "carbon"
  }));
  return [...transactionItems, ...listingItems, ...carbonItems].slice(0, 6);
}
function FarmerDashboard({
  farmerId,
  listings,
  transactions
}) {
  const totalListings = listings.length;
  const revenue = transactions.reduce(
    (sum, transaction) => sum + transaction.total_price,
    0
  );
  const activeTransactions = transactions.filter(
    (transaction) => transaction.status === "pending" || transaction.status === "accepted" || transaction.status === "in_delivery"
  ).length;
  const carbonImpact = listings.reduce(
    (sum, listing) => sum + listing.carbon_saved_kg,
    0
  );
  const chartBars = [45, 62, 58, 76, 64, 84, 72];
  const recentActivity = buildRecentActivity(listings, transactions);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "Total Listings",
          value: totalListings,
          icon: /* @__PURE__ */ jsx(Package, { size: 20 }),
          description: "Biomass lots currently managed in your workspace.",
          trend: "Live inventory"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "Total Revenue",
          value: `${revenue.toLocaleString()} TND`,
          icon: /* @__PURE__ */ jsx(DollarSign, { size: 20 }),
          description: "Combined value from recorded biomass transactions.",
          trend: "Updated automatically"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "Active Transactions",
          value: activeTransactions,
          icon: /* @__PURE__ */ jsx(ReceiptText, { size: 20 }),
          description: "Deals that still require confirmation, delivery, or closure.",
          trend: "Operational focus"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "Carbon Impact",
          value: `${carbonImpact.toLocaleString()} kg`,
          icon: /* @__PURE__ */ jsx(Leaf, { size: 20 }),
          description: "Estimated emissions avoided through traceable reuse.",
          trend: "Sustainability metric"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-[1.3fr_0.7fr]", children: [
      /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700", children: "Analytics" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-2 text-xl font-semibold text-slate-950", children: "Marketplace performance" })
          ] }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "/analytics",
              className: "inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700",
              children: [
                "Open analytics",
                /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,#f8fafc,#effaf5)] p-5", children: /* @__PURE__ */ jsx("div", { className: "flex items-end gap-3", children: chartBars.map((height, index) => /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-44 w-full items-end rounded-2xl bg-white/70 p-2", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-full rounded-xl bg-gradient-to-t from-emerald-600 to-emerald-300",
              style: { height: `${height}%` }
            }
          ) }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-slate-400", children: [
            "W",
            index + 1
          ] })
        ] }, index)) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700", children: "AI Guidance" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 text-xl font-semibold text-slate-950", children: "Smart operational tips" }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 space-y-3", children: listings.slice(0, 3).map((listing) => /* @__PURE__ */ jsx(
          RecommendationCard,
          {
            title: listing.biomass_type,
            recommendation: generateRecommendation(listing)
          },
          listing.id
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-[1.15fr_0.85fr]", children: [
      /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-slate-200/80 px-6 py-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700", children: "My Listings" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-2 text-xl font-semibold text-slate-950", children: "Current inventory overview" })
          ] }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "/listings",
              className: "text-sm font-medium text-emerald-700 transition hover:text-emerald-800",
              children: "Manage all"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full text-left text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-slate-50/80 text-slate-500", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Listing" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Quantity" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Price" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: listings.map((listing) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-slate-100", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-950", children: listing.title }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-slate-500", children: listing.biomass_type })
            ] }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 text-slate-600", children: [
              listing.quantity_kg.toLocaleString(),
              " kg"
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 text-slate-600", children: [
              listing.price_per_kg.toFixed(2),
              " TND/kg"
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(
              Badge,
              {
                variant: listing.status === "available" ? "success" : "warning",
                children: listing.status
              }
            ) })
          ] }, listing.id)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(RecentActivity, { items: recentActivity })
    ] }),
    /* @__PURE__ */ jsx("div", { id: "create-listing", children: /* @__PURE__ */ jsx(CreateListingForm, { farmerId }) })
  ] });
}

function FarmerDashboardData() {
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) throw new Error("Login required.");
      if (currentProfile.role !== "farmer" && currentProfile.role !== "admin") throw new Error("Farmer access required.");
      const [farmerListings, farmerTransactions] = await Promise.all([
        getListingsByFarmer(currentProfile.id),
        getTransactionsForUser(currentProfile.id, "farmer")
      ]);
      setProfile(currentProfile);
      setListings(farmerListings);
      setTransactions(farmerTransactions);
    }
    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load farmer dashboard.")).finally(() => setLoading(false));
  }, []);
  if (loading) return /* @__PURE__ */ jsx(LoadingState, { label: "Loading farmer dashboard" });
  if (error || !profile) return /* @__PURE__ */ jsx(EmptyState, { title: "Farmer dashboard unavailable", description: error || "Login required." });
  return /* @__PURE__ */ jsx(FarmerDashboard, { farmerId: profile.id, listings, transactions });
}

const $$Farmer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Farmer dashboard", "subtitle": "Create biomass listings and track revenue, carbon, and AI recommendations.", "role": "farmer" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "FarmerDashboardData", FarmerDashboardData, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/dashboards/FarmerDashboardData", "client:component-export": "default" })} ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/dashboard/farmer.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/dashboard/farmer.astro";
const $$url = "/dashboard/farmer";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Farmer,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
