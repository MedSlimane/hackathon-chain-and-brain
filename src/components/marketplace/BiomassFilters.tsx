import type { BiomassListing } from "@/lib/database.types";

export interface BiomassFilterState {
  search: string;
  type: string;
  location: string;
  sort: string;
  maxPrice: string;
}

export function filterListings(listings: BiomassListing[], filters: BiomassFilterState) {
  const search = filters.search.toLowerCase();
  const filtered = listings.filter((listing) => {
    const matchesSearch = !search || `${listing.title} ${listing.biomass_type} ${listing.location}`.toLowerCase().includes(search);
    const matchesType = !filters.type || listing.biomass_type === filters.type;
    const matchesLocation = !filters.location || listing.location === filters.location;
    const matchesPrice = !filters.maxPrice || listing.price_per_kg <= Number(filters.maxPrice);
    return matchesSearch && matchesType && matchesLocation && matchesPrice;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === "price") return a.price_per_kg - b.price_per_kg;
    if (filters.sort === "quantity") return b.quantity_kg - a.quantity_kg;
    if (filters.sort === "carbon") return b.carbon_saved_kg - a.carbon_saved_kg;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function BiomassFilters({
  filters,
  onChange,
  types,
  locations,
}: {
  filters: BiomassFilterState;
  onChange: (filters: BiomassFilterState) => void;
  types: string[];
  locations: string[];
}) {
  const set = (key: keyof BiomassFilterState, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
      <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Search biomass" value={filters.search} onChange={(event) => set("search", event.target.value)} />
      <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={filters.type} onChange={(event) => set("type", event.target.value)}>
        <option value="">All types</option>
        {types.map((type) => <option key={type} value={type}>{type}</option>)}
      </select>
      <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={filters.location} onChange={(event) => set("location", event.target.value)}>
        <option value="">All regions</option>
        {locations.map((location) => <option key={location} value={location}>{location}</option>)}
      </select>
      <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Max TND/kg" type="number" min="0" step="0.01" value={filters.maxPrice} onChange={(event) => set("maxPrice", event.target.value)} />
      <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={filters.sort} onChange={(event) => set("sort", event.target.value)}>
        <option value="newest">Newest</option>
        <option value="price">Price</option>
        <option value="quantity">Quantity</option>
        <option value="carbon">Carbon saved</option>
      </select>
    </div>
  );
}

export default BiomassFilters;
