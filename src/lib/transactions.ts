import type { TransactionStatus, UserRole } from "./database.types";
import { demoTransactions } from "./sampleData";
import { supabase, hasSupabaseConfig } from "./supabaseClient";

export async function createTransaction(data: {
  listing_id: string;
  farmer_id: string;
  industry_id: string;
  quantity_kg: number;
  agreed_price_per_kg: number;
  delivery_location?: string;
  delivery_date?: string;
}) {
  const { data: created, error } = await supabase.from("biomass_transactions").insert(data).select().single();
  if (error) throw error;
  return created;
}

export async function getTransactionsForUser(userId: string, role: UserRole) {
  if (!hasSupabaseConfig) {
    return demoTransactions.filter((transaction) => role === "farmer" ? transaction.farmer_id === userId : transaction.industry_id === userId);
  }
  const column = role === "farmer" ? "farmer_id" : "industry_id";
  const { data, error } = await supabase.from("biomass_transactions").select("*").eq(column, userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateTransactionStatus(id: string, status: TransactionStatus) {
  const { data, error } = await supabase.from("biomass_transactions").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
