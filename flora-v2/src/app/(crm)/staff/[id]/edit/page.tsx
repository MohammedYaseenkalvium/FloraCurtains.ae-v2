import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";

import { StaffForm } from "@/components/crm/StaffForm";

export const dynamic = "force-dynamic";

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const member = await db.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!member) {
    notFound();
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
          <UserRound
            size={19}
            className="text-flora-primary"
          />

          <span className="text-xs font-semibold uppercase tracking-wide text-flora-muted">
            Staff Account
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-flora-foreground">
          Edit Staff
        </h1>

        <p className="mt-1 text-sm text-flora-muted">
          Update account information and access role for{" "}
          <span className="font-semibold text-flora-foreground">
            {member.name}
          </span>
          .
        </p>
      </section>

      <StaffForm
        mode="edit"
        staffId={member.id}
        initialValues={{
          name: member.name,
          email: member.email,
          role: member.role,
        }}
      />
    </div>
  );
}