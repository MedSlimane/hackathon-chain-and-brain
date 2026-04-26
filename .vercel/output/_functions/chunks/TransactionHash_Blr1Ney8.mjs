import { jsxs, jsx } from 'react/jsx-runtime';
import { ShieldCheck } from 'lucide-react';

function shortHash(hash) {
  if (!hash) return "Not recorded";
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
function TransactionHash({ hash }) {
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700", children: [
    /* @__PURE__ */ jsx(ShieldCheck, { size: 14 }),
    " ",
    shortHash(hash)
  ] });
}

export { TransactionHash as T, shortHash as s };
