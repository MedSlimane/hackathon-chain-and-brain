import { useCallback, useEffect, useState } from "react"
import { CircleDollarSign, PackageCheck, ReceiptText } from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import EmptyState from "@/components/common/EmptyState"
import StatCard from "@/components/common/StatCard"
import LoadingState from "@/components/common/LoadingState"
import { getCurrentProfile } from "@/lib/auth"
import type { BiomassTransaction, ListingStatus, Profile, TransactionStatus } from "@/lib/database.types"
import { updateListing } from "@/lib/listings"
import { logSecurityEvent } from "@/lib/security"
import {
  getAllTransactions,
  getTransactionsForUser,
  updateTransactionStatus,
} from "@/lib/transactions"

export function TransactionsOverview() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<BiomassTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const loadTransactions = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    Promise.resolve()
      .then(loadTransactions)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load transactions.")
      )
      .finally(() => setLoading(false))
  }, [loadTransactions])

  async function transitionTransaction(
    transaction: BiomassTransaction,
    nextStatus: TransactionStatus,
    listingStatus?: ListingStatus
  ) {
    if (!profile) return

    setBusyId(transaction.id)
    setMessage("")
    setError("")

    try {
      const updated = await updateTransactionStatus(transaction.id, nextStatus)

      if (listingStatus && (profile.role === "farmer" || profile.role === "admin")) {
        await updateListing(transaction.listing_id, { status: listingStatus })
      }

      await logSecurityEvent({
        userId: profile.id,
        eventType: "transaction_status_changed",
        details: {
          transaction_id: transaction.id,
          from: transaction.status,
          to: nextStatus,
          listing_id: transaction.listing_id,
        },
      }).catch(() => undefined)

      setTransactions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      )
      setMessage(`Transaction #${transaction.id.slice(0, 8)} moved to ${nextStatus}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update transaction.")
    } finally {
      setBusyId("")
    }
  }

  function renderActions(transaction: BiomassTransaction) {
    if (!profile) return null

    const canActAsFarmer = profile.role === "farmer" || profile.role === "admin"
    const canActAsIndustry = profile.role === "industry" || profile.role === "admin"
    const disabled = busyId === transaction.id
    const buttonClass =
      "rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-60"

    if (transaction.status === "pending" && canActAsFarmer) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => transitionTransaction(transaction, "accepted", "reserved")}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => transitionTransaction(transaction, "cancelled", "available")}
            className={buttonClass}
          >
            Decline
          </button>
        </div>
      )
    }

    if (transaction.status === "accepted" && canActAsIndustry) {
      return (
        <button
          type="button"
          disabled={disabled}
          onClick={() => transitionTransaction(transaction, "in_delivery")}
          className={buttonClass}
        >
          Start delivery
        </button>
      )
    }

    if (transaction.status === "in_delivery" && canActAsIndustry) {
      return (
        <button
          type="button"
          disabled={disabled}
          onClick={() => transitionTransaction(transaction, "delivered")}
          className={buttonClass}
        >
          Mark delivered
        </button>
      )
    }

    if (transaction.status === "delivered" && canActAsFarmer) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => transitionTransaction(transaction, "completed", "sold")}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Complete
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => transitionTransaction(transaction, "disputed")}
            className={buttonClass}
          >
            Dispute
          </button>
        </div>
      )
    }

    return <span className="text-xs text-slate-400">No action</span>
  }

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
  const pendingApprovalCount = transactions.filter(
    (transaction) => transaction.status === "pending"
  ).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Transactions" value={transactions.length} icon={<ReceiptText size={20} />} />
        <StatCard title={profile.role === "farmer" ? "Pending Approvals" : "Active Deals"} value={profile.role === "farmer" ? pendingApprovalCount : activeCount} icon={<PackageCheck size={20} />} />
        <StatCard title="Total Value" value={`${totalValue.toLocaleString()} TND`} icon={<CircleDollarSign size={20} />} />
      </div>
      {message ? <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">{message}</div> : null}

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
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? transactions.map((transaction) => (
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
                  <td className="px-6 py-4">
                    {renderActions(transaction)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default TransactionsOverview
