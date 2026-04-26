import { s as supabase } from './auth_DwlCj7dW.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { CheckCircle2 } from 'lucide-react';
import { B as Badge } from './Badge_CSrJEJIS.mjs';
import { s as shortHash } from './TransactionHash_Blr1Ney8.mjs';

async function getSecurityLogs() {
  const { data, error } = await supabase.from("security_logs").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
async function getBlockchainRecords() {
  const { data, error } = await supabase.from("blockchain_records").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
async function getAiPredictionLogs() {
  const { data, error } = await supabase.from("ai_predictions").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
async function getProfiles() {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

function BlockchainTimeline({ records }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-950", children: "Traceability timeline" }),
      /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Append-only demo" })
    ] }),
    /* @__PURE__ */ jsx("ol", { className: "mt-5 space-y-4", children: records.map((record) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700", children: /* @__PURE__ */ jsx(CheckCircle2, { size: 16 }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 rounded-md border border-slate-100 p-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-950", children: record.action.replaceAll("_", " ") }),
          /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Verified" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 font-mono text-xs text-slate-500", children: shortHash(record.hash) }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-slate-500", children: new Date(record.created_at).toLocaleString() })
      ] })
    ] }, record.id)) })
  ] });
}

export { BlockchainTimeline as B, getSecurityLogs as a, getBlockchainRecords as b, getAiPredictionLogs as c, getProfiles as g };
