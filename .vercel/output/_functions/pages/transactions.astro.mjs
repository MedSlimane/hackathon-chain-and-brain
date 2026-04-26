import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useCallback, useEffect } from 'react';
import { ReceiptText, PackageCheck, CircleDollarSign } from 'lucide-react';
import { B as Badge } from '../chunks/Badge_CSrJEJIS.mjs';
import { C as Card } from '../chunks/Card_BUbElGB8.mjs';
import { L as LoadingState, E as EmptyState } from '../chunks/LoadingState_DsPIB6ym.mjs';
import { S as StatCard } from '../chunks/StatCard_CuLZLHBx.mjs';
import { a as getCurrentProfile } from '../chunks/auth_DwlCj7dW.mjs';
import { u as updateListing } from '../chunks/listings_Di9Iuo7a.mjs';
import { l as logSecurityEvent } from '../chunks/security_CFiqUYzX.mjs';
import { a as getAllTransactions, g as getTransactionsForUser, d as updateTransactionStatus } from '../chunks/transactions_BwQG0AvW.mjs';
import { $ as $$DashboardLayout } from '../chunks/DashboardLayout_DNSv8d_E.mjs';
export { renderers } from '../renderers.mjs';

function TransactionsOverview() {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const loadTransactions = useCallback(async () => {
    const currentProfile = await getCurrentProfile();
    if (!currentProfile) throw new Error("Login required.");
    const nextTransactions = currentProfile.role === "admin" ? await getAllTransactions() : currentProfile.role === "health_actor" ? [] : await getTransactionsForUser(currentProfile.id, currentProfile.role);
    setProfile(currentProfile);
    setTransactions(nextTransactions);
  }, []);
  useEffect(() => {
    Promise.resolve().then(loadTransactions).catch(
      (err) => setError(err instanceof Error ? err.message : "Unable to load transactions.")
    ).finally(() => setLoading(false));
  }, [loadTransactions]);
  async function transitionTransaction(transaction, nextStatus, listingStatus) {
    if (!profile) return;
    setBusyId(transaction.id);
    setMessage("");
    setError("");
    try {
      const updated = await updateTransactionStatus(transaction.id, nextStatus);
      if (listingStatus && (profile.role === "farmer" || profile.role === "admin")) {
        await updateListing(transaction.listing_id, { status: listingStatus });
      }
      await logSecurityEvent({
        userId: profile.id,
        eventType: "transaction_status_changed",
        details: {
          transaction_id: transaction.id,
          from: transaction.status,
          to: nextStatus,
          listing_id: transaction.listing_id
        }
      }).catch(() => void 0);
      setTransactions(
        (current) => current.map((item) => item.id === updated.id ? updated : item)
      );
      setMessage(`Transaction #${transaction.id.slice(0, 8)} moved to ${nextStatus}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update transaction.");
    } finally {
      setBusyId("");
    }
  }
  function renderActions(transaction) {
    if (!profile) return null;
    const canActAsFarmer = profile.role === "farmer" || profile.role === "admin";
    const canActAsIndustry = profile.role === "industry" || profile.role === "admin";
    const disabled = busyId === transaction.id;
    const buttonClass = "rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-60";
    if (transaction.status === "pending" && canActAsFarmer) {
      return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => transitionTransaction(transaction, "accepted", "reserved"),
            className: "rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60",
            children: "Approve"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => transitionTransaction(transaction, "cancelled", "available"),
            className: buttonClass,
            children: "Decline"
          }
        )
      ] });
    }
    if (transaction.status === "accepted" && canActAsIndustry) {
      return /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          disabled,
          onClick: () => transitionTransaction(transaction, "in_delivery"),
          className: buttonClass,
          children: "Start delivery"
        }
      );
    }
    if (transaction.status === "in_delivery" && canActAsIndustry) {
      return /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          disabled,
          onClick: () => transitionTransaction(transaction, "delivered"),
          className: buttonClass,
          children: "Mark delivered"
        }
      );
    }
    if (transaction.status === "delivered" && canActAsFarmer) {
      return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => transitionTransaction(transaction, "completed", "sold"),
            className: "rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60",
            children: "Complete"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => transitionTransaction(transaction, "disputed"),
            className: buttonClass,
            children: "Dispute"
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: "No action" });
  }
  if (loading) return /* @__PURE__ */ jsx(LoadingState, { label: "Loading transactions" });
  if (error || !profile) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        title: "Transactions unavailable",
        description: error || "Login required."
      }
    );
  }
  const totalValue = transactions.reduce(
    (sum, transaction) => sum + transaction.total_price,
    0
  );
  const activeCount = transactions.filter(
    (transaction) => transaction.status !== "completed" && transaction.status !== "cancelled"
  ).length;
  const completedCount = transactions.filter(
    (transaction) => transaction.status === "completed"
  ).length;
  const pendingApprovalCount = transactions.filter(
    (transaction) => transaction.status === "pending"
  ).length;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsx(StatCard, { title: "Total Transactions", value: transactions.length, icon: /* @__PURE__ */ jsx(ReceiptText, { size: 20 }) }),
      /* @__PURE__ */ jsx(StatCard, { title: profile.role === "farmer" ? "Pending Approvals" : "Active Deals", value: profile.role === "farmer" ? pendingApprovalCount : activeCount, icon: /* @__PURE__ */ jsx(PackageCheck, { size: 20 }) }),
      /* @__PURE__ */ jsx(StatCard, { title: "Total Value", value: `${totalValue.toLocaleString()} TND`, icon: /* @__PURE__ */ jsx(CircleDollarSign, { size: 20 }) })
    ] }),
    message ? /* @__PURE__ */ jsx("div", { className: "rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900", children: message }) : null,
    /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-slate-200/80 px-6 py-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700", children: "Transactions" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-2 text-xl font-semibold text-slate-950", children: "Recent deal activity" })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600", children: [
          completedCount,
          " completed"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50/80 text-slate-500", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Transaction ID" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Quantity" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Total" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Updated" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: transactions.length > 0 ? transactions.map((transaction) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-slate-100", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 font-medium text-slate-950", children: /* @__PURE__ */ jsxs("a", { href: `/transactions/${transaction.id}`, className: "hover:text-emerald-700", children: [
            "#",
            transaction.id.slice(0, 8)
          ] }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 text-slate-600", children: [
            transaction.quantity_kg.toLocaleString(),
            " kg"
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 text-slate-600", children: [
            transaction.total_price.toLocaleString(),
            " TND"
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(
            Badge,
            {
              variant: transaction.status === "completed" ? "success" : "info",
              children: transaction.status
            }
          ) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-slate-500", children: new Date(transaction.updated_at).toLocaleDateString() }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: renderActions(transaction) })
        ] }, transaction.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-6 py-10 text-center text-sm text-slate-500", children: "No transactions yet." }) }) })
      ] }) })
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Transactions", "subtitle": "Track active and completed biomass deals across your workspace." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TransactionsOverview", TransactionsOverview, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/dashboard/TransactionsOverview", "client:component-export": "default" })} ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/transactions/index.astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/transactions/index.astro";
const $$url = "/transactions";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
