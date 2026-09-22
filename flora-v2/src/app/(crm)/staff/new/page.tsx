import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

import { StaffForm } from "@/components/crm/StaffForm";

export const dynamic = "force-dynamic";

export default async function NewStaffPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-full bg-flora-background">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/staff"
          className="inline-flex items-center gap-1.5 text-sm text-flora-muted transition-colors hover:text-flora-primary"
        >
          <ArrowLeft size={15} />
          Staff
        </Link>
      </div>

      {/* Header */}
      <section className="mb-6 rounded-xl border border-flora-border bg-white p-5">
        <div className="flex items-center gap-2">
          <UserPlus
            size={19}
            className="text-flora-primary"
          />

          <span className="text-xs font-semibold uppercase tracking-wide text-flora-muted">
            Administration
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-flora-foreground">
          Create Staff Account
        </h1>

        <p className="mt-1 text-sm text-flora-muted">
          Create a new FloraFlow user and assign their
          access role.
        </p>
      </section>

      <StaffForm mode="create" />
    </div>
  );
}