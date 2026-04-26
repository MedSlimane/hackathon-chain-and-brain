import { e as createComponent, l as renderHead, k as renderComponent, r as renderTemplate, n as renderSlot, h as createAstro } from './astro/server_CTPEiHAX.mjs';
import 'piccolore';
/* empty css                         */
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { Menu, Bell, User, Settings, LogOut, ChevronDown, LayoutDashboard, PackageSearch, PackagePlus, ShoppingCart, HeartPulse, ScanSearch, ReceiptText, BarChart3, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { h as signOut, d as dashboardPathForRole } from './auth_DwlCj7dW.mjs';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function Dropdown({
  trigger,
  children,
  align = "right",
  className,
  contentClassName
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: cn("relative", className), ref: rootRef, children: [
    /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setOpen((value) => !value), children: trigger }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "absolute top-[calc(100%+0.75rem)] z-50 rounded-3xl border border-slate-200/80 bg-white p-2 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] transition-all duration-200",
          align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-95 opacity-0",
          contentClassName
        ),
        children
      }
    )
  ] });
}

function Header({
  title,
  subtitle,
  user,
  notifications
}) {
  const initials = useMemo(() => {
    const source = user?.name?.trim() || user?.email?.trim() || "A";
    return source.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
  }, [user?.email, user?.name]);
  async function handleLogout() {
    await signOut();
    window.location.href = "/login";
  }
  function toggleSidebar() {
    window.dispatchEvent(new CustomEvent("dashboard-sidebar-toggle"));
  }
  return /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: toggleSidebar,
          className: "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 lg:hidden",
          "aria-label": "Toggle navigation",
          children: /* @__PURE__ */ jsx(Menu, { size: 18 })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700", children: "AgriConnect Smart" }),
        /* @__PURE__ */ jsx("h1", { className: "truncate text-2xl font-semibold tracking-[-0.02em] text-slate-950", children: title }),
        subtitle ? /* @__PURE__ */ jsx("p", { className: "mt-1 truncate text-sm text-slate-500", children: subtitle }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        Dropdown,
        {
          trigger: /* @__PURE__ */ jsxs("span", { className: "relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700", children: [
            /* @__PURE__ */ jsx(Bell, { size: 18 }),
            notifications.length ? /* @__PURE__ */ jsx("span", { className: "absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-semibold text-white", children: notifications.length }) : null
          ] }),
          contentClassName: "w-80 max-w-[calc(100vw-2rem)]",
          children: /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 py-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-950", children: "Notifications" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Recent account and trading updates." })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700", children: [
                notifications.length,
                " new"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-2", children: notifications.map((notification) => /* @__PURE__ */ jsx(
              "div",
              {
                className: "rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-3 text-left",
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-900", children: notification.title }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-5 text-slate-500", children: notification.description })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400", children: notification.time })
                ] })
              },
              notification.id
            )) })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        Dropdown,
        {
          trigger: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-emerald-200", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-semibold text-white", children: initials }),
            /* @__PURE__ */ jsxs("span", { className: "hidden text-left md:block", children: [
              /* @__PURE__ */ jsx("span", { className: "block max-w-36 truncate text-sm font-medium text-slate-900", children: user?.name || "AgriConnect User" }),
              /* @__PURE__ */ jsx("span", { className: "block max-w-36 truncate text-xs text-slate-500", children: user?.email || "No email" })
            ] }),
            /* @__PURE__ */ jsx(ChevronDown, { size: 16, className: "text-slate-400" })
          ] }),
          contentClassName: "w-72 max-w-[calc(100vw-2rem)]",
          children: /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-slate-50 px-3 py-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-950", children: user?.name || "AgriConnect User" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-slate-500", children: user?.email || "No email" }),
              user?.role ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700", children: user.role.replace("_", " ") }) : null
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-1", children: [
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: "/settings",
                  className: "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700",
                  children: [
                    /* @__PURE__ */ jsx(User, { size: 16 }),
                    "Profile"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: "/settings",
                  className: "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700",
                  children: [
                    /* @__PURE__ */ jsx(Settings, { size: 16 }),
                    "Settings"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: handleLogout,
                  className: "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-rose-600 transition hover:bg-rose-50",
                  children: [
                    /* @__PURE__ */ jsx(LogOut, { size: 16 }),
                    "Logout"
                  ]
                }
              )
            ] })
          ] })
        }
      )
    ] })
  ] }) });
}

