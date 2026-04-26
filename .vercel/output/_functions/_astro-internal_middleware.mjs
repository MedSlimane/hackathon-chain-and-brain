import { d as defineMiddleware, s as sequence } from './chunks/index_DqV0-B6v.mjs';
import { e as ensureProfileForUser, d as dashboardPathForRole, g as getSafeRedirectPath } from './chunks/auth_DwlCj7dW.mjs';
import { h as hasSupabaseServerConfig, c as createSupabaseServerClient } from './chunks/supabaseServer_BUX5AfY7.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_CzV9kBye.mjs';
import 'piccolore';
import './chunks/astro/server_CTPEiHAX.mjs';
import 'clsx';

const authRoutes = /* @__PURE__ */ new Set(["/login", "/register"]);
const protectedRoutes = [
  { prefix: "/dashboard/admin", roles: ["admin"] },
  { prefix: "/dashboard/farmer", roles: ["farmer", "admin"] },
  { prefix: "/dashboard/industry", roles: ["industry", "admin"] },
  { prefix: "/dashboard/health", roles: ["health_actor", "admin"] },
  { prefix: "/dashboard/health-risk", roles: ["health_actor", "admin"] },
  { prefix: "/dashboard/scan-dechets", roles: ["health_actor", "admin"] },
  { prefix: "/listings", roles: ["farmer", "admin"] },
  { prefix: "/marketplace", roles: ["industry", "admin"] },
  { prefix: "/transactions", roles: ["farmer", "industry", "admin"] },
  { prefix: "/analytics", roles: ["farmer", "industry", "admin"] },
  { prefix: "/settings", roles: ["farmer", "industry", "health_actor", "admin"] }
];
function matchesPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
function getProtectedRoute(pathname) {
  return protectedRoutes.find((route) => matchesPrefix(pathname, route.prefix));
}
function loginRedirectPath(pathname, search, reason) {
  const params = new URLSearchParams();
  params.set("redirectTo", `${pathname}${search}`);
  if (reason) params.set("reason", reason);
  return `/login?${params.toString()}`;
}
const onRequest$1 = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  const protectedRoute = getProtectedRoute(pathname);
  const authHeaders = new Headers();
  function withAuthHeaders(response) {
    authHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }
  context.locals.user = null;
  context.locals.profile = null;
  if (!hasSupabaseServerConfig) {
    if (protectedRoute) {
      return context.redirect(loginRedirectPath(pathname, search, "missing_config"));
    }
    return next();
  }
  const supabase = createSupabaseServerClient(context, authHeaders);
  context.locals.supabase = supabase;
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (!userError && user) {
    context.locals.user = user;
    try {
      context.locals.profile = await ensureProfileForUser(supabase, user);
    } catch {
      context.locals.profile = null;
    }
  }
  if (authRoutes.has(pathname) && context.locals.profile) {
    const fallback = dashboardPathForRole(context.locals.profile.role);
    const requestedPath = getSafeRedirectPath(context.url.searchParams.get("redirectTo"), fallback);
    return withAuthHeaders(context.redirect(requestedPath));
  }
  if (!protectedRoute) {
    return withAuthHeaders(await next());
  }
  if (!context.locals.user) {
    return withAuthHeaders(context.redirect(loginRedirectPath(pathname, search, "auth_required")));
  }
  if (!context.locals.profile) {
    return withAuthHeaders(context.redirect(loginRedirectPath(pathname, search, "missing_profile")));
  }
  if (protectedRoute.roles && !protectedRoute.roles.includes(context.locals.profile.role)) {
    return withAuthHeaders(context.redirect(`${dashboardPathForRole(context.locals.profile.role)}?unauthorized=1`));
  }
  return withAuthHeaders(await next());
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
