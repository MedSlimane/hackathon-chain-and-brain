import { e as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { L as LoadingState, E as EmptyState } from '../../chunks/LoadingState_DsPIB6ym.mjs';
import { B as BlockchainTimeline, g as getProfiles, a as getSecurityLogs, b as getBlockchainRecords, c as getAiPredictionLogs } from '../../chunks/BlockchainTimeline_RbMhdE0n.mjs';
import { a as getCurrentProfile } from '../../chunks/auth_DwlCj7dW.mjs';
import { a as getListingsForCurrentUser } from '../../chunks/listings_Di9Iuo7a.mjs';
import { a as getAllTransactions } from '../../chunks/transactions_BwQG0AvW.mjs';
import { Users, Database, Activity, ShieldAlert } from 'lucide-react';
import { S as StatCard } from '../../chunks/StatCard_CuLZLHBx.mjs';
import { B as Badge } from '../../chunks/Badge_CSrJEJIS.mjs';
import { $ as $$DashboardLayout } from '../../chunks/DashboardLayout_DNSv8d_E.mjs';
export { renderers } from '../../renderers.mjs';

function variantForSeverity(severity) {
  if (severity === "critical" || severity === "high") return "danger";
  if (severity === "medium") return "warning";
  return "success";
}
function SecurityAlerts({ alerts }) {
  return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b border-slate-200 p-5", children: /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "Security alerts" }) }),
    /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-100", children: alerts.map((alert) => /* @__PURE__ */ jsxs("div", { className: "grid gap-3 p-4 md:grid-cols-[140px_1fr_180px] md:items-center", children: [
      /* @__PURE__ */ jsx(Badge, { variant: variantForSeverity(alert.severity), children: alert.severity }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-950", children: alert.event_type.replaceAll("_", " ") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: JSON.stringify(alert.details) })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 md:text-right", children: new Date(alert.created_at).toLocaleString() })
    ] }, alert.id)) })
  ] });
}

function AdminDashboard({
  profiles,
  listings,
  transactions,
  securityLogs,
  blockchainRecords,
  predictions
}) {
  const highAlerts = securityLogs.filter((log) => ["high", "critical"].includes(log.severity)).length;
  const byRole = profiles.reduce((acc, profile) => ({ ...acc, [profile.role]: (acc[profile.role] ?? 0) + 1 }), {});
  const suspiciousListings = listings.filter((listing) => listing.predicted_price_per_kg && listing.price_per_kg > listing.predicted_price_per_kg * 1.2);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { title: "Total users", value: profiles.length, icon: /* @__PURE__ */ jsx(Users, { size: 20 }) }),
      /* @__PURE__ */ jsx(StatCard, { title: "Total listings", value: listings.length, icon: /* @__PURE__ */ jsx(Database, { size: 20 }) }),
      /* @__PURE__ */ jsx(StatCard, { title: "Transactions", value: transactions.length, icon: /* @__PURE__ */ jsx(Activity, { size: 20 }) }),
      /* @__PURE__ */ jsx(StatCard, { title: "High alerts", value: highAlerts, icon: /* @__PURE__ */ jsx(ShieldAlert, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "Users by role" }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: Object.entries(byRole).map(([role, count]) => /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-slate-50 p-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: role }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-slate-950", children: count })
        ] }, role)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "Suspicious listings" }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-3", children: suspiciousListings.length > 0 ? suspiciousListings.map((listing) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-md bg-red-50 p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-red-950", children: listing.title }),
          /* @__PURE__ */ jsx(Badge, { variant: "danger", children: "price anomaly" })
        ] }, listing.id)) : /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "No suspicious listings in demo data." }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-red-200 bg-red-50 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-red-900", children: "AI anomaly detection" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-semibold text-red-950", children: suspiciousListings.length + highAlerts }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-800", children: "Suspicious listings and high severity alerts." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-sky-200 bg-sky-50 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-sky-900", children: "Global security control" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-semibold text-sky-950", children: securityLogs.length }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-sky-800", children: "Logs available for platform supervision." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-200 bg-slate-50 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-900", children: "Verifiable history" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-semibold text-slate-950", children: blockchainRecords.length }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-700", children: "Blockchain records across listings and transactions." })
      ] })
    ] }),
    /* @__PURE__ */ jsx(SecurityAlerts, { alerts: securityLogs }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsx(BlockchainTimeline, { records: blockchainRecords.slice(0, 6) }),
      /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-slate-200 p-5", children: /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "AI prediction logs" }) }),
        predictions.map((prediction) => /* @__PURE__ */ jsxs("div", { className: "border-b border-slate-100 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-950", children: prediction.prediction_type }),
            /* @__PURE__ */ jsxs(Badge, { variant: "info", children: [
              Math.round(prediction.confidence * 100),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 font-mono text-xs text-slate-500", children: prediction.entity_id })
        ] }, prediction.id))
      ] })
    ] })
  ] });
}

function AdminDashboardData() {
  const [profiles, setProfiles] = useState([]);
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [blockchainRecords, setBlockchainRecords] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const profile = await getCurrentProfile();
      if (!profile) throw new Error("Login required.");
      if (profile.role !== "admin") throw new Error("Admin access required.");
      const [nextProfiles, nextListings, nextTransactions, nextLogs, nextRecords, nextPredictions] = await Promise.all([
        getProfiles(),
        getListingsForCurrentUser(),
        getAllTransactions(),
        getSecurityLogs(),
        getBlockchainRecords(),
        getAiPredictionLogs()
      ]);
      setProfiles(nextProfiles);
      setListings(nextListings);
      setTransactions(nextTransactions);
      setSecurityLogs(nextLogs);
      setBlockchainRecords(nextRecords);
      setPredictions(nextPredictions);
    }
    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load admin dashboard.")).finally(() => setLoading(false));
  }, []);
  if (loading) return /* @__PURE__ */ jsx(LoadingState, { label: "Loading admin dashboard" });
  if (error) return /* @__PURE__ */ jsx(EmptyState, { title: "Admin dashboard unavailable", description: error });
  return /* @__PURE__ */ jsx(
    AdminDashboard,
    {
      profiles,
      listings,
      transactions,
      securityLogs,
      blockchainRecords,
      predictions
    }
  );
}

const $$Admin = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Admin and security dashboard", "subtitle": "Review platform activity, anomaly logs, blockchain records, and AI prediction history.", "role": "admin" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminDashboardData", AdminDashboardData, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/dashboards/AdminDashboardData", "client:component-export": "default" })} ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/dashboard/admin.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/dashboard/admin.astro";
const $$url = "/dashboard/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Admin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
