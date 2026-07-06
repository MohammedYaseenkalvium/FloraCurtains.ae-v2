import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
// ─── Types ───────────────────────────────────────────────────────────────────

export interface CustomerFinancialSummary {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  companyName: string | null;
  companyType: string | null;

  // Financial totals
  lifetimeRevenue: number;      // Sum of all approved quotation totals + project contract values
  totalQuoted: number;          // Sum of all quotation totals
  totalContractValue: number;   // Sum of all project contract values
  totalPaid: number;            // Sum of all payments across quotes and projects
  outstanding: number;          // lifetimeRevenue - totalPaid

  // Counts
  enquiryCount: number;
  quotationCount: number;
  projectCount: number;
  paymentCount: number;
  activeProjectCount: number;

  // Detailed lists
  enquiries: EnquiryFinancial[];
  quotations: QuotationFinancial[];
  projects: ProjectFinancial[];
  payments: PaymentFinancial[];
  
  // Running balance ledger
  ledger: LedgerEntry[];
}

export interface EnquiryFinancial {
  id: string;
  serviceWanted: string;
  status: string;
  createdAt: Date;
  interestLevel: number;
  followUpDate: Date | null;
}

export interface QuotationFinancial {
  id: string;
  quoteNumber: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  validUntil: Date | null;
  createdAt: Date;
  enquiryId: string;
  enquiryService: string;
  payments: PaymentFinancial[];
  totalPaid: number;
  balance: number;
}

export interface ProjectFinancial {
  id: string;
  status: string;
  totalContractValue: number;
  startDate: Date | null;
  endDate: Date | null;
  installationDate: Date | null;
  siteAddress: string | null;
  poNumber: string | null;
  createdAt: Date;
  enquiryId: string;
  enquiryService: string;
  quotationId: string | null;
  quotationNumber: string | null;
  payments: PaymentFinancial[];
  totalPaid: number;
  balance: number;
}

export interface PaymentFinancial {
  id: string;
  amount: number;
  type: string;
  method: string;
  reference: string | null;
  notes: string | null;
  paidAt: Date;
  projectId: string | null;
  quotationId: string | null;
  sourceType: "PROJECT" | "QUOTATION";
  sourceNumber: string; // quoteNumber or "Project"
}

export interface LedgerEntry {
  id: string;
  date: Date;
  type: "QUOTE" | "INVOICE" | "PAYMENT" | "PROJECT";
  description: string;
  reference: string;
  debit: number;   // Money owed by customer
  credit: number;  // Money paid by customer
  balance: number; // Running balance
}

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Fetches complete financial picture for a customer (contact).
 * Reusable across dashboards, reports, PDFs, and APIs.
 */
