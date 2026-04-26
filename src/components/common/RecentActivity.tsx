import { ArrowUpRight, Leaf, Package, RefreshCcw } from "lucide-react"
import Card from "./Card"

export type ActivityItem = {
  id: string
  title: string
  description: string
  time: string
  type: "listing" | "transaction" | "carbon"
}

const activityStyles = {
  listing: {
    icon: Package,
    tone: "bg-emerald-50 text-emerald-700",
  },
  transaction: {
    icon: RefreshCcw,
    tone: "bg-sky-50 text-sky-700",
  },
  carbon: {
    icon: Leaf,
    tone: "bg-lime-50 text-lime-700",
  },
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Recent Activity
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Latest marketplace actions
          </h2>
        </div>
        <a
          href="/transactions"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
        >
          View all
          <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const style = activityStyles[item.type]
          const Icon = style.icon

          return (
            <div
              key={item.id}
              className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4"
            >
              <span
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${style.tone}`}
              >
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <span className="whitespace-nowrap text-xs text-slate-400">
                    {item.time}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default RecentActivity
