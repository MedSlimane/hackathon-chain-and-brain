import { useEffect, useState } from "react"
import { getCurrentProfile, signOut } from "@/lib/auth"
import type { Profile } from "@/lib/database.types"

export function ProfileSection() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const profile = await getCurrentProfile()
        if (active) {
          setProfile(profile)
        }
      } catch (err) {
        if (active) {
          setError("Unable to load profile.")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [])

  async function handleSignOut() {
    try {
      await signOut()
      window.location.href = "/login"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign out.")
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">
          No profile available. Please sign in to see your account details.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-emerald-700 uppercase">
            Profile
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-950">
            {profile.full_name}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {profile.organization_name ?? profile.role}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs tracking-[0.3em] text-slate-500 uppercase">
            Role
          </p>
          <p className="mt-2 text-sm font-medium text-slate-950">
            {profile.role.replace("_", " ")}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs tracking-[0.3em] text-slate-500 uppercase">
            Region
          </p>
          <p className="mt-2 text-sm font-medium text-slate-950">
            {profile.location ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs tracking-[0.3em] text-slate-500 uppercase">
            Phone
          </p>
          <p className="mt-2 text-sm font-medium text-slate-950">
            {profile.phone ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs tracking-[0.3em] text-slate-500 uppercase">
            Joined
          </p>
          <p className="mt-2 text-sm font-medium text-slate-950">
            {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </div>
  )
}

export default ProfileSection
