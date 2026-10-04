"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Banknote,
  CheckSquare,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/enquiries", label: "Leads", icon: FileText },
  { href: "/quotations", label: "Quotes", icon: FileText },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/payments", label: "Payments", icon: Banknote },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
];

/** Persistent mobile bottom navigation for the CRM. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="CRM"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-flora-border bg-white/90 backdrop-blur-md"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-6 px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active
                  ? "text-flora-primary"
                  : "text-flora-muted hover:text-flora-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
