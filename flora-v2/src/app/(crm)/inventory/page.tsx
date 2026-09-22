import {
  Boxes,
  ChevronRight,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export const dynamic = "force-dynamic";

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#F8F5F2] ${className}`}
    />
  );
}

export default function InventoryPage() {
  return (
    <div className="min-h-full bg-[#FFF8F5]">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-[#6B625A]">
        <span>Operations</span>

        <ChevronRight size={14} />

        <span className="text-[#1E1B18]">
          Inventory
        </span>
      </div>

      {/* Page Header */}
      <section className="mb-6 overflow-hidden rounded-xl border border-[#D8C9BC] bg-white">
        <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8F5F2]">
                <Boxes
                  size={18}
                  className="text-[#5A0E12]"
                />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B625A]">
                Operations
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#1E1B18]">
              Inventory
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B625A]">
              Manage materials, stock levels, reservations,
              suppliers and project material requirements
              from one workspace.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D8C9BC] bg-[#FFF8F5] px-3 py-1.5 text-xs font-semibold text-[#5A0E12]">
            <span className="h-2 w-2 rounded-full bg-[#C8A97E]" />
            Coming Soon
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="mb-6 rounded-xl border border-[#D8C9BC] bg-white p-8 sm:p-12">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8F5F2]">
            <Package
              size={30}
              className="text-[#5A0E12]"
            />
          </div>

          <h2 className="text-xl font-bold text-[#1E1B18]">
            Inventory management is coming soon
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#6B625A]">
            The inventory workspace is planned for a
            later phase. No inventory tables exist in the
            database yet, so this page is intentionally
            read-only until the domain model is approved.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#D8C9BC] bg-[#FFF8F5] px-4 py-2.5 text-xs font-medium text-[#6B625A]">
            <span className="text-[#5A0E12]">
              Planned
            </span>

            <span className="text-[#D8C9BC]">
              •
            </span>

            <span>
              Materials, stock & project allocation
            </span>
          </div>
        </div>
      </section>

      {/* Future Dashboard Skeleton */}
      <section className="mb-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-[#5A0E12]">
            Inventory Overview
          </h2>

          <p className="mt-1 text-xs text-[#6B625A]">
            Planned inventory metrics and stock visibility.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            "Total Materials",
            "Available Stock",
            "Reserved Stock",
            "Low Stock",
          ].map((label) => (
            <div
              key={label}
              className="rounded-xl border border-[#D8C9BC] bg-white p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[#6B625A]">
                {label}
              </p>

              <Skeleton className="mt-3 h-7 w-24" />

              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      </section>

      {/* Future Inventory Table Skeleton */}
      <section className="rounded-xl border border-[#D8C9BC] bg-white">
        {/* Table Header */}
        <div className="border-b border-[#D8C9BC] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#5A0E12]">
                Materials
              </h2>

              <p className="mt-1 text-xs text-[#6B625A]">
                Materials and stock records will appear
                here.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex h-9 min-w-[220px] items-center gap-2 rounded-lg border border-[#D8C9BC] bg-[#F8F5F2] px-3">
                <Search
                  size={14}
                  className="text-[#6B625A]"
                />

                <span className="text-xs text-[#6B625A]">
                  Search materials...
                </span>
              </div>

              <button
                type="button"
                disabled
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#D8C9BC] bg-[#F8F5F2] px-3 text-xs font-medium text-[#6B625A] opacity-70"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              <button
                type="button"
                disabled
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#5A0E12] px-3 text-xs font-medium text-white opacity-50"
              >
                <Plus size={14} />
                Add Material
              </button>
            </div>
          </div>
        </div>

        {/* Skeleton Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#EFE7DF] text-left">
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                  Material
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                  Category
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                  Supplier
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                  Quantity
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                  Reserved
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                  Available
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#EFE7DF] last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />

                        <div>
                          <Skeleton className="h-3.5 w-32" />
                          <Skeleton className="mt-2 h-2.5 w-20" />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Skeleton className="h-3 w-20" />
                    </td>

                    <td className="px-5 py-4">
                      <Skeleton className="h-3 w-24" />
                    </td>

                    <td className="px-5 py-4">
                      <Skeleton className="h-3 w-16" />
                    </td>

                    <td className="px-5 py-4">
                      <Skeleton className="h-3 w-16" />
                    </td>

                    <td className="px-5 py-4">
                      <Skeleton className="h-3 w-16" />
                    </td>

                    <td className="px-5 py-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Future Pagination */}
        <div className="flex items-center justify-between border-t border-[#D8C9BC] p-4">
          <Skeleton className="h-3 w-28" />

          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </section>
    </div>
  );
}