export async function getCustomerFinancialSummary(contactId: string): Promise<CustomerFinancialSummary> {
  // Single Prisma query to fetch everything
  const contact = await db.contact.findUnique({
    where: { id: contactId },
    include: {
      company: true,
      enquiries: {
        orderBy: { createdAt: "desc" },
        include: {
          quotations: {
            orderBy: { createdAt: "desc" },
            include: { payments: { orderBy: { paidAt: "asc" } } },
          },
          project: {
            include: { 
              payments: { orderBy: { paidAt: "asc" } },
              quotation: { select: { quoteNumber: true } },
            },
          },
        },
      },
    },
  });

  if (!contact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  // Flatten and normalize data
  const enquiries: EnquiryFinancial[] = contact.enquiries.map(e => ({
    id: e.id,
    serviceWanted: e.serviceWanted,
    status: e.status,
    createdAt: e.createdAt,
    interestLevel: e.interestLevel,
    followUpDate: e.followUpDate,
  }));

  // Collect all quotations with their payments
  const quotations: QuotationFinancial[] = contact.enquiries.flatMap(e => 
    e.quotations.map(q => {
      const qPayments = q.payments.map(p => ({
        id: p.id,
        amount: p.amount,
        type: p.type,
        method: p.method,
        reference: p.reference,
        notes: p.notes,
        paidAt: p.paidAt,
        projectId: p.projectId,
        quotationId: p.quotationId,
        sourceType: "QUOTATION" as const,
        sourceNumber: q.quoteNumber,
      }));
      
      const qTotalPaid = qPayments.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        id: q.id,
        quoteNumber: q.quoteNumber,
        status: q.status,
        totalAmount: q.totalAmount,
        subtotal: q.subtotal,
        vatAmount: q.vatAmount,
        vatRate: q.vatRate,
        validUntil: q.validUntil,
        createdAt: q.createdAt,
        enquiryId: e.id,
        enquiryService: e.serviceWanted,
        payments: qPayments,
        totalPaid: qTotalPaid,
        balance: q.totalAmount - qTotalPaid,
      };
    })
  );

  // Collect all projects with their payments
  const projects: ProjectFinancial[] = contact.enquiries
    .filter(e => e.project !== null)
    .map(e => {
      const p = e.project!;
      const pPayments = p.payments.map(pay => ({
        id: pay.id,
        amount: pay.amount,
        type: pay.type,
        method: pay.method,
        reference: pay.reference,
        notes: pay.notes,
        paidAt: pay.paidAt,
        projectId: pay.projectId,
        quotationId: pay.quotationId,
        sourceType: "PROJECT" as const,
        sourceNumber: p.quotation?.quoteNumber ?? `Project-${p.id.slice(-4)}`,
      }));
      
      const pTotalPaid = pPayments.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        id: p.id,
        status: p.status,
        totalContractValue: p.totalContractValue,
        startDate: p.startDate,
        endDate: p.endDate,
        installationDate: p.installationDate,
        siteAddress: p.siteAddress,
        poNumber: p.poNumber,
        createdAt: p.createdAt,
        enquiryId: e.id,
        enquiryService: e.serviceWanted,
        quotationId: p.quotationId,
        quotationNumber: p.quotation?.quoteNumber ?? null,
        payments: pPayments,
        totalPaid: pTotalPaid,
        balance: p.totalContractValue - pTotalPaid,
      };
    });

  // All payments flattened (for global payment history)
  const allPayments: PaymentFinancial[] = [
    ...quotations.flatMap(q => q.payments),
    ...projects.flatMap(p => p.payments),
  ].sort((a, b) => a.paidAt.getTime() - b.paidAt.getTime());

  // Calculate totals
  const totalQuoted = quotations.reduce((sum, q) => sum + q.totalAmount, 0);
  const totalContractValue = projects.reduce((sum, p) => sum + p.totalContractValue, 0);
  
  // Lifetime revenue = approved quotes + project contract values (avoid double counting)
  const approvedQuotesTotal = quotations
    .filter(q => q.status === "APPROVED")
    .reduce((sum, q) => sum + q.totalAmount, 0);
  
  // If project exists for approved quote, use project contract value instead
  const projectValues = projects.reduce((sum, p) => sum + p.totalContractValue, 0);
  
  // Lifetime revenue is the higher of: approved quotes not yet projects + all project values
  const quotesWithoutProjects = quotations
    .filter(q => q.status === "APPROVED" && !projects.some(p => p.quotationId === q.id))
    .reduce((sum, q) => sum + q.totalAmount, 0);
  
  const lifetimeRevenue = projectValues + quotesWithoutProjects;
  
  const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = Math.max(0, lifetimeRevenue - totalPaid);

  // Active projects (not completed or on hold)
  const activeStatuses = ["NOT_STARTED", "IN_PROGRESS", "INSTALLATION", "SNAGGING"];
  const activeProjectCount = projects.filter(p => activeStatuses.includes(p.status)).length;

  // Build running balance ledger
  const ledger = buildLedger(quotations, projects, allPayments);

  return {
    customerId: contact.id,
    customerName: contact.name,
    customerPhone: contact.phone,
    customerEmail: contact.email,
    companyName: contact.company?.tradeName ?? null,
    companyType: contact.company?.type ?? null,

    lifetimeRevenue,
    totalQuoted,
    totalContractValue,
    totalPaid,
    outstanding,

    enquiryCount: enquiries.length,
    quotationCount: quotations.length,
    projectCount: projects.length,
    paymentCount: allPayments.length,
    activeProjectCount,

    enquiries,
    quotations,
    projects,
    payments: allPayments.sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime()), // Most recent first
    ledger,
  };
}

