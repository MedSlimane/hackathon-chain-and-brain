import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead } from '../../chunks/astro/server_CTPEiHAX.mjs';
import 'piccolore';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { T as TransactionHash } from '../../chunks/TransactionHash_Blr1Ney8.mjs';
import { B as Badge } from '../../chunks/Badge_CSrJEJIS.mjs';
import { L as LoadingState, E as EmptyState } from '../../chunks/LoadingState_DsPIB6ym.mjs';
import { c as getListingById } from '../../chunks/listings_Di9Iuo7a.mjs';
import { b as getTransactionById } from '../../chunks/transactions_BwQG0AvW.mjs';
import { $ as $$MainLayout } from '../../chunks/MainLayout_DjVgWa-b.mjs';
export { renderers } from '../../renderers.mjs';

function TransactionDetailData({ id }) {
  const [transaction, setTransaction] = useState(null);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const nextTransaction = await getTransactionById(id);
      const nextListing = await getListingById(nextTransaction.listing_id);
      setTransaction(nextTransaction);
      setListing(nextListing);
    }
    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load transaction.")).finally(() => setLoading(false));
  }, [id]);
  if (loading) return /* @__PURE__ */ jsx(LoadingState, { label: "Loading live transaction" });
  if (error || !transaction) return /* @__PURE__ */ jsx(EmptyState, { title: "Transaction unavailable", description: error || "Transaction was not found." });
  return /* @__PURE__ */ jsxs("section", { className: "rounded-lg border border-slate-200 bg-white p-6 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-wide text-sky-700", children: "Transaction" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-2 text-2xl font-semibold text-slate-950", children: listing?.title ?? "Biomass transaction" })
      ] }),
      /* @__PURE__ */ jsx(Badge, { variant: "info", children: transaction.status })
    ] }),
    /* @__PURE__ */ jsxs("dl", { className: "mt-6 grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("dt", { className: "text-sm text-slate-500", children: "Quantity" }),
        /* @__PURE__ */ jsxs("dd", { className: "font-semibold text-slate-950", children: [
          transaction.quantity_kg.toLocaleString(),
          " kg"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("dt", { className: "text-sm text-slate-500", children: "Total" }),
        /* @__PURE__ */ jsxs("dd", { className: "font-semibold text-slate-950", children: [
          transaction.total_price.toLocaleString(),
          " TND"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("dt", { className: "text-sm text-slate-500", children: "Delivery" }),
        /* @__PURE__ */ jsx("dd", { className: "font-semibold text-slate-950", children: transaction.delivery_location })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("dt", { className: "text-sm text-slate-500", children: "Hash" }),
        /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx(TransactionHash, { hash: transaction.blockchain_transaction_hash }) })
      ] })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$id = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Transaction trace | AgriConnect Smart" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8"> ${renderComponent($$result2, "TransactionDetailData", TransactionDetailData, { "id": id, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/transactions/TransactionDetailData", "client:component-export": "default" })} </main> ` })}`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/transactions/[id].astro", void 0);

const $$file = "/Users/slimane/hackathon/hackathon-chain-and-brain/src/pages/transactions/[id].astro";
const $$url = "/transactions/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
