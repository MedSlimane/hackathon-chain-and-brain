import type { ReactNode } from "react"
import Card from "./Card"

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
}: {
  title: string
  value: string | number
  icon?: ReactNode
  description?: string
  trend?: string
}) {
  return (
    <Card className="p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-28px_rgba(15,23,42,0.4)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
            {value}
          </p>
        </div>
        {icon ? (
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100">
            {icon}
          </div>
        ) : null}
      </div>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
      ) : null}
      {trend ? (
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          {trend}
        </p>
      ) : null}
    </Card>
  )
}

export default StatCard
