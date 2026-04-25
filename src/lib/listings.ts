import type { BiomassListing } from "./database.types";
import { demoListings } from "./sampleData";
import { supabase, hasSupabaseConfig } from "./supabaseClient";

export async function getAvailableListings() {
  if (!hasSupabaseConfig) return demoListings.filter((listing) => listing.status === "available");
  const { data, error } = await supabase.from("biomass_listings").select("*").eq("status", "available").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getListingById(id: string) {
  if (!hasSupabaseConfig) return demoListings.find((listing) => listing.id === id) ?? null;
  const { data, error } = await supabase.from("biomass_listings").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createListing(data: Partial<BiomassListing>) {
  const { data: created, error } = await supabase.from("biomass_listings").insert(data).select().single();
  if (error) throw error;
  return created;
}

export async function updateListing(id: string, data: Partial<BiomassListing>) {
  const { data: updated, error } = await supabase.from("biomass_listings").update(data).eq("id", id).select().single();
  if (error) throw error;
  return updated;
}

export async function getListingsByFarmer(farmerId: string) {
  if (!hasSupabaseConfig) return demoListings.filter((listing) => listing.farmer_id === farmerId);
  const { data, error } = await supabase.from("biomass_listings").select("*").eq("farmer_id", farmerId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
