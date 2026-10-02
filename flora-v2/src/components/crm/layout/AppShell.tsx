import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/crm/layout/BottomNav";

interface AppShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  children: ReactNode;
}

/**
 * Canonical CRM shell: persistent sidebar on desktop,
 * top header, content, bottom nav on mobile.
 */
export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-flora-background">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader user={user} />
          <main className="flex-1 overflow-y-auto p-4 pb-28 sm:p-6 md:pb-10">
            {children}
          </main>
          <div className="md:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  );
}
