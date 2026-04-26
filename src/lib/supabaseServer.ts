import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { APIContext } from "astro";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const missingEnvMessage =
  "Missing Supabase environment variables. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env.";

export const hasSupabaseServerConfig = Boolean(supabaseUrl && supabaseKey);

export function assertSupabaseServerConfig() {
  if (!hasSupabaseServerConfig) {
    throw new Error(missingEnvMessage);
  }
}

export function createSupabaseServerClient(context: APIContext, responseHeaders?: Headers) {
  assertSupabaseServerConfig();

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return parseCookieHeader(context.request.headers.get("Cookie") ?? "").flatMap(({ name, value }) =>
          value ? [{ name, value }] : [],
        );
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          context.cookies.set(name, value, options);
        });

        if (responseHeaders) {
          responseHeaders.set("Cache-Control", "private, no-store");
          responseHeaders.set("Pragma", "no-cache");
          responseHeaders.set("Expires", "0");
        }
      },
    },
  });
}
