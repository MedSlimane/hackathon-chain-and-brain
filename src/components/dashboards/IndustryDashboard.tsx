import { useState } from "react";
import { CheckCircle2, Leaf, PackageSearch, ShoppingCart } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import Badge from "@/components/common/Badge";
import type { BiomassListing, BiomassTransaction } from "@/lib/database.types";
import { createTransactionHash } from "@/lib/blockchain";
import { createTransaction } from "@/lib/transactions";
import { logSecurityEvent, detectTransactionAnomaly } from "@/lib/security";
import { hasSupabaseConfig } from "@/lib/supabaseClient";

export function IndustryDashboard({ industryId, listings, transactions }: { industryId: string; listings: BiomassListing[]; transactions: BiomassTransaction[] }) {
  const [message, setMessage] = useState("");
  const activeOrders = transactions.filter((transaction) => !["completed", "cancelled"].includes(transaction.status)).length;
  const completed = transactions.filter((transaction) => transaction.status === "completed").length;
  const carbon = listings.reduce((sum, listing) => sum + listing.carbon_saved_kg, 0);
  const scoredListings = listings.map((listing) => ({
    ...listing,
    buyerScore: Math.min(98, Math.round(45 + listing.quality_score! * 0.25 + listing.carbon_saved_kg / 1200 - listing.price_per_kg * 10)),
  }));

  async function requestPurchase(listing: BiomassListing) {
    try {
      if (!hasSupabaseConfig) {
        setMessage("Demo mode: connect Supabase env vars to create real transactions.");
        return;
      }
      const draft = {
        listing_id: listing.id,
        farmer_id: listing.farmer_id,
        industry_id: industryId,
        quantity_kg: Math.min(1000, listing.quantity_kg),
        agreed_price_per_kg: listing.price_per_kg,
        delivery_location: "Industry receiving site",
      };
      const transaction = await createTransaction(draft);
      const hash = await createTransactionHash(transaction);
      await logSecurityEvent({ userId: industryId, eventType: "transaction_created", details: { transaction_id: transaction.id, hash } });
      for (const alert of detectTransactionAnomaly(transaction)) {
        await logSecurityEvent({ userId: industryId, eventType: alert.eventType, severity: alert.severity, details: { reason: alert.reason } });
      }
      setMessage("Purchase request created with blockchain-style transaction hash.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to request purchase.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Available biomass" value={`${listings.reduce((sum, listing) => sum + listing.quantity_kg, 0).toLocaleString()} kg`} icon={<PackageSearch size={20} />} />
        <StatCard title="Active orders" value={activeOrders} icon={<ShoppingCart size={20} />} />
        <StatCard title="Completed purchases" value={completed} icon={<CheckCircle2 size={20} />} />
        <StatCard title="Potential carbon impact" value={`${carbon.toLocaleString()} kg`} icon={<Leaf size={20} />} />
      </div>
      {message ? <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">{message}</div> : null}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Organisation verification</h2>
            <p className="mt-1 text-sm text-slate-500">Buyer actions are tied to an organization profile and logged as secure transaction events.</p>
          </div>
          <Badge variant="success">Verified demo buyer</Badge>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {scoredListings.slice(0, 6).map((listing) => (
          <article key={listing.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs uppercase text-emerald-700">{listing.biomass_type}</p><h3 className="mt-1 font-semibold text-slate-950">{listing.title}</h3></div>
              <Badge variant={listing.buyerScore >= 80 ? "success" : "info"}>{listing.buyerScore}/100 score</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-600">{listing.quantity_kg.toLocaleString()} kg in {listing.location}</p>
            <p className="mt-1 text-sm text-slate-600">{listing.price_per_kg.toFixed(2)} TND/kg</p>
            <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
              Recommendation compares price, quality, carbon impact, and availability.
            </div>
            <button onClick={() => requestPurchase(listing)} className="mt-4 w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Request purchase</button>
          </article>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-semibold text-slate-950">My transactions</h2></div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Transaction</th><th className="p-3">Quantity</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead>
          <tbody>{transactions.map((transaction) => <tr key={transaction.id} className="border-t border-slate-100"><td className="p-3 font-mono text-xs">{transaction.id.slice(0, 8)}</td><td className="p-3">{transaction.quantity_kg.toLocaleString()} kg</td><td className="p-3">{transaction.total_price.toLocaleString()} TND</td><td className="p-3"><Badge variant="info">{transaction.status}</Badge></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

export default IndustryDashboard;
