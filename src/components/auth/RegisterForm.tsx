import { useState } from "react";
import { dashboardPathForRole, signUp } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

export function RegisterForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const parsed = registerSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check the form.");
      setBusy(false);
      return;
    }

    try {
      const data = await signUp(parsed.data);
      if (!data.session) {
        setMessage("Account created. Check your email to confirm it. The confirmation link will bring you back to your dashboard.");
        return;
      }

      window.location.href = dashboardPathForRole(parsed.data.role);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to register.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-950">Create account</h1>
      <p className="mt-2 text-sm text-slate-500">Choose a role for the MVP access model.</p>
      <form onSubmit={handleRegister} className="mt-6 grid gap-4 md:grid-cols-2">
        <input name="full_name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Full name" required />
        <input name="email" type="email" className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Email" required />
        <input name="password" type="password" className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Password" required />
        <select name="role" className="rounded-md border border-slate-300 px-3 py-2 text-sm" defaultValue="farmer">
          <option value="farmer">Farmer</option>
          <option value="industry">Industry</option>
          <option value="health_actor">Health actor</option>
          <option value="admin">Admin</option>
        </select>
        <input name="organization_name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Organization name" />
        <input name="phone" className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Phone" />
        <input name="location" className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2" placeholder="Location" required />
        <button disabled={busy} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 md:col-span-2">
          {busy ? "Creating..." : "Register"}
        </button>
      </form>
      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}

export default RegisterForm;
