import { e as ensureProfileForUser, d as dashboardPathForRole, g as getSafeRedirectPath } from '../../chunks/auth_DwlCj7dW.mjs';
import { h as hasSupabaseServerConfig, c as createSupabaseServerClient } from '../../chunks/supabaseServer_BUX5AfY7.mjs';
export { renderers } from '../../renderers.mjs';

function withHeaders(response, headers) {
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}
async function GET(context) {
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
    data: { user }
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
