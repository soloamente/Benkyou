"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, List, BarChart3, Home } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/waitlist", label: "Waitlist", icon: List },
  { href: "/admin/debug", label: "Debug", icon: BarChart3 },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/admin"
              className="text-xl font-semibold text-title"
            >
              Admin Panel
            </Link>
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-background text-title"
                        : "text-muted-foreground hover:bg-background/50 hover:text-title"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <Link
            href="/decks"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-background/50 hover:text-title transition-colors"
          >
            <Home className="size-4" />
            Back to App
          </Link>
        </div>
      </div>
    </nav>
  );
}
