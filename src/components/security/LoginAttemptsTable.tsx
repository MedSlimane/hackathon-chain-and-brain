import type { SecurityLog } from "@/lib/database.types";

export function LoginAttemptsTable({ logs }: { logs: SecurityLog[] }) {
  const attempts = logs.filter((log) => log.event_type.includes("login") || log.event_type.includes("device"));
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-950">Login attempts</h2>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr><th className="p-3">Event</th><th className="p-3">IP</th><th className="p-3">Time</th></tr>
        </thead>
        <tbody>
          {attempts.map((log) => (
            <tr key={log.id} className="border-t border-slate-100">
              <td className="p-3 font-medium text-slate-950">{log.event_type}</td>
              <td className="p-3 text-slate-600">{log.ip_address ?? "-"}</td>
              <td className="p-3 text-slate-600">{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LoginAttemptsTable;
