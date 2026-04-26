import { jsxs, jsx } from 'react/jsx-runtime';
import { C as Card } from './Card_BUbElGB8.mjs';

function StatCard({
  title,
  value,
  icon,
  description,
  trend
}) {
  return /* @__PURE__ */ jsxs(Card, { className: "p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-28px_rgba(15,23,42,0.4)]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: title }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950", children: value })
      ] }),
      icon ? /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100", children: icon }) : null
    ] }),
    description ? /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-6 text-slate-500", children: description }) : null,
    trend ? /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700", children: trend }) : null
  ] });
}

export { StatCard as S };
