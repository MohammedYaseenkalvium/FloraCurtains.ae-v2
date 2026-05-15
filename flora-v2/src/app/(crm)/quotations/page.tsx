import { db } from "@/lib/db";
import Link from "next/link";

export default async function QuotationsPage() {
  const quotations = await db.quotation.findMany({
    orderBy: { createdAt: "desc" },
    include: { enquiry: { include: { contact: true, company: true } } },
  });

  const statusColors: Record<string, string> = {
    DRAFT: "#8B8178", SENT: "#185FA5", APPROVED: "#0F6E56",
    REJECTED: "#991B1B", REVISED: "#854D0E",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Quotations</h1>
      </div>

      <div className="bg-white border border-[#D8C9BC] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F5F2] text-[#6B625A] text-[10px] uppercase tracking-widest">
              {["Quote #","Client","Service","Status","Total","Date","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotations.map(q => (
              <tr key={q.id} className="border-t border-[#F8F5F2] hover:bg-[#F8F5F2]/60">
                <td className="px-4 py-3 font-medium text-[#5A0E12]">{q.quoteNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{q.enquiry.contact.name}</div>
                  {q.enquiry.company && <div className="text-xs text-[#6B625A]">{q.enquiry.company.tradeName}</div>}
                </td>
                <td className="px-4 py-3 text-[#6B625A]">{q.enquiry.serviceWanted}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: `${statusColors[q.status]}18`, color: statusColors[q.status] }}>
                    {q.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">AED {q.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-[#6B625A]">
                  {new Date(q.createdAt).toLocaleDateString("en-AE")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/quotations/${q.id}`} className="text-[#5A0E12] text-xs hover:underline">View →</Link>
                </td>
              </tr>
            ))}
            {quotations.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6B625A]">No quotations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}