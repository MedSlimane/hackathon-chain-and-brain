import { jsx } from 'react/jsx-runtime';
import { c as cn } from './DashboardLayout_DNSv8d_E.mjs';

function Card({
  children,
  className
}) {
  return /* @__PURE__ */ jsx(
    "section",
    {
      className: cn(
        "rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm",
        className
      ),
      children
    }
  );
}

export { Card as C };
