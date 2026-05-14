"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quotationFormSchema, type QuotationFormValues } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, PlusCircle } from "lucide-react";

export function QuotationBuilder({ enquiryId }: { enquiryId: string }) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, watch } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationFormSchema) as any,
    defaultValues: {
      enquiryId,
      vatRate: 5,
      items: [{ description: "", unit: "pcs", qty: 1, unitPrice: 0, discount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items  = watch("items");
  const vatRate = watch("vatRate") ?? 5;

  const subtotal    = items.reduce((s, it) => s + (it.qty ?? 0) * (it.unitPrice ?? 0) * (1 - (it.discount ?? 0) / 100), 0);
  const vatAmount   = subtotal * (vatRate / 100);
  const totalAmount = subtotal + vatAmount;

  const field = "border border-[#D8C9BC] rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2] w-full";
  const label = "text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1";

  async function onSubmit(data: QuotationFormValues) {
    setLoading(true);
    const res = await fetch("/api/quotations", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });
    if (res.ok) {
      const q = await res.json();
      router.push(`/quotations/${q.id}`);
    } else {
      setLoading(false);
      alert("Error saving quotation");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {/* Line Items */}
      <section>
        <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F5F2] text-[#6B625A] text-[10px] uppercase tracking-widest">
                <th className="text-left p-2 font-medium">Description</th>
                <th className="text-left p-2 font-medium w-20">Unit</th>
                <th className="text-right p-2 font-medium w-20">Qty</th>
                <th className="text-right p-2 font-medium w-28">Unit Price</th>
                <th className="text-right p-2 font-medium w-20">Disc%</th>
                <th className="text-right p-2 font-medium w-28">Total</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => {
                const it    = items[i] ?? {};
                const total = (it.qty ?? 0) * (it.unitPrice ?? 0) * (1 - (it.discount ?? 0) / 100);
                return (
                  <tr key={f.id} className="border-b border-[#EFE7DF]">
                    <td className="p-1"><input {...register(`items.${i}.description`)} className={field} placeholder="Description" /></td>
                    <td className="p-1"><input {...register(`items.${i}.unit`)} className={field} /></td>
                    <td className="p-1"><input {...register(`items.${i}.qty`)} type="number" step="0.01" className={`${field} text-right`} /></td>
                    <td className="p-1"><input {...register(`items.${i}.unitPrice`)} type="number" step="0.01" className={`${field} text-right`} /></td>
                    <td className="p-1"><input {...register(`items.${i}.discount`)} type="number" step="0.1" className={`${field} text-right`} /></td>
                    <td className="p-1 text-right font-medium text-[#5A0E12]">
                      AED {total.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-1">
                      <button type="button" onClick={() => remove(i)} className="text-[#6B625A] hover:text-red-700">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={() => append({ description: "", unit: "pcs", qty: 1, unitPrice: 0, discount: 0 })}
          className="mt-3 flex items-center gap-2 text-[#5A0E12] text-sm hover:underline">
          <PlusCircle size={15} /> Add Line Item
        </button>
      </section>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-72 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#6B625A]">Subtotal</span>
            <span>AED {subtotal.toLocaleString("en-AE", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#6B625A]">VAT %</span>
            <input {...register("vatRate")} type="number" step="0.1" className="border border-[#D8C9BC] rounded px-2 py-1 text-sm w-20 text-right bg-[#F8F5F2]" />
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B625A]">VAT Amount</span>
            <span>AED {vatAmount.toLocaleString("en-AE", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between font-bold text-[#5A0E12] text-base border-t border-[#D8C9BC] pt-2">
            <span>Total</span>
            <span>AED {totalAmount.toLocaleString("en-AE", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Notes & Billing */}
      <section className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-sm mb-3 text-[#5A0E12]">Billing Info (B2B)</h3>
          <div className="space-y-3">
            <div><label className={label}>Billed To Name</label><input {...register("billedToName")} className={field} /></div>
            <div><label className={label}>TRN</label><input {...register("billedToTrn")} className={field} /></div>
            <div><label className={label}>Address</label><input {...register("billedToAddr")} className={field} /></div>
            <div><label className={label}>Valid Until</label><input {...register("validUntil")} type="date" className={field} /></div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-3 text-[#5A0E12]">Notes</h3>
          <div className="space-y-3">
            <div><label className={label}>Client-Facing Notes</label><textarea {...register("notes")} className={field} rows={3} /></div>
            <div><label className={label}>Internal Notes</label><textarea {...register("internalNotes")} className={field} rows={3} /></div>
          </div>
        </div>
      </section>

      <button type="submit" disabled={loading}
        className="bg-[#5A0E12] text-white rounded-lg px-8 py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-[#7A1E22] transition-colors">
        {loading ? "Saving…" : "Save Quotation"}
      </button>
    </form>
  );
}