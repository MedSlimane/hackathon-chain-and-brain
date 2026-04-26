import { useState } from "react"
import { dashboardPathForRole, signUp } from "@/lib/auth"
import { registerSchema } from "@/lib/validators"

const roleOptions = [
  { value: "farmer", label: "Farmer" },
  { value: "industry", label: "Industry buyer" },
  { value: "health_actor", label: "Health organization" },
] as const

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
    <div className="w-full max-w-sm">
      <h1 className="mb-2 text-xl font-semibold tracking-[-0.01em] text-slate-950">Create your account</h1>
      <p className="mb-6 text-xs font-light tracking-[0.01em] text-slate-500">
        Join the biomass network with the right workspace.
      </p>

      <form onSubmit={handleRegister} className="space-y-6">
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
            className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm font-light text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-light text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            defaultValue="farmer"
            required
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
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
            className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm font-light text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
            className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm font-light text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
            className={`w-full rounded-md border px-3 py-3 text-sm font-light text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:outline-none ${
              passwordError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
            }`}
            placeholder="••••••••"
            required
          />
          {passwordError ? (
            <p className="mt-2 text-xs text-red-600">{passwordError}</p>
          ) : null}
        </div>

        <input type="hidden" name="location" value="Tunisia" />

        <button
          disabled={busy}
          className="w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>

      {message ? <p className="mt-6 text-sm font-light text-red-600">{message}</p> : null}

      <p className="mt-8 text-center text-xs font-light tracking-[0.01em] text-slate-500">
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
