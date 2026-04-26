import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { TrendingUp, Leaf, BarChart3 } from 'lucide-react';
import { C as Card } from '../chunks/Card_BUbElGB8.mjs';
import { L as LoadingState, E as EmptyState } from '../chunks/LoadingState_DsPIB6ym.mjs';
import { S as StatCard } from '../chunks/StatCard_CuLZLHBx.mjs';
import { a as getCurrentProfile } from '../chunks/auth_DwlCj7dW.mjs';
import { g as getListingsByFarmer } from '../chunks/listings_Di9Iuo7a.mjs';
import { g as getTransactionsForUser } from '../chunks/transactions_BwQG0AvW.mjs';
import { $ as $$DashboardLayout } from '../chunks/DashboardLayout_DNSv8d_E.mjs';
export { renderers } from '../renderers.mjs';

function AnalyticsOverview() {
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) throw new Error("Login required.");
      const [nextListings, nextTransactions] = currentProfile.role === "farmer" ? await Promise.all([
        getListingsByFarmer(currentProfile.id),
        getTransactionsForUser(currentProfile.id, "farmer")
      ]) : [[], []];
      setProfile(currentProfile);
      setListings(nextListings);
      setTransactions(nextTransactions);
    }
    load().catch(
      (err) => setError(err instanceof Error ? err.message : "Unable to load analytics.")
    ).finally(() => setLoading(false));
  }, []);
  if (loading) return /* @__PURE__ */ jsx(LoadingState, { label: "Loading analytics" });
  if (error || !profile) {
    return /* @__PURE__ */ jsx(EmptyState, { title: "Analytics unavailable", description: error || "Login required." });
  }
  const totalRevenue = transactions.reduce((sum, item) => sum + item.total_price, 0);
  const totalCarbon = listings.reduce((sum, item) => sum + item.carbon_saved_kg, 0);
  const performanceBars = [34, 48, 51, 44, 62, 67, 71, 59];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsx(StatCard, { title: "Revenue Trend", value: `${totalRevenue.toLocaleString()} TND`, icon: /* @__PURE__ */ jsx(TrendingUp, { size: 20 }) }),
      /* @__PURE__ */ jsx(StatCard, { title: "Carbon Score", value: `${totalCarbon.toLocaleString()} kg`, icon: /* @__PURE__ */ jsx(Leaf, { size: 20 }) }),
      /* @__PURE__ */ jsx(StatCard, { title: "Data Points", value: listings.length + transactions.length, icon: /* @__PURE__ */ jsx(BarChart3, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700", children: "Chart Placeholder" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-2 text-xl font-semibold text-slate-950", children: "Weekly performance snapshot" }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,#f8fafc,#effaf5)] p-5", children: /* @__PURE__ */ jsx("div", { className: "flex items-end gap-3", children: performanceBars.map((height, index) => /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-52 w-full items-end rounded-2xl bg-white/70 p-2", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-full rounded-xl bg-gradient-to-t from-emerald-600 to-emerald-300",
            style: { height: `${height}%` }
          }
        ) }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-slate-400", children: [
          "Q",
          index + 1
        ] })
      ] }, index)) }) })
    ] })
  ] });
}

const $$Analytics = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Analytics", "subtitle": "Review performance trends, revenue signals, and sustainability metrics." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AnalyticsOverview", AnalyticsOverview, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/dashboard/AnalyticsOverview", "client:component-export": "default" })} ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/analytics.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/analytics.astro";
const $$url = "/analytics";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Analytics,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
