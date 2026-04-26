import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { UserRound, Bell, ShieldCheck } from 'lucide-react';
import { C as Card } from '../chunks/Card_BUbElGB8.mjs';
import { L as LoadingState, E as EmptyState } from '../chunks/LoadingState_DsPIB6ym.mjs';
import { a as getCurrentProfile } from '../chunks/auth_DwlCj7dW.mjs';
import { $ as $$DashboardLayout } from '../chunks/DashboardLayout_DNSv8d_E.mjs';
export { renderers } from '../renderers.mjs';

function SettingRow({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-[0.16em] text-slate-400", children: label }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-medium text-slate-900", children: value })
  ] });
}
function SettingsOverview() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    getCurrentProfile().then((currentProfile) => {
      if (!currentProfile) throw new Error("Login required.");
      setProfile(currentProfile);
    }).catch(
      (err) => setError(err instanceof Error ? err.message : "Unable to load settings.")
    ).finally(() => setLoading(false));
  }, []);
  if (loading) return /* @__PURE__ */ jsx(LoadingState, { label: "Loading settings" });
  if (error || !profile) {
    return /* @__PURE__ */ jsx(EmptyState, { title: "Settings unavailable", description: error || "Login required." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-[1.05fr_0.95fr]", children: [
    /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700", children: /* @__PURE__ */ jsx(UserRound, { size: 20 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700", children: "Profile" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-1 text-xl font-semibold text-slate-950", children: "Account details" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsx(SettingRow, { label: "Full Name", value: profile.full_name }),
        /* @__PURE__ */ jsx(SettingRow, { label: "Role", value: profile.role.replace("_", " ") }),
        /* @__PURE__ */ jsx(SettingRow, { label: "Region", value: profile.location ?? "Not set" }),
        /* @__PURE__ */ jsx(SettingRow, { label: "Phone", value: profile.phone ?? "Not set" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700", children: /* @__PURE__ */ jsx(Bell, { size: 20 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "Notifications" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Configure alerts for listings, transactions, and traceability events." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-50 text-lime-700", children: /* @__PURE__ */ jsx(ShieldCheck, { size: 20 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "Security" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Review access, activity, and verification settings for your account." })
        ] })
      ] }) })
    ] })
  ] });
}

const $$Settings = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Settings", "subtitle": "Manage account details, preferences, and security controls." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "SettingsOverview", SettingsOverview, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/dashboard/SettingsOverview", "client:component-export": "default" })} ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/settings.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/settings.astro";
const $$url = "/settings";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Settings,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
