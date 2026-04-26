import { useEffect, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import { getCurrentProfile } from "@/lib/auth";
import type { BiomassListing, HealthIndicator, PollutionReport, Profile } from "@/lib/database.types";
import { getHealthIndicators, getPollutionReports } from "@/lib/health";
import { getListingsForHealthScan } from "@/lib/listings";
import HealthDashboard from "./HealthDashboard";

export function HealthDashboardData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [listings, setListings] = useState<BiomassListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) throw new Error("Login required.");
      if (currentProfile.role !== "health_actor" && currentProfile.role !== "admin") throw new Error("Health actor access required.");
      const [pollutionReports, healthIndicators, farmerListings] = await Promise.all([
        getPollutionReports(),
        getHealthIndicators(),
        getListingsForHealthScan(),
      ]);
      setProfile(currentProfile);
      setReports(pollutionReports);
      setIndicators(healthIndicators);
      setListings(farmerListings);
    }

    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load health dashboard.")).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading health dashboard" />;
  if (error || !profile) return <EmptyState title="Health dashboard unavailable" description={error || "Login required."} />;
  return <HealthDashboard reporterId={profile.id} reports={reports} indicators={indicators} listings={listings} />;
}

export default HealthDashboardData;
