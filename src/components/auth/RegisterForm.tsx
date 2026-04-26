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

    // Check if passwords match
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
    <div className="w-full max-w-sm">
      <h1 className="mb-2 text-2xl font-bold text-slate-950">Get started</h1>
      <p className="mb-6 text-sm text-slate-600">
        Create your account in minutes. Join Africa's biomass marketplace.
      </p>
      <form onSubmit={handleRegister} className="space-y-6">
        <div>
          <label
            htmlFor="full_name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Your name
          </label>
          <input
            id="full_name"
            name="full_name"
            className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="John Doe"
            required
          />
        </div>
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
        <div>
          <label
            htmlFor="password_confirm"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Confirm password
          </label>
          <input
            id="password_confirm"
            name="password_confirm"
            type="password"
            className={`w-full rounded-md border px-3 py-3 text-sm focus:ring-2 focus:outline-none ${
              passwordError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
            }`}
            placeholder="••••••••"
            required
          />
          {passwordError && (
            <p className="mt-2 text-xs text-red-600">{passwordError}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            I am a
          </label>
          <select
            id="role"
            name="role"
            className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            defaultValue="farmer"
          >
            <option value="farmer">Farmer / Producer</option>
            <option value="industry">Buyer / Industry</option>
            <option value="health_actor">Healthcare Organization</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="location"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Region
          </label>
          <input
            id="location"
            name="location"
            className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="Your region"
            required
          />
        </div>
        <button
          disabled={busy}
          className="w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
      {message ? <p className="mt-6 text-sm text-red-600">{message}</p> : null}
      <p className="mt-8 text-center text-sm text-slate-500">
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
