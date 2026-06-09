"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/queue", label: "Queue" },
  { href: "/dashboard/compose", label: "Compose" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === link.href
              ? "bg-sky-500/15 text-sky-400"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
