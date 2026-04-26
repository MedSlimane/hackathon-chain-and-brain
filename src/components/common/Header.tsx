import { Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react"
import { useMemo } from "react"
import { signOut } from "@/lib/auth"
import Dropdown from "./Dropdown"

export type HeaderNotification = {
  id: string
  title: string
  description: string
  time: string
}

export function Header({
  title,
  subtitle,
  user,
  notifications,
}: {
  title: string
  subtitle?: string
  user?: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
  notifications: HeaderNotification[]
}) {
  const initials = useMemo(() => {
    const source = user?.name?.trim() || user?.email?.trim() || "A"
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
  }, [user?.email, user?.name])

  async function handleLogout() {
    await signOut()
    window.location.href = "/login"
  }

  function toggleSidebar() {
    window.dispatchEvent(new CustomEvent("dashboard-sidebar-toggle"))
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
              AgriConnect Smart
            </p>
            <h1 className="truncate text-2xl font-semibold tracking-[-0.02em] text-slate-950">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 truncate text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Dropdown
            trigger={
              <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700">
                <Bell size={18} />
                {notifications.length ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-semibold text-white">
                    {notifications.length}
                  </span>
                ) : null}
              </span>
            }
            contentClassName="w-80 max-w-[calc(100vw-2rem)]"
          >
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Notifications</p>
                  <p className="text-xs text-slate-500">Recent account and trading updates.</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  {notifications.length} new
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-3 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {notification.description}
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Dropdown>

          <Dropdown
            trigger={
              <span className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-emerald-200">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden text-left md:block">
                  <span className="block max-w-36 truncate text-sm font-medium text-slate-900">
                    {user?.name || "AgriConnect User"}
                  </span>
                  <span className="block max-w-36 truncate text-xs text-slate-500">
                    {user?.email || "No email"}
                  </span>
                </span>
                <ChevronDown size={16} className="text-slate-400" />
              </span>
            }
            contentClassName="w-72 max-w-[calc(100vw-2rem)]"
          >
            <div className="p-2">
              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <p className="text-sm font-semibold text-slate-950">
                  {user?.name || "AgriConnect User"}
                </p>
                <p className="mt-1 text-xs text-slate-500">{user?.email || "No email"}</p>
                {user?.role ? (
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    {user.role.replace("_", " ")}
                  </p>
                ) : null}
              </div>
              <div className="mt-2 space-y-1">
                <a
                  href="/settings"
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <User size={16} />
                  Profile
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Settings size={16} />
                  Settings
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  )
}

export default Header
