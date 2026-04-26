import { e as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { TriangleAlert, Activity, HeartPulse, CloudSun } from 'lucide-react';
import { B as Badge } from '../../chunks/Badge_CSrJEJIS.mjs';
import { L as LoadingState, E as EmptyState } from '../../chunks/LoadingState_DsPIB6ym.mjs';
import { S as StatCard } from '../../chunks/StatCard_CuLZLHBx.mjs';
import { s as supabase, a as getCurrentProfile } from '../../chunks/auth_DwlCj7dW.mjs';
import { $ as $$DashboardLayout } from '../../chunks/DashboardLayout_DNSv8d_E.mjs';
export { renderers } from '../../renderers.mjs';

async function getPollutionReports() {
  const { data, error } = await supabase.from("pollution_reports").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
async function getHealthIndicators() {
  const { data, error } = await supabase.from("health_indicators").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
function riskVariant(score) {
  if (score > 65) return "danger";
  if (score > 40) return "warning";
  return "success";
}
function HealthRiskPage({
  reports,
  indicators
}) {
  const riskRows = useMemo(() => {
    const reportsByRegion = /* @__PURE__ */ new Map();
    reports.forEach((report) => {
      reportsByRegion.set(report.region, [...reportsByRegion.get(report.region) ?? [], report]);
    });
    return Array.from(reportsByRegion.entries()).map(([region, regionalReports]) => {
      const indicator = indicators.find((item) => item.region === region);
      const avgPollution = average(regionalReports.map((report) => report.pollution_level));
      const avgRespiratoryRisk = average(
        regionalReports.map((report) => report.respiratory_risk_score ?? 0)
      );
      const burnedWaste = regionalReports.reduce(
        (sum, report) => sum + report.burned_waste_estimate_kg,
        0
      );
      const healthRisk = indicator?.risk_score ?? avgRespiratoryRisk;
      const combinedRisk = Math.min(
        100,
        Math.round(avgPollution * 0.35 + healthRisk * 0.5 + burnedWaste / 1e4)
      );
      return {
        region,
        avgPollution,
        avgRespiratoryRisk,
        burnedWaste,
        respiratoryCases: indicator?.respiratory_cases ?? null,
        vulnerablePopulation: indicator?.vulnerable_population_estimate ?? null,
        combinedRisk,
        reportCount: regionalReports.length
      };
    }).sort((a, b) => b.combinedRisk - a.combinedRisk);
  }, [reports, indicators]);
  const highRiskCount = riskRows.filter((row) => row.combinedRisk > 65).length;
  const averageCombinedRisk = average(riskRows.map((row) => row.combinedRisk));
  const totalVulnerablePopulation = riskRows.reduce(
    (sum, row) => sum + (row.vulnerablePopulation ?? 0),
    0
  );
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "High-risk regions",
          value: highRiskCount,
          icon: /* @__PURE__ */ jsx(TriangleAlert, { size: 20 })
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "Avg combined risk",
          value: `${averageCombinedRisk}/100`,
          icon: /* @__PURE__ */ jsx(Activity, { size: 20 })
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "Vulnerable population",
          value: totalVulnerablePopulation.toLocaleString(),
          icon: /* @__PURE__ */ jsx(HeartPulse, { size: 20 })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "border-b border-slate-200 p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "Regional risk map" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Ranked by pollution, respiratory risk, health indicators, and waste-burning estimates." })
      ] }),
      riskRows.length ? /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-100", children: riskRows.map((row) => /* @__PURE__ */ jsxs("div", { className: "grid gap-4 p-4 lg:grid-cols-[1fr_auto]", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-950", children: row.region }),
            /* @__PURE__ */ jsxs(Badge, { variant: riskVariant(row.combinedRisk), children: [
              row.combinedRisk,
              "/100 combined risk"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "Pollution ",
              row.avgPollution,
              "/100"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Respiratory ",
              row.avgRespiratoryRisk,
              "/100"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Waste ",
              row.burnedWaste.toLocaleString(),
              " kg"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              row.reportCount,
              " reports"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 h-2 overflow-hidden rounded-full bg-slate-100", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full rounded-full bg-emerald-600",
              style: { width: `${row.combinedRisk}%` }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2 text-sm text-slate-500 sm:grid-cols-2 lg:min-w-56 lg:grid-cols-1", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Respiratory cases:",
            " ",
            row.respiratoryCases === null ? "N/A" : row.respiratoryCases.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Vulnerable population:",
            " ",
            row.vulnerablePopulation === null ? "N/A" : row.vulnerablePopulation.toLocaleString()
          ] })
        ] })
      ] }, row.region)) }) : /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          title: "No regional risk data",
          description: "Add pollution reports to calculate regional risk."
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(CloudSun, { size: 18, className: "text-emerald-700" }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "Monitoring scope" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-slate-500", children: "Health actors only see aggregated environmental and health signals. Farmer lots, buyer marketplace activity, and transaction details stay outside this dashboard." })
    ] })
  ] });
}
function HealthRiskData() {
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) throw new Error("Login required.");
      if (currentProfile.role !== "health_actor" && currentProfile.role !== "admin") {
        throw new Error("Health actor access required.");
      }
      const [pollutionReports, healthIndicators] = await Promise.all([
        getPollutionReports(),
        getHealthIndicators()
      ]);
      setProfile(currentProfile);
      setReports(pollutionReports);
      setIndicators(healthIndicators);
    }
    load().catch(
      (err) => setError(err instanceof Error ? err.message : "Unable to load health risk map.")
    ).finally(() => setLoading(false));
  }, []);
  if (loading) return /* @__PURE__ */ jsx(LoadingState, { label: "Loading health risk map" });
  if (error || !profile) {
    return /* @__PURE__ */ jsx(EmptyState, { title: "Risk map unavailable", description: error || "Login required." });
  }
  return /* @__PURE__ */ jsx(HealthRiskPage, { reports, indicators });
}

const $$HealthRisk = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Risk map", "subtitle": "Prioritize regions using aggregated pollution, health, and waste-burning signals.", "role": "health_actor" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "HealthRiskData", HealthRiskData, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/dashboards/HealthRiskData", "client:component-export": "default" })} ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/dashboard/health-risk.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/dashboard/health-risk.astro";
const $$url = "/dashboard/health-risk";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$HealthRisk,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
