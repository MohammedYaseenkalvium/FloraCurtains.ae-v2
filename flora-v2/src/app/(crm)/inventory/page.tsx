import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Inventory"
        description="Manage materials, stock levels, reservations, suppliers and project material requirements from one workspace."
      />

      {/* Coming Soon */}
      <Card padded={false}>
        <EmptyState
          icon={<Package size={24} />}
          title="Inventory management is coming soon"
          hint="The inventory workspace is planned for a later phase. No inventory tables exist in the database yet, so this page is intentionally read-only until the domain model is approved."
        />
      </Card>

      {/* Future Dashboard Skeleton */}
      <section className="mb-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-flora-primary">
            Inventory Overview
          </h2>

          <p className="mt-1 text-xs text-flora-muted">
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
              className="rounded-xl border border-flora-border bg-white p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-flora-muted">
                {label}
              </p>

              <Skeleton className="mt-3 h-7 w-24" />

              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      </section>

      {/* Future Inventory Table Skeleton */}
      <section className="rounded-xl border border-flora-border bg-white">
        {/* Table Header */}
        <div className="border-b border-flora-border p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-flora-primary">
                Materials
              </h2>

              <p className="mt-1 text-xs text-flora-muted">
                Materials and stock records will appear
                here.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex h-9 min-w-[220px] items-center gap-2 rounded-lg border border-flora-border bg-flora-surface px-3">
                <Search
                  size={14}
                  className="text-flora-muted"
                />

                <span className="text-xs text-flora-muted">
                  Search materials...
                </span>
              </div>

              <button
                type="button"
                disabled
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-flora-border bg-flora-surface px-3 text-xs font-medium text-flora-muted opacity-70"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              <button
                type="button"
                disabled
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-flora-primary px-3 text-xs font-medium text-white opacity-50"
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
              <tr className="border-b border-flora-border/60 text-left">
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-flora-muted">
                  Material
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-flora-muted">
                  Category
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-flora-muted">
                  Supplier
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-flora-muted">
                  Quantity
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-flora-muted">
                  Reserved
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-flora-muted">
                  Available
                </th>

                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-flora-muted">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <tr
                    key={index}
                    className="border-b border-flora-border/60 last:border-b-0"
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
        <div className="flex items-center justify-between border-t border-flora-border p-4">
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