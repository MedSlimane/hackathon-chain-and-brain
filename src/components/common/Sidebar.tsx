import { useCallback, useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  HeartPulse,
  LayoutDashboard,
  PackagePlus,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  ScanSearch,
  Settings,
  ShoppingCart,
  X,
} from "lucide-react"
import { dashboardPathForRole } from "@/lib/auth"
import type { UserRole } from "@/lib/database.types"
import { cn } from "@/lib/utils"

export function Sidebar({ role = "admin" }: { role?: UserRole }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPinnedOpen, setIsPinnedOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pathname, setPathname] = useState(() =>
    typeof window === "undefined" ? "" : window.location.pathname
  )
  const isSidebarOpen = isHovered || isPinnedOpen

  const links = useMemo(
    () => {
      const navigationLinks = [
        { href: dashboardPathForRole(role), label: "Dashboard", icon: LayoutDashboard },
      ]

      if (role === "farmer" || role === "admin") {
        navigationLinks.push({
          href: "/listings",
          label: "My Listings",
          icon: PackageSearch,
        }, {
          href: "/listings#create-listing",
          label: "New Listing",
          icon: PackagePlus,
        })
      }

      if (role === "industry" || role === "admin") {
        navigationLinks.push({
          href: "/marketplace",
          label: "Marketplace",
          icon: ShoppingCart,
        })
      }

      if (role === "health_actor" || role === "admin") {
        navigationLinks.push(
          { href: "/dashboard/health-risk", label: "Risk map", icon: HeartPulse },
          { href: "/dashboard/scan-dechets", label: "Waste scan", icon: ScanSearch }
        )
      }

      if (role !== "health_actor") {
        navigationLinks.push({ href: "/transactions", label: "Transactions", icon: ReceiptText })
      }

      if (role !== "health_actor") {
        navigationLinks.push({ href: "/analytics", label: "Analytics", icon: BarChart3 })
      }

      navigationLinks.push({ href: "/settings", label: "Settings", icon: Settings })

      return navigationLinks
    },
    [role]
  )

  useEffect(() => {
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

  const handleMouseEnter = useCallback(() => {
    setIsHovered((currentIsHovered) => {
      if (currentIsHovered) {
        return currentIsHovered
      }

      return true
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (isPinnedOpen) {
      return
    }

    setIsHovered((currentIsHovered) => {
      if (!currentIsHovered) {
        return currentIsHovered
      }

      return false
    })
  }, [isPinnedOpen])

  const togglePinnedOpen = useCallback(() => {
    setIsPinnedOpen((currentIsPinnedOpen) => {
      const nextIsPinnedOpen = !currentIsPinnedOpen

      if (!nextIsPinnedOpen) {
        setIsHovered(false)
      }

      return nextIsPinnedOpen
    })
  }, [])

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  function renderNavigation(isMobile = false) {
    const open = isMobile || isSidebarOpen
    const CollapseIcon = isPinnedOpen ? PanelLeftClose : PanelLeftOpen
    const collapseLabel = isPinnedOpen
      ? "Collapse"
      : open
        ? "Lock open"
        : "Expand"

    return (
      <aside
        className={cn(
          "relative z-50 flex h-full flex-col border-r border-slate-200/70 bg-white px-3 py-4 transition-[width,box-shadow] duration-300",
          open ? "w-56 shadow-[18px_0_40px_-32px_rgba(15,23,42,0.45)]" : "w-16 shadow-none"
        )}
        onMouseEnter={isMobile ? undefined : handleMouseEnter}
        onMouseLeave={isMobile ? undefined : handleMouseLeave}
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-3">
          <a
            href="/"
            className={cn(
              "flex h-9 min-w-0 items-center gap-2 text-slate-950",
              open ? "" : "justify-center"
            )}
            title={open ? undefined : "AgriConnect Smart"}
          >
            <LayoutDashboard size={20} className="shrink-0 text-emerald-700" />
            <span
              className={cn(
                "min-w-0 transition-all duration-200",
                !open
                  ? "pointer-events-none w-0 overflow-hidden opacity-0"
                  : "opacity-100"
              )}
            >
              <span className="block truncate text-sm font-semibold tracking-[-0.01em] text-slate-950">
                AgriConnect Smart
              </span>
            </span>
          </a>

          {isMobile ? (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center text-slate-600 hover:text-slate-950 lg:hidden"
            >
              <X size={18} />
            </button>
          ) : (
            null
          )}
        </div>

        <nav className="mt-6 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)

            return (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex h-9 items-center gap-3 border-l-2 px-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-600 hover:text-emerald-700",
                  open ? "" : "justify-center px-0"
                )}
                title={open ? undefined : link.label}
              >
                <Icon size={17} className="shrink-0" />
                <span
                  className={cn(
                    "truncate transition-all duration-200",
                    !open
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
            "mt-auto border-t border-slate-200 pt-4 transition-all duration-200",
            open ? "" : "px-0"
          )}
        >
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700",
              open ? "" : "text-center"
            )}
          >
            {open ? "Smart Ops" : "AI"}
          </p>
          <p className={cn("mt-2 text-xs leading-5 text-slate-500", open ? "block" : "hidden")}>
            Listings, deals, and traceability in one workflow.
          </p>
        </div>

        {!isMobile ? (
          <button
            type="button"
            onClick={togglePinnedOpen}
            className={cn(
              "mt-3 inline-flex h-9 items-center text-sm font-medium text-slate-600 transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
              open ? "justify-start gap-3 px-2" : "justify-center px-0"
            )}
            aria-label={
              isPinnedOpen
                ? "Collapse sidebar"
                : open
                  ? "Lock sidebar open"
                  : "Expand sidebar"
            }
            aria-pressed={isPinnedOpen}
            aria-expanded={open}
            title={collapseLabel}
          >
            <CollapseIcon size={18} className="shrink-0" />
            <span
              className={cn(
                "truncate transition-all duration-200",
                open ? "opacity-100" : "pointer-events-none w-0 overflow-hidden opacity-0"
              )}
            >
              {collapseLabel}
            </span>
          </button>
        ) : null}
      </aside>
    )
  }

  return (
    <>
      <div className="relative z-50 hidden w-16 min-w-16 max-w-16 flex-none overflow-visible lg:block">
        {renderNavigation()}
      </div>

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
