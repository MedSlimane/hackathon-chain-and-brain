import { CheckCircle2 } from "lucide-react";
import Badge from "@/components/common/Badge";
import type { BlockchainRecord } from "@/lib/database.types";
import { shortHash } from "./TransactionHash";

export function BlockchainTimeline({ records }: { records: BlockchainRecord[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">Traceability timeline</h2>
        <Badge variant="success">Append-only demo</Badge>
      </div>
      <ol className="mt-5 space-y-4">
        {records.map((record) => (
          <li key={record.id} className="flex gap-3">
            <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={16} />
            </span>
            <div className="min-w-0 flex-1 rounded-md border border-slate-100 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-950">{record.action.replaceAll("_", " ")}</p>
                <Badge variant="success">Verified</Badge>
              </div>
              <p className="mt-1 font-mono text-xs text-slate-500">{shortHash(record.hash)}</p>
              <p className="mt-1 text-xs text-slate-500">{new Date(record.created_at).toLocaleString()}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default BlockchainTimeline;
