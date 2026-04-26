import { useEffect, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import { getCurrentProfile } from "@/lib/auth";
import type { BiomassListing } from "@/lib/database.types";
import { getAvailableListings } from "@/lib/listings";
import MarketplaceView from "./MarketplaceView";

export function MarketplaceData() {
  const [buyerId, setBuyerId] = useState("");
  const [listings, setListings] = useState<BiomassListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const profile = await getCurrentProfile();
      if (!profile) throw new Error("Login required.");
      if (profile.role !== "industry" && profile.role !== "admin") {
        throw new Error("Marketplace purchases are available for industry buyers only.");
      }

      const availableListings = await getAvailableListings();
      setBuyerId(profile.id);
      setListings(availableListings);
    }

    load()
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load marketplace."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading live Supabase listings" />;
  if (error) return <EmptyState title="Unable to load marketplace" description={error} />;
  return <MarketplaceView buyerId={buyerId} listings={listings} />;
}

export default MarketplaceData;
