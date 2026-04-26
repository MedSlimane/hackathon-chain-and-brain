import { s as supabase } from './auth_DwlCj7dW.mjs';

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
}
async function generateHash(payload) {
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
async function createBlockchainRecord(input) {
  const hash = await generateHash(input);
  const record = {
    entity_type: input.entityType,
    entity_id: input.entityId,
    action: input.action,
    actor_id: input.actorId ?? null,
    hash,
    previous_hash: input.previousHash ?? null,
    payload: input.payload
  };
  const { data, error } = await supabase.from("blockchain_records").insert(record).select().single();
  if (error) throw error;
  return data;
}
function createBatchHash(listing) {
  return generateHash({
    id: listing.id,
    farmer_id: listing.farmer_id,
    biomass_type: listing.biomass_type,
    quantity_kg: listing.quantity_kg,
    timestamp: listing.created_at ?? (/* @__PURE__ */ new Date()).toISOString()
  });
}
function createTransactionHash(transaction) {
  return generateHash({
    id: transaction.id,
    listing_id: transaction.listing_id,
    farmer_id: transaction.farmer_id,
    industry_id: transaction.industry_id,
    total_price: transaction.total_price,
    timestamp: transaction.created_at ?? (/* @__PURE__ */ new Date()).toISOString()
  });
}

export { createBlockchainRecord as a, createTransactionHash as b, createBatchHash as c };
