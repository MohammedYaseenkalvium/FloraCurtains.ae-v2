import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import {
  ArrowUpRight,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function roleLabel(role: string) {
  if (role === "ADMIN") return "Administrator";
  if (role === "STAFF") return "Staff";

  return role;
}

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;

  const search = params.q?.trim() ?? "";

  const requestedPage = Number(params.page ?? "1");

  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  const normalizedSearch = search.trim().toUpperCase();
  const roleMatch =
    normalizedSearch === "ADMIN" || normalizedSearch === "STAFF"
      ? normalizedSearch
      : undefined;

  const where = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          ...(roleMatch ? [{ role: roleMatch as UserRole }] : []),
        ],
      }
    : {};

  const [staff, totalStaff, adminCount] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),

    db.user.count({
      where,
    }),

    db.user.count({
      where: {
        role: "ADMIN",
      },
    }),
  ]);

  const totalPages = Math.max(
    Math.ceil(totalStaff / PAGE_SIZE),
    1
  );

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  function buildPageUrl(page: number) {
    const query = new URLSearchParams();

    if (search) {
      query.set("q", search);
    }

    query.set("page", String(page));

    return `/staff?${query.toString()}`;
  }

  return (
    <div className="min-h-full bg-flora-background">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Users
              size={18}
              className="text-flora-primary"
            />

            <span className="text-xs font-semibold uppercase tracking-wide text-flora-muted">
              Administration
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-flora-foreground">
            Staff
          </h1>

          <p className="mt-1 text-sm text-flora-muted">
            Manage FloraFlow users and their access roles.
          </p>
        </div>

        <Link
          href="/staff/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-flora-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-flora-primary-hover"
        >
          <Plus size={16} />
          Add Staff
        </Link>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center gap-2">
            <Users
              size={16}
              className="text-flora-primary"
            />

            <p className="text-xs font-medium uppercase tracking-wide text-flora-muted">
              Total Staff
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold text-flora-foreground">
            {totalStaff}
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={16}
              className="text-flora-primary"
            />

            <p className="text-xs font-medium uppercase tracking-wide text-flora-muted">
              Administrators
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold text-flora-foreground">
            {adminCount}
          </p>
        </div>
      </div>

      {/* Search */}
      <section className="mb-6 rounded-xl border border-flora-border bg-white p-4">
        <form
          action="/staff"
          method="GET"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-flora-muted"
            />

            <input
              name="q"
              defaultValue={search}
              placeholder="Search by name, email or role..."
              className="h-10 w-full rounded-lg border border-flora-border bg-white pl-9 pr-3 text-sm text-flora-foreground outline-none transition focus:border-flora-primary focus:ring-1 focus:ring-flora-primary"
            />
          </div>

          <button
            type="submit"
            className="h-10 rounded-lg border border-flora-border bg-flora-surface px-4 text-sm font-medium text-flora-primary transition-colors hover:bg-[#EFE7DF]"
          >
            Search
          </button>

          {search && (
            <Link
              href="/staff"
              className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-flora-muted hover:bg-flora-surface"
            >
              Clear
            </Link>
          )}
        </form>
      </section>

      {/* Staff Table */}
      <section className="overflow-hidden rounded-xl border border-flora-border bg-white">
        <div className="border-b border-flora-border px-5 py-4">
          <h2 className="text-sm font-semibold text-flora-primary">
            Staff Directory
          </h2>

          <p className="mt-1 text-xs text-flora-muted">
            {totalStaff}{" "}
            {totalStaff === 1 ? "user" : "users"} found.
          </p>
        </div>

        {staff.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users
              size={30}
              className="mx-auto text-[#D8C9BC]"
            />

            <h3 className="mt-4 text-sm font-semibold text-flora-foreground">
              No staff found
            </h3>

            <p className="mt-1 text-sm text-flora-muted">
              {search
                ? "Try changing your search."
                : "Create your first staff account."}
            </p>

            {!search && (
              <Link
                href="/staff/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-flora-primary px-4 py-2 text-sm font-semibold text-white hover:bg-flora-primary-hover"
              >
                <Plus size={15} />
                Add Staff
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full">
                <thead>
                  <tr className="border-b border-flora-border bg-flora-surface text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-flora-muted">
                      Staff
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-flora-muted">
                      Email
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-flora-muted">
                      Role
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-flora-muted">
                      Joined
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-flora-muted">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {staff.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-flora-border/60 last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-flora-surface text-sm font-bold text-flora-primary">
                            {member.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-flora-foreground">
                              {member.name}
                            </p>

                            <p className="text-xs text-flora-muted">
                              User account
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-flora-foreground">
                          <Mail
                            size={14}
                            className="text-flora-muted"
                          />

                          <span>{member.email}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full border border-flora-border bg-flora-surface px-2.5 py-1 text-xs font-semibold text-flora-primary">
                          {roleLabel(member.role)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-flora-muted">
                        {formatDate(member.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/staff/${member.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-flora-border px-3 py-2 text-xs font-semibold text-flora-primary transition-colors hover:bg-flora-surface"
                        >
                          Edit
                          <ArrowUpRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-flora-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-flora-muted">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                {hasPrevious ? (
                  <Link
                    href={buildPageUrl(
                      currentPage - 1
                    )}
                    className="rounded-lg border border-flora-border px-3 py-2 text-xs font-medium text-flora-primary hover:bg-flora-surface"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-flora-border/60 px-3 py-2 text-xs font-medium text-[#B7ADA5]">
                    Previous
                  </span>
                )}

                {hasNext ? (
                  <Link
                    href={buildPageUrl(
                      currentPage + 1
                    )}
                    className="rounded-lg border border-flora-border px-3 py-2 text-xs font-medium text-flora-primary hover:bg-flora-surface"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-flora-border/60 px-3 py-2 text-xs font-medium text-[#B7ADA5]">
                    Next
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}