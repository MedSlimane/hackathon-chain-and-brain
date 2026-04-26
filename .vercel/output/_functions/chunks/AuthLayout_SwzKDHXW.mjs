import { jsxs, jsx } from 'react/jsx-runtime';
import { e as createComponent, g as addAttribute, l as renderHead, k as renderComponent, n as renderSlot, r as renderTemplate, h as createAstro } from './astro/server_CTPEiHAX.mjs';
import 'piccolore';
/* empty css                         */
import { A as AuthRedirectHandler } from './AuthRedirectHandler_BgzkYOXR.mjs';

function AgricultureBackground() {
  return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 h-full w-full overflow-hidden", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 h-full w-full bg-cover bg-center",
        style: {
          backgroundImage: 'url("https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center"
        }
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-emerald-900/10" })
  ] });
}

const $$Astro = createAstro();
const $$AuthLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AuthLayout;
  const { title = "AgriConnect Smart", description = "Secure biomass marketplace for farmers, industries, and health actors." } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="description"${addAttribute(description, "content")}><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title}</title>${renderHead()}</head> <body class="min-h-screen bg-slate-50 text-slate-950"> ${renderComponent($$result, "AuthRedirectHandler", AuthRedirectHandler, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/AuthRedirectHandler", "client:component-export": "default" })} ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/layouts/AuthLayout.astro", void 0);

export { $$AuthLayout as $, AgricultureBackground as A };
