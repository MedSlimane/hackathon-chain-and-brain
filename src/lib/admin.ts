import type { AiPrediction, BlockchainRecord, Profile, SecurityLog } from "./database.types";
import { supabase } from "./supabaseClient";

export async function getSecurityLogs() {
  const { data, error } = await supabase.from("security_logs").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as SecurityLog[];
}

export async function getPlatformStats() {
  const [users, listings, transactions, alerts] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("biomass_listings").select("id", { count: "exact", head: true }),
    supabase.from("biomass_transactions").select("id", { count: "exact", head: true }),
    supabase.from("security_logs").select("id", { count: "exact", head: true }).in("severity", ["high", "critical"]),
  ]);

  return {
    totalUsers: users.count ?? 0,
    totalListings: listings.count ?? 0,
    totalTransactions: transactions.count ?? 0,
    highSeverityAlerts: alerts.count ?? 0,
  };
}

export async function getBlockchainRecords() {
  const { data, error } = await supabase.from("blockchain_records").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as BlockchainRecord[];
}

export async function getAiPredictionLogs() {
  const { data, error } = await supabase.from("ai_predictions").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as AiPrediction[];
}

export async function getProfiles() {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Profile[];
}
