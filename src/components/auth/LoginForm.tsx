import { useState } from "react";
import { dashboardPathForRole, getSafeRedirectPath, signIn } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/security";
import { supabase } from "@/lib/supabaseClient";
import { loginSchema } from "@/lib/validators";

export function LoginForm({ initialMessage = "" }: { initialMessage?: string }) {
  const [message, setMessage] = useState(initialMessage);
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
      const { user } = await signIn(parsed.data.email, parsed.data.password);
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      void logSecurityEvent({ userId: user.id, eventType: "login", details: { email: parsed.data.email } }).catch(() => undefined);

      const fallbackPath = dashboardPathForRole(profile?.role ?? "farmer");
      const redirectTo = new URLSearchParams(window.location.search).get("redirectTo");
      window.location.href = getSafeRedirectPath(redirectTo, fallbackPath);
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
      <p className="mt-6 text-center text-sm text-slate-500">Use a seeded Supabase account or register a new user.</p>
    </div>
  );
}

export default LoginForm;
