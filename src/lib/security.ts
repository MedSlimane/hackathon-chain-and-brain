import type { BiomassListing, BiomassTransaction, SecurityLog } from "./database.types";
import { supabase } from "./supabaseClient";

export async function logSecurityEvent(input: {
  userId?: string | null;
  eventType: string;
  severity?: SecurityLog["severity"];
  details?: Record<string, unknown>;
}) {
  const { data, error } = await supabase
    .from("security_logs")
    .insert({
      user_id: input.userId ?? null,
      event_type: input.eventType,
      severity: input.severity ?? "low",
      details: input.details ?? {},
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function detectListingAnomaly(listing: Partial<BiomassListing> & { edit_count_recent?: number }) {
  const predicted = listing.predicted_price_per_kg ?? 0;
  const price = listing.price_per_kg ?? 0;
  const alerts: Array<{ severity: SecurityLog["severity"]; eventType: string; reason: string }> = [];

  if (predicted > 0 && price > predicted * 3) {
    alerts.push({ severity: "high", eventType: "suspicious_price", reason: "Price is more than 3x predicted price." });
  }
  if ((listing.quantity_kg ?? 0) > 100000) {
    alerts.push({ severity: "high", eventType: "suspicious_quantity", reason: "Quantity is unusually large." });
  }
  if ((listing.quality_score ?? 100) < 20 && predicted > 0 && price > predicted * 1.4) {
    alerts.push({ severity: "medium", eventType: "low_quality_high_price", reason: "Low quality with a high price." });
  }
  if ((listing.edit_count_recent ?? 0) > 6) {
    alerts.push({ severity: "medium", eventType: "rapid_listing_edits", reason: "Too many edits in a short time." });
  }

  return alerts;
}

export function detectTransactionAnomaly(transaction: Partial<BiomassTransaction> & { cancelled_count?: number; is_new_user?: boolean }) {
  const total = transaction.total_price ?? (transaction.quantity_kg ?? 0) * (transaction.agreed_price_per_kg ?? 0);
  const alerts: Array<{ severity: SecurityLog["severity"]; eventType: string; reason: string }> = [];

  if (total > 50000) alerts.push({ severity: "high", eventType: "high_value_transaction", reason: "Transaction value is unusually high." });
  if ((transaction.cancelled_count ?? 0) > 3) alerts.push({ severity: "medium", eventType: "repeated_cancellations", reason: "Repeated cancelled transactions." });
  if (transaction.is_new_user && (transaction.quantity_kg ?? 0) > 50000) {
    alerts.push({ severity: "medium", eventType: "new_user_huge_quantity", reason: "New account with a huge order quantity." });
  }

  return alerts;
}

export function detectLoginAnomaly(event: { failedAttempts?: number; unknownDevice?: boolean; impossibleTravel?: boolean }) {
  if ((event.failedAttempts ?? 0) >= 6) return { severity: "high" as const, eventType: "failed_login_burst" };
  if (event.impossibleTravel) return { severity: "high" as const, eventType: "impossible_travel" };
  if (event.unknownDevice) return { severity: "medium" as const, eventType: "unknown_device" };
  return { severity: "low" as const, eventType: "login" };
}
