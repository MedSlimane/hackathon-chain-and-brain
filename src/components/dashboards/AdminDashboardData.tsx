import { useEffect, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import { getAiPredictionLogs, getBlockchainRecords, getProfiles, getSecurityLogs } from "@/lib/admin";
import { getCurrentProfile } from "@/lib/auth";
import type { AiPrediction, BiomassListing, BiomassTransaction, BlockchainRecord, Profile, SecurityLog } from "@/lib/database.types";
import { getListingsForCurrentUser } from "@/lib/listings";
import { getAllTransactions } from "@/lib/transactions";
import AdminDashboard from "./AdminDashboard";

export function AdminDashboardData() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [listings, setListings] = useState<BiomassListing[]>([]);
  const [transactions, setTransactions] = useState<BiomassTransaction[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [blockchainRecords, setBlockchainRecords] = useState<BlockchainRecord[]>([]);
  const [predictions, setPredictions] = useState<AiPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const profile = await getCurrentProfile();
      if (!profile) throw new Error("Login required.");
      if (profile.role !== "admin") throw new Error("Admin access required.");
      const [nextProfiles, nextListings, nextTransactions, nextLogs, nextRecords, nextPredictions] = await Promise.all([
        getProfiles(),
        getListingsForCurrentUser(),
        getAllTransactions(),
        getSecurityLogs(),
        getBlockchainRecords(),
        getAiPredictionLogs(),
      ]);
      setProfiles(nextProfiles);
      setListings(nextListings);
      setTransactions(nextTransactions);
      setSecurityLogs(nextLogs);
      setBlockchainRecords(nextRecords);
      setPredictions(nextPredictions);
    }

    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load admin dashboard.")).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading admin dashboard" />;
  if (error) return <EmptyState title="Admin dashboard unavailable" description={error} />;
  return (
    <AdminDashboard
      profiles={profiles}
      listings={listings}
      transactions={transactions}
      securityLogs={securityLogs}
      blockchainRecords={blockchainRecords}
      predictions={predictions}
    />
  );
}

export default AdminDashboardData;
