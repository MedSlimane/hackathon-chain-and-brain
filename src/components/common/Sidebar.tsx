import { Activity, Building2, HeartPulse, Shield, Store, Tractor } from "lucide-react";
import type { UserRole } from "@/lib/database.types";

const links = [
  { href: "/dashboard/farmer", label: "Farmer", icon: Tractor, roles: ["farmer", "admin"] },
  { href: "/dashboard/industry", label: "Industry", icon: Building2, roles: ["industry", "admin"] },
  { href: "/dashboard/health", label: "Health", icon: HeartPulse, roles: ["health_actor", "admin"] },
  { href: "/dashboard/admin", label: "Admin", icon: Shield, roles: ["admin"] },
  { href: "/marketplace", label: "Marketplace", icon: Store, roles: ["farmer", "industry", "health_actor", "admin"] },
];

export function Sidebar({ role = "admin" }: { role?: UserRole }) {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white p-5 lg:block">
      <a href="/" className="flex items-center gap-2 font-semibold text-slate-950">
        <span className="rounded-md bg-emerald-600 p-2 text-white"><Activity size={18} /></span>
        AgriConnect Smart
      </a>
      <nav className="mt-8 space-y-1">
        {links
          .filter((link) => link.roles.includes(role))
          .map((link) => {
            const Icon = link.icon;
            return (
              <a key={link.href} href={link.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                <Icon size={17} />
                {link.label}
              </a>
            );
          })}
      </nav>
      <div className="mt-8 rounded-lg bg-sky-50 p-4 text-sm text-sky-900">
        <p className="font-medium">Secure MVP</p>
        <p className="mt-1 text-sky-800">RLS, anomaly logs, and blockchain-style hashes are wired for demo flow.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
