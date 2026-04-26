import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "./database.types";

const roles: UserRole[] = ["farmer", "industry", "health_actor", "admin"];

function normalizeRole(value: unknown): UserRole {
  return roles.includes(value as UserRole) ? (value as UserRole) : "farmer";
}

function stringMetadata(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function profileFromUserMetadata(user: User) {
  const metadata = user.user_metadata as Record<string, unknown>;

  return {
    id: user.id,
    full_name: stringMetadata(metadata, "full_name") ?? user.email ?? "New user",
    role: normalizeRole(metadata.role),
    organization_name: stringMetadata(metadata, "organization_name"),
    phone: stringMetadata(metadata, "phone"),
    location: stringMetadata(metadata, "location"),
  };
}

export async function ensureProfileForUser(supabase: SupabaseClient, user: User) {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;
  if (selectError) throw selectError;

  const { data: created, error: upsertError } = await supabase
    .from("profiles")
    .upsert(profileFromUserMetadata(user))
    .select("*")
    .single();

  if (upsertError) throw upsertError;
  return created as Profile;
}
