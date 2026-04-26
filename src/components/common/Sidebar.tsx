import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Store,
  X,
} from "lucide-react"
import { dashboardPathForRole } from "@/lib/auth"
import type { UserRole } from "@/lib/database.types"
import { cn } from "@/lib/utils"

export function Sidebar({ role = "admin" }: { role?: UserRole }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pathname, setPathname] = useState("")

  const links = useMemo(
    () => [
      { href: dashboardPathForRole(role), label: "Dashboard", icon: LayoutDashboard },
      { href: "/listings", label: "My Listings", icon: Store },
      { href: "/transactions", label: "Transactions", icon: ReceiptText },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
    [role]
  )

  useEffect(() => {
    setPathname(window.location.pathname)
    setCollapsed(window.localStorage.getItem("agriconnect-sidebar-collapsed") === "true")

    function syncPathname() {
      setPathname(window.location.pathname)
      setMobileOpen(false)
    }

    function handleToggle() {
      setMobileOpen((value) => !value)
    }

    window.addEventListener("popstate", syncPathname)
    window.addEventListener("dashboard-sidebar-toggle", handleToggle as EventListener)

    return () => {
      window.removeEventListener("popstate", syncPathname)
      window.removeEventListener(
        "dashboard-sidebar-toggle",
        handleToggle as EventListener
      )
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem("agriconnect-sidebar-collapsed", String(collapsed))
  }, [collapsed])

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  function renderNavigation(isMobile = false) {
    return (
      <aside
        className={cn(
          "flex h-full flex-col border-r border-slate-200/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.98))] px-4 py-5 transition-all duration-300",
          collapsed && !isMobile ? "w-[5.5rem]" : "w-72"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <a
            href="/"
            className={cn(
              "flex min-w-0 items-center gap-3",
              collapsed && !isMobile ? "justify-center" : ""
            )}
          >
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_18px_30px_-18px_rgba(5,150,105,0.9)]">
              <LayoutDashboard size={20} />
            </span>
            <span
              className={cn(
                "min-w-0 transition-all duration-200",
                collapsed && !isMobile
                  ? "pointer-events-none w-0 overflow-hidden opacity-0"
                  : "opacity-100"
              )}
            >
              <span className="block truncate text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Workspace
              </span>
              <span className="block truncate text-lg font-semibold tracking-[-0.02em] text-slate-950">
                AgriConnect Smart
              </span>
            </span>
          </a>

          {isMobile ? (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 lg:hidden"
            >
              <X size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 lg:inline-flex"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>

        <nav className="mt-8 space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)

            return (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-emerald-600 text-white shadow-[0_18px_30px_-18px_rgba(5,150,105,0.85)]"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700",
                  collapsed && !isMobile ? "justify-center px-0" : ""
                )}
                title={collapsed && !isMobile ? link.label : undefined}
              >
                <span
                  className={cn(
                    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition",
                    active
                      ? "bg-white/15 text-white"
                      : "bg-white text-slate-500 ring-1 ring-slate-200 group-hover:text-emerald-700"
                  )}
                >
                  <Icon size={18} />
                </span>
                <span
                  className={cn(
                    "truncate transition-all duration-200",
                    collapsed && !isMobile
                      ? "pointer-events-none w-0 overflow-hidden opacity-0"
                      : "opacity-100"
                  )}
                >
                  {link.label}
                </span>
              </a>
            )
          })}
        </nav>

        <div
          className={cn(
            "mt-auto rounded-3xl border border-emerald-100 bg-emerald-50/90 p-4 transition-all duration-200",
            collapsed && !isMobile ? "px-2 py-4" : ""
          )}
        >
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700",
              collapsed && !isMobile ? "text-center" : ""
            )}
          >
            {collapsed && !isMobile ? "AI" : "Smart Ops"}
          </p>
          <p className={cn("mt-2 text-sm leading-6 text-emerald-900", collapsed && !isMobile ? "hidden" : "block")}>
            Listings, traceability, and transaction data in one clean workspace.
          </p>
        </div>
      </aside>
    )
  }

  return (
    <>
      <div className="hidden lg:block">{renderNavigation()}</div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm transition lg:hidden",
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <div
          className={cn(
            "h-full max-w-[18rem] transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {renderNavigation(true)}
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 -z-10"
          aria-label="Close navigation"
        />
      </div>
    </>
  )
}

export default Sidebar
