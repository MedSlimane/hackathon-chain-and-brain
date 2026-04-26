import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const missingEnvMessage =
  "Missing Supabase environment variables. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env.";

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);

if (!hasSupabaseConfig && import.meta.env.DEV) {
  console.warn(missingEnvMessage);
}

export const supabase = createBrowserClient(
  supabaseUrl || "https://example.supabase.co",
  supabaseKey || "public-anon-key",
);

export function assertSupabaseConfig() {
  if (!hasSupabaseConfig) {
    throw new Error(missingEnvMessage);
  }
}
