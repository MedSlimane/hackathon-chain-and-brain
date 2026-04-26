import { useEffect } from 'react';
import { s as supabase, p as profileFromUserMetadata, d as dashboardPathForRole } from './auth_DwlCj7dW.mjs';

function AuthRedirectHandler() {
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const hasAuthHash = hash.has("access_token") || hash.has("refresh_token");
    if (!hasAuthHash) return;
    async function completeHashRedirect() {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      const profile = existingProfile ?? profileFromUserMetadata(user);
      if (!existingProfile) {
        await supabase.from("profiles").upsert(profile);
      }
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      window.location.href = dashboardPathForRole(profile.role);
    }
    void completeHashRedirect();
  }, []);
  return null;
}

export { AuthRedirectHandler as A };
