import { demoAiPredictions, demoBlockchainRecords, demoListings, demoProfiles, demoSecurityLogs, demoTransactions } from "./sampleData";
import { supabase, hasSupabaseConfig } from "./supabaseClient";

export async function getSecurityLogs() {
  if (!hasSupabaseConfig) return demoSecurityLogs;
  const { data, error } = await supabase.from("security_logs").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPlatformStats() {
  if (!hasSupabaseConfig) {
    return {
      totalUsers: demoProfiles.length,
      totalListings: demoListings.length,
      totalTransactions: demoTransactions.length,
      highSeverityAlerts: demoSecurityLogs.filter((log) => ["high", "critical"].includes(log.severity)).length,
    };
  }

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
  if (!hasSupabaseConfig) return demoBlockchainRecords;
  const { data, error } = await supabase.from("blockchain_records").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAiPredictionLogs() {
  if (!hasSupabaseConfig) return demoAiPredictions;
  const { data, error } = await supabase.from("ai_predictions").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
