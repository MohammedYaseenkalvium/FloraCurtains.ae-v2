import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
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
          {
            role: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
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
    <div className="min-h-full bg-[#FFF8F5]">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Users
              size={18}
              className="text-[#5A0E12]"
            />

            <span className="text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
              Administration
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#1E1B18]">
            Staff
          </h1>

          <p className="mt-1 text-sm text-[#6B625A]">
            Manage FloraFlow users and their access roles.
          </p>
        </div>

        <Link
          href="/staff/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5A0E12] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#74171C]"
        >
          <Plus size={16} />
          Add Staff
        </Link>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
          <div className="flex items-center gap-2">
            <Users
              size={16}
              className="text-[#5A0E12]"
            />

            <p className="text-xs font-medium uppercase tracking-wide text-[#6B625A]">
              Total Staff
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold text-[#1E1B18]">
            {totalStaff}
          </p>
        </div>

        <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={16}
              className="text-[#5A0E12]"
            />

            <p className="text-xs font-medium uppercase tracking-wide text-[#6B625A]">
              Administrators
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold text-[#1E1B18]">
            {adminCount}
          </p>
        </div>
      </div>

      {/* Search */}
      <section className="mb-6 rounded-xl border border-[#D8C9BC] bg-white p-4">
        <form
          action="/staff"
          method="GET"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B625A]"
            />

            <input
              name="q"
              defaultValue={search}
              placeholder="Search by name, email or role..."
              className="h-10 w-full rounded-lg border border-[#D8C9BC] bg-white pl-9 pr-3 text-sm text-[#1E1B18] outline-none transition focus:border-[#5A0E12] focus:ring-1 focus:ring-[#5A0E12]"
            />
          </div>

          <button
            type="submit"
            className="h-10 rounded-lg border border-[#D8C9BC] bg-[#F8F5F2] px-4 text-sm font-medium text-[#5A0E12] transition-colors hover:bg-[#EFE7DF]"
          >
            Search
          </button>

          {search && (
            <Link
              href="/staff"
              className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-[#6B625A] hover:bg-[#F8F5F2]"
            >
              Clear
            </Link>
          )}
        </form>
      </section>

      {/* Staff Table */}
      <section className="overflow-hidden rounded-xl border border-[#D8C9BC] bg-white">
        <div className="border-b border-[#D8C9BC] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#5A0E12]">
            Staff Directory
          </h2>

          <p className="mt-1 text-xs text-[#6B625A]">
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

            <h3 className="mt-4 text-sm font-semibold text-[#1E1B18]">
              No staff found
            </h3>

            <p className="mt-1 text-sm text-[#6B625A]">
              {search
                ? "Try changing your search."
                : "Create your first staff account."}
            </p>

            {!search && (
              <Link
                href="/staff/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#5A0E12] px-4 py-2 text-sm font-semibold text-white hover:bg-[#74171C]"
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
                  <tr className="border-b border-[#D8C9BC] bg-[#F8F5F2] text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
                      Staff
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
                      Email
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
                      Role
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
                      Joined
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {staff.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-[#EFE7DF] last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F8F5F2] text-sm font-bold text-[#5A0E12]">
                            {member.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-[#1E1B18]">
                              {member.name}
                            </p>

                            <p className="text-xs text-[#6B625A]">
                              User account
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-[#1E1B18]">
                          <Mail
                            size={14}
                            className="text-[#6B625A]"
                          />

                          <span>{member.email}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full border border-[#D8C9BC] bg-[#F8F5F2] px-2.5 py-1 text-xs font-semibold text-[#5A0E12]">
                          {roleLabel(member.role)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#6B625A]">
                        {formatDate(member.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/staff/${member.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8C9BC] px-3 py-2 text-xs font-semibold text-[#5A0E12] transition-colors hover:bg-[#F8F5F2]"
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
            <div className="flex flex-col gap-3 border-t border-[#D8C9BC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#6B625A]">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                {hasPrevious ? (
                  <Link
                    href={buildPageUrl(
                      currentPage - 1
                    )}
                    className="rounded-lg border border-[#D8C9BC] px-3 py-2 text-xs font-medium text-[#5A0E12] hover:bg-[#F8F5F2]"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-[#EFE7DF] px-3 py-2 text-xs font-medium text-[#B7ADA5]">
                    Previous
                  </span>
                )}

                {hasNext ? (
                  <Link
                    href={buildPageUrl(
                      currentPage + 1
                    )}
                    className="rounded-lg border border-[#D8C9BC] px-3 py-2 text-xs font-medium text-[#5A0E12] hover:bg-[#F8F5F2]"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-[#EFE7DF] px-3 py-2 text-xs font-medium text-[#B7ADA5]">
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