import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead } from '../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { c as signIn, s as supabase, d as dashboardPathForRole, g as getSafeRedirectPath } from '../chunks/auth_DwlCj7dW.mjs';
import { l as logSecurityEvent } from '../chunks/security_CFiqUYzX.mjs';
import { a as loginSchema } from '../chunks/validators_BsKMdSsQ.mjs';
import { $ as $$AuthLayout, A as AgricultureBackground } from '../chunks/AuthLayout_SwzKDHXW.mjs';
export { renderers } from '../renderers.mjs';

function LoginForm({
  initialMessage = ""
}) {
  const [message, setMessage] = useState(initialMessage);
  const [busy, setBusy] = useState(false);
  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const parsed = loginSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget))
    );
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check your login details.");
      setBusy(false);
      return;
    }
    try {
      const { user } = await signIn(parsed.data.email, parsed.data.password);
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      void logSecurityEvent({
        userId: user.id,
        eventType: "login",
        details: { email: parsed.data.email }
      }).catch(() => void 0);
      const fallbackPath = dashboardPathForRole(profile?.role ?? "farmer");
      const redirectTo = new URLSearchParams(window.location.search).get(
        "redirectTo"
      );
      window.location.href = getSafeRedirectPath(redirectTo, fallbackPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-2 text-xl font-semibold tracking-[-0.01em] text-slate-950", children: "Welcome back" }),
    /* @__PURE__ */ jsx("p", { className: "mb-6 text-xs font-light tracking-[0.01em] text-slate-500", children: "Sign in to your biomass account." }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleLogin, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "email",
            className: "mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500",
            children: "Email"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "email",
            name: "email",
            type: "email",
            className: "w-full rounded-md border border-slate-300 px-3 py-3 text-sm font-light text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none",
            placeholder: "you@example.com",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "password",
            className: "mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500",
            children: "Password"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "password",
            name: "password",
            type: "password",
            className: "w-full rounded-md border border-slate-300 px-3 py-3 text-sm font-light text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none",
            placeholder: "••••••••",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          disabled: busy,
          className: "w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60",
          children: busy ? "Signing in..." : "Sign in"
        }
      )
    ] }),
    message ? /* @__PURE__ */ jsx("p", { className: "mt-6 text-sm font-light text-red-600", children: message }) : null,
    /* @__PURE__ */ jsxs("p", { className: "mt-8 text-center text-xs font-light tracking-[0.01em] text-slate-500", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/register",
          className: "font-medium text-emerald-600 hover:text-emerald-700",
          children: "Create one"
        }
      )
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Login = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const reasonMessages = {
    auth_required: "Please log in to continue.",
    auth_callback_failed: "Email confirmation could not be completed. Try logging in, or request a new confirmation email.",
    missing_profile: "Your account is signed in, but no profile was found.",
    missing_config: "Supabase is not configured. Add your public Supabase URL and anon key."
  };
  const initialMessage = reasonMessages[Astro2.url.searchParams.get("reason") ?? ""] ?? "";
  return renderTemplate`${renderComponent($$result, "AuthLayout", $$AuthLayout, { "title": "Login | AgriConnect Smart" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="flex min-h-screen"> <div class="relative flex-1 overflow-hidden rounded-r-[3rem]"> ${renderComponent($$result2, "AgricultureBackground", AgricultureBackground, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/AgricultureBackground", "client:component-export": "default" })} <div class="absolute inset-0 flex flex-col justify-between p-10 text-white"> <div class="max-w-xs"> <span class="text-xs uppercase tracking-[0.3em] text-slate-200/80">AgriConnect Smart</span> </div> <div class="max-w-xl"> <h1 class="text-4xl font-semibold leading-tight drop-shadow-xl md:text-[2.65rem]">Track and trade biomass with clarity.</h1> <p class="mt-5 max-w-lg text-sm font-light leading-6 text-slate-100/75 md:text-base">A secure platform for farmers, buyers, and health organizations with trusted visibility from source to delivery.</p> </div> <div class="max-w-xs text-xs font-light tracking-[0.08em] text-slate-200/70 md:text-sm">
Built for smarter operations and tailored supply chain confidence.
</div> </div> </div> <div class="flex-1 flex items-center justify-center bg-white p-6"> ${renderComponent($$result2, "LoginForm", LoginForm, { "initialMessage": initialMessage, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/LoginForm", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/login.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
