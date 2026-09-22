"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";

const SERVICES = [
  "Curtains & Blinds",
  "Wallpaper Solutions",
  "Customized Sofas & Upholstery",
  "Interior Decoration",
  "Carpet & Wooden Flooring",
];

const STEPS = [
  "Customer information",
  "Property & project",
  "Services required",
  "Requirements",
  "Review",
] as const;

interface WizardForm {
  name: string;
  email: string;
  phone: string;
  customerType: string;
  projectName: string;
  siteAddress: string;
  serviceWanted: string;
  budget: string;
  notes: string;
}

const emptyForm: WizardForm = {
  name: "",
  email: "",
  phone: "",
  customerType: "B2C",
  projectName: "",
  siteAddress: "",
  serviceWanted: "",
  budget: "",
  notes: "",
};

const input =
  "h-11 w-full rounded-lg border border-flora-border bg-white px-3 text-sm outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary";
const label = "mb-2 block text-xs font-semibold text-flora-foreground";

function validateStep(step: number, form: WizardForm): string {
  if (step === 0) {
    if (form.name.trim().length < 2) return "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Please enter a valid email address.";
    if (form.phone.trim().length < 5) return "Please enter your phone number.";
  }
  if (step === 2 && !form.serviceWanted) return "Please select a service.";
  return "";
}

export function QuoteWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardForm>(emptyForm);
  const [stepError, setStepError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function set<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    const problem = validateStep(step, form);
    if (problem) {
      setStepError(problem);
      return;
    }
    setStepError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStepError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    const problem = validateStep(0, form) || validateStep(2, form);
    if (problem) {
      setSubmitError(problem);
      return;
    }
    setLoading(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/public/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          customerType: form.customerType,
          serviceWanted: form.serviceWanted,
          projectName: form.projectName.trim(),
          siteAddress: form.siteAddress.trim(),
          budget: form.budget.trim(),
          notes: form.notes.trim(),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Unable to submit your enquiry.");
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-flora-border bg-white p-8 text-center sm:p-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-flora-surface text-flora-primary">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="mt-5 font-display text-3xl text-flora-foreground">
          Request received.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-flora-muted">
          Thank you, {form.name.trim() || "friend"}. Our team will contact you
          shortly about {form.serviceWanted || "your project"}.
        </p>
      </div>
    );
  }

  const reviewRows: Array<[string, string]> = [
    ["Name", form.name.trim() || "—"],
    ["Email", form.email.trim() || "—"],
    ["Phone", form.phone.trim() || "—"],
    ["Customer type", form.customerType === "B2B" ? "Business" : "Residential"],
    ["Project", form.projectName.trim() || "—"],
    ["Site address", form.siteAddress.trim() || "—"],
    ["Service", form.serviceWanted || "—"],
    ["Budget", form.budget.trim() || "—"],
    ["Notes", form.notes.trim() || "—"],
  ];

  return (
    <div className="rounded-xl border border-flora-border bg-white p-6 sm:p-8">
      {/* Progress */}
      <ol aria-label="Quote progress" className="mb-8 flex items-center gap-1.5">
        {STEPS.map((labelText, i) => (
          <li key={labelText} className="flex flex-1 items-center gap-1.5 last:flex-none">
            <span
              aria-current={i === step ? "step" : undefined}
              title={labelText}
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i < step
                  ? "bg-flora-primary text-white"
                  : i === step
                    ? "border-2 border-flora-primary text-flora-primary"
                    : "border border-flora-border text-flora-muted",
              ].join(" ")}
            >
              {i + 1}
            </span>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`h-px flex-1 ${i < step ? "bg-flora-primary" : "bg-flora-border"}`}
              />
            )}
          </li>
        ))}
      </ol>

      <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-flora-primary">
        Step {step + 1} of {STEPS.length} — {STEPS[step]}
      </p>

      {stepError && (
        <p role="alert" className="mb-5 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {stepError}
        </p>
      )}

      {step === 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="qw-name" className={label}>Name *</label>
            <input id="qw-name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" className={input} />
          </div>
          <div>
            <label htmlFor="qw-email" className={label}>Email *</label>
            <input id="qw-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className={input} />
          </div>
          <div>
            <label htmlFor="qw-phone" className={label}>Phone *</label>
            <input id="qw-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone number" className={input} />
          </div>
          <div>
            <label htmlFor="qw-type" className={label}>Customer Type</label>
            <select id="qw-type" value={form.customerType} onChange={(e) => set("customerType", e.target.value)} className={input}>
              <option value="B2C">Residential</option>
              <option value="B2B">Business</option>
            </select>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="qw-project" className={label}>Project Name</label>
            <input id="qw-project" value={form.projectName} onChange={(e) => set("projectName", e.target.value)} placeholder="e.g. Villa living room" className={input} />
          </div>
          <div>
            <label htmlFor="qw-address" className={label}>Site Address</label>
            <input id="qw-address" autoComplete="street-address" value={form.siteAddress} onChange={(e) => set("siteAddress", e.target.value)} placeholder="Area, city" className={input} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="qw-service" className={label}>Service *</label>
            <select id="qw-service" value={form.serviceWanted} onChange={(e) => set("serviceWanted", e.target.value)} className={input}>
              <option value="" disabled>Select a service</option>
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="qw-budget" className={label}>Budget (AED)</label>
            <input id="qw-budget" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="Optional" className={input} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <label htmlFor="qw-notes" className={label}>Anything we should know?</label>
          <textarea id="qw-notes" rows={5} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Measurements, timelines, preferences…" className="w-full rounded-lg border border-flora-border bg-white px-3 py-2.5 text-sm outline-none focus:border-flora-primary focus:ring-1 focus:ring-flora-primary" />
        </div>
      )}

      {step === 4 && (
        <dl className="divide-y divide-flora-border/60 rounded-lg border border-flora-border">
          {reviewRows.map(([term, value]) => (
            <div key={term} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between">
              <dt className="text-xs font-semibold uppercase tracking-wide text-flora-muted">{term}</dt>
              <dd className="text-sm text-flora-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {submitError && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          {submitError}
        </p>
      )}

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 0 ? (
          <button type="button" onClick={back} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-flora-border px-5 py-3 text-sm font-semibold text-flora-foreground hover:bg-flora-surface disabled:opacity-50">
            <ArrowLeft size={15} /> Back
          </button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} className="inline-flex items-center justify-center gap-2 rounded-lg bg-flora-primary px-6 py-3 text-sm font-semibold text-white hover:bg-flora-primary-hover">
            Next Step <ArrowRight size={15} />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-flora-primary px-6 py-3 text-sm font-semibold text-white hover:bg-flora-primary-hover disabled:opacity-60">
            {loading ? (<><Loader2 size={16} className="animate-spin" /> Sending…</>) : (<><Send size={15} /> Submit Request</>)}
          </button>
        )}
      </div>
    </div>
  );
}
