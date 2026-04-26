import { useEffect, useState } from "react"
import { Boxes, Leaf, Store } from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import EmptyState from "@/components/common/EmptyState"
import LoadingState from "@/components/common/LoadingState"
import StatCard from "@/components/common/StatCard"
import CreateListingForm from "@/components/marketplace/CreateListingForm"
import { getCurrentProfile } from "@/lib/auth"
import type { BiomassListing, Profile } from "@/lib/database.types"
import { getListingsByFarmer } from "@/lib/listings"

export function ListingsOverview() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<BiomassListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile()
      if (!currentProfile) throw new Error("Login required.")

      if (currentProfile.role !== "farmer" && currentProfile.role !== "admin") {
        throw new Error("Farmer listing access required.")
      }

      const nextListings = await getListingsByFarmer(currentProfile.id)

      setProfile(currentProfile)
      setListings(nextListings)
    }

    load()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load listings.")
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState label="Loading listings" />
  if (error || !profile) {
    return (
      <EmptyState title="Listings unavailable" description={error || "Login required."} />
    )
  }

  const availableCount = listings.filter((listing) => listing.status === "available").length
  const totalCarbon = listings.reduce((sum, listing) => sum + listing.carbon_saved_kg, 0)

  return (
    <div className="space-y-6">
      {profile.role === "farmer" ? (
        <div id="create-listing">
          <CreateListingForm farmerId={profile.id} />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Listing Count" value={listings.length} icon={<Store size={20} />} />
        <StatCard title="Available Lots" value={availableCount} icon={<Boxes size={20} />} />
        <StatCard title="Carbon Saved" value={`${totalCarbon.toLocaleString()} kg`} icon={<Leaf size={20} />} />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200/80 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Listings
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Biomass inventory
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-950">{listing.title}</td>
                  <td className="px-6 py-4 text-slate-600">{listing.biomass_type}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {listing.quantity_kg.toLocaleString()} kg
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={listing.status === "available" ? "success" : "warning"}>
                      {listing.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default ListingsOverview
