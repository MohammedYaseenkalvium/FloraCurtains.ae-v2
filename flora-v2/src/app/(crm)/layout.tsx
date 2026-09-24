import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/crm/layout/BottomNav";

export default async function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-flora-background overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6">
        <TopHeader user={session.user} />

        <main className="flex-1 overflow-y-auto pb-0">
          <div className="prose lg:prose-lg max-w-none">
            {children}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}