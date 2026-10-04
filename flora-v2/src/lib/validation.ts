import { z } from "zod";

/**
 * Shared public-enquiry validation (single source of truth for the
 * website forms + `/api/public/enquiries`). CRM-internal
 * `enquiryFormSchema` (src/types) is a different contract — do not merge.
 */

/** Digits-only length check shared by client + server phone rules. */
export function isPlausiblePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

/** HTML `pattern`-attribute source mirroring `isPlausiblePhone` (implicitly anchored by browsers). */
export const PHONE_PATTERN_SOURCE = "[+\\d][\\d\\s\\-().]{6,29}";

/** Single email grammar shared by both website forms (server uses z.email()). */
export const EMAIL_PATTERN_SOURCE = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";

export function isEmailLike(value: string): boolean {
  return new RegExp(EMAIL_PATTERN_SOURCE).test(value.trim());
}

export const publicEnquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address."),

  phone: z
    .string()
    .trim()
    .min(5, "Phone number is required.")
    .max(30, "Phone number is too long.")
    .refine(isPlausiblePhone, "Enter a valid phone number."),

  customerType: z
    .enum(["B2C", "B2B"])
    .default("B2C"),

  serviceWanted: z
    .string()
    .trim()
    .min(2, "Please select a service.")
    .max(100, "Service name is too long."),

  projectName: z
    .string()
    .trim()
    .max(150, "Project name is too long.")
    .optional()
    .or(z.literal("")),

  siteAddress: z
    .string()
    .trim()
    .max(1000, "Site address is too long.")
    .optional()
    .or(z.literal("")),

  budget: z
    .string()
    .trim()
    .max(100, "Budget is too long.")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .max(3000, "Message is too long.")
    .optional()
    .or(z.literal("")),
});

export type PublicEnquiryValues = z.infer<typeof publicEnquirySchema>;

/**
 * Parse a free-text AED budget to a number. Takes the first digit run
 * (allowing `,`/`.`/space separators); returns null when none exists.
 * No k/m multipliers — digits only, never invented.
 */
export function parseBudgetAed(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/\d[\d\s,]*(\.\d+)?/);
  if (!match) return null;
  const num = Number(match[0].replace(/[\s,]/g, ""));
  return Number.isFinite(num) ? num : null;
}

/** Maps an enquiry field to its QuoteWizard step for error navigation. */
export const FIELD_STEPS: Record<string, number> = {
  name: 0,
  email: 0,
  phone: 0,
  customerType: 0,
  projectName: 1,
  siteAddress: 1,
  serviceWanted: 2,
  budget: 2,
  notes: 3,
};
