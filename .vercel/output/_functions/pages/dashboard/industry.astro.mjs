import { e as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { L as LoadingState, E as EmptyState } from '../../chunks/LoadingState_DsPIB6ym.mjs';
import { a as getCurrentProfile } from '../../chunks/auth_DwlCj7dW.mjs';
import { g as getTransactionsForUser } from '../../chunks/transactions_BwQG0AvW.mjs';
import { ShoppingCart, CheckCircle2, ReceiptText, Store } from 'lucide-react';
import { S as StatCard } from '../../chunks/StatCard_CuLZLHBx.mjs';
import { B as Badge } from '../../chunks/Badge_CSrJEJIS.mjs';
import { $ as $$DashboardLayout } from '../../chunks/DashboardLayout_DNSv8d_E.mjs';
export { renderers } from '../../renderers.mjs';

function IndustryDashboard({ transactions }) {
  const activeOrders = transactions.filter((transaction) => !["completed", "cancelled"].includes(transaction.status)).length;
  const completed = transactions.filter((transaction) => transaction.status === "completed").length;
  const totalSpend = transactions.reduce((sum, transaction) => sum + transaction.total_price, 0);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsx(StatCard, { title: "Active orders", value: activeOrders, icon: /* @__PURE__ */ jsx(ShoppingCart, { size: 20 }) }),
      /* @__PURE__ */ jsx(StatCard, { title: "Completed purchases", value: completed, icon: /* @__PURE__ */ jsx(CheckCircle2, { size: 20 }) }),
      /* @__PURE__ */ jsx(StatCard, { title: "Recorded spend", value: `${totalSpend.toLocaleString()} TND`, icon: /* @__PURE__ */ jsx(ReceiptText, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "Organisation verification" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Buyer actions are tied to an organization profile and logged as secure transaction events." })
      ] }),
      /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Verified demo buyer" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-emerald-100 bg-emerald-50/80 p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "Buy lots from Marketplace" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-emerald-900", children: "Available farmer lots are separated from this dashboard. Use Marketplace to review lots and create purchase requests." })
      ] }),
      /* @__PURE__ */ jsxs("a", { href: "/marketplace", className: "inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700", children: [
        /* @__PURE__ */ jsx(Store, { size: 16 }),
        "Open Marketplace"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b border-slate-200 p-5", children: /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "My transactions" }) }),
      /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 text-slate-500", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "p-3", children: "Transaction" }),
          /* @__PURE__ */ jsx("th", { className: "p-3", children: "Quantity" }),
          /* @__PURE__ */ jsx("th", { className: "p-3", children: "Total" }),
          /* @__PURE__ */ jsx("th", { className: "p-3", children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: transactions.map((transaction) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-slate-100", children: [
          /* @__PURE__ */ jsx("td", { className: "p-3 font-mono text-xs", children: transaction.id.slice(0, 8) }),
          /* @__PURE__ */ jsxs("td", { className: "p-3", children: [
            transaction.quantity_kg.toLocaleString(),
            " kg"
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "p-3", children: [
            transaction.total_price.toLocaleString(),
            " TND"
          ] }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsx(Badge, { variant: "info", children: transaction.status }) })
        ] }, transaction.id)) })
      ] })
    ] })
  ] });
}

function IndustryDashboardData() {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) throw new Error("Login required.");
      if (currentProfile.role !== "industry" && currentProfile.role !== "admin") throw new Error("Industry access required.");
      const industryTransactions = await getTransactionsForUser(currentProfile.id, "industry");
      setProfile(currentProfile);
      setTransactions(industryTransactions);
    }
    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load industry dashboard.")).finally(() => setLoading(false));
  }, []);
  if (loading) return /* @__PURE__ */ jsx(LoadingState, { label: "Loading industry dashboard" });
  if (error || !profile) return /* @__PURE__ */ jsx(EmptyState, { title: "Industry dashboard unavailable", description: error || "Login required." });
  return /* @__PURE__ */ jsx(IndustryDashboard, { transactions });
}

const $$Industry = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Industry dashboard", "subtitle": "Source biomass, create purchase transactions, and track carbon impact.", "role": "industry" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "IndustryDashboardData", IndustryDashboardData, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/dashboards/IndustryDashboardData", "client:component-export": "default" })} ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/dashboard/industry.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/dashboard/industry.astro";
const $$url = "/dashboard/industry";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Industry,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
