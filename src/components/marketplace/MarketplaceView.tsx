import { useMemo, useState } from "react";
import type { BiomassListing } from "@/lib/database.types";
import BiomassCard from "./BiomassCard";
import BiomassFilters, { filterListings, type BiomassFilterState } from "./BiomassFilters";
import EmptyState from "@/components/common/EmptyState";

export function MarketplaceView({ listings }: { listings: BiomassListing[] }) {
  const [filters, setFilters] = useState<BiomassFilterState>({ search: "", type: "", location: "", sort: "newest", maxPrice: "" });
  const types = Array.from(new Set(listings.map((listing) => listing.biomass_type)));
  const locations = Array.from(new Set(listings.map((listing) => listing.location)));
  const visibleListings = useMemo(() => filterListings(listings, filters), [listings, filters]);

  return (
    <div className="space-y-6">
      <BiomassFilters filters={filters} onChange={setFilters} types={types} locations={locations} />
      {visibleListings.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleListings.map((listing) => <BiomassCard key={listing.id} listing={listing} />)}
        </div>
      ) : (
        <EmptyState title="No listings match these filters" description="Try a different biomass type, region, or price range." />
      )}
    </div>
  );
}

export default MarketplaceView;
