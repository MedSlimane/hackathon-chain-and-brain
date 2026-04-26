import { createBrowserClient } from '@supabase/ssr';

const roles = ["farmer", "industry", "health_actor", "admin"];
function normalizeRole(value) {
  return roles.includes(value) ? value : "farmer";
}
function stringMetadata(metadata, key) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
function profileFromUserMetadata(user) {
  const metadata = user.user_metadata;
  return {
    id: user.id,
    full_name: stringMetadata(metadata, "full_name") ?? user.email ?? "New user",
    role: normalizeRole(metadata.role),
    organization_name: stringMetadata(metadata, "organization_name"),
    phone: stringMetadata(metadata, "phone"),
    location: stringMetadata(metadata, "location")
  };
}
async function ensureProfileForUser(supabase, user) {
  const { data: existing, error: selectError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (existing) return existing;
  if (selectError) throw selectError;
  const { data: created, error: upsertError } = await supabase.from("profiles").upsert(profileFromUserMetadata(user)).select("*").single();
  if (upsertError) throw upsertError;
  return created;
}

const supabaseUrl = "https://oiqpucaapzrmzdmcfvoz.supabase.co";
const supabaseKey = "sb_publishable_usrzZx6pnwYNKv7-jCHRdQ_SK1W-EmL";
const missingEnvMessage = "Missing Supabase environment variables. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env.";
const hasSupabaseConfig = Boolean(supabaseKey);
const supabase = createBrowserClient(
  supabaseUrl,
  supabaseKey
);
function assertSupabaseConfig() {
  if (!hasSupabaseConfig) {
    throw new Error(missingEnvMessage);
  }
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}
async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) return null;
  return data;
}
async function signIn(email, password) {
  assertSupabaseConfig();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
async function signUp(input) {
  assertSupabaseConfig();
  const nextPath = dashboardPathForRole(input.role);
  const emailRedirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` : void 0;
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
        location: input.location || null
      }
    }
  });
  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return a user.");
  if (!data.session) return data;
  const { error: profileError } = await supabase.from("profiles").upsert(profileFromUserMetadata(data.user));
  if (profileError) throw profileError;
  return data;
}
async function signOut() {
  assertSupabaseConfig();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
function dashboardPathForRole(role) {
  if (role === "health_actor") return "/dashboard/health";
  return `/dashboard/${role}`;
}
function getSafeRedirectPath(value, fallback) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export { getCurrentProfile as a, assertSupabaseConfig as b, signIn as c, dashboardPathForRole as d, ensureProfileForUser as e, signUp as f, getSafeRedirectPath as g, signOut as h, profileFromUserMetadata as p, supabase as s };
