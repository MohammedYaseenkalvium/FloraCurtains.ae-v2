"use client";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enquiryFormSchema, type EnquiryFormValues } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function EnquiryForm() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema) as Resolver<EnquiryFormValues>,
    defaultValues: { customerType: "B2C", contactSource: "CALL", interestLevel: 3 },
  });

  const isB2B = watch("customerType") === "B2B";

  async function onSubmit(data: EnquiryFormValues) {
    setLoading(true);
    const res = await fetch("/api/enquiries", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });
    if (res.ok) {
      const enquiry = await res.json();
      router.push(`/enquiries/${enquiry.id}`);
    } else {
      setLoading(false);
      alert("Error saving enquiry");
    }
  }

  const field = "border border-[#D8C9BC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2] w-full";
  const label = "text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1";
  const err   = "text-red-600 text-xs mt-0.5";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">

      {/* Customer Type Toggle */}
      <div>
        <p className={label}>Customer Type</p>
        <div className="flex gap-3">
          {(["B2C", "B2B"] as const).map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value={t} {...register("customerType")} className="accent-[#5A0E12]" />
              <span className="text-sm">{t === "B2C" ? "Individual (B2C)" : "Company / Firm (B2B)"}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Contact Details */}
      <section>
        <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Contact Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Full Name *</label>
            <input {...register("contactName")} className={field} />
            {errors.contactName && <p className={err}>{errors.contactName.message}</p>}
          </div>
          <div>
            <label className={label}>Phone *</label>
            <input {...register("contactPhone")} className={field} placeholder="+971 50 …" />
            {errors.contactPhone && <p className={err}>{errors.contactPhone.message}</p>}
          </div>
          <div>
            <label className={label}>Email</label>
            <input {...register("contactEmail")} className={field} type="email" />
          </div>
          <div>
            <label className={label}>Source *</label>
            <select {...register("contactSource")} className={field}>
              {["CALL","WALK_IN","REFERRAL","INSTAGRAM","WEBSITE","WHATSAPP","EXISTING_CLIENT","TENDER"].map(s => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          {isB2B && (
            <div>
              <label className={label}>Role at Company</label>
              <select {...register("contactRole")} className={field}>
                {["OWNER","MANAGER","INTERIOR_DESIGNER","PROCUREMENT","SITE_ENGINEER","OTHER"].map(r => (
                  <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* B2B Company Details */}
      {isB2B && (
        <section>
          <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Company Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Company / Trade Name *</label>
              <input {...register("companyName")} className={field} />
            </div>
            <div>
              <label className={label}>Company Type</label>
              <select {...register("companyType")} className={field}>
                {["INTERIOR_FIRM","HOTEL","HOSPITAL","GOVERNMENT","CONTRACTOR","REAL_ESTATE","OTHER"].map(c => (
                  <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>TRN (VAT Number)</label>
              <input {...register("companyTrn")} className={field} />
            </div>
            <div>
              <label className={label}>Project / Tender Name</label>
              <input {...register("projectName")} className={field} placeholder="Marriott Hotel Renovation" />
            </div>
          </div>
        </section>
      )}

      {/* Enquiry Details */}
      <section>
        <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Enquiry Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={label}>Service Wanted *</label>
            <input {...register("serviceWanted")} className={field} placeholder="e.g. Living Room Drapes, Office Blinds Package" />
            {errors.serviceWanted && <p className={err}>{errors.serviceWanted.message}</p>}
          </div>
          <div className="col-span-2">
            <label className={label}>Site / Delivery Address</label>
            <input {...register("siteAddress")} className={field} />
          </div>
          <div>
            <label className={label}>Budget (AED)</label>
            <input {...register("desiredBudget")} type="number" className={field} />
          </div>
          <div>
            <label className={label}>Interest Level (1–5)</label>
            <input {...register("interestLevel")} type="number" min={1} max={5} className={field} />
          </div>
          <div>
            <label className={label}>Assigned Staff</label>
            <input {...register("assignedTo")} className={field} placeholder="Staff name" />
          </div>
          <div>
            <label className={label}>Follow-up Date</label>
            <input {...register("followUpDate")} type="date" className={field} />
          </div>
          <div className="col-span-2">
            <label className={label}>Call Notes / Remarks</label>
            <textarea {...register("remarks")} className={field} rows={3} />
          </div>
        </div>
      </section>

      <button
        type="submit" disabled={loading}
        className="bg-[#5A0E12] text-white rounded-lg px-8 py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-[#7A1E22] transition-colors"
      >
        {loading ? "Saving…" : "Save Enquiry"}
      </button>
    </form>
  );
}