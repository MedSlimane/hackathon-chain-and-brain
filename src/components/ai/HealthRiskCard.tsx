import { HeartPulse } from "lucide-react";
import Badge from "@/components/common/Badge";

export function HealthRiskCard({
  pollutionLevel,
  respiratoryRisk,
  carbonSaved,
  healthBenefitScore,
}: {
  pollutionLevel: number;
  respiratoryRisk: number;
  carbonSaved: number;
  healthBenefitScore: number;
}) {
  const variant = respiratoryRisk >= 70 ? "danger" : respiratoryRisk >= 50 ? "warning" : "success";
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950"><HeartPulse size={20} /> Health impact</h2>
        <Badge variant={variant}>{respiratoryRisk}/100 risk</Badge>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-slate-500">Pollution level</dt><dd className="font-semibold text-slate-950">{pollutionLevel}/100</dd></div>
        <div><dt className="text-slate-500">CO2e avoided</dt><dd className="font-semibold text-slate-950">{carbonSaved.toLocaleString()} kg</dd></div>
        <div><dt className="text-slate-500">Health benefit</dt><dd className="font-semibold text-slate-950">{healthBenefitScore}/100</dd></div>
        <div><dt className="text-slate-500">Data model</dt><dd className="font-semibold text-slate-950">Aggregated</dd></div>
      </dl>
    </article>
  );
}

export default HealthRiskCard;
