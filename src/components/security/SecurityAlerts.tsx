import Badge from "@/components/common/Badge";
import type { SecurityLog } from "@/lib/database.types";

function variantForSeverity(severity: SecurityLog["severity"]) {
  if (severity === "critical" || severity === "high") return "danger";
  if (severity === "medium") return "warning";
  return "success";
}

export function SecurityAlerts({ alerts }: { alerts: SecurityLog[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-950">Security alerts</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {alerts.map((alert) => (
          <div key={alert.id} className="grid gap-3 p-4 md:grid-cols-[140px_1fr_180px] md:items-center">
            <Badge variant={variantForSeverity(alert.severity)}>{alert.severity}</Badge>
            <div>
              <p className="font-medium text-slate-950">{alert.event_type.replaceAll("_", " ")}</p>
              <p className="text-sm text-slate-500">{JSON.stringify(alert.details)}</p>
            </div>
            <p className="text-sm text-slate-500 md:text-right">{new Date(alert.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SecurityAlerts;
