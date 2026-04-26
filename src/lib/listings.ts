import type { BiomassListing } from "./database.types";
import { supabase } from "./supabaseClient";

export async function getAvailableListings() {
  const { data, error } = await supabase.from("biomass_listings").select("*").eq("status", "available").order("created_at", { ascending: false });
  if (error) throw error;
  return data as BiomassListing[];
}

export async function getListingById(id: string) {
  const { data, error } = await supabase.from("biomass_listings").select("*").eq("id", id).single();
  if (error) throw error;
  return data as BiomassListing;
}

export async function createListing(data: Partial<BiomassListing>) {
  const { data: created, error } = await supabase.from("biomass_listings").insert(data).select().single();
  if (error) throw error;
  return created as BiomassListing;
}

export async function updateListing(id: string, data: Partial<BiomassListing>) {
  const { data: updated, error } = await supabase.from("biomass_listings").update(data).eq("id", id).select().single();
  if (error) throw error;
  return updated as BiomassListing;
}

export async function getListingsByFarmer(farmerId: string) {
  const { data, error } = await supabase.from("biomass_listings").select("*").eq("farmer_id", farmerId).order("created_at", { ascending: false });
  if (error) throw error;
  return data as BiomassListing[];
}

export async function getListingsForCurrentUser() {
  const { data, error } = await supabase.from("biomass_listings").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as BiomassListing[];
}

export async function getListingsForHealthScan() {
  const { data, error } = await supabase.from("biomass_listings").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as BiomassListing[];
}
