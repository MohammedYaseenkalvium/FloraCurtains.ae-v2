import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { db } from "@/lib/db";
import { QuotationBuilder } from "@/components/crm/QuotationBuilder";
import type { QuotationLineItem } from "@/types";

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quotation = await db.quotation.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      enquiry: {
        include: {
          contact: true,
          company: true,
        },
      },
    },
  });

  if (!quotation) {
    notFound();
  }

  // Approved quotations are locked.
  // A revision should be created through the quotation workflow.
  if (quotation.status === "APPROVED") {
    redirect(`/quotations/${quotation.id}`);
  }

  const items =
    quotation.items as unknown as QuotationLineItem[];

  return (
    <div className="min-h-full bg-flora-background">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-flora-muted">
          <Link
            href={`/quotations/${quotation.id}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-flora-primary"
          >
            <ArrowLeft size={15} />
            Quotation
          </Link>

          <span>/</span>

          <span className="text-flora-foreground">
            Edit
          </span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-flora-foreground">
                Edit Quotation
              </h1>

              <p className="mt-1 text-sm text-flora-muted">
                {quotation.quoteNumber} ·{" "}
                {quotation.enquiry.contact.name}
              </p>

              {quotation.enquiry.company && (
                <p className="mt-1 text-xs text-flora-muted">
                  {quotation.enquiry.company.tradeName}
                </p>
              )}
            </div>

            <div className="inline-flex w-fit rounded-full bg-flora-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-flora-muted">
              {quotation.status}
            </div>
          </div>
        </div>

        {/* Editing notice */}
        {quotation.status === "SENT" ||
        quotation.status === "REJECTED" ? (
          <div className="mb-6 rounded-xl border border-flora-border bg-white p-4">
            <p className="text-sm font-medium text-flora-foreground">
              You are editing an existing quotation.
            </p>

            <p className="mt-1 text-xs text-flora-muted">
              Saving changes will update this quotation.
              If the quotation needs to be sent again after
              revision, use the quotation workflow from the
              workspace.
            </p>
          </div>
        ) : null}

        {/* Builder */}
        <QuotationBuilder
          enquiryId={quotation.enquiryId}
          quotationId={quotation.id}
          initialValues={{
            enquiryId: quotation.enquiryId,
            items,
            vatRate: quotation.vatRate,
            validUntil: quotation.validUntil
              ? quotation.validUntil
                  .toISOString()
                  .split("T")[0]
              : "",
            notes: quotation.notes ?? "",
            internalNotes:
              quotation.internalNotes ?? "",
            billedToName:
              quotation.billedToName ?? "",
            billedToTrn:
              quotation.billedToTrn ?? "",
            billedToAddr:
              quotation.billedToAddr ?? "",
          }}
        />
      </div>
    </div>
  );
}