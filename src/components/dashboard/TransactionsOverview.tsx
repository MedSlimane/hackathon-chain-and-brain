import { useEffect, useState } from "react"
import { CircleDollarSign, PackageCheck, ReceiptText } from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import EmptyState from "@/components/common/EmptyState"
import StatCard from "@/components/common/StatCard"
import LoadingState from "@/components/common/LoadingState"
import { getCurrentProfile } from "@/lib/auth"
import type { BiomassTransaction, Profile } from "@/lib/database.types"
import {
  getAllTransactions,
  getTransactionsForUser,
} from "@/lib/transactions"

export function TransactionsOverview() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<BiomassTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile()
      if (!currentProfile) throw new Error("Login required.")

      const nextTransactions =
        currentProfile.role === "admin"
          ? await getAllTransactions()
          : currentProfile.role === "health_actor"
            ? []
            : await getTransactionsForUser(currentProfile.id, currentProfile.role)

      setProfile(currentProfile)
      setTransactions(nextTransactions)
    }

    load()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load transactions.")
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState label="Loading transactions" />
  if (error || !profile) {
    return (
      <EmptyState
        title="Transactions unavailable"
        description={error || "Login required."}
      />
    )
  }

  const totalValue = transactions.reduce(
    (sum, transaction) => sum + transaction.total_price,
    0
  )
  const activeCount = transactions.filter(
    (transaction) => transaction.status !== "completed" && transaction.status !== "cancelled"
  ).length
  const completedCount = transactions.filter(
    (transaction) => transaction.status === "completed"
  ).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Transactions" value={transactions.length} icon={<ReceiptText size={20} />} />
        <StatCard title="Active Deals" value={activeCount} icon={<PackageCheck size={20} />} />
        <StatCard title="Total Value" value={`${totalValue.toLocaleString()} TND`} icon={<CircleDollarSign size={20} />} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Transactions
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Recent deal activity
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {completedCount} completed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-950">
                    <a href={`/transactions/${transaction.id}`} className="hover:text-emerald-700">
                      #{transaction.id.slice(0, 8)}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {transaction.quantity_kg.toLocaleString()} kg
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {transaction.total_price.toLocaleString()} TND
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={transaction.status === "completed" ? "success" : "info"}
                    >
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(transaction.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default TransactionsOverview
