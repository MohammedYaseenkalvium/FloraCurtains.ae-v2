import type {
  Contact, Company, Enquiry, Quotation,
  Project, Payment, Task,
  CustomerType, EnquiryStatus, QuotationStatus,
  ProjectStatus, PaymentType, TaskPriority
} from "@prisma/client";

// Re-export prisma types so pages never import from @prisma/client directly
export type {
  Contact, Company, Enquiry, Quotation,
  Project, Payment, Task,
  CustomerType, EnquiryStatus, QuotationStatus,
  ProjectStatus, PaymentType, TaskPriority
};

// ─── Enriched types (with relations) ────────────────────────────────────────

export type EnquiryWithRelations = Enquiry & {
  contact: Contact;
  company: Company | null;
  quotations: Quotation[];
  project: Project | null;
  tasks: Task[];
};

export type ProjectWithRelations = Project & {
  enquiry: EnquiryWithRelations;
  quotation: Quotation | null;
  company: Company | null;
  payments: Payment[];
  tasks: Task[];
};

export type QuotationLineItem = {
  description: string;
  unit: string;
  qty: number;
  unitPrice: number;
  discount: number; // percentage
};

// ─── Form schemas (Zod) ──────────────────────────────────────────────────────
// Defined here so they can be imported by both form components and API routes.

import { z } from "zod";

export const enquiryFormSchema = z.object({
  // Contact
  contactName:   z.string().min(2),
  contactPhone:  z.string().min(7),
  contactEmail:  z.string().email().optional().or(z.literal("")),
  contactSource: z.enum(["CALL","WALK_IN","REFERRAL","INSTAGRAM","WEBSITE","WHATSAPP","EXISTING_CLIENT","TENDER"]),

  // B2B toggle
  customerType:  z.enum(["B2C", "B2B"]),
  companyName:   z.string().optional(),
  companyType:   z.enum(["INTERIOR_FIRM","HOTEL","HOSPITAL","GOVERNMENT","CONTRACTOR","REAL_ESTATE","OTHER"]).optional(),
  companyTrn:    z.string().optional(),
  contactRole:   z.enum(["OWNER","MANAGER","INTERIOR_DESIGNER","PROCUREMENT","SITE_ENGINEER","OTHER"]).optional(),

  // Enquiry
  serviceWanted:  z.string().min(3),
  remarks:        z.string().optional(),
  desiredBudget:  z.coerce.number().optional(),
  interestLevel: z.coerce.number().min(1).max(5),
  projectName:    z.string().optional(), // B2B
  siteAddress:    z.string().optional(),
  assignedTo:     z.string().optional(),
  followUpDate:   z.string().optional(), // ISO date string
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

export const quotationItemSchema = z.object({
  description: z.string().min(1),
  unit:        z.string().default("pcs"),
  qty:         z.coerce.number().min(0.01),
  unitPrice:   z.coerce.number().min(0),
  discount:    z.coerce.number().min(0).max(100).default(0),
});

export const quotationFormSchema = z.object({
  enquiryId: z.string(),
  items:         z.array(quotationItemSchema).min(1),
  vatRate:       z.coerce.number().default(5),
  validUntil:    z.string().optional(),
  notes:         z.string().optional(),
  internalNotes: z.string().optional(),
  billedToName:  z.string().optional(),
  billedToTrn:   z.string().optional(),
  billedToAddr:  z.string().optional(),
});

export type QuotationFormValues = z.infer<typeof quotationFormSchema>;