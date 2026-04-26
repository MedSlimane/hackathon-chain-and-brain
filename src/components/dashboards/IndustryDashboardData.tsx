import { useEffect, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import { getCurrentProfile } from "@/lib/auth";
import type { BiomassListing, BiomassTransaction, Profile } from "@/lib/database.types";
import { getAvailableListings } from "@/lib/listings";
import { getTransactionsForUser } from "@/lib/transactions";
import IndustryDashboard from "./IndustryDashboard";

export function IndustryDashboardData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<BiomassListing[]>([]);
  const [transactions, setTransactions] = useState<BiomassTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) throw new Error("Login required.");
      if (currentProfile.role !== "industry" && currentProfile.role !== "admin") throw new Error("Industry access required.");
      const [availableListings, industryTransactions] = await Promise.all([
        getAvailableListings(),
        getTransactionsForUser(currentProfile.id, "industry"),
      ]);
      setProfile(currentProfile);
      setListings(availableListings);
      setTransactions(industryTransactions);
    }

    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load industry dashboard.")).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading industry dashboard" />;
  if (error || !profile) return <EmptyState title="Industry dashboard unavailable" description={error || "Login required."} />;
  return <IndustryDashboard industryId={profile.id} listings={listings} transactions={transactions} />;
}

export default IndustryDashboardData;
