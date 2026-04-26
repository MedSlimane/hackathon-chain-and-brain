import { useEffect, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import type { BiomassListing } from "@/lib/database.types";
import { getAvailableListings } from "@/lib/listings";
import MarketplaceView from "./MarketplaceView";

export function MarketplaceData() {
  const [listings, setListings] = useState<BiomassListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAvailableListings()
      .then(setListings)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load marketplace."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading live Supabase listings" />;
  if (error) return <EmptyState title="Unable to load marketplace" description={error} />;
  return <MarketplaceView listings={listings} />;
}

export default MarketplaceData;
