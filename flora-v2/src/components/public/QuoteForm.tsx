"use client";

import { FormEvent, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import { PHONE_PATTERN_SOURCE } from "@/lib/validation";

function FieldError({
  name,
  errors,
}: {
  name: string;
  errors: Record<string, string>;
}) {
  if (!errors[name]) return null;
  return (
    <p
      id={`${name}-error`}
      className="mt-1.5 text-xs text-flora-danger"
    >
      {errors[name]}
    </p>
  );
}

export function QuoteForm() {
  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string>>({});

  const [reference, setReference] =
    useState("");

  const [offline, setOffline] =
    useState(false);

  const formRef =
    useRef<HTMLFormElement>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setFieldErrors({});
    setSuccess(false);
    setReference("");
    setOffline(false);

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
        if (
          data &&
          typeof data === "object" &&
          data.fieldErrors &&
          typeof data.fieldErrors === "object"
        ) {
          setFieldErrors(
            data.fieldErrors as Record<string, string>
          );
        }
        throw new Error(
          data?.error ??
            "Unable to submit your enquiry."
        );
      }

      form.reset();
      setReference(
        typeof data?.enquiryId === "string"
          ? data.enquiryId.slice(-6).toUpperCase()
          : ""
      );
      setSuccess(true);
    } catch (err) {
      const isOffline =
        err instanceof TypeError &&
        /fetch failed|networkerror|load failed/i.test(
          err.message
        );
      setOffline(isOffline);
      setError(
        isOffline
          ? "No connection. Check your internet connection and try again."
          : err instanceof Error
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
          {reference ? ` Your reference: ${reference}.` : ""}
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
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-xl border border-flora-border bg-white p-6 sm:p-8"
      aria-busy={loading}
    >
      <fieldset disabled={loading} className="contents">
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
            maxLength={100}
            aria-invalid={fieldErrors.name ? true : undefined}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className="h-11 w-full rounded-lg border border-flora-border px-3 text-base outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary sm:text-sm"
            placeholder="Your name"
          />
          <FieldError name="name" errors={fieldErrors} />
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
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className="h-11 w-full rounded-lg border border-flora-border px-3 text-base outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary sm:text-sm"
            placeholder="you@example.com"
          />
          <FieldError name="email" errors={fieldErrors} />
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
            pattern={PHONE_PATTERN_SOURCE}
            title="Enter a valid phone number with at least 7 digits."
            maxLength={30}
            aria-invalid={fieldErrors.phone ? true : undefined}
            aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            className="h-11 w-full rounded-lg border border-flora-border px-3 text-base outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary sm:text-sm"
            placeholder="Phone number"
          />
          <FieldError name="phone" errors={fieldErrors} />
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
            aria-invalid={fieldErrors.customerType ? true : undefined}
            aria-describedby={fieldErrors.customerType ? "customerType-error" : undefined}
            className="h-11 w-full rounded-lg border border-flora-border bg-white px-3 text-base outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary sm:text-sm"
          >
            <option value="B2C">
              Residential
            </option>

            <option value="B2B">
              Business
            </option>
          </select>
          <FieldError name="customerType" errors={fieldErrors} />
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
            aria-invalid={fieldErrors.serviceWanted ? true : undefined}
            aria-describedby={fieldErrors.serviceWanted ? "serviceWanted-error" : undefined}
            className="h-11 w-full rounded-lg border border-flora-border bg-white px-3 text-base outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary sm:text-sm"
          >
            <option value="" disabled>
              Select a service
            </option>

            <option value="Curtains & Blinds">
              Curtains &amp; Blinds
            </option>

            <option value="Wallpaper Solutions">
              Wallpaper Solutions
            </option>

            <option value="Customized Sofas & Upholstery">
              Customized Sofas &amp; Upholstery
            </option>

            <option value="Interior Decoration">
              Interior Decoration
            </option>

            <option value="Carpet & Wooden Flooring">
              Carpet &amp; Wooden Flooring
            </option>
          </select>
          <FieldError name="serviceWanted" errors={fieldErrors} />
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
            maxLength={150}
            aria-invalid={fieldErrors.projectName ? true : undefined}
            aria-describedby={fieldErrors.projectName ? "projectName-error" : undefined}
            className="h-11 w-full rounded-lg border border-flora-border px-3 text-base outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary sm:text-sm"
            placeholder="Optional"
          />
          <FieldError name="projectName" errors={fieldErrors} />
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
            maxLength={1000}
            aria-invalid={fieldErrors.siteAddress ? true : undefined}
            aria-describedby={fieldErrors.siteAddress ? "siteAddress-error" : undefined}
            className="w-full resize-none rounded-lg border border-flora-border px-3 py-3 text-base outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary sm:text-sm"
            placeholder="Where is the project located?"
          />
          <FieldError name="siteAddress" errors={fieldErrors} />
        </div>

        {/* Budget */}
        <div>
          <label
            htmlFor="budget"
            className="mb-2 block text-xs font-semibold text-flora-foreground"
          >
            Budget (AED)
          </label>

          <input
            id="budget"
            name="budget"
            maxLength={100}
            aria-invalid={fieldErrors.budget ? true : undefined}
            aria-describedby={fieldErrors.budget ? "budget-error" : undefined}
            className="h-11 w-full rounded-lg border border-flora-border px-3 text-base outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary sm:text-sm"
            placeholder="Optional"
          />
          <FieldError name="budget" errors={fieldErrors} />
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
            maxLength={3000}
            aria-invalid={fieldErrors.notes ? true : undefined}
            aria-describedby={fieldErrors.notes ? "notes-error" : undefined}
            className="w-full resize-none rounded-lg border border-flora-border px-3 py-3 text-base outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary sm:text-sm"
            placeholder="Tell us about your requirements, preferred style, number of windows, timeline, etc."
          />
          <FieldError name="notes" errors={fieldErrors} />
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-5 flex items-start gap-3 rounded-lg border border-flora-danger/30 bg-flora-danger-surface p-4">
          <AlertCircle
            size={17}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-flora-danger"
          />

          <div>
            <p className="text-sm text-flora-danger">
              {error}
            </p>

            {Object.keys(fieldErrors).length > 0 && (
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-flora-danger">
                {Object.entries(fieldErrors).map(([field, message]) => (
                  <li key={field}>
                    {field}: {message}
                  </li>
                ))}
              </ul>
            )}

            {offline && (
              <button
                type="button"
                onClick={() =>
                  formRef.current?.requestSubmit()
                }
                className="mt-3 rounded-lg bg-flora-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-flora-primary-hover"
              >
                Retry
              </button>
            )}
          </div>
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
      </fieldset>
    </form>
  );
}