import { ShieldCheck } from "lucide-react";

export function shortHash(hash?: string | null) {
  if (!hash) return "Not recorded";
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export function TransactionHash({ hash }: { hash?: string | null }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
      <ShieldCheck size={14} /> {shortHash(hash)}
    </span>
  );
}

export default TransactionHash;
