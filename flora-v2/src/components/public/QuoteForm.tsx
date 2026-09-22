"use client";

import { FormEvent, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";

export function QuoteForm() {
  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const payload = {
      name: String(
        formData.get("name") ?? ""
      ).trim(),

      email: String(
        formData.get("email") ?? ""
      ).trim(),

      phone: String(
        formData.get("phone") ?? ""
      ).trim(),

      customerType:
        String(
          formData.get(
            "customerType"
          ) ?? "B2C"
        ),

      serviceWanted:
        String(
          formData.get(
            "serviceWanted"
          ) ?? ""
        ).trim(),

      projectName:
        String(
          formData.get(
            "projectName"
          ) ?? ""
        ).trim(),

      siteAddress:
        String(
          formData.get(
            "siteAddress"
          ) ?? ""
        ).trim(),

      budget:
        String(
          formData.get("budget") ?? ""
        ).trim(),

      notes: String(
        formData.get("notes") ?? ""
      ).trim(),
    };

    try {
      const response = await fetch(
        "/api/public/enquiries",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Unable to submit your enquiry."
        );
      }

      form.reset();
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-flora-border bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-flora-surface text-flora-primary">
          <CheckCircle2 size={24} />
        </div>

        <h2 className="mt-5 font-display text-3xl text-flora-foreground">
          Enquiry received.
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-flora-muted">
          Thank you for contacting Flora Curtains.
          Your enquiry has been received and our team
          will get back to you.
        </p>

        <button
          type="button"
          onClick={() =>
            setSuccess(false)
          }
          className="mt-6 rounded-lg border border-flora-border px-5 py-2.5 text-sm font-semibold text-flora-primary hover:bg-flora-surface"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-flora-border bg-white p-6 sm:p-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-xs font-semibold text-flora-foreground"
          >
            Name *
          </label>

          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className="h-11 w-full rounded-lg border border-flora-border px-3 text-sm outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary"
            placeholder="Your name"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-semibold text-flora-foreground"
          >
            Email *
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-11 w-full rounded-lg border border-flora-border px-3 text-sm outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary"
            placeholder="you@example.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-xs font-semibold text-flora-foreground"
          >
            Phone *
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className="h-11 w-full rounded-lg border border-flora-border px-3 text-sm outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary"
            placeholder="Phone number"
          />
        </div>

        {/* Customer Type */}
        <div>
          <label
            htmlFor="customerType"
            className="mb-2 block text-xs font-semibold text-flora-foreground"
          >
            Customer Type
          </label>

          <select
            id="customerType"
            name="customerType"
            defaultValue="B2C"
            className="h-11 w-full rounded-lg border border-flora-border bg-white px-3 text-sm outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary"
          >
            <option value="B2C">
              Residential
            </option>

            <option value="B2B">
              Business
            </option>
          </select>
        </div>

        {/* Service */}
        <div>
          <label
            htmlFor="serviceWanted"
            className="mb-2 block text-xs font-semibold text-flora-foreground"
          >
            Service *
          </label>

          <select
            id="serviceWanted"
            name="serviceWanted"
            required
            defaultValue=""
            className="h-11 w-full rounded-lg border border-flora-border bg-white px-3 text-sm outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary"
          >
            <option value="" disabled>
              Select a service
            </option>

            <option value="Curtains">
              Curtains
            </option>

            <option value="Blinds">
              Blinds
            </option>

            <option value="Motorized Curtains">
              Motorized Curtains
            </option>

            <option value="Custom Window Solutions">
              Custom Window Solutions
            </option>
          </select>
        </div>

        {/* Project */}
        <div>
          <label
            htmlFor="projectName"
            className="mb-2 block text-xs font-semibold text-flora-foreground"
          >
            Project Name
          </label>

          <input
            id="projectName"
            name="projectName"
            className="h-11 w-full rounded-lg border border-flora-border px-3 text-sm outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary"
            placeholder="Optional"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label
            htmlFor="siteAddress"
            className="mb-2 block text-xs font-semibold text-flora-foreground"
          >
            Site Address
          </label>

          <textarea
            id="siteAddress"
            name="siteAddress"
            rows={3}
            className="w-full resize-none rounded-lg border border-flora-border px-3 py-3 text-sm outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary"
            placeholder="Where is the project located?"
          />
        </div>

        {/* Budget */}
        <div>
          <label
            htmlFor="budget"
            className="mb-2 block text-xs font-semibold text-flora-foreground"
          >
            Budget
          </label>

          <input
            id="budget"
            name="budget"
            className="h-11 w-full rounded-lg border border-flora-border px-3 text-sm outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary"
            placeholder="Optional"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label
            htmlFor="notes"
            className="mb-2 block text-xs font-semibold text-flora-foreground"
          >
            Tell us about your project
          </label>

          <textarea
            id="notes"
            name="notes"
            rows={5}
            className="w-full resize-none rounded-lg border border-flora-border px-3 py-3 text-sm outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary"
            placeholder="Tell us about your requirements, preferred style, number of windows, timeline, etc."
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-5 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4">
          <AlertCircle
            size={17}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-red-700"
          />

          <p className="text-sm text-red-800">
            {error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-flora-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-flora-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />
            Sending...
          </>
        ) : (
          <>
            <Send size={16} />
            Send Enquiry
          </>
        )}
      </button>
    </form>
  );
}