function Sidebar({ role = "admin" }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pathname, setPathname] = useState(
    () => typeof window === "undefined" ? "" : window.location.pathname
  );
  const isSidebarOpen = isHovered || isPinnedOpen;
  const links = useMemo(
    () => {
      const navigationLinks = [
        { href: dashboardPathForRole(role), label: "Dashboard", icon: LayoutDashboard }
      ];
      if (role === "farmer" || role === "admin") {
        navigationLinks.push({
          href: "/listings",
          label: "My Listings",
          icon: PackageSearch
        }, {
          href: "/listings#create-listing",
          label: "New Listing",
          icon: PackagePlus
        });
      }
      if (role === "industry" || role === "admin") {
        navigationLinks.push({
          href: "/marketplace",
          label: "Marketplace",
          icon: ShoppingCart
        });
      }
      if (role === "health_actor" || role === "admin") {
        navigationLinks.push(
          { href: "/dashboard/health-risk", label: "Risk map", icon: HeartPulse },
          { href: "/dashboard/scan-dechets", label: "Waste scan", icon: ScanSearch }
        );
      }
      if (role !== "health_actor") {
        navigationLinks.push({ href: "/transactions", label: "Transactions", icon: ReceiptText });
      }
      if (role !== "health_actor") {
        navigationLinks.push({ href: "/analytics", label: "Analytics", icon: BarChart3 });
      }
      navigationLinks.push({ href: "/settings", label: "Settings", icon: Settings });
      return navigationLinks;
    },
    [role]
  );
  useEffect(() => {
    function syncPathname() {
      setPathname(window.location.pathname);
      setMobileOpen(false);
    }
    function handleToggle() {
      setMobileOpen((value) => !value);
    }
    window.addEventListener("popstate", syncPathname);
    window.addEventListener("dashboard-sidebar-toggle", handleToggle);
    return () => {
      window.removeEventListener("popstate", syncPathname);
      window.removeEventListener(
        "dashboard-sidebar-toggle",
        handleToggle
      );
    };
  }, []);
  const handleMouseEnter = useCallback(() => {
    setIsHovered((currentIsHovered) => {
      if (currentIsHovered) {
        return currentIsHovered;
      }
      return true;
    });
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (isPinnedOpen) {
      return;
    }
    setIsHovered((currentIsHovered) => {
      if (!currentIsHovered) {
        return currentIsHovered;
      }
      return false;
    });
  }, [isPinnedOpen]);
  const togglePinnedOpen = useCallback(() => {
    setIsPinnedOpen((currentIsPinnedOpen) => {
      const nextIsPinnedOpen = !currentIsPinnedOpen;
      if (!nextIsPinnedOpen) {
        setIsHovered(false);
      }
      return nextIsPinnedOpen;
    });
  }, []);
  function isActive(href) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  function renderNavigation(isMobile = false) {
    const open = isMobile || isSidebarOpen;
    const CollapseIcon = isPinnedOpen ? PanelLeftClose : PanelLeftOpen;
    const collapseLabel = isPinnedOpen ? "Collapse" : open ? "Lock open" : "Expand";
    return /* @__PURE__ */ jsxs(
      "aside",
      {
        className: cn(
          "relative z-50 flex h-full flex-col border-r border-slate-200/70 bg-white px-3 py-4 transition-[width,box-shadow] duration-300",
          open ? "w-56 shadow-[18px_0_40px_-32px_rgba(15,23,42,0.45)]" : "w-16 shadow-none"
        ),
        onMouseEnter: isMobile ? void 0 : handleMouseEnter,
        onMouseLeave: isMobile ? void 0 : handleMouseLeave,
        "aria-expanded": open,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: "/",
                className: cn(
                  "flex h-9 min-w-0 items-center gap-2 text-slate-950",
                  open ? "" : "justify-center"
                ),
                title: open ? void 0 : "AgriConnect Smart",
                children: [
                  /* @__PURE__ */ jsx(LayoutDashboard, { size: 20, className: "shrink-0 text-emerald-700" }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: cn(
                        "min-w-0 transition-all duration-200",
                        !open ? "pointer-events-none w-0 overflow-hidden opacity-0" : "opacity-100"
                      ),
                      children: /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-semibold tracking-[-0.01em] text-slate-950", children: "AgriConnect Smart" })
                    }
                  )
                ]
              }
            ),
            isMobile ? /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setMobileOpen(false),
                className: "inline-flex h-8 w-8 items-center justify-center text-slate-600 hover:text-slate-950 lg:hidden",
                children: /* @__PURE__ */ jsx(X, { size: 18 })
              }
            ) : null
          ] }),
          /* @__PURE__ */ jsx("nav", { className: "mt-6 space-y-1", children: links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return /* @__PURE__ */ jsxs(
              "a",
              {
                href: link.href,
                className: cn(
                  "group flex h-9 items-center gap-3 border-l-2 px-2 text-sm font-medium transition-all duration-200",
                  active ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-600 hover:text-emerald-700",
                  open ? "" : "justify-center px-0"
                ),
                title: open ? void 0 : link.label,
                children: [
                  /* @__PURE__ */ jsx(Icon, { size: 17, className: "shrink-0" }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: cn(
                        "truncate transition-all duration-200",
                        !open ? "pointer-events-none w-0 overflow-hidden opacity-0" : "opacity-100"
                      ),
                      children: link.label
                    }
                  )
                ]
              },
              link.href
            );
          }) }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: cn(
                "mt-auto border-t border-slate-200 pt-4 transition-all duration-200",
                open ? "" : "px-0"
              ),
              children: [
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    className: cn(
                      "text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700",
                      open ? "" : "text-center"
                    ),
                    children: open ? "Smart Ops" : "AI"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: cn("mt-2 text-xs leading-5 text-slate-500", open ? "block" : "hidden"), children: "Listings, deals, and traceability in one workflow." })
              ]
            }
          ),
          !isMobile ? /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: togglePinnedOpen,
              className: cn(
                "mt-3 inline-flex h-9 items-center text-sm font-medium text-slate-600 transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                open ? "justify-start gap-3 px-2" : "justify-center px-0"
              ),
              "aria-label": isPinnedOpen ? "Collapse sidebar" : open ? "Lock sidebar open" : "Expand sidebar",
              "aria-pressed": isPinnedOpen,
              "aria-expanded": open,
              title: collapseLabel,
              children: [
                /* @__PURE__ */ jsx(CollapseIcon, { size: 18, className: "shrink-0" }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: cn(
                      "truncate transition-all duration-200",
                      open ? "opacity-100" : "pointer-events-none w-0 overflow-hidden opacity-0"
                    ),
                    children: collapseLabel
                  }
                )
              ]
            }
          ) : null
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "relative z-50 hidden w-16 min-w-16 max-w-16 flex-none overflow-visible lg:block", children: renderNavigation() }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm transition lg:hidden",
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        ),
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "h-full max-w-[18rem] transition-transform duration-300",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              ),
              children: renderNavigation(true)
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setMobileOpen(false),
              className: "absolute inset-0 -z-10",
              "aria-label": "Close navigation"
            }
          )
        ]
      }
    )
  ] });
}

