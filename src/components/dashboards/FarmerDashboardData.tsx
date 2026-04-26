import { useEffect, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import { getCurrentProfile } from "@/lib/auth";
import type { BiomassListing, BiomassTransaction, Profile } from "@/lib/database.types";
import { getListingsByFarmer } from "@/lib/listings";
import { getTransactionsForUser } from "@/lib/transactions";
import FarmerDashboard from "./FarmerDashboard";

export function FarmerDashboardData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<BiomassListing[]>([]);
  const [transactions, setTransactions] = useState<BiomassTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) throw new Error("Login required.");
      if (currentProfile.role !== "farmer" && currentProfile.role !== "admin") throw new Error("Farmer access required.");
      const [farmerListings, farmerTransactions] = await Promise.all([
        getListingsByFarmer(currentProfile.id),
        getTransactionsForUser(currentProfile.id, "farmer"),
      ]);
      setProfile(currentProfile);
      setListings(farmerListings);
      setTransactions(farmerTransactions);
    }

    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load farmer dashboard.")).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading farmer dashboard" />;
  if (error || !profile) return <EmptyState title="Farmer dashboard unavailable" description={error || "Login required."} />;
  return <FarmerDashboard farmerId={profile.id} listings={listings} transactions={transactions} />;
}

export default FarmerDashboardData;
