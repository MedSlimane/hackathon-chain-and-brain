import { useEffect, useState } from "react"
import { BarChart3, Leaf, TrendingUp } from "lucide-react"
import Card from "@/components/common/Card"
import EmptyState from "@/components/common/EmptyState"
import LoadingState from "@/components/common/LoadingState"
import StatCard from "@/components/common/StatCard"
import { getCurrentProfile } from "@/lib/auth"
import type { BiomassListing, BiomassTransaction, Profile } from "@/lib/database.types"
import { getListingsByFarmer } from "@/lib/listings"
import { getTransactionsForUser } from "@/lib/transactions"

export function AnalyticsOverview() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<BiomassListing[]>([])
  const [transactions, setTransactions] = useState<BiomassTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile()
      if (!currentProfile) throw new Error("Login required.")

      const [nextListings, nextTransactions] =
        currentProfile.role === "farmer"
          ? await Promise.all([
              getListingsByFarmer(currentProfile.id),
              getTransactionsForUser(currentProfile.id, "farmer"),
            ])
          : [[], []]

      setProfile(currentProfile)
      setListings(nextListings)
      setTransactions(nextTransactions)
    }

    load()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load analytics.")
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState label="Loading analytics" />
  if (error || !profile) {
    return (
      <EmptyState title="Analytics unavailable" description={error || "Login required."} />
    )
  }

  const totalRevenue = transactions.reduce((sum, item) => sum + item.total_price, 0)
  const totalCarbon = listings.reduce((sum, item) => sum + item.carbon_saved_kg, 0)
  const performanceBars = [34, 48, 51, 44, 62, 67, 71, 59]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Revenue Trend" value={`${totalRevenue.toLocaleString()} TND`} icon={<TrendingUp size={20} />} />
        <StatCard title="Carbon Score" value={`${totalCarbon.toLocaleString()} kg`} icon={<Leaf size={20} />} />
        <StatCard title="Data Points" value={listings.length + transactions.length} icon={<BarChart3 size={20} />} />
      </div>

      <Card className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Chart Placeholder
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Weekly performance snapshot
        </h2>
        <div className="mt-6 rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,#f8fafc,#effaf5)] p-5">
          <div className="flex items-end gap-3">
            {performanceBars.map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-52 w-full items-end rounded-2xl bg-white/70 p-2">
                  <div
                    className="w-full rounded-xl bg-gradient-to-t from-emerald-600 to-emerald-300"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-400">Q{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AnalyticsOverview
