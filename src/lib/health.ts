import type { HealthIndicator, PollutionReport } from "./database.types";
import { supabase } from "./supabaseClient";

export async function getPollutionReports() {
  const { data, error } = await supabase.from("pollution_reports").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as PollutionReport[];
}

export async function createPollutionReport(data: {
  region: string;
  pollution_level: number;
  burned_waste_estimate_kg: number;
  respiratory_risk_score: number;
  notes?: string;
}, reporterId?: string) {
  const payload = {
    ...data,
    reporter_id: reporterId ?? null,
  };
  const { data: created, error } = await supabase.from("pollution_reports").insert(payload).select().single();
  if (error) throw error;
  return created as PollutionReport;
}

export async function getHealthIndicators() {
  const { data, error } = await supabase.from("health_indicators").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as HealthIndicator[];
}
