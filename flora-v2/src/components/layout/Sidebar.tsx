"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Menu,
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
  X,
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
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls="crm-sidebar"
        className="fixed left-4 top-4 z-30 rounded-lg border border-flora-border bg-white p-2 text-flora-primary shadow-sm md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        id="crm-sidebar"
        className={[
          "fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 -translate-x-full flex-col overflow-hidden border-r border-white/10 bg-flora-footer text-white transition-transform duration-200",
          "md:static md:z-auto md:translate-x-0",
          open ? "translate-x-0" : "",
        ].join(" ")}
      >
        {/* Brand row */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-6">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white/95 p-1">
            <Image
              src="/images/flora-logo.png"
              alt="Flora Curtains"
              fill
              sizes="36px"
              className="object-contain"
            />
          </div>

          <div className="min-w-0">
            <div className="font-display text-xl font-semibold leading-none text-white">
              FloraFlow
            </div>

            <div className="mt-1 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.16em] text-white/50">
              Interior Operations
            </div>
          </div>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
        {navigation.map((section) => (
          <div key={section.label} className="mb-4 last:mb-0">
            {/* Section label */}
            <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
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
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      "transition-colors duration-150",
                      active
                        ? "bg-flora-primary text-white"
                        : "text-white/65 hover:bg-white/10 hover:text-white",
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
      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/65 transition-colors hover:bg-white/10 hover:text-white"
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
    </>
  );
}