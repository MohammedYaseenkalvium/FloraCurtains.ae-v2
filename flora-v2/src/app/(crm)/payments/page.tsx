import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Banknote, Landmark, Receipt, CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";

const methodIcons = {
  CASH: Banknote,
  BANK_TRANSFER: Landmark,
  CHEQUE: Receipt,
  CARD: CreditCard,
};

const methodLabels = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  CHEQUE: "Cheque",
  CARD: "Card",
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string; quotationId?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { method, quotationId } = await searchParams;

  const where: Prisma.PaymentWhereInput = {};
  if (method) where.method = method as Prisma.PaymentWhereInput["method"];
  if (quotationId) where.quotationId = quotationId;

  const payments = await db.payment.findMany({
    where,
    include: {
      quotation: {
        select: {
          id: true,
          quoteNumber: true,
          totalAmount: true,
          enquiry: {
            select: {
              contact: { select: { name: true } },
              company: { select: { tradeName: true } },
            },
          },
        },
      },
    },
    orderBy: { paidAt: "desc" },
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Payment Details</h1>
          <p className="text-sm text-[#6B625A] mt-1">
            {payments.length} payments · AED {totalCollected.toLocaleString("en-AE", { minimumFractionDigits: 2 })} total collected
          </p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-[#6B625A] hover:text-[#5A0E12] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <form className="flex gap-3">
          <select
            name="method"
            defaultValue={method || ""}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#5A0E12] focus:border-[#5A0E12]"
          >
            <option value="">All Methods</option>
            {Object.entries(methodLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-[#5A0E12] rounded-md hover:bg-[#4a0c0f] transition-colors"
          >
            Filter
          </button>
          {method && (
            <Link
              href="/payments"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F5F2] text-left">
              <th className="px-4 py-3 font-semibold text-[#6B625A]">Date</th>
              <th className="px-4 py-3 font-semibold text-[#6B625A]">Quotation</th>
              <th className="px-4 py-3 font-semibold text-[#6B625A]">Customer</th>
              <th className="px-4 py-3 font-semibold text-[#6B625A]">Method</th>
              <th className="px-4 py-3 font-semibold text-[#6B625A]">Reference</th>
              <th className="px-4 py-3 font-semibold text-[#6B625A] text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#6B625A]">
                  No payments recorded yet
                </td>
              </tr>
            ) : (
              payments.map((payment) => {
                const Icon = methodIcons[payment.method];
                const customerName =
                  payment.quotation?.enquiry?.company?.tradeName ||
                  payment.quotation?.enquiry?.contact?.name ||
                  "Unknown";

                return (
                  <tr key={payment.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {format(new Date(payment.paidAt), "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/quotations/${payment.quotationId}`}
                        className="text-[#5A0E12] hover:underline font-medium"
                      >
                        {payment.quotation?.quoteNumber || "N/A"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{customerName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Icon size={14} className="text-[#6B625A]" />
                        <span>{methodLabels[payment.method]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B625A]">
                      {payment.reference || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      AED {payment.amount.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}