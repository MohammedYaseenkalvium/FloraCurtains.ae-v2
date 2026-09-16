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
    <div className="min-h-full bg-[#FFF8F5]">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/staff"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B625A] transition-colors hover:text-[#5A0E12]"
        >
          <ArrowLeft size={15} />
          Staff
        </Link>
      </div>

      {/* Header */}
      <section className="mb-6 rounded-xl border border-[#D8C9BC] bg-white p-5">
        <div className="flex items-center gap-2">
          <UserPlus
            size={19}
            className="text-[#5A0E12]"
          />

          <span className="text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
            Administration
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1E1B18]">
          Create Staff Account
        </h1>

        <p className="mt-1 text-sm text-[#6B625A]">
          Create a new FloraFlow user and assign their
          access role.
        </p>
      </section>

      <StaffForm mode="create" />
    </div>
  );
}