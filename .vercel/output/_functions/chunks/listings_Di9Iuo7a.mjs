import { s as supabase } from './auth_DwlCj7dW.mjs';

async function getAvailableListings() {
  const { data, error } = await supabase.from("biomass_listings").select("*").eq("status", "available").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
async function getListingById(id) {
  const { data, error } = await supabase.from("biomass_listings").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}
async function createListing(data) {
  const { data: created, error } = await supabase.from("biomass_listings").insert(data).select().single();
  if (error) throw error;
  return created;
}
async function updateListing(id, data) {
  const { data: updated, error } = await supabase.from("biomass_listings").update(data).eq("id", id).select().single();
  if (error) throw error;
  return updated;
}
async function getListingsByFarmer(farmerId) {
  const { data, error } = await supabase.from("biomass_listings").select("*").eq("farmer_id", farmerId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
async function getListingsForCurrentUser() {
  const { data, error } = await supabase.from("biomass_listings").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
async function getListingsForHealthScan() {
  const { data, error } = await supabase.from("biomass_listings").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export { getListingsForCurrentUser as a, getListingsForHealthScan as b, getListingById as c, createListing as d, getAvailableListings as e, getListingsByFarmer as g, updateListing as u };