/**
 * Builds a running balance ledger combining quotes, projects, and payments
 */
function buildLedger(
  quotations: QuotationFinancial[],
  projects: ProjectFinancial[],
  payments: PaymentFinancial[]
): LedgerEntry[] {
  const entries: LedgerEntry[] = [];

  // Add approved quotations as debits
  quotations
    .filter(q => q.status === "APPROVED")
    .forEach(q => {
      entries.push({
        id: `Q-${q.id}`,
        date: q.createdAt,
        type: "QUOTE",
        description: `Quotation: ${q.enquiryService}`,
        reference: q.quoteNumber,
        debit: q.totalAmount,
        credit: 0,
        balance: 0, // Will be calculated
      });
    });

  // Add projects as debits (if different from quote)
  projects.forEach(p => {
    entries.push({
      id: `P-${p.id}`,
      date: p.createdAt,
      type: "PROJECT",
      description: `Project: ${p.enquiryService}`,
      reference: p.poNumber ?? `Project-${p.id.slice(-4)}`,
      debit: p.totalContractValue,
      credit: 0,
      balance: 0,
    });
  });

  // Add all payments as credits
  payments.forEach(p => {
    entries.push({
      id: `PY-${p.id}`,
      date: p.paidAt,
      type: "PAYMENT",
      description: `${p.type} payment (${p.method})`,
      reference: p.reference ?? p.sourceNumber,
      debit: 0,
      credit: p.amount,
      balance: 0,
    });
  });

  // Sort by date and calculate running balance
  entries.sort((a, b) => a.date.getTime() - b.date.getTime());

  let runningBalance = 0;
  return entries.map(entry => {
    runningBalance += entry.debit - entry.credit;
    return { ...entry, balance: runningBalance };
  });
}

/**
 * Get outstanding balances for all customers (for dashboard/reports)
 */
export async function getAllOutstandingBalances() {
  const contacts = await db.contact.findMany({
    include: {
      company: true,
      enquiries: {
        include: {
          quotations: { include: { payments: true } },
          project: { include: { payments: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return contacts.map(contact => {
    const quotations = contact.enquiries.flatMap(e => e.quotations);
    const projects = contact.enquiries.map(e => e.project).filter(Boolean);
    
    const approvedQuotes = quotations.filter(q => q.status === "APPROVED");
    const totalApproved = approvedQuotes.reduce((sum, q) => sum + q.totalAmount, 0);
    const projectValues = projects.reduce((sum, p) => sum + (p?.totalContractValue ?? 0), 0);
    
    const allPayments = [
      ...quotations.flatMap(q => q.payments),
      ...projects.flatMap(p => p?.payments ?? []),
    ];
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Use project values if they exist, otherwise approved quotes
    const lifetimeValue = Math.max(projectValues, totalApproved);
    const outstanding = Math.max(0, lifetimeValue - totalPaid);

    // Days since last payment
    const lastPayment = allPayments.sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())[0];
    const daysSincePayment = lastPayment 
      ? Math.floor((Date.now() - lastPayment.paidAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      customerId: contact.id,
      customerName: contact.name,
      customerPhone: contact.phone,
      companyName: contact.company?.tradeName ?? null,
      lifetimeValue,
      totalPaid,
      outstanding,
      paymentCount: allPayments.length,
      daysSincePayment,
      lastPaymentDate: lastPayment?.paidAt ?? null,
    };
  })
  .filter(c => c.outstanding > 0) // Only customers with outstanding balances
  .sort((a, b) => b.outstanding - a.outstanding); // Highest first
}