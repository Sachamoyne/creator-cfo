"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Database, Settings, User, List, PieChart } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sources", href: "/dashboard/sources", icon: Database },
  { name: "Transactions", href: "/dashboard/transactions", icon: List },
  { name: "Analyses", href: "/dashboard/analytics", icon: PieChart },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full w-full flex flex-col bg-[#020817] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800 flex-shrink-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
          CreatorCFO
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? "bg-blue-600/10 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? "text-blue-400" : "text-slate-500 group-hover:text-white"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Faux Profil Utilisateur (Simulation) */}
      <div className="border-t border-slate-800 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
            <User size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Sacha M.</span>
            <span className="text-xs text-slate-500">Pro Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}