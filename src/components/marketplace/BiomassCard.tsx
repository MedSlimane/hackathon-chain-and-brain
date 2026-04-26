import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import Badge from "@/components/common/Badge";
import type { BiomassListing } from "@/lib/database.types";

export function BiomassCard({
  listing,
  onRequestPurchase,
  purchaseBusy = false,
}: {
  listing: BiomassListing;
  onRequestPurchase?: (listing: BiomassListing) => void;
  purchaseBusy?: boolean;
}) {
  const statusVariant = listing.status === "available" ? "success" : listing.status === "reserved" ? "warning" : "neutral";

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <img
        src={listing.image_url ?? "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80"}
        alt={listing.title}
        className="h-44 w-full object-cover"
      />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">{listing.biomass_type}</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">{listing.title}</h3>
          </div>
          <Badge variant={statusVariant}>{listing.status}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Quantity</p>
            <p className="font-medium text-slate-950">{listing.quantity_kg.toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-slate-500">Price</p>
            <p className="font-medium text-slate-950">{listing.price_per_kg.toFixed(2)} TND/kg</p>
          </div>
          <div>
            <p className="text-slate-500">AI estimate</p>
            <p className="font-medium text-slate-950">{listing.predicted_price_per_kg?.toFixed(2) ?? "-"} TND/kg</p>
          </div>
          <div>
            <p className="text-slate-500">CO2e avoided</p>
            <p className="font-medium text-slate-950">{listing.carbon_saved_kg.toLocaleString()} kg</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1 text-sm text-slate-600"><MapPin size={15} /> {listing.location}</span>
          {listing.blockchain_batch_hash ? <span className="flex items-center gap-1 text-xs text-emerald-700"><ShieldCheck size={14} /> Verified</span> : null}
        </div>
        {onRequestPurchase ? (
          <button
            type="button"
            onClick={() => onRequestPurchase(listing)}
            disabled={purchaseBusy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {purchaseBusy ? "Creating request..." : "Request purchase"}
          </button>
        ) : (
          <a href={`/listings/${listing.id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            View details <ArrowRight size={16} />
          </a>
        )}
      </div>
    </article>
  );
}

export default BiomassCard;
