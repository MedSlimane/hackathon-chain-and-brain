import type { ReactNode } from "react";

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
}: {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        {icon ? <div className="rounded-md bg-emerald-50 p-2 text-emerald-700">{icon}</div> : null}
      </div>
      {description ? <p className="mt-3 text-sm text-slate-600">{description}</p> : null}
      {trend ? <p className="mt-2 text-xs font-medium text-emerald-700">{trend}</p> : null}
    </article>
  );
}

export default StatCard;
