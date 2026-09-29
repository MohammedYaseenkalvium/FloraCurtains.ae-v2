import type {
  EnquiryStatus,
  PaymentScheduleStatus,
  ProjectStatus,
  QuotationStatus,
  SiteVisitStatus,
  TaskPriority,
} from "@/types";

export type StatusTone = "muted" | "info" | "warning" | "success" | "danger";

export type StatusStyle = Record<"background" | "text" | "border", string> & {
  label: string;
  tone: StatusTone;
};

export const statusStyles: {
  enquiry: Record<EnquiryStatus, StatusStyle>;
  quotation: Record<QuotationStatus, StatusStyle>;
  project: Record<ProjectStatus, StatusStyle>;
  paymentSchedule: Record<PaymentScheduleStatus, StatusStyle>;
  siteVisit: Record<SiteVisitStatus, StatusStyle>;
  taskPriority: Record<TaskPriority, StatusStyle>;
} = {
  enquiry: {
    NEW: {
      background: "#F8F5F2",
      text: "#6B625A",
      border: "#D8C9BC",
      label: "New",
      tone: "muted",
    },
    CONTACTED: {
      background: "#EEF4FA",
      text: "#185FA5",
      border: "#B8D0E5",
      label: "Contacted",
      tone: "info",
    },
    VISIT_SCHEDULED: {
      background: "#FEF9E7",
      text: "#854D0E",
      border: "#E6D19B",
      label: "Visit Scheduled",
      tone: "warning",
    },
    QUOTED: {
      background: "#EDF7F3",
      text: "#0F6E56",
      border: "#B7D8CC",
      label: "Quoted",
      tone: "success",
    },
    NEGOTIATING: {
      background: "#EEF4FA",
      text: "#185FA5",
      border: "#B8D0E5",
      label: "Negotiating",
      tone: "info",
    },
    WON: {
      background: "#EDF7F3",
      text: "#0F6E56",
      border: "#B7D8CC",
      label: "Won",
      tone: "success",
    },
    LOST: {
      background: "#FEF2F2",
      text: "#991B1B",
      border: "#E8BDBD",
      label: "Lost",
      tone: "danger",
    },
  },
  quotation: {
    DRAFT: {
      background: "#F8F5F2",
      text: "#6B625A",
      border: "#D8C9BC",
      label: "Draft",
      tone: "muted",
    },
    SENT: {
      background: "#EEF4FA",
      text: "#185FA5",
      border: "#B8D0E5",
      label: "Sent",
      tone: "info",
    },
    APPROVED: {
      background: "#EDF7F3",
      text: "#0F6E56",
      border: "#B7D8CC",
      label: "Approved",
      tone: "success",
    },
    REJECTED: {
      background: "#FEF2F2",
      text: "#991B1B",
      border: "#E8BDBD",
      label: "Rejected",
      tone: "danger",
    },
    REVISED: {
      background: "#FEF9E7",
      text: "#854D0E",
      border: "#E6D19B",
      label: "Revised",
      tone: "warning",
    },
  },
  project: {
    NOT_STARTED: {
      background: "#F8F5F2",
      text: "#6B625A",
      border: "#D8C9BC",
      label: "Not Started",
      tone: "muted",
    },
    IN_PROGRESS: {
      background: "#EEF4FA",
      text: "#185FA5",
      border: "#B8D0E5",
      label: "In Progress",
      tone: "info",
    },
    INSTALLATION: {
      background: "#FEF9E7",
      text: "#854D0E",
      border: "#E6D19B",
      label: "Installation",
      tone: "warning",
    },
    SNAGGING: {
      background: "#FEF9E7",
      text: "#854D0E",
      border: "#E6D19B",
      label: "Snagging",
      tone: "warning",
    },
    COMPLETED: {
      background: "#EDF7F3",
      text: "#0F6E56",
      border: "#B7D8CC",
      label: "Completed",
      tone: "success",
    },
    ON_HOLD: {
      background: "#FEF2F2",
      text: "#991B1B",
      border: "#E8BDBD",
      label: "On Hold",
      tone: "danger",
    },
    CANCELLED: {
      background: "#F8F5F2",
      text: "#6B625A",
      border: "#D8C9BC",
      label: "Cancelled",
      tone: "muted",
    },
  },
  paymentSchedule: {
    PENDING: {
      background: "#FEF9E7",
      text: "#854D0E",
      border: "#E6D19B",
      label: "Pending",
      tone: "warning",
    },
    PARTIALLY_PAID: {
      background: "#FEF9E7",
      text: "#854D0E",
      border: "#E6D19B",
      label: "Partially Paid",
      tone: "warning",
    },
    PAID: {
      background: "#EDF7F3",
      text: "#0F6E56",
      border: "#B7D8CC",
      label: "Paid",
      tone: "success",
    },
    OVERDUE: {
      background: "#FEF2F2",
      text: "#991B1B",
      border: "#E8BDBD",
      label: "Overdue",
      tone: "danger",
    },
    CANCELLED: {
      background: "#F8F5F2",
      text: "#6B625A",
      border: "#D8C9BC",
      label: "Cancelled",
      tone: "muted",
    },
  },
  siteVisit: {
    SCHEDULED: {
      background: "#FEF9E7",
      text: "#854D0E",
      border: "#E6D19B",
      label: "Scheduled",
      tone: "warning",
    },
    COMPLETED: {
      background: "#EDF7F3",
      text: "#0F6E56",
      border: "#B7D8CC",
      label: "Completed",
      tone: "success",
    },
    CANCELLED: {
      background: "#FEF2F2",
      text: "#991B1B",
      border: "#E8BDBD",
      label: "Cancelled",
      tone: "danger",
    },
    RESCHEDULED: {
      background: "#EEF4FA",
      text: "#185FA5",
      border: "#B8D0E5",
      label: "Rescheduled",
      tone: "info",
    },
  },
  taskPriority: {
    LOW: {
      background: "#EDF7F3",
      text: "#0F6E56",
      border: "#B7D8CC",
      label: "Low",
      tone: "success",
    },
    MEDIUM: {
      background: "#FEF9E7",
      text: "#854D0E",
      border: "#E6D19B",
      label: "Medium",
      tone: "warning",
    },
    HIGH: {
      background: "#FEF2F2",
      text: "#991B1B",
      border: "#E8BDBD",
      label: "High",
      tone: "danger",
    },
  },
};
