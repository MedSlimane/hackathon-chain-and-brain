import { useState } from "react"
import { dashboardPathForRole, getSafeRedirectPath, signIn } from "@/lib/auth"
import { logSecurityEvent } from "@/lib/security"
import { supabase } from "@/lib/supabaseClient"
import { loginSchema } from "@/lib/validators"

export function LoginForm({
  initialMessage = "",
}: {
  initialMessage?: string
}) {
  const [message, setMessage] = useState(initialMessage)
  const [busy, setBusy] = useState(false)

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    const parsed = loginSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget))
    )

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check your login details.")
      setBusy(false)
      return
    }

    try {
      const { user } = await signIn(parsed.data.email, parsed.data.password)
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      void logSecurityEvent({
        userId: user.id,
        eventType: "login",
        details: { email: parsed.data.email },
      }).catch(() => undefined)

      const fallbackPath = dashboardPathForRole(profile?.role ?? "farmer")
      const redirectTo = new URLSearchParams(window.location.search).get(
        "redirectTo"
      )
      window.location.href = getSafeRedirectPath(redirectTo, fallbackPath)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-2 text-2xl font-bold text-slate-950">Welcome back</h1>
      <p className="mb-6 text-sm text-slate-600">
        Sign in to your biomass account.
      </p>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="••••••••"
            required
          />
        </div>
        <button
          disabled={busy}
          className="w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {message ? <p className="mt-6 text-sm text-red-600">{message}</p> : null}
      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <a
          href="/register"
          className="font-medium text-emerald-600 hover:text-emerald-700"
        >
          Create one
        </a>
      </p>
    </div>
  )
}

export default LoginForm
