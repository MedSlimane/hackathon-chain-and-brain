import { useMemo, useState } from "react";
import type { BiomassListing } from "@/lib/database.types";
import { createTransactionHash } from "@/lib/blockchain";
import { detectTransactionAnomaly, logSecurityEvent } from "@/lib/security";
import { createTransaction, updateTransaction } from "@/lib/transactions";
import BiomassCard from "./BiomassCard";
import BiomassFilters, { filterListings, type BiomassFilterState } from "./BiomassFilters";
import EmptyState from "@/components/common/EmptyState";

export function MarketplaceView({ buyerId, listings }: { buyerId: string; listings: BiomassListing[] }) {
  const [filters, setFilters] = useState<BiomassFilterState>({ search: "", type: "", location: "", sort: "newest", maxPrice: "" });
  const [message, setMessage] = useState("");
  const [busyListingId, setBusyListingId] = useState("");
  const types = Array.from(new Set(listings.map((listing) => listing.biomass_type)));
  const locations = Array.from(new Set(listings.map((listing) => listing.location)));
  const visibleListings = useMemo(() => filterListings(listings, filters), [listings, filters]);

  async function requestPurchase(listing: BiomassListing) {
    setBusyListingId(listing.id);
    setMessage("");

    try {
      const transaction = await createTransaction({
        listing_id: listing.id,
        farmer_id: listing.farmer_id,
        industry_id: buyerId,
        quantity_kg: Math.min(1000, listing.quantity_kg),
        agreed_price_per_kg: listing.price_per_kg,
        delivery_location: "Industry receiving site",
      });
      const hash = await createTransactionHash(transaction);
      await updateTransaction(transaction.id, { blockchain_transaction_hash: hash });
      await logSecurityEvent({
        userId: buyerId,
        eventType: "transaction_created",
        details: { transaction_id: transaction.id, listing_id: listing.id, hash },
      });
      for (const alert of detectTransactionAnomaly(transaction)) {
        await logSecurityEvent({
          userId: buyerId,
          eventType: alert.eventType,
          severity: alert.severity,
          details: { reason: alert.reason, listing_id: listing.id },
        });
      }
      setMessage("Purchase request created from Marketplace with a traceable transaction hash.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to request purchase.");
    } finally {
      setBusyListingId("");
    }
  }

  return (
    <div className="space-y-6">
      <BiomassFilters filters={filters} onChange={setFilters} types={types} locations={locations} />
      {message ? <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">{message}</div> : null}
      {visibleListings.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleListings.map((listing) => (
            <BiomassCard
              key={listing.id}
              listing={listing}
              onRequestPurchase={requestPurchase}
              purchaseBusy={busyListingId === listing.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No listings match these filters" description="Try a different biomass type, region, or price range." />
      )}
    </div>
  );
}

export default MarketplaceView;
