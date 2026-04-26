import {
  ArrowUpRight,
  DollarSign,
  Leaf,
  Package,
  ReceiptText,
} from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import RecentActivity, {
  type ActivityItem,
} from "@/components/common/RecentActivity"
import StatCard from "@/components/common/StatCard"
import CreateListingForm from "@/components/marketplace/CreateListingForm"
import RecommendationCard from "@/components/ai/RecommendationCard"
import type { BiomassListing, BiomassTransaction } from "@/lib/database.types"
import { generateRecommendation } from "@/lib/predictions"

function formatRelativeDate(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date)
}

function buildRecentActivity(
  listings: BiomassListing[],
  transactions: BiomassTransaction[]
): ActivityItem[] {
  const listingItems: ActivityItem[] = listings.slice(0, 3).map((listing) => ({
    id: `listing-${listing.id}`,
    title: `${listing.title} was updated`,
    description: `${listing.quantity_kg.toLocaleString()} kg listed at ${listing.price_per_kg.toFixed(2)} TND/kg.`,
    time: formatRelativeDate(listing.updated_at),
    type: "listing",
  }))

  const transactionItems: ActivityItem[] = transactions
    .slice(0, 3)
    .map((transaction) => ({
      id: `transaction-${transaction.id}`,
      title: `Transaction ${transaction.status}`,
      description: `${transaction.quantity_kg.toLocaleString()} kg for ${transaction.total_price.toLocaleString()} TND.`,
      time: formatRelativeDate(transaction.updated_at),
      type: "transaction",
    }))

  const carbonItems: ActivityItem[] = listings.slice(0, 2).map((listing) => ({
    id: `carbon-${listing.id}`,
    title: `Carbon impact recorded for ${listing.biomass_type}`,
    description: `${listing.carbon_saved_kg.toLocaleString()} kg CO2e avoided through traceable biomass reuse.`,
    time: formatRelativeDate(listing.created_at),
    type: "carbon",
  }))

  return [...transactionItems, ...listingItems, ...carbonItems].slice(0, 6)
}

export function FarmerDashboard({
  farmerId,
  listings,
  transactions,
}: {
  farmerId: string
  listings: BiomassListing[]
  transactions: BiomassTransaction[]
}) {
  const totalListings = listings.length
  const revenue = transactions.reduce(
    (sum, transaction) => sum + transaction.total_price,
    0
  )
  const activeTransactions = transactions.filter(
    (transaction) =>
      transaction.status === "pending" ||
      transaction.status === "accepted" ||
      transaction.status === "in_delivery"
  ).length
  const carbonImpact = listings.reduce(
    (sum, listing) => sum + listing.carbon_saved_kg,
    0
  )
  const chartBars = [45, 62, 58, 76, 64, 84, 72]
  const recentActivity = buildRecentActivity(listings, transactions)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Listings"
          value={totalListings}
          icon={<Package size={20} />}
          description="Biomass lots currently managed in your workspace."
          trend="Live inventory"
        />
        <StatCard
          title="Total Revenue"
          value={`${revenue.toLocaleString()} TND`}
          icon={<DollarSign size={20} />}
          description="Combined value from recorded biomass transactions."
          trend="Updated automatically"
        />
        <StatCard
          title="Active Transactions"
          value={activeTransactions}
          icon={<ReceiptText size={20} />}
          description="Deals that still require confirmation, delivery, or closure."
          trend="Operational focus"
        />
        <StatCard
          title="Carbon Impact"
          value={`${carbonImpact.toLocaleString()} kg`}
          icon={<Leaf size={20} />}
          description="Estimated emissions avoided through traceable reuse."
          trend="Sustainability metric"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Analytics
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Marketplace performance
              </h2>
            </div>
            <a
              href="/analytics"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
            >
              Open analytics
              <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,#f8fafc,#effaf5)] p-5">
            <div className="flex items-end gap-3">
              {chartBars.map((height, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-44 w-full items-end rounded-2xl bg-white/70 p-2">
                    <div
                      className="w-full rounded-xl bg-gradient-to-t from-emerald-600 to-emerald-300"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    W{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            AI Guidance
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Smart operational tips
          </h2>
          <div className="mt-5 space-y-3">
            {listings.slice(0, 3).map((listing) => (
              <RecommendationCard
                key={listing.id}
                title={listing.biomass_type}
                recommendation={generateRecommendation(listing)}
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                My Listings
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Current inventory overview
              </h2>
            </div>
            <a
              href="/listings"
              className="text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
            >
              Manage all
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Listing</th>
                  <th className="px-6 py-4 font-medium">Quantity</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-950">{listing.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {listing.biomass_type}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {listing.quantity_kg.toLocaleString()} kg
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {listing.price_per_kg.toFixed(2)} TND/kg
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={listing.status === "available" ? "success" : "warning"}
                      >
                        {listing.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <RecentActivity items={recentActivity} />
      </div>

      <div id="create-listing">
        <CreateListingForm farmerId={farmerId} />
      </div>
    </div>
  )
}

export default FarmerDashboard
