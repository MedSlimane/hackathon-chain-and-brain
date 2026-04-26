import { CheckCircle2, ReceiptText, ShoppingCart, Store } from "lucide-react";
import StatCard from "@/components/common/StatCard";
import Badge from "@/components/common/Badge";
import type { BiomassTransaction } from "@/lib/database.types";

export function IndustryDashboard({ transactions }: { transactions: BiomassTransaction[] }) {
  const activeOrders = transactions.filter((transaction) => !["completed", "cancelled"].includes(transaction.status)).length;
  const completed = transactions.filter((transaction) => transaction.status === "completed").length;
  const totalSpend = transactions.reduce((sum, transaction) => sum + transaction.total_price, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Active orders" value={activeOrders} icon={<ShoppingCart size={20} />} />
        <StatCard title="Completed purchases" value={completed} icon={<CheckCircle2 size={20} />} />
        <StatCard title="Recorded spend" value={`${totalSpend.toLocaleString()} TND`} icon={<ReceiptText size={20} />} />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Organisation verification</h2>
            <p className="mt-1 text-sm text-slate-500">Buyer actions are tied to an organization profile and logged as secure transaction events.</p>
          </div>
          <Badge variant="success">Verified demo buyer</Badge>
        </div>
      </div>
      <div className="rounded-lg border border-emerald-100 bg-emerald-50/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Buy lots from Marketplace</h2>
            <p className="mt-1 text-sm text-emerald-900">
              Available farmer lots are separated from this dashboard. Use Marketplace to review lots and create purchase requests.
            </p>
          </div>
          <a href="/marketplace" className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            <Store size={16} />
            Open Marketplace
          </a>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-semibold text-slate-950">My transactions</h2></div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Transaction</th><th className="p-3">Quantity</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead>
          <tbody>{transactions.map((transaction) => <tr key={transaction.id} className="border-t border-slate-100"><td className="p-3 font-mono text-xs">{transaction.id.slice(0, 8)}</td><td className="p-3">{transaction.quantity_kg.toLocaleString()} kg</td><td className="p-3">{transaction.total_price.toLocaleString()} TND</td><td className="p-3"><Badge variant="info">{transaction.status}</Badge></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

export default IndustryDashboard;
