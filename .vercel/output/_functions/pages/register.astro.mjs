import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { f as signUp, d as dashboardPathForRole } from '../chunks/auth_DwlCj7dW.mjs';
import { r as registerSchema } from '../chunks/validators_BsKMdSsQ.mjs';
import { $ as $$AuthLayout, A as AgricultureBackground } from '../chunks/AuthLayout_SwzKDHXW.mjs';
export { renderers } from '../renderers.mjs';

const roleOptions = [
  { value: "farmer", label: "Farmer" },
  { value: "industry", label: "Industry buyer" },
  { value: "health_actor", label: "Health organization" }
];
function RegisterForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  async function handleRegister(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setPasswordError("");
    const formData = Object.fromEntries(new FormData(event.currentTarget));
    if (formData.password !== formData.password_confirm) {
      setPasswordError("Passwords do not match");
      setBusy(false);
      return;
    }
    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check the form.");
      setBusy(false);
      return;
    }
    try {
      const data = await signUp(parsed.data);
      if (!data.session) {
        setMessage(
          "Account created. Check your email to confirm it. The confirmation link will bring you back to your dashboard."
        );
        return;
      }
      window.location.href = dashboardPathForRole(parsed.data.role);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to register.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-2 text-xl font-semibold tracking-[-0.01em] text-slate-950", children: "Create your account" }),
    /* @__PURE__ */ jsx("p", { className: "mb-6 text-xs font-light tracking-[0.01em] text-slate-500", children: "Join the biomass network with the right workspace." }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleRegister, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "full_name",
            className: "mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500",
            children: "Full Name"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "full_name",
            name: "full_name",
            className: "w-full rounded-md border border-slate-300 px-3 py-3 text-sm font-light text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none",
            placeholder: "John Doe",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "role",
            className: "mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500",
            children: "Role"
          }
        ),
        /* @__PURE__ */ jsx(
          "select",
          {
            id: "role",
            name: "role",
            className: "w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-light text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none",
            defaultValue: "farmer",
            required: true,
            children: roleOptions.map((role) => /* @__PURE__ */ jsx("option", { value: role.value, children: role.label }, role.value))
          }
        )
      ] }),
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
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "password_confirm",
            className: "mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500",
            children: "Confirm Password"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "password_confirm",
            name: "password_confirm",
            type: "password",
            className: `w-full rounded-md border px-3 py-3 text-sm font-light text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:outline-none ${passwordError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"}`,
            placeholder: "••••••••",
            required: true
          }
        ),
        passwordError ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600", children: passwordError }) : null
      ] }),
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "location", value: "Tunisia" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          disabled: busy,
          className: "w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60",
          children: busy ? "Creating account..." : "Create account"
        }
      )
    ] }),
    message ? /* @__PURE__ */ jsx("p", { className: "mt-6 text-sm font-light text-red-600", children: message }) : null,
    /* @__PURE__ */ jsxs("p", { className: "mt-8 text-center text-xs font-light tracking-[0.01em] text-slate-500", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/login",
          className: "font-medium text-emerald-600 hover:text-emerald-700",
          children: "Sign in"
        }
      )
    ] })
  ] });
}

const $$Register = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AuthLayout", $$AuthLayout, { "title": "Register | AgriConnect Smart" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="flex min-h-screen"> <div class="relative flex-1 overflow-hidden rounded-r-[3rem]"> ${renderComponent($$result2, "AgricultureBackground", AgricultureBackground, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/AgricultureBackground", "client:component-export": "default" })} <div class="absolute inset-0 flex flex-col justify-between p-10 text-white"> <div class="max-w-xs"> <span class="text-xs uppercase tracking-[0.3em] text-slate-200/80">AgriConnect Smart</span> </div> <div class="max-w-xl"> <h1 class="text-4xl font-semibold leading-tight drop-shadow-xl md:text-[2.65rem]">Track and trade biomass with clarity.</h1> <p class="mt-5 max-w-lg text-sm font-light leading-6 text-slate-100/75 md:text-base">A secure platform for farmers, buyers, and health organizations with trusted visibility from source to delivery.</p> </div> <div class="max-w-xs text-xs font-light tracking-[0.08em] text-slate-200/70 md:text-sm">
Built for smarter operations and tailored supply chain confidence.
</div> </div> </div> <div class="flex flex-1 items-center justify-center bg-white p-6"> ${renderComponent($$result2, "RegisterForm", RegisterForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/RegisterForm", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/register.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Register,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
