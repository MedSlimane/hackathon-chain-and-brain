import { e as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../chunks/DashboardLayout_DNSv8d_E.mjs';
export { renderers } from '../../renderers.mjs';

const $$Health = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Health dashboard", "subtitle": "Monitor aggregated pollution, respiratory risk, and waste-burning reduction.", "role": "health_actor" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "HealthDashboardData", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/components/dashboards/HealthDashboardData", "client:component-export": "default" })} ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/dashboard/health.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/dashboard/health.astro";
const $$url = "/dashboard/health";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Health,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
