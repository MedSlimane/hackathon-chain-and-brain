import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, CloudSun, HeartPulse, Leaf } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import Badge from "@/components/common/Badge";
import type { HealthIndicator, PollutionReport } from "@/lib/database.types";
import { createPollutionReport } from "@/lib/health";
import { logSecurityEvent } from "@/lib/security";
import { pollutionReportSchema } from "@/lib/validators";

export function HealthDashboard({ reporterId, reports, indicators }: { reporterId: string; reports: PollutionReport[]; indicators: HealthIndicator[] }) {
  const [message, setMessage] = useState("");
  const reportCount = Math.max(1, reports.length);
  const averagePollution = Math.round(reports.reduce((sum, report) => sum + report.pollution_level, 0) / reportCount);
  const averageRisk = Math.round(reports.reduce((sum, report) => sum + (report.respiratory_risk_score ?? 0), 0) / reportCount);
  const burnedWaste = reports.reduce((sum, report) => sum + report.burned_waste_estimate_kg, 0);
  const environmentScore = Math.max(0, 100 - averagePollution);
  const predictedRisk = Math.min(100, Math.round(averageRisk + burnedWaste / 50000));
  const carbonCredits = Math.round(burnedWaste / 1000);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = pollutionReportSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check report fields.");
      return;
    }
    try {
      await createPollutionReport(parsed.data);
      await logSecurityEvent({ userId: reporterId, eventType: "pollution_report_created", details: { region: parsed.data.region } });
      setMessage("Aggregated pollution report saved.");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save report.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Avg pollution" value={`${averagePollution}/100`} icon={<CloudSun size={20} />} />
        <StatCard title="Respiratory risk" value={`${averageRisk}/100`} icon={<HeartPulse size={20} />} />
        <StatCard title="Environment score" value={`${environmentScore}/100`} icon={<Leaf size={20} />} />
        <StatCard title="Predicted risk" value={`${predictedRisk}/100`} icon={<Activity size={20} />} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Burned waste estimate</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{burnedWaste.toLocaleString()} kg</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Anonymized access</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">Aggregated only</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Carbon credits candidate</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{carbonCredits} credits</p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Regional pollution</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={reports}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="region" /><YAxis /><Tooltip /><Bar dataKey="pollution_level" fill="#059669" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Respiratory risk trend</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%"><LineChart data={indicators}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="region" /><YAxis /><Tooltip /><Line type="monotone" dataKey="risk_score" stroke="#0284c7" strokeWidth={2} /></LineChart></ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Add aggregated report</h2>
          <input name="region" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Region" required />
          <input name="pollution_level" type="number" min="0" max="100" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Pollution level" required />
          <input name="burned_waste_estimate_kg" type="number" min="0" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Burned waste estimate kg" />
          <input name="respiratory_risk_score" type="number" min="0" max="100" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Respiratory risk score" required />
          <textarea name="notes" className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Notes" />
          <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Save report</button>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </form>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-semibold text-slate-950">High-risk regions</h2></div>
          {reports.map((report) => <div key={report.id} className="flex items-center justify-between border-b border-slate-100 p-4"><div><p className="font-medium text-slate-950">{report.region}</p><p className="text-sm text-slate-500">{report.notes}</p></div><Badge variant={(report.respiratory_risk_score ?? 0) > 65 ? "danger" : "warning"}>{report.respiratory_risk_score}/100</Badge></div>)}
        </div>
      </div>
    </div>
  );
}

export default HealthDashboard;
