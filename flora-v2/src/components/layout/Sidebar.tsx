"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderKanban,
  Banknote,
  CalendarCheck,
  CheckSquare,
  Settings,
  LogOut,
  BriefcaseBusiness,
  Package,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        label: "Leads & Enquiries",
        href: "/enquiries",
        icon: FileText,
      },
      {
        label: "Customers",
        href: "/customers",
        icon: Users,
      },
      {
        label: "Quotations",
        href: "/quotations",
        icon: FileText,
      },
      {
        label: "Projects",
        href: "/projects",
        icon: FolderKanban,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Site Visits",
        href: "/site-visits",
        icon: CalendarCheck,
      },
      {
        label: "Tasks",
        href: "/tasks",
        icon: CheckSquare,
      },
      {
        label: "Payments",
        href: "/payments",
        icon: Banknote,
      },
      {
        label: "Inventory",
        href: "/inventory",
        icon: Package,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Staff",
        href: "/staff",
        icon: BriefcaseBusiness,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-flora-border bg-white">
      {/* Brand */}
      <div className="flex h-[76px] shrink-0 items-center border-b border-flora-border px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
            <Image
              src="/images/logo.png"
              alt="Flora Curtains"
              fill
              sizes="36px"
              className="object-contain"
            />
          </div>

          <div className="min-w-0">
            <div className="font-display text-xl font-semibold leading-none text-flora-primary">
              FloraFlow
            </div>

            <div className="mt-1 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.16em] text-flora-muted">
              Interior Operations
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
        {navigation.map((section) => (
          <div key={section.label} className="mb-4 last:mb-0">
            {/* Section label */}
            <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-flora-muted">
              {section.label}
            </div>

            {/* Section links */}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;

                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      "transition-colors duration-150",
                      active
                        ? "bg-flora-primary text-white"
                        : "text-flora-muted hover:bg-flora-surface hover:text-flora-foreground",
                    ].join(" ")}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />

                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="shrink-0 border-t border-flora-border bg-white p-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-flora-muted transition-colors hover:bg-flora-surface hover:text-flora-primary"
        >
          <LogOut
            size={18}
            strokeWidth={1.8}
            className="shrink-0"
          />

          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}