import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  MapPin,
  Pencil,
  User,
} from "lucide-react";

import { QuotationStatusWorkflow } from "@/components/crm/QuotationWorkflow";
import { ConvertToProject } from "@/components/crm/ConvertToProject";
import type { QuotationLineItem } from "@/types";

function formatAED(value: number) {
  return `AED ${value.toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: Date | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function QuotationDetailPage({
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
      payments: {
        orderBy: {
          paidAt: "desc",
        },
      },
    },
  });

  if (!quotation) {
    notFound();
  }

  const items =
    quotation.items as unknown as QuotationLineItem[];

  const paidAmount = quotation.payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const outstandingAmount = Math.max(
    quotation.totalAmount - paidAmount,
    0
  );

  return (
    <div className="min-h-full bg-[#FFF8F5]">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6B625A]">
          <Link
            href="/quotations"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[#5A0E12]"
          >
            <ArrowLeft size={15} />
            Quotations
          </Link>

          <span>/</span>

          <span className="text-[#1E1B18]">
            {quotation.quoteNumber}
          </span>
        </div>

        {/* Header */}
        <section className="rounded-xl border border-[#D8C9BC] bg-white p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#F8F5F2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                  Quotation
                </span>

                <span className="text-xs text-[#6B625A]">
                  Created {formatDate(quotation.createdAt)}
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#1E1B18]">
                {quotation.quoteNumber}
              </h1>

              <p className="mt-1 text-sm text-[#6B625A]">
                {quotation.enquiry.contact.name}
                {quotation.enquiry.serviceWanted
                  ? ` · ${quotation.enquiry.serviceWanted}`
                  : ""}
              </p>

              {quotation.enquiry.projectName && (
                <p className="mt-1 text-xs text-[#6B625A]">
                  Project: {quotation.enquiry.projectName}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/quotations/${quotation.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg border border-[#D8C9BC] px-3 py-2 text-sm font-medium text-[#6B625A] transition-colors hover:bg-[#F8F5F2]"
              >
                <Pencil size={14} />
                Edit
              </Link>

              <a
                href={`/api/quotations/${quotation.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#D8C9BC] px-3 py-2 text-sm font-medium text-[#6B625A] transition-colors hover:bg-[#F8F5F2]"
              >
                <FileText size={14} />
                PDF
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="mt-5 border-t border-[#EFE7DF] pt-4">
            <QuotationStatusWorkflow
              quotationId={quotation.id}
              currentStatus={quotation.status}
            />
          </div>
        </section>

        {/* Customer + Quotation Info */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Customer */}
          <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8F5F2] text-[#5A0E12]">
                <User size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#1E1B18]">
                  Customer
                </h2>
                <p className="text-xs text-[#6B625A]">
                  Customer and company information
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-[#6B625A]">
                  Name
                </p>

                <p className="mt-1 text-sm font-medium text-[#1E1B18]">
                  {quotation.enquiry.contact.name}
                </p>
              </div>

              {quotation.enquiry.contact.phone && (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-[#6B625A]">
                    Phone
                  </p>

                  <p className="mt-1 text-sm text-[#1E1B18]">
                    {quotation.enquiry.contact.phone}
                  </p>
                </div>
              )}

              {quotation.enquiry.contact.email && (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-[#6B625A]">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm text-[#1E1B18]">
                    {quotation.enquiry.contact.email}
                  </p>
                </div>
              )}

              {quotation.enquiry.company && (
                <div className="flex items-start gap-2 border-t border-[#EFE7DF] pt-4">
                  <Building2
                    size={15}
                    className="mt-0.5 text-[#6B625A]"
                  />

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-[#6B625A]">
                      Company
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#1E1B18]">
                      {quotation.enquiry.company.tradeName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quotation information */}
          <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8F5F2] text-[#5A0E12]">
                <CalendarDays size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#1E1B18]">
                  Quotation Information
                </h2>

                <p className="text-xs text-[#6B625A]">
                  Commercial and site details
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-[#6B625A]">
                  Service
                </p>

                <p className="mt-1 text-sm text-[#1E1B18]">
                  {quotation.enquiry.serviceWanted || "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-[#6B625A]">
                  Valid Until
                </p>

                <p className="mt-1 text-sm text-[#1E1B18]">
                  {formatDate(quotation.validUntil)}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-[10px] font-medium uppercase tracking-widest text-[#6B625A]">
                  Site Address
                </p>

                <div className="mt-1 flex items-start gap-2">
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0 text-[#6B625A]"
                  />

                  <p className="text-sm text-[#1E1B18]">
                    {quotation.enquiry.siteAddress || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Items */}
        <section className="overflow-hidden rounded-xl border border-[#D8C9BC] bg-white">
          <div className="border-b border-[#D8C9BC] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#1E1B18]">
              Quotation Items
            </h2>

            <p className="mt-0.5 text-xs text-[#6B625A]">
              Products and services included in this quotation.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-[#F8F5F2] text-[10px] uppercase tracking-widest text-[#6B625A]">
                  <th className="p-3 text-left font-medium">
                    Description
                  </th>
                  <th className="p-3 text-right font-medium">
                    Qty
                  </th>
                  <th className="p-3 text-left font-medium">
                    Unit
                  </th>
                  <th className="p-3 text-right font-medium">
                    Unit Price
                  </th>
                  <th className="p-3 text-right font-medium">
                    Discount
                  </th>
                  <th className="p-3 text-right font-medium">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-sm text-[#6B625A]"
                    >
                      No quotation items.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => {
                    const lineTotal =
                      item.qty *
                      item.unitPrice *
                      (1 - item.discount / 100);

                    return (
                      <tr
                        key={`${item.description}-${index}`}
                        className="border-t border-[#EFE7DF]"
                      >
                        <td className="p-3 text-[#1E1B18]">
                          {item.description}
                        </td>

                        <td className="p-3 text-right">
                          {item.qty}
                        </td>

                        <td className="p-3 text-[#6B625A]">
                          {item.unit}
                        </td>

                        <td className="p-3 text-right">
                          {formatAED(item.unitPrice)}
                        </td>

                        <td className="p-3 text-right">
                          {item.discount}%
                        </td>

                        <td className="p-3 text-right font-medium text-[#5A0E12]">
                          {formatAED(lineTotal)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Financial Summary */}
        <section className="flex justify-end">
          <div className="w-full rounded-xl border border-[#D8C9BC] bg-white p-5 sm:w-96">
            <h2 className="mb-4 text-sm font-semibold text-[#1E1B18]">
              Financial Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B625A]">
                  Subtotal
                </span>

                <span>{formatAED(quotation.subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#6B625A]">
                  VAT ({quotation.vatRate}%)
                </span>

                <span>{formatAED(quotation.vatAmount)}</span>
              </div>

              <div className="border-t border-[#D8C9BC] pt-3">
                <div className="flex justify-between text-base font-bold text-[#5A0E12]">
                  <span>Total</span>
                  <span>
                    {formatAED(quotation.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-[#EFE7DF] pt-4">
                <div className="flex justify-between">
                  <span className="text-[#6B625A]">
                    Paid
                  </span>

                  <span className="font-medium text-[#0F6E56]">
                    {formatAED(paidAmount)}
                  </span>
                </div>

                <div className="mt-2 flex justify-between">
                  <span className="text-[#6B625A]">
                    Outstanding
                  </span>

                  <span className="font-medium text-[#991B1B]">
                    {formatAED(outstandingAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notes */}
        {(quotation.notes || quotation.internalNotes) && (
          <section className="grid gap-6 lg:grid-cols-2">
            {quotation.notes && (
              <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-[#1E1B18]">
                  Client Notes
                </h2>

                <p className="whitespace-pre-wrap text-sm leading-6 text-[#6B625A]">
                  {quotation.notes}
                </p>
              </div>
            )}

            {quotation.internalNotes && (
              <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-[#991B1B]">
                  Internal Notes
                </h2>

                <p className="whitespace-pre-wrap text-sm leading-6 text-[#6B625A]">
                  {quotation.internalNotes}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Convert to Project */}
        {quotation.status === "APPROVED" && (
          <section className="rounded-xl border border-[#B7D8CC] bg-[#EDF7F3] p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-[#0F6E56]">
                Quotation Approved
              </h2>

              <p className="mt-1 text-xs text-[#6B625A]">
                This quotation has been approved. You can now convert the
                enquiry into a project.
              </p>
            </div>

            <ConvertToProject
              enquiryId={quotation.enquiryId}
              quotationId={quotation.id}
              quoteTotal={quotation.totalAmount}
            />
          </section>
        )}
      </div>
    </div>
  );
}