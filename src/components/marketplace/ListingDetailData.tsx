import { useEffect, useState } from "react";
import BlockchainTimeline from "@/components/blockchain/BlockchainTimeline";
import TransactionHash from "@/components/blockchain/TransactionHash";
import HealthRiskCard from "@/components/ai/HealthRiskCard";
import PricePredictionCard from "@/components/ai/PricePredictionCard";
import Badge from "@/components/common/Badge";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import BiomassCard from "@/components/marketplace/BiomassCard";
import { getBlockchainRecords } from "@/lib/admin";
import type { BiomassListing, BlockchainRecord } from "@/lib/database.types";
import { getListingById } from "@/lib/listings";

export function ListingDetailData({ id }: { id: string }) {
  const [listing, setListing] = useState<BiomassListing | null>(null);
  const [records, setRecords] = useState<BlockchainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [nextListing, nextRecords] = await Promise.all([getListingById(id), getBlockchainRecords()]);
      setListing(nextListing);
      setRecords(nextRecords.filter((record) => record.entity_id === id || record.payload?.listing_id === id));
    }

    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load listing.")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState label="Loading live listing" />;
  if (error || !listing) return <EmptyState title="Listing unavailable" description={error || "Listing was not found."} />;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <a href="/marketplace" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">Back to marketplace</a>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{listing.title}</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Detailed marketplace view with AI estimates, environmental impact, and blockchain traceability.</p>
        </div>
        <Badge variant={listing.status === "available" ? "success" : "warning"}>{listing.status}</Badge>
      </div>

      <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <BiomassCard listing={listing} />
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">Buyer action</h2>
            <p className="mt-2 text-sm text-slate-600">Request purchase from the industry dashboard and create a traceable transaction hash.</p>
            <div className="mt-4 grid gap-2">
              <a href="/dashboard/industry" className="rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-800">Request Purchase</a>
              <a href="/dashboard/farmer" className="rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-50">Farmer dashboard</a>
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{listing.biomass_type}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Listing overview</h2>
                <p className="mt-3 max-w-2xl text-slate-600">{listing.description}</p>
              </div>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md bg-slate-50 p-3"><dt className="text-sm text-slate-500">Quantity</dt><dd className="mt-1 font-semibold text-slate-950">{listing.quantity_kg.toLocaleString()} kg</dd></div>
              <div className="rounded-md bg-slate-50 p-3"><dt className="text-sm text-slate-500">Price</dt><dd className="mt-1 font-semibold text-slate-950">{listing.price_per_kg.toFixed(2)} TND/kg</dd></div>
              <div className="rounded-md bg-slate-50 p-3"><dt className="text-sm text-slate-500">Location</dt><dd className="mt-1 font-semibold text-slate-950">{listing.location}</dd></div>
              <div className="rounded-md bg-slate-50 p-3"><dt className="text-sm text-slate-500">Batch hash</dt><dd className="mt-1"><TransactionHash hash={listing.blockchain_batch_hash} /></dd></div>
            </dl>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <PricePredictionCard listing={listing} />
            <HealthRiskCard pollutionLevel={65} respiratoryRisk={listing.health_risk_reduction_score} carbonSaved={listing.carbon_saved_kg} healthBenefitScore={listing.health_risk_reduction_score} />
          </div>

          <BlockchainTimeline records={records} />
        </div>
      </div>
    </>
  );
}

export default ListingDetailData;
