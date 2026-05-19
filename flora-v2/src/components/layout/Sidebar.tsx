"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, FolderOpen,
  ClipboardList, Wrench, CheckSquare, Settings, LogOut
} from "lucide-react";

const nav = [
  { label: "Dashboard",    href: "/dashboard",  icon: LayoutDashboard },
  { label: "Enquiries",    href: "/enquiries",  icon: FileText },
  { label: "Quotations",   href: "/quotations", icon: ClipboardList },
  { label: "Projects",     href: "/projects",   icon: FolderOpen },
  { label: "Installations",href: "/projects?status=INSTALLATION", icon: Wrench },
  { label: "Tasks",        href: "/tasks",      icon: CheckSquare },
];

const burgundy = "#5A0E12";

function isActive(path: string, href: string): boolean {
  const baseHref = href.split("?")[0];
  if (path === baseHref) return true;
  if (path.startsWith(baseHref + "/")) return true;
  return false;
}

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 min-w-64 bg-white/70 backdrop-blur-xl border-r border-black/5 flex flex-col z-10">
      <div className="px-6 pt-7 pb-5">
        <div className="text-xl font-bold tracking-[0.08em]" style={{ color: burgundy }}>FLORA</div>
        <div className="text-[9px] text-[#6B625A] tracking-[0.18em] uppercase mt-1">Interior Operations</div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 bg-[#EFE7DF] border border-[#D8C9BC] rounded-lg px-3 py-2">
          <span className="text-[#6B625A] text-sm">⌕</span>
          <input placeholder="Search…" className="bg-transparent outline-none text-xs text-[#1A1A1A] w-full" />
        </div>
      </div>

      <nav className="px-3 flex-1 space-y-0.5">
        <p className="text-[9px] text-[#6B625A] tracking-[0.14em] uppercase px-3 py-1">Main</p>
        {nav.map(({ label, href, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link key={label} href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all"
              style={{
                background:  active ? "rgba(90,14,18,0.08)" : "transparent",
                borderLeft:  active ? `3px solid ${burgundy}` : "3px solid transparent",
                color:       active ? burgundy : "#6B625A",
                fontWeight:  active ? 500 : 400,
              }}>
              <Icon size={15} />
              {label}
            </Link>
          );
        })}

        <div className="border-t border-[#D8C9BC] my-3" />
        <p className="text-[9px] text-[#6B625A] tracking-[0.14em] uppercase px-3 py-1">Quick Actions</p>
        <Link href="/enquiries/new" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[#6B625A] hover:text-[#1A1A1A]">
          📞 Log Call / Lead
        </Link>
        <Link href="/quotations/new" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[#6B625A] hover:text-[#1A1A1A]">
          📋 Create Quote
        </Link>
      </nav>

      <div className="px-3 pb-5 space-y-0.5">
        <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[#6B625A]">
          <Settings size={15} /> Settings
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[#6B625A] hover:text-red-700">
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
}