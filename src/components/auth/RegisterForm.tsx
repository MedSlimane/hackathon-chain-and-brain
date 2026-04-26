import { useState } from "react"
import { dashboardPathForRole, signUp } from "@/lib/auth"
import { registerSchema } from "@/lib/validators"

export function RegisterForm() {
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    setPasswordError("")

    const formData = Object.fromEntries(new FormData(event.currentTarget))

    if (formData.password !== formData.password_confirm) {
      setPasswordError("Passwords do not match")
      setBusy(false)
      return
    }

    const parsed = registerSchema.safeParse(formData)

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check the form.")
      setBusy(false)
      return
    }

    try {
      const data = await signUp(parsed.data)
      if (!data.session) {
        setMessage(
          "Account created. Check your email to confirm it. The confirmation link will bring you back to your dashboard."
        )
        return
      }

      window.location.href = dashboardPathForRole(parsed.data.role)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to register.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full rounded-[2rem] border border-white/70 bg-white/90 p-7 shadow-[0_32px_90px_-38px_rgba(15,23,42,0.32)] backdrop-blur-xl sm:p-8">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">
          AgriConnect Smart
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
          Create your account
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Join the platform with a clean, secure registration flow.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label
            htmlFor="full_name"
            className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500"
          >
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:outline-none"
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:outline-none"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:outline-none"
            placeholder="••••••••"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password_confirm"
            className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500"
          >
            Confirm Password
          </label>
          <input
            id="password_confirm"
            name="password_confirm"
            type="password"
            className={`w-full rounded-2xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:outline-none ${
              passwordError
                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
            }`}
            placeholder="••••••••"
            required
          />
          {passwordError ? (
            <p className="mt-2 text-xs text-red-600">{passwordError}</p>
          ) : null}
        </div>

        <input type="hidden" name="role" value="farmer" />
        <input type="hidden" name="location" value="Tunisia" />

        <button
          disabled={busy}
          className="w-full rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>

      {message ? <p className="mt-5 text-sm text-red-600">{message}</p> : null}

      <p className="mt-7 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-medium text-emerald-600 hover:text-emerald-700"
        >
          Sign in
        </a>
      </p>
    </div>
  )
}

export default RegisterForm
