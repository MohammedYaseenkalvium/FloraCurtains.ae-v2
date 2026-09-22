"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Calculator,
  PlusCircle,
  Save,
  Trash2,
} from "lucide-react";

import {
  quotationFormSchema,
  type QuotationFormValues,
} from "@/types";
import { calcTotals } from "@/lib/quotation";

type Props = {
  enquiryId: string;
  quotationId?: string;
  initialValues?: QuotationFormValues;
};

const emptyItem = {
  description: "",
  unit: "pcs",
  qty: 1,
  unitPrice: 0,
  discount: 0,
};

export function QuotationBuilder({
  enquiryId,
  quotationId,
  initialValues,
}: Props) {
  const router = useRouter();

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(quotationId);

  const defaultValues: QuotationFormValues = initialValues ?? {
    enquiryId,
    items: [emptyItem],
    vatRate: 5,
    validUntil: "",
    notes: "",
    internalNotes: "",
    billedToName: "",
    billedToTrn: "",
    billedToAddr: "",
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(
      quotationFormSchema
    ) as Resolver<QuotationFormValues>,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items") ?? [];
  const vatRate = Number(watch("vatRate") ?? 5);

  // Live preview via the canonical server math (src/lib/quotation.ts).
  // Deliberately unmemoized: the item list is tiny, and RHF watch()
  // returns a new reference per render by design.
  const { subtotal, vatAmount, totalAmount } = calcTotals(
    (items ?? []).map((item) => ({
      description: String(item?.description ?? ""),
      unit: String(item?.unit ?? "pcs"),
      qty: Number(item?.qty) || 0,
      unitPrice: Number(item?.unitPrice) || 0,
      discount: Number(item?.discount) || 0,
    })),
    Number.isFinite(vatRate) ? vatRate : 5
  );

  async function onSubmit(values: QuotationFormValues) {
    setError("");
    setSaving(true);

    try {
      const endpoint = isEdit
        ? `/api/quotations/${quotationId}`
        : "/api/quotations";

      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          enquiryId,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Failed to ${isEdit ? "update" : "create"} quotation`
        );
      }

      router.push(
        `/quotations/${data.id ?? quotationId}`
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEdit ? "update" : "create"} quotation`
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Line Items */}
      <section className="rounded-xl border border-flora-border bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-flora-primary">
              Quotation Items
            </h2>

            <p className="mt-1 text-xs text-flora-muted">
              Add the products or services included in this quotation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => append(emptyItem)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-flora-border px-3 py-2 text-xs font-medium text-flora-primary transition-colors hover:bg-flora-surface"
          >
            <PlusCircle size={14} />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border border-flora-border/60 bg-flora-background p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-flora-muted">
                  Item {index + 1}
                </p>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex items-center gap-1 text-xs text-[#991B1B] hover:underline"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-12">
                {/* Description */}
                <div className="md:col-span-5">
                  <label className="mb-1.5 block text-xs font-medium text-flora-muted">
                    Description
                  </label>

                  <input
                    {...register(
                      `items.${index}.description`
                    )}
                    placeholder="e.g. Blackout curtain installation"
                    className="w-full rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-flora-primary"
                  />
                </div>

                {/* Unit */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-flora-muted">
                    Unit
                  </label>

                  <input
                    {...register(`items.${index}.unit`)}
                    placeholder="pcs"
                    className="w-full rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-flora-primary"
                  />
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-flora-muted">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    {...register(
                      `items.${index}.qty`,
                      {
                        valueAsNumber: true,
                      }
                    )}
                    className="w-full rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-flora-primary"
                  />
                </div>

                {/* Unit Price */}
                <div className="md:col-span-3">
                  <label className="mb-1.5 block text-xs font-medium text-flora-muted">
                    Unit Price (AED)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(
                      `items.${index}.unitPrice`,
                      {
                        valueAsNumber: true,
                      }
                    )}
                    className="w-full rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-flora-primary"
                  />
                </div>

                {/* Discount */}
                <div className="md:col-span-3">
                  <label className="mb-1.5 block text-xs font-medium text-flora-muted">
                    Discount (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    {...register(
                      `items.${index}.discount`,
                      {
                        valueAsNumber: true,
                      }
                    )}
                    className="w-full rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-flora-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Billing */}
      <section className="rounded-xl border border-flora-border bg-white p-5">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-flora-primary">
            Billing Information
          </h2>

          <p className="mt-1 text-xs text-flora-muted">
            Enter the billing information that should appear on the quotation.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-flora-muted">
              Billed To
            </label>

            <input
              {...register("billedToName")}
              placeholder="Customer or company name"
              className="w-full rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-flora-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-flora-muted">
              TRN
            </label>

            <input
              {...register("billedToTrn")}
              placeholder="Tax Registration Number"
              className="w-full rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-flora-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-flora-muted">
              Billing Address
            </label>

            <textarea
              {...register("billedToAddr")}
              rows={3}
              placeholder="Billing address"
              className="w-full resize-none rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-flora-primary"
            />
          </div>
        </div>
      </section>

      {/* Validity + VAT */}
      <section className="rounded-xl border border-flora-border bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-flora-muted">
              VAT Rate (%)
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              {...register("vatRate", {
                valueAsNumber: true,
              })}
              className="w-full rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-flora-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-flora-muted">
              Valid Until
            </label>

            <input
              type="date"
              {...register("validUntil")}
              className="w-full rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-flora-primary"
            />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-xl border border-flora-border bg-white p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-flora-muted">
              Customer Notes
            </label>

            <textarea
              {...register("notes")}
              rows={5}
              placeholder="Notes visible to the customer"
              className="w-full resize-none rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-flora-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-flora-muted">
              Internal Notes
            </label>

            <textarea
              {...register("internalNotes")}
              rows={5}
              placeholder="Internal CRM notes"
              className="w-full resize-none rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-flora-primary"
            />
          </div>
        </div>
      </section>

      {/* Totals */}
      <section className="rounded-xl border border-flora-border bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Calculator
            size={17}
            className="text-flora-primary"
          />

          <h2 className="text-sm font-semibold text-flora-primary">
            Financial Summary
          </h2>
        </div>

        <div className="ml-auto max-w-sm space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-flora-muted">
              Subtotal
            </span>

            <span className="font-medium">
              AED {subtotal.toLocaleString("en-AE", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-flora-muted">
              VAT ({vatRate}%)
            </span>

            <span className="font-medium">
              AED {vatAmount.toLocaleString("en-AE", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="border-t border-flora-border/60 pt-3">
            <div className="flex justify-between">
              <span className="font-semibold text-flora-foreground">
                Total
              </span>

              <span className="text-lg font-bold text-flora-primary">
                AED {totalAmount.toLocaleString("en-AE", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-[#E5B8B8] bg-[#FFF3F3] px-4 py-3 text-sm text-[#991B1B]">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(
              quotationId
                ? `/quotations/${quotationId}`
                : "/quotations"
            )
          }
          className="rounded-lg border border-flora-border bg-white px-5 py-2.5 text-sm font-medium text-flora-muted transition-colors hover:bg-flora-surface"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-flora-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-flora-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={15} />

          {saving
            ? isEdit
              ? "Updating..."
              : "Saving..."
            : isEdit
              ? "Update Quotation"
              : "Save Quotation"}
        </button>
      </div>
    </form>
  );
}