import type { APIContext } from "astro";
import { dashboardPathForRole, getSafeRedirectPath } from "@/lib/auth";
import { ensureProfileForUser } from "@/lib/profiles";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabaseServer";

function withHeaders(response: Response, headers: Headers) {
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export async function GET(context: APIContext) {
  const authHeaders = new Headers();
  const code = context.url.searchParams.get("code");

  if (!hasSupabaseServerConfig) {
    return context.redirect("/login?reason=missing_config");
  }

  if (!code) {
    return context.redirect("/login?reason=auth_callback_failed");
  }

  const supabase = createSupabaseServerClient(context, authHeaders);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return withHeaders(context.redirect("/login?reason=auth_callback_failed"), authHeaders);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return withHeaders(context.redirect("/login?reason=auth_required"), authHeaders);
  }

  try {
    const profile = await ensureProfileForUser(supabase, user);
    const fallback = dashboardPathForRole(profile.role);
    const nextPath = getSafeRedirectPath(context.url.searchParams.get("next"), fallback);

    return withHeaders(context.redirect(nextPath), authHeaders);
  } catch {
    return withHeaders(context.redirect("/login?reason=missing_profile"), authHeaders);
  }
}
