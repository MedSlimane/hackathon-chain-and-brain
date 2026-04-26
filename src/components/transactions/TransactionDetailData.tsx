import { useEffect, useState } from "react";
import TransactionHash from "@/components/blockchain/TransactionHash";
import Badge from "@/components/common/Badge";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import type { BiomassListing, BiomassTransaction } from "@/lib/database.types";
import { getListingById } from "@/lib/listings";
import { getTransactionById } from "@/lib/transactions";

export function TransactionDetailData({ id }: { id: string }) {
  const [transaction, setTransaction] = useState<BiomassTransaction | null>(null);
  const [listing, setListing] = useState<BiomassListing | null>(null);
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

  if (loading) return <LoadingState label="Loading live transaction" />;
  if (error || !transaction) return <EmptyState title="Transaction unavailable" description={error || "Transaction was not found."} />;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Transaction</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">{listing?.title ?? "Biomass transaction"}</h1>
        </div>
        <Badge variant="info">{transaction.status}</Badge>
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><dt className="text-sm text-slate-500">Quantity</dt><dd className="font-semibold text-slate-950">{transaction.quantity_kg.toLocaleString()} kg</dd></div>
        <div><dt className="text-sm text-slate-500">Total</dt><dd className="font-semibold text-slate-950">{transaction.total_price.toLocaleString()} TND</dd></div>
        <div><dt className="text-sm text-slate-500">Delivery</dt><dd className="font-semibold text-slate-950">{transaction.delivery_location}</dd></div>
        <div><dt className="text-sm text-slate-500">Hash</dt><dd><TransactionHash hash={transaction.blockchain_transaction_hash} /></dd></div>
      </dl>
    </section>
  );
}

export default TransactionDetailData;
