import { s as supabase } from './auth_DwlCj7dW.mjs';

async function createTransaction(data) {
  const { data: created, error } = await supabase.from("biomass_transactions").insert(data).select().single();
  if (error) throw error;
  return created;
}
async function updateTransaction(id, data) {
  const { data: updated, error } = await supabase.from("biomass_transactions").update(data).eq("id", id).select().single();
  if (error) throw error;
  return updated;
}
async function getTransactionsForUser(userId, role) {
  const column = role === "farmer" ? "farmer_id" : "industry_id";
  const { data, error } = await supabase.from("biomass_transactions").select("*").eq(column, userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
async function updateTransactionStatus(id, status) {
  const { data, error } = await supabase.from("biomass_transactions").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
async function getTransactionById(id) {
  const { data, error } = await supabase.from("biomass_transactions").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}
async function getAllTransactions() {
  const { data, error } = await supabase.from("biomass_transactions").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export { getAllTransactions as a, getTransactionById as b, createTransaction as c, updateTransactionStatus as d, getTransactionsForUser as g, updateTransaction as u };
