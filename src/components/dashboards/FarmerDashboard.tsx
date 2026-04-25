import { DollarSign, Leaf, Package, ShoppingBag } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import Badge from "@/components/common/Badge";
import CreateListingForm from "@/components/marketplace/CreateListingForm";
import RecommendationCard from "@/components/ai/RecommendationCard";
import type { BiomassListing, BiomassTransaction } from "@/lib/database.types";
import { generateRecommendation } from "@/lib/predictions";

export function FarmerDashboard({ farmerId, listings, transactions }: { farmerId: string; listings: BiomassListing[]; transactions: BiomassTransaction[] }) {
  const active = listings.filter((listing) => listing.status === "available").length;
  const soldQuantity = transactions.filter((transaction) => transaction.status === "completed").reduce((sum, transaction) => sum + transaction.quantity_kg, 0);
  const revenue = transactions.reduce((sum, transaction) => sum + transaction.total_price, 0);
  const carbon = listings.reduce((sum, listing) => sum + listing.carbon_saved_kg, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active listings" value={active} icon={<Package size={20} />} />
        <StatCard title="Sold quantity" value={`${soldQuantity.toLocaleString()} kg`} icon={<ShoppingBag size={20} />} />
        <StatCard title="Estimated revenue" value={`${revenue.toLocaleString()} TND`} icon={<DollarSign size={20} />} />
        <StatCard title="Carbon saved" value={`${carbon.toLocaleString()} kg`} icon={<Leaf size={20} />} />
      </div>
      <CreateListingForm farmerId={farmerId} />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-semibold text-slate-950">My listings</h2></div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Listing</th><th className="p-3">Qty</th><th className="p-3">Price</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-t border-slate-100">
                  <td className="p-3 font-medium text-slate-950">{listing.title}</td>
                  <td className="p-3">{listing.quantity_kg.toLocaleString()} kg</td>
                  <td className="p-3">{listing.price_per_kg.toFixed(2)} TND/kg</td>
                  <td className="p-3"><Badge variant={listing.status === "available" ? "success" : "warning"}>{listing.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-slate-950">Lot traceability checklist</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Photo du lot obligatoire pour preuve visuelle.</li>
              <li>Hash local genere pour origine et integrite.</li>
              <li>Alertes anti-fraude si prix ou quantite semblent anormaux.</li>
            </ul>
          </div>
          {listings.slice(0, 3).map((listing) => <RecommendationCard key={listing.id} title={listing.biomass_type} recommendation={generateRecommendation(listing)} />)}
        </div>
      </div>
    </div>
  );
}

export default FarmerDashboard;