const $$Astro = createAstro();
const $$DashboardLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$DashboardLayout;
  const { title, subtitle, role = "admin" } = Astro2.props;
  const sidebarRole = Astro2.locals.profile?.role ?? role;
  const wasUnauthorized = Astro2.url.searchParams.get("unauthorized") === "1";
  const headerUser = {
    name: Astro2.locals.profile?.full_name ?? "AgriConnect User",
    email: Astro2.locals.user?.email ?? null,
    role: Astro2.locals.profile?.role ?? role
  };
  const notifications = [
    {
      id: "1",
      title: "New biomass request",
      description: "A buyer viewed your recent listing and requested more details.",
      time: "Now"
    },
    {
      id: "2",
      title: "Traceability check completed",
      description: "Your latest batch hash and integrity validation were stored successfully.",
      time: "2h"
    },
    {
      id: "3",
      title: "Carbon impact updated",
      description: "Your latest transactions improved this month's sustainability score.",
      time: "Today"
    }
  ];
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title} | AgriConnect Smart</title>${renderHead()}</head> <body class="min-h-screen bg-slate-50 text-slate-950"> <div class="flex min-h-screen"> ${renderComponent($$result, "Sidebar", Sidebar, { "role": sidebarRole, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/common/Sidebar", "client:component-export": "default" })} <main class="min-w-0 flex-1"> ${renderComponent($$result, "Header", Header, { "title": title, "subtitle": subtitle, "user": headerUser, "notifications": notifications, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/common/Header", "client:component-export": "default" })} <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"> ${wasUnauthorized ? renderTemplate`<div class="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
You were redirected because your account is not allowed to access that area.
</div>` : null} <div class="space-y-6"> ${renderSlot($$result, $$slots["default"])} </div> </div> </main> </div> </body></html>`;
}, "/Users/slimane/hackathon/hackathon-chain-and-brain/src/layouts/DashboardLayout.astro", void 0);

export { $$DashboardLayout as $, cn as c };
