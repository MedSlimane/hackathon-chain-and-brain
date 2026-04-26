import { jsx } from 'react/jsx-runtime';

const styles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700"
};
function Badge({ variant = "neutral", children }) {
  return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${styles[variant]}`, children });
}

export { Badge as B };
