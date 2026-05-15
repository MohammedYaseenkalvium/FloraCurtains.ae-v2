import { db } from "@/lib/db";
import Link from "next/link";
import type { EnquiryStatus } from "@prisma/client";

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageParam } = await searchParams;
  const enquiryStatus = status as EnquiryStatus | undefined;
  const page     = parseInt(pageParam ?? "1");
  const pageSize = 20;

  const [data, total] = await Promise.all([
    db.enquiry.findMany({
      where:   enquiryStatus ? { status: enquiryStatus } : undefined,
      include: { contact: true, company: true },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    db.enquiry.count({ where: enquiryStatus ? { status: enquiryStatus } : undefined }),
  ]);

  const statuses: EnquiryStatus[] = ["NEW","CONTACTED","VISIT_SCHEDULED","QUOTED","NEGOTIATING","WON","LOST"];
  const statusColors: Record<string, string> = {
    NEW: "#8B8178", CONTACTED: "#185FA5", VISIT_SCHEDULED: "#854D0E",
    QUOTED: "#0F6E56", NEGOTIATING: "#7F77DD", WON: "#166534", LOST: "#991B1B",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Enquiries</h1>
        <Link href="/enquiries/new" className="bg-[#5A0E12] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#7A1E22]">
          + Log Call / Lead
        </Link>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        <Link href="/enquiries"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${!enquiryStatus ? "bg-[#5A0E12] text-white border-[#5A0E12]" : "bg-white border-[#D8C9BC] text-[#6B625A] hover:border-[#5A0E12]"}`}>
          All ({total})
        </Link>
        {statuses.map(s => (
          <Link key={s} href={`/enquiries?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${enquiryStatus === s ? "bg-[#5A0E12] text-white border-[#5A0E12]" : "bg-white border-[#D8C9BC] text-[#6B625A]"}`}>
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-[#D8C9BC] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F5F2] text-[#6B625A] text-[10px] uppercase tracking-widest">
              {["Client","Company","Service","Assigned To","Status","Interest","Date","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(e => (
              <tr key={e.id} className="border-t border-[#F8F5F2] hover:bg-[#F8F5F2]/60">
                <td className="px-4 py-3">
                  <div className="font-medium">{e.contact.name}</div>
                  <div className="text-xs text-[#6B625A]">{e.contact.phone}</div>
                </td>
                <td className="px-4 py-3 text-[#6B625A] text-xs">{e.company?.tradeName ?? "—"}</td>
                <td className="px-4 py-3 text-[#6B625A]">{e.serviceWanted}</td>
                <td className="px-4 py-3 text-[#6B625A]">{e.assignedTo ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: `${statusColors[e.status]}18`, color: statusColors[e.status] }}>
                    {e.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <div key={n} className="w-2 h-2 rounded-full"
                        style={{ background: n <= (e.interestLevel ?? 0) ? "#5A0E12" : "#EFE7DF" }} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-[#6B625A]">
                  {new Date(e.createdAt).toLocaleDateString("en-AE")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/enquiries/${e.id}`} className="text-[#5A0E12] text-xs hover:underline">View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-[#6B625A]">
        <span>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}</span>
        <div className="flex gap-2">
          {page > 1 && <Link href={`/enquiries?page=${page - 1}${enquiryStatus ? `&status=${enquiryStatus}` : ""}`} className="px-3 py-1 border border-[#D8C9BC] rounded-lg hover:bg-[#EFE7DF]">← Prev</Link>}
          {page * pageSize < total && <Link href={`/enquiries?page=${page + 1}${enquiryStatus ? `&status=${enquiryStatus}` : ""}`} className="px-3 py-1 border border-[#D8C9BC] rounded-lg hover:bg-[#EFE7DF]">Next →</Link>}
        </div>
      </div>
    </div>
  );
}