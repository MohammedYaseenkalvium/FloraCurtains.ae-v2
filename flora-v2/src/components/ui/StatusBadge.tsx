import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { statusStyles } from "@/lib/status-styles";

type Domain = "enquiry" | "quotation" | "project" | "payment" | "priority" | "visit";

const maps: Record<Domain, Record<string, { label: string; tone: BadgeTone }>> = {
  enquiry: statusStyles.enquiry,
  quotation: statusStyles.quotation,
  project: statusStyles.project,
  payment: {
    ADVANCE: { label: "Advance", tone: "info" },
    INSTALLMENT: { label: "Installment", tone: "warning" },
    BALANCE: { label: "Balance", tone: "success" },
    RETENTION: { label: "Retention", tone: "primary" },
  },
  priority: statusStyles.taskPriority,
  visit: statusStyles.siteVisit,
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
