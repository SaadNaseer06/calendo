"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Calendar,
  LayoutDashboard,
  Sparkles,
  Building2,
  LogOut,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/ai-studio", label: "AI Studio", icon: Sparkles },
  { href: "/brands", label: "Brands", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--cal-border)] bg-[var(--bg-surface)]">
      <div className="border-b border-[var(--cal-border)] px-6 py-5">
        <Link href="/dashboard" className="font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Calendo
        </Link>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Content chaos → calendar clarity
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--accent-glow)] text-[var(--accent-brand)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--cal-border)] p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-[var(--text-secondary)]"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
