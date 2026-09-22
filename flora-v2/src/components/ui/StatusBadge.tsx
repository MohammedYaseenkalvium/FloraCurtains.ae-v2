import { Badge, type BadgeTone } from "@/components/ui/Badge";

type Domain = "enquiry" | "quotation" | "project" | "payment" | "priority" | "visit";

const maps: Record<Domain, Record<string, { label: string; tone: BadgeTone }>> = {
  enquiry: {
    NEW: { label: "New", tone: "muted" },
    CONTACTED: { label: "Contacted", tone: "info" },
    VISIT_SCHEDULED: { label: "Visit Scheduled", tone: "warning" },
    QUOTED: { label: "Quoted", tone: "success" },
    NEGOTIATING: { label: "Negotiating", tone: "primary" },
    WON: { label: "Won", tone: "success" },
    LOST: { label: "Lost", tone: "danger" },
  },
  quotation: {
    DRAFT: { label: "Draft", tone: "muted" },
    SENT: { label: "Sent", tone: "info" },
    APPROVED: { label: "Approved", tone: "success" },
    REJECTED: { label: "Rejected", tone: "danger" },
    REVISED: { label: "Revised", tone: "warning" },
  },
  project: {
    NOT_STARTED: { label: "Not Started", tone: "muted" },
    IN_PROGRESS: { label: "In Progress", tone: "info" },
    INSTALLATION: { label: "Installation", tone: "warning" },
    SNAGGING: { label: "Snagging", tone: "primary" },
    COMPLETED: { label: "Completed", tone: "success" },
    ON_HOLD: { label: "On Hold", tone: "danger" },
    CANCELLED: { label: "Cancelled", tone: "muted" },
  },
  payment: {
    ADVANCE: { label: "Advance", tone: "info" },
    INSTALLMENT: { label: "Installment", tone: "warning" },
    BALANCE: { label: "Balance", tone: "success" },
    RETENTION: { label: "Retention", tone: "primary" },
  },
  priority: {
    LOW: { label: "Low", tone: "success" },
    MEDIUM: { label: "Medium", tone: "warning" },
    HIGH: { label: "High", tone: "danger" },
  },
  visit: {
    SCHEDULED: { label: "Scheduled", tone: "warning" },
    COMPLETED: { label: "Completed", tone: "success" },
    CANCELLED: { label: "Cancelled", tone: "danger" },
    RESCHEDULED: { label: "Rescheduled", tone: "info" },
  },
};

interface StatusBadgeProps {
  domain: Domain;
  status: string;
}

/**
 * Canonical domain status badge — replaces the per-page
 * statusLabels/statusStyles maps. Unknown values fall back to muted.
 */
export function StatusBadge({ domain, status }: StatusBadgeProps) {
  const entry = maps[domain]?.[status] ?? { label: status.replace(/_/g, " "), tone: "muted" as BadgeTone };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}
