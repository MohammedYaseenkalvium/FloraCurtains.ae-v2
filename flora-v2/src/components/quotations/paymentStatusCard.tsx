"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle, Clock, AlertCircle, Plus, Receipt, Banknote, CreditCard, Landmark } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  method: "CASH" | "CARD" | "BANK_TRANSFER" | "CHEQUE";
  reference: string | null;
  paidAt: Date;
  notes: string | null;
}

interface PaymentStatusCardProps {
  totalAmount: number;
  payments: Payment[];
  dueDate?: Date | null;
  quotationId: string;
 onAddPayment: (payment: Omit<Payment, "id" | "paidAt">) => Promise<void>;
}

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

export function PaymentStatusCard({
  totalAmount,
  payments,
  dueDate,
  onAddPayment,
}: PaymentStatusCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    method: "CASH" as Payment["method"],
    reference: "",
    notes: "",
  });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = totalAmount - totalPaid;
  const isFullyPaid = balance <= 0;
  const isOverdue = dueDate && new Date() > new Date(dueDate) && !isFullyPaid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) return;
    
    setIsSubmitting(true);
    try {
      await onAddPayment({
        amount: parseFloat(newPayment.amount),
        method: newPayment.method,
        reference: newPayment.reference || null,
        notes: newPayment.notes || null,
      });
      setIsAdding(false);
      setNewPayment({ amount: "", method: "CASH", reference: "", notes: "" });
    } catch (error) {
      console.error("Failed to add payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Payment Status
        </h3>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          {isFullyPaid ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Fully Paid</span>
            </>
          ) : isOverdue ? (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">Overdue</span>
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Unpaid</span>
            </>
          )}
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Total</span>
            <span className="font-medium text-gray-900">
              AED {totalAmount.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Paid</span>
            <span className="font-medium text-green-600">
              AED {totalPaid.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-gray-100">
            <span className="text-gray-500">Balance</span>
            <span className={`font-semibold ${balance <= 0 ? "text-green-600" : "text-gray-900"}`}>
              AED {Math.abs(balance).toLocaleString("en-AE", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {dueDate && !isFullyPaid && (
          <div className="mt-2 text-xs text-gray-500">
            Due: {format(new Date(dueDate), "dd MMM yyyy")}
          </div>
        )}
      </div>

      {payments.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Payment History
          </h4>
          <div className="space-y-2">
            {payments.map((payment) => {
              const Icon = methodIcons[payment.method];
              return (
                <div key={payment.id} className="flex items-start gap-2 p-2 rounded-md bg-gray-50">
                  <Icon className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">
                        AED {payment.amount.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(payment.paidAt), "dd MMM yyyy")}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {methodLabels[payment.method]}
                      {payment.reference && ` · Ref: ${payment.reference}`}
                    </div>
                    {payment.notes && (
                      <div className="text-xs text-gray-400 mt-0.5">{payment.notes}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-t border-gray-100">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#5A0E12] rounded-md hover:bg-[#4a0c0f] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount (AED)</label>
              <input
                type="number"
                step="0.01"
                required
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#5A0E12] focus:border-[#5A0E12]"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Method</label>
              <select
                value={newPayment.method}
                onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as Payment["method"] })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#5A0E12] focus:border-[#5A0E12]"
              >
                {Object.entries(methodLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reference (optional)</label>
              <input
                type="text"
                value={newPayment.reference}
                onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#5A0E12] focus:border-[#5A0E12]"
                placeholder="Cheque #, Transaction ID..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input
                type="text"
                value={newPayment.notes}
                onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#5A0E12] focus:border-[#5A0E12]"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-[#5A0E12] rounded-md hover:bg-[#4a0c0f] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Payment"}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}   