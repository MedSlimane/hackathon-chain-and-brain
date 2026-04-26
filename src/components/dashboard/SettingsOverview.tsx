import { useEffect, useState } from "react"
import { Bell, ShieldCheck, UserRound } from "lucide-react"
import Card from "@/components/common/Card"
import EmptyState from "@/components/common/EmptyState"
import LoadingState from "@/components/common/LoadingState"
import { getCurrentProfile } from "@/lib/auth"
import type { Profile } from "@/lib/database.types"

function SettingRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}

export function SettingsOverview() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getCurrentProfile()
      .then((currentProfile) => {
        if (!currentProfile) throw new Error("Login required.")
        setProfile(currentProfile)
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load settings.")
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState label="Loading settings" />
  if (error || !profile) {
    return <EmptyState title="Settings unavailable" description={error || "Login required."} />
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <UserRound size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Profile
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Account details
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SettingRow label="Full Name" value={profile.full_name} />
          <SettingRow label="Role" value={profile.role.replace("_", " ")} />
          <SettingRow label="Region" value={profile.location ?? "Not set"} />
          <SettingRow label="Phone" value={profile.phone ?? "Not set"} />
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Bell size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Notifications</h2>
              <p className="mt-1 text-sm text-slate-500">
                Configure alerts for listings, transactions, and traceability events.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-50 text-lime-700">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Security</h2>
              <p className="mt-1 text-sm text-slate-500">
                Review access, activity, and verification settings for your account.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SettingsOverview
