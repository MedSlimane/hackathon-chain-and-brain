import { jsxs, jsx } from 'react/jsx-runtime';
import { MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { B as Badge } from './Badge_CSrJEJIS.mjs';

function BiomassCard({
  listing,
  onRequestPurchase,
  purchaseBusy = false
}) {
  const statusVariant = listing.status === "available" ? "success" : listing.status === "reserved" ? "warning" : "neutral";
  return /* @__PURE__ */ jsxs("article", { className: "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: listing.image_url ?? "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80",
        alt: listing.title,
        className: "h-44 w-full object-cover"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-emerald-700", children: listing.biomass_type }),
          /* @__PURE__ */ jsx("h3", { className: "mt-1 text-lg font-semibold text-slate-950", children: listing.title })
        ] }),
        /* @__PURE__ */ jsx(Badge, { variant: statusVariant, children: listing.status })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Quantity" }),
          /* @__PURE__ */ jsxs("p", { className: "font-medium text-slate-950", children: [
            listing.quantity_kg.toLocaleString(),
            " kg"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Price" }),
          /* @__PURE__ */ jsxs("p", { className: "font-medium text-slate-950", children: [
            listing.price_per_kg.toFixed(2),
            " TND/kg"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "AI estimate" }),
          /* @__PURE__ */ jsxs("p", { className: "font-medium text-slate-950", children: [
            listing.predicted_price_per_kg?.toFixed(2) ?? "-",
            " TND/kg"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "CO2e avoided" }),
          /* @__PURE__ */ jsxs("p", { className: "font-medium text-slate-950", children: [
            listing.carbon_saved_kg.toLocaleString(),
            " kg"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-t border-slate-100 pt-4", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-sm text-slate-600", children: [
          /* @__PURE__ */ jsx(MapPin, { size: 15 }),
          " ",
          listing.location
        ] }),
        listing.blockchain_batch_hash ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-xs text-emerald-700", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { size: 14 }),
          " Verified"
        ] }) : null
      ] }),
      onRequestPurchase ? /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onRequestPurchase(listing),
          disabled: purchaseBusy,
          className: "inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60",
          children: purchaseBusy ? "Creating request..." : "Request purchase"
        }
      ) : /* @__PURE__ */ jsxs("a", { href: `/listings/${listing.id}`, className: "inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800", children: [
        "View details ",
        /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
      ] })
    ] })
  ] });
}

export { BiomassCard as B };
