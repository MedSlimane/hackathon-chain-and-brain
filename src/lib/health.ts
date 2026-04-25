import { demoHealthIndicators, demoPollutionReports } from "./sampleData";
import { supabase, hasSupabaseConfig } from "./supabaseClient";

export async function getPollutionReports() {
  if (!hasSupabaseConfig) return demoPollutionReports;
  const { data, error } = await supabase.from("pollution_reports").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPollutionReport(data: {
  region: string;
  pollution_level: number;
  burned_waste_estimate_kg: number;
  respiratory_risk_score: number;
  notes?: string;
}) {
  const { data: created, error } = await supabase.from("pollution_reports").insert(data).select().single();
  if (error) throw error;
  return created;
}

export async function getHealthIndicators() {
  if (!hasSupabaseConfig) return demoHealthIndicators;
  const { data, error } = await supabase.from("health_indicators").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
