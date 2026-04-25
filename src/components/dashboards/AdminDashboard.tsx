import { Activity, Database, ShieldAlert, Users } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import Badge from "@/components/common/Badge";
import SecurityAlerts from "@/components/security/SecurityAlerts";
import BlockchainTimeline from "@/components/blockchain/BlockchainTimeline";
import type { AiPrediction, BiomassListing, BiomassTransaction, BlockchainRecord, Profile, SecurityLog } from "@/lib/database.types";

export function AdminDashboard({
  profiles,
  listings,
  transactions,
  securityLogs,
  blockchainRecords,
  predictions,
}: {
  profiles: Profile[];
  listings: BiomassListing[];
  transactions: BiomassTransaction[];
  securityLogs: SecurityLog[];
  blockchainRecords: BlockchainRecord[];
  predictions: AiPrediction[];
}) {
  const highAlerts = securityLogs.filter((log) => ["high", "critical"].includes(log.severity)).length;
  const byRole = profiles.reduce<Record<string, number>>((acc, profile) => ({ ...acc, [profile.role]: (acc[profile.role] ?? 0) + 1 }), {});
  const suspiciousListings = listings.filter((listing) => listing.predicted_price_per_kg && listing.price_per_kg > listing.predicted_price_per_kg * 1.2);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total users" value={profiles.length} icon={<Users size={20} />} />
        <StatCard title="Total listings" value={listings.length} icon={<Database size={20} />} />
        <StatCard title="Transactions" value={transactions.length} icon={<Activity size={20} />} />
        <StatCard title="High alerts" value={highAlerts} icon={<ShieldAlert size={20} />} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Users by role</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(byRole).map(([role, count]) => <div key={role} className="rounded-md bg-slate-50 p-3"><p className="text-sm text-slate-500">{role}</p><p className="text-xl font-semibold text-slate-950">{count}</p></div>)}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Suspicious listings</h2>
          <div className="mt-4 space-y-3">
            {suspiciousListings.length > 0 ? suspiciousListings.map((listing) => <div key={listing.id} className="flex items-center justify-between rounded-md bg-red-50 p-3"><span className="text-sm font-medium text-red-950">{listing.title}</span><Badge variant="danger">price anomaly</Badge></div>) : <p className="text-sm text-slate-500">No suspicious listings in demo data.</p>}
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">AI anomaly detection</p>
          <p className="mt-2 text-2xl font-semibold text-red-950">{suspiciousListings.length + highAlerts}</p>
          <p className="mt-1 text-sm text-red-800">Suspicious listings and high severity alerts.</p>
        </div>
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm font-semibold text-sky-900">Global security control</p>
          <p className="mt-2 text-2xl font-semibold text-sky-950">{securityLogs.length}</p>
          <p className="mt-1 text-sm text-sky-800">Logs available for platform supervision.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Verifiable history</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{blockchainRecords.length}</p>
          <p className="mt-1 text-sm text-slate-700">Blockchain records across listings and transactions.</p>
        </div>
      </div>
      <SecurityAlerts alerts={securityLogs} />
      <div className="grid gap-6 xl:grid-cols-2">
        <BlockchainTimeline records={blockchainRecords.slice(0, 6)} />
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-semibold text-slate-950">AI prediction logs</h2></div>
          {predictions.map((prediction) => <div key={prediction.id} className="border-b border-slate-100 p-4"><div className="flex items-center justify-between"><p className="font-medium text-slate-950">{prediction.prediction_type}</p><Badge variant="info">{Math.round(prediction.confidence * 100)}%</Badge></div><p className="mt-1 font-mono text-xs text-slate-500">{prediction.entity_id}</p></div>)}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
