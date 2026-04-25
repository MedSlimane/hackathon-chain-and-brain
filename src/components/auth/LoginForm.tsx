import { useState } from "react";
import { dashboardPathForRole, signIn } from "@/lib/auth";
import type { UserRole } from "@/lib/database.types";
import { logSecurityEvent } from "@/lib/security";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { loginSchema } from "@/lib/validators";

const demoAccounts: Array<{ label: string; email: string; role: UserRole }> = [
  { label: "Farmer demo", email: "farmer@demo.test", role: "farmer" },
  { label: "Industry demo", email: "industry@demo.test", role: "industry" },
  { label: "Health demo", email: "health@demo.test", role: "health_actor" },
  { label: "Admin demo", email: "admin@demo.test", role: "admin" },
];

export function LoginForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const parsed = loginSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check your login details.");
      setBusy(false);
      return;
    }

    try {
      if (!hasSupabaseConfig) {
        setMessage("Demo mode: use the dashboard links without authentication, or add Supabase env vars.");
        return;
      }

      const { user } = await signIn(parsed.data.email, parsed.data.password);
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      await logSecurityEvent({ userId: user.id, eventType: "login", details: { email: parsed.data.email } });
      window.location.href = dashboardPathForRole(profile?.role ?? "farmer");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-950">Log in</h1>
      <p className="mt-2 text-sm text-slate-500">Access your role-based dashboard.</p>
      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <input name="email" type="email" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Email" required />
        <input name="password" type="password" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Password" required />
        <button disabled={busy} className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
          {busy ? "Signing in..." : "Log in"}
        </button>
      </form>
      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
      <div className="mt-6 grid grid-cols-2 gap-2">
        {demoAccounts.map((account) => (
          <a key={account.role} href={dashboardPathForRole(account.role)} className="rounded-md border border-slate-200 px-3 py-2 text-center text-sm text-slate-700 hover:bg-slate-50">
            {account.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default LoginForm;
