import type { UserRole } from "./database.types";
import { profileFromUserMetadata } from "./profiles";
import { assertSupabaseConfig, supabase } from "./supabaseClient";
import type { registerSchema } from "./validators";
import type { z } from "zod";

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) return null;
  return data;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

export async function requireRole(role: UserRole) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== role) throw new Error("You do not have access to this area.");
  return profile;
}

export async function signIn(email: string, password: string) {
  assertSupabaseConfig();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(input: z.infer<typeof registerSchema>) {
  assertSupabaseConfig();
  const nextPath = dashboardPathForRole(input.role);
  const emailRedirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` : undefined;

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo,
      data: {
        full_name: input.full_name,
        role: input.role,
        organization_name: input.organization_name || null,
        phone: input.phone || null,
        location: input.location || null,
      },
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return a user.");
  if (!data.session) return data;

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profileFromUserMetadata(data.user));
  if (profileError) throw profileError;

  return data;
}

export async function signOut() {
  assertSupabaseConfig();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function dashboardPathForRole(role: UserRole) {
  if (role === "health_actor") return "/dashboard/health";
  return `/dashboard/${role}`;
}

export function getSafeRedirectPath(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
