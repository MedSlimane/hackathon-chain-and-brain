import { jsxs, jsx } from 'react/jsx-runtime';

function EmptyState({ title, description }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center", children: [
    /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-950", children: title }),
    description ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-500", children: description }) : null
  ] });
}

function LoadingState({ label = "Loading" }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600", children: [
    /* @__PURE__ */ jsx("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" }),
    label
  ] });
}

export { EmptyState as E, LoadingState as L };
