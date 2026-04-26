import { e as createComponent, m as maybeRenderHead, g as addAttribute, r as renderTemplate, h as createAstro, l as renderHead, k as renderComponent, n as renderSlot } from './astro/server_CTPEiHAX.mjs';
import 'piccolore';
/* empty css                         */
import { A as AuthRedirectHandler } from './AuthRedirectHandler_BgzkYOXR.mjs';
import 'clsx';
import { d as dashboardPathForRole } from './auth_DwlCj7dW.mjs';

const $$Astro$1 = createAstro();
const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Navbar;
  const links = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/dashboard/farmer", label: "Farmer" },
    { href: "/dashboard/industry", label: "Industry" },
    { href: "/dashboard/health", label: "Health" },
    { href: "/dashboard/admin", label: "Admin" }
  ];
  const profile = Astro2.locals.profile;
  return renderTemplate`${maybeRenderHead()}<header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur"> <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"> <a href="/" class="flex items-center gap-2 font-semibold text-slate-950"> <span class="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white">AC</span> <span>AgriConnect Smart</span> </a> <nav class="hidden items-center gap-5 text-sm text-slate-600 md:flex"> ${links.map((link) => renderTemplate`<a class="hover:text-emerald-700"${addAttribute(link.href, "href")}>${link.label}</a>`)} </nav> ${profile ? renderTemplate`<div class="flex items-center gap-2"> <a${addAttribute(dashboardPathForRole(profile.role), "href")} class="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">Dashboard</a> </div>` : renderTemplate`<div class="flex items-center gap-2"> <a href="/login" class="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">Log in</a> <a href="/register" class="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">Register</a> </div>`} </div> </header>`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/components/common/Navbar.astro", void 0);

const $$Astro = createAstro();
const $$MainLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$MainLayout;
  const { title = "AgriConnect Smart", description = "Secure biomass marketplace for farmers, industries, and health actors." } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="description"${addAttribute(description, "content")}><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title}</title>${renderHead()}</head> <body class="min-h-screen bg-slate-50 text-slate-950"> ${renderComponent($$result, "AuthRedirectHandler", AuthRedirectHandler, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/AuthRedirectHandler", "client:component-export": "default" })} ${renderComponent($$result, "Navbar", $$Navbar, {})} ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/layouts/MainLayout.astro", void 0);

export { $$MainLayout as $ };
