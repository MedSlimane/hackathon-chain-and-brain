import type { BiomassListing, BiomassTransaction, BlockchainRecord } from "./database.types";
import { supabase } from "./supabaseClient";

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
    .join(",")}}`;
}

export async function generateHash(payload: unknown) {
  const encoded = new TextEncoder().encode(stableStringify(payload));
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded);
    return `0x${Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  }

  let hash = 0;
  const text = stableStringify(payload);
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, "0").slice(0, 64)}`;
}

export async function createBlockchainRecord(input: {
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string | null;
  payload: Record<string, unknown>;
  previousHash?: string | null;
}) {
  const hash = await generateHash(input);
  const record = {
    entity_type: input.entityType,
    entity_id: input.entityId,
    action: input.action,
    actor_id: input.actorId ?? null,
    hash,
    previous_hash: input.previousHash ?? null,
    payload: input.payload,
  };
  const { data, error } = await supabase.from("blockchain_records").insert(record).select().single();
  if (error) throw error;
  return data;
}

export function createBatchHash(listing: Partial<BiomassListing>) {
  return generateHash({
    id: listing.id,
    farmer_id: listing.farmer_id,
    biomass_type: listing.biomass_type,
    quantity_kg: listing.quantity_kg,
    timestamp: listing.created_at ?? new Date().toISOString(),
  });
}

export function createTransactionHash(transaction: Partial<BiomassTransaction>) {
  return generateHash({
    id: transaction.id,
    listing_id: transaction.listing_id,
    farmer_id: transaction.farmer_id,
    industry_id: transaction.industry_id,
    total_price: transaction.total_price,
    timestamp: transaction.created_at ?? new Date().toISOString(),
  });
}

export async function verifyRecord(record: BlockchainRecord) {
  if (!record.hash?.startsWith("0x") || record.hash.length !== 66) return false;
  return true;
}
