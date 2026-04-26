import { useEffect, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import { getCurrentProfile } from "@/lib/auth";
import type { BiomassTransaction, Profile } from "@/lib/database.types";
import { getTransactionsForUser } from "@/lib/transactions";
import IndustryDashboard from "./IndustryDashboard";

export function IndustryDashboardData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<BiomassTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) throw new Error("Login required.");
      if (currentProfile.role !== "industry" && currentProfile.role !== "admin") throw new Error("Industry access required.");
      const industryTransactions = await getTransactionsForUser(currentProfile.id, "industry");
      setProfile(currentProfile);
      setTransactions(industryTransactions);
    }

    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load industry dashboard.")).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading industry dashboard" />;
  if (error || !profile) return <EmptyState title="Industry dashboard unavailable" description={error || "Login required."} />;
  return <IndustryDashboard transactions={transactions} />;
}

export default IndustryDashboardData;
