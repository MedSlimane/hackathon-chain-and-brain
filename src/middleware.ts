import { defineMiddleware } from "astro:middleware";
import { dashboardPathForRole, getSafeRedirectPath } from "@/lib/auth";
import type { UserRole } from "@/lib/database.types";
import { ensureProfileForUser } from "@/lib/profiles";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabaseServer";

type ProtectedRoute = {
  prefix: string;
  roles?: UserRole[];
};

const authRoutes = new Set(["/login", "/register"]);

const protectedRoutes: ProtectedRoute[] = [
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
  { prefix: "/settings", roles: ["farmer", "industry", "health_actor", "admin"] },
];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function getProtectedRoute(pathname: string) {
  return protectedRoutes.find((route) => matchesPrefix(pathname, route.prefix));
}

function loginRedirectPath(pathname: string, search: string, reason?: string) {
  const params = new URLSearchParams();
  params.set("redirectTo", `${pathname}${search}`);
  if (reason) params.set("reason", reason);
  return `/login?${params.toString()}`;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  const protectedRoute = getProtectedRoute(pathname);
  const authHeaders = new Headers();

  function withAuthHeaders(response: Response) {
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
    error: userError,
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
