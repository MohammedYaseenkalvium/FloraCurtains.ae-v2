// src/app/(crm)/customers/page.tsx

import { db } from "@/lib/db";
import Link from "next/link";
import { Users, Building, Phone, Mail } from "lucide-react";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = parseInt(pageParam ?? "1");
  const pageSize = 25;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" as const } },
          { company: { tradeName: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [contacts, total] = await Promise.all([
    db.contact.findMany({
      where,
      include: {
        company: true,
        enquiries: {
          select: {
            id: true,
            status: true,
            quotations: { select: { payments: { select: { amount: true } } } },
            project: { select: { payments: { select: { amount: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.contact.count({ where }),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Customers</h1>
          <p className="text-[#6B625A] text-sm mt-1">{total} total contacts</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="mb-5">
        <div className="flex items-center gap-2 bg-white border border-[#D8C9BC] rounded-lg px-4 py-2.5 max-w-md">
          <span className="text-[#6B625A]">⌕</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name, phone, company…"
            className="bg-transparent outline-none text-sm text-[#1A1A1A] w-full placeholder:text-[#8B8178]"
          />
        </div>
      </form>

      <div className="bg-white border border-[#D8C9BC] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F5F2] text-[#6B625A] text-[10px] uppercase tracking-widest">
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Company</th>
              <th className="text-left px-5 py-3 font-medium">Source</th>
              <th className="text-center px-5 py-3 font-medium">Enquiries</th>
              <th className="text-right px-5 py-3 font-medium">Total Paid</th>
              <th className="text-left px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[#6B625A]">
                  No customers found.
                </td>
              </tr>
            )}
            {contacts.map((c) => {
              const totalPaid = c.enquiries.reduce((sum, e) => {
                const fromQuotes = e.quotations.flatMap((q) => q.payments).reduce((s, p) => s + p.amount, 0);
                const fromProject = e.project?.payments.reduce((s, p) => s + p.amount, 0) ?? 0;
                return sum + fromQuotes + fromProject;
              }, 0);

              return (
                <tr key={c.id} className="border-t border-[#F8F5F2] hover:bg-[#F8F5F2]/60">
                  <td className="px-5 py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-[#6B625A]">
                      <span className="flex items-center gap-1">
                        <Phone size={11} /> {c.phone}
                      </span>
                      {c.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={11} /> {c.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#6B625A] text-xs">
                    {c.company ? (
                      <span className="flex items-center gap-1">
                        <Building size={12} /> {c.company.tradeName}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-[#6B625A]">
                    {c.source.replace(/_/g, " ")}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium bg-[#EFE7DF] text-[#5A0E12]">
                      {c.enquiries.length}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-[#0F6E56] text-sm">
                    {totalPaid > 0 ? `AED ${totalPaid.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/customers/${c.id}`}
                      className="text-[#5A0E12] text-xs hover:underline font-medium"
                    >
                      💰 Financial →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-[#6B625A]">
        <span>
          Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`/customers?page=${page - 1}${q ? `&q=${q}` : ""}`}
              className="px-3 py-1 border border-[#D8C9BC] rounded-lg hover:bg-[#EFE7DF]"
            >
              ← Prev
            </Link>
          )}
          {page * pageSize < total && (
            <Link
              href={`/customers?page=${page + 1}${q ? `&q=${q}` : ""}`}
              className="px-3 py-1 border border-[#D8C9BC] rounded-lg hover:bg-[#EFE7DF]"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
