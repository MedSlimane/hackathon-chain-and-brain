import { createServerClient, parseCookieHeader } from '@supabase/ssr';

const supabaseUrl = "https://oiqpucaapzrmzdmcfvoz.supabase.co";
const supabaseKey = "sb_publishable_usrzZx6pnwYNKv7-jCHRdQ_SK1W-EmL";
const missingEnvMessage = "Missing Supabase environment variables. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env.";
const hasSupabaseServerConfig = Boolean(supabaseKey);
function assertSupabaseServerConfig() {
  if (!hasSupabaseServerConfig) {
    throw new Error(missingEnvMessage);
  }
}
function createSupabaseServerClient(context, responseHeaders) {
  assertSupabaseServerConfig();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(context.request.headers.get("Cookie") ?? "").flatMap(
          ({ name, value }) => value ? [{ name, value }] : []
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
      }
    }
  });
}

export { createSupabaseServerClient as c, hasSupabaseServerConfig as h };
