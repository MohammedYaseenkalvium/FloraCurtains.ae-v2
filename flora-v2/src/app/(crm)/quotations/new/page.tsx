import { db } from "@/lib/db";
import { QuotationBuilder } from "@/components/crm/QuotationBuilder";
import { notFound } from "next/navigation";

export default async function NewQuotationPage({
  searchParams,
}: {
  searchParams: Promise<{ enquiryId?: string }>;
}) {
  const { enquiryId } = await searchParams;
  if (!enquiryId) notFound();

  const enquiry = await db.enquiry.findFirst({
    where:   { id: enquiryId, deletedAt: null },
    include: { contact: true, company: true },
  });
  if (!enquiry) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Create Quotation</h1>
      <p className="text-[#6B625A] text-sm mb-8">
        For <strong>{enquiry.contact.name}</strong>
        {enquiry.company ? ` · ${enquiry.company.tradeName}` : ""} — {enquiry.serviceWanted}
      </p>
      <QuotationBuilder enquiryId={enquiry.id} />
    </div>
  );
}