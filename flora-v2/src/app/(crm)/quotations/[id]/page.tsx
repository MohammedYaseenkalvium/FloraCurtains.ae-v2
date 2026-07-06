import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { QuotationStatusWorkflow } from "@/components/crm/QuotationWorkflow";
import type { QuotationLineItem } from "@/types";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const q = await db.quotation.findFirst({
    where:   { id, deletedAt: null },
    include: { enquiry: { include: { contact: true, company: true } } },
  });
  if (!q) notFound();

  const items = q.items as unknown as QuotationLineItem[];

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{q.quoteNumber}</h1>
          <p className="text-[#6B625A] text-sm">{q.enquiry.contact.name} · {q.enquiry.serviceWanted}</p>
        </div>
        <div className="flex gap-3 items-center">
          <QuotationStatusWorkflow quotationId={q.id} currentStatus={q.status} />
          <a href={`/api/quotations/${q.id}/pdf`} target="_blank" rel="noopener noreferrer"
            className="border border-[#D8C9BC] text-[#6B625A] rounded-lg px-4 py-2 text-sm hover:bg-[#EFE7DF]">
            📄 Download PDF
          </a>
        </div>
      </div>

      <div className="bg-white border border-[#D8C9BC] rounded-xl overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F5F2] text-[#6B625A] text-[10px] uppercase tracking-widest">
              {["Description","Qty","Unit Price","Disc%","Total"].map(h => (
                <th key={h} className={`p-3 font-medium ${h !== "Description" ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it: QuotationLineItem, i: number) => {
              const total = it.qty * it.unitPrice * (1 - it.discount / 100);
              return (
                <tr key={i} className="border-t border-[#EFE7DF]">
                  <td className="p-3">{it.description} <span className="text-[#6B625A]">({it.unit})</span></td>
                  <td className="p-3 text-right">{it.qty}</td>
                  <td className="p-3 text-right">AED {it.unitPrice.toLocaleString()}</td>
                  <td className="p-3 text-right">{it.discount}%</td>
                  <td className="p-3 text-right font-medium">AED {total.toLocaleString("en-AE", { minimumFractionDigits: 2 })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-[#6B625A]">Subtotal</span><span>AED {q.subtotal.toLocaleString("en-AE", { minimumFractionDigits: 2 })}</span></div>
          <div className="flex justify-between"><span className="text-[#6B625A]">VAT ({q.vatRate}%)</span><span>AED {q.vatAmount.toLocaleString("en-AE", { minimumFractionDigits: 2 })}</span></div>
          <div className="flex justify-between font-bold text-[#5A0E12] text-base border-t border-[#D8C9BC] pt-2">
            <span>Total</span><span>AED {q.totalAmount.toLocaleString("en-AE", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {q.notes && (
        <div className="bg-[#F8F5F2] border border-[#D8C9BC] rounded-xl p-4 text-sm text-[#6B625A] mb-4">
          <p className="text-[10px] uppercase tracking-widest mb-1">Notes</p>
          <p>{q.notes}</p>
        </div>
      )}

      {q.internalNotes && (
        <div className="bg-[#FEF2F2] border border-[#D8C9BC] rounded-xl p-4 text-sm text-[#6B625A]">
          <p className="text-[10px] uppercase tracking-widest mb-1 text-[#991B1B]">Internal Notes</p>
          <p>{q.internalNotes}</p>
        </div>
      )}
    </div>
  );
}