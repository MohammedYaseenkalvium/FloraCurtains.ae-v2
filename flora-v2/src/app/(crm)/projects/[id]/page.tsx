export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  FileText,
  FolderKanban,
  MapPin,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { PaymentLedger } from "@/components/crm/PaymentLedger";
import { ProjectStatusWorkflow } from "@/components/crm/ProjectStatusWorkflow";
import { SiteVisitManager } from "@/components/crm/SiteVisitManager";
import { TaskManager } from "@/components/crm/TaskManager";

import type { ProjectStatus } from "@prisma/client";

const statusLabels: Record<ProjectStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  INSTALLATION: "Installation",
  SNAGGING: "Snagging",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

const statusStyles: Record<
  ProjectStatus,
  {
    background: string;
    text: string;
    border: string;
  }
> = {
  NOT_STARTED: {
    background: "#F8F5F2",
    text: "#6B625A",
    border: "#D8C9BC",
  },

  IN_PROGRESS: {
    background: "#EEF4FA",
    text: "#185FA5",
    border: "#B8D0E5",
  },

  INSTALLATION: {
    background: "#FEF9E7",
    text: "#854D0E",
    border: "#E6D19B",
  },

  SNAGGING: {
    background: "#F1F0FC",
    text: "#7F77DD",
    border: "#C9C5F0",
  },

  COMPLETED: {
    background: "#EDF7F3",
    text: "#166534",
    border: "#B7D8CC",
  },

  ON_HOLD: {
    background: "#FEF2F2",
    text: "#991B1B",
    border: "#E8BDBD",
  },
};

function formatAED(value: number) {
  return `AED ${value.toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: Date | null) {
  if (!value) return "Not scheduled";

  return new Date(value).toLocaleDateString("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await db.project.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    include: {
      enquiry: {
        include: {
          contact: true,
          company: true,
        },
      },

      quotation: true,

      payments: {
        orderBy: {
          paidAt: "asc",
        },
      },

      tasks: {
        orderBy: {
          dueDate: "asc",
        },
      },

      siteVisits: {
        orderBy: {
          scheduledAt: "desc",
        },

        include: {
          measurements: {
            orderBy: {
              createdAt: "asc",
            },
          },

          attachments: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const { contact, company } = project.enquiry;

  const paidAmount = project.payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const outstandingAmount = Math.max(
    project.totalContractValue - paidAmount,
    0
  );

  const statusStyle = statusStyles[project.status];

  const projectName =
    project.enquiry.projectName ??
    "Untitled Project";

  return (
    <div className="min-h-full bg-[#FFF8F5]">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-[#6B625A]">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-[#5A0E12]"
        >
          <ArrowLeft size={15} />
          Projects
        </Link>

        <span>/</span>

        <span className="truncate text-[#1E1B18]">
          {projectName}
        </span>
      </div>

      {/* Project Header */}
      <section className="mb-6 rounded-xl border border-[#D8C9BC] bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FolderKanban
                size={19}
                className="text-[#5A0E12]"
              />

              <span className="text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
                Project Workspace
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#1E1B18]">
              {projectName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6B625A]">
              <span>{contact.name}</span>

              {company && (
                <>
                  <span className="text-[#D8C9BC]">
                    •
                  </span>

                  <span>{company.tradeName}</span>
                </>
              )}

              <span className="text-[#D8C9BC]">
                •
              </span>

              <span>
                {project.enquiry.serviceWanted}
              </span>
            </div>

            {/* Status Workflow */}
            <div className="mt-4">
              <ProjectStatusWorkflow
                projectId={project.id}
                currentStatus={project.status}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor:
                  statusStyle.background,
                color: statusStyle.text,
                borderColor: statusStyle.border,
              }}
            >
              {statusLabels[project.status]}
            </span>

            {project.quotation && (
              <Link
                href={`/quotations/${project.quotation.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8C9BC] bg-white px-3 py-2 text-xs font-medium text-[#5A0E12] transition-colors hover:bg-[#F8F5F2]"
              >
                <FileText size={14} />
                {project.quotation.quoteNumber}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Financial Summary */}
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        {/* Contract */}
        <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B625A]">
            Contract Value
          </p>

          <p className="mt-2 text-xl font-bold text-[#5A0E12]">
            {formatAED(
              project.totalContractValue
            )}
          </p>
        </div>

        {/* Paid */}
        <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
          <div className="flex items-center gap-2">
            <CircleDollarSign
              size={15}
              className="text-[#0F6E56]"
            />

            <p className="text-xs font-medium uppercase tracking-wide text-[#6B625A]">
              Payments Received
            </p>
          </div>

          <p className="mt-2 text-xl font-bold text-[#0F6E56]">
            {formatAED(paidAmount)}
          </p>
        </div>

        {/* Outstanding */}
        <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B625A]">
            Outstanding
          </p>

          <p className="mt-2 text-xl font-bold text-[#991B1B]">
            {formatAED(outstandingAmount)}
          </p>
        </div>
      </section>

      {/* Customer + Project Information */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Customer */}
        <section className="rounded-xl border border-[#D8C9BC] bg-white p-5">
          <div className="mb-5 flex items-center gap-2">
            <UserRound
              size={17}
              className="text-[#5A0E12]"
            />

            <h2 className="text-sm font-semibold text-[#5A0E12]">
              Customer
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#6B625A]">
                Name
              </p>

              <Link
                href={`/customers/${contact.id}`}
                className="mt-1 block font-semibold text-[#1E1B18] hover:text-[#5A0E12] hover:underline"
              >
                {contact.name}
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[#6B625A]">
                  Phone
                </p>

                <p className="mt-1 text-sm font-medium">
                  {contact.phone || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#6B625A]">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-medium">
                  {contact.email || "—"}
                </p>
              </div>
            </div>

            {company && (
              <div className="border-t border-[#EFE7DF] pt-4">
                <p className="text-xs text-[#6B625A]">
                  Company
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {company.tradeName}
                </p>

                {company.legalName &&
                  company.legalName !==
                    company.tradeName && (
                    <p className="mt-1 text-xs text-[#6B625A]">
                      {company.legalName}
                    </p>
                  )}
              </div>
            )}
          </div>
        </section>

        {/* Project Information */}
        <section className="rounded-xl border border-[#D8C9BC] bg-white p-5">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays
              size={17}
              className="text-[#5A0E12]"
            />

            <h2 className="text-sm font-semibold text-[#5A0E12]">
              Project Information
            </h2>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[#6B625A]">
                Service
              </dt>

              <dd className="mt-1 text-sm font-medium">
                {project.enquiry.serviceWanted}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-[#6B625A]">
                Status
              </dt>

              <dd className="mt-1">
                <span
                  className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium"
                  style={{
                    backgroundColor:
                      statusStyle.background,
                    color: statusStyle.text,
                    borderColor: statusStyle.border,
                  }}
                >
                  {statusLabels[project.status]}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-xs text-[#6B625A]">
                Start Date
              </dt>

              <dd className="mt-1 text-sm font-medium">
                {formatDate(project.startDate)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-[#6B625A]">
                End Date
              </dt>

              <dd className="mt-1 text-sm font-medium">
                {formatDate(project.endDate)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-[#6B625A]">
                Installation Date
              </dt>

              <dd className="mt-1 text-sm font-medium">
                {formatDate(
                  project.installationDate
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-[#6B625A]">
                PO Number
              </dt>

              <dd className="mt-1 text-sm font-medium">
                {project.poNumber || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-[#6B625A]">
                PO Date
              </dt>

              <dd className="mt-1 text-sm font-medium">
                {formatDate(project.poDate)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-[#6B625A]">
                Quotation
              </dt>

              <dd className="mt-1">
                {project.quotation ? (
                  <Link
                    href={`/quotations/${project.quotation.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#5A0E12] hover:underline"
                  >
                    {project.quotation.quoteNumber}

                    <ArrowUpRight
                      size={13}
                    />
                  </Link>
                ) : (
                  <span className="text-sm">
                    —
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Site Information */}
      <section className="mb-6 rounded-xl border border-[#D8C9BC] bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <MapPin
            size={17}
            className="text-[#5A0E12]"
          />

          <h2 className="text-sm font-semibold text-[#5A0E12]">
            Site Information
          </h2>
        </div>

        <div className="rounded-lg border border-[#EFE7DF] bg-[#FFF8F5] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B625A]">
            Site Address
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-[#1E1B18]">
            {project.siteAddress ||
              project.enquiry.siteAddress ||
              "No site address recorded."}
          </p>
        </div>
      </section>

      {/* Notes */}
      <section className="mb-6 rounded-xl border border-[#D8C9BC] bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-[#5A0E12]">
          Project Notes
        </h2>

        <p className="whitespace-pre-wrap text-sm leading-6 text-[#6B625A]">
          {project.notes ||
            "No project notes recorded."}
        </p>
      </section>

      {/* Site Visits & Measurements */}
      <section className="mb-6">
        <SiteVisitManager
          enquiryId={project.enquiryId}
          projectId={project.id}
          initialVisits={project.siteVisits}
          defaultAddress={
            project.siteAddress ??
            project.enquiry.siteAddress
          }
        />
      </section>

      {/* Tasks */}
      <section className="mb-6 rounded-xl border border-[#D8C9BC] bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#5A0E12]">
              Tasks
            </h2>

            <p className="mt-1 text-xs text-[#6B625A]">
              Track operational work associated with
              this project.
            </p>
          </div>

          <span className="rounded-full bg-[#F8F5F2] px-2.5 py-1 text-xs font-medium text-[#6B625A]">
            {project.tasks.length}{" "}
            {project.tasks.length === 1
              ? "task"
              : "tasks"}
          </span>
        </div>

        <TaskManager
          projectId={project.id}
          initialTasks={project.tasks}
        />
      </section>

      {/* Payment Ledger */}
      <section className="rounded-xl border border-[#D8C9BC] bg-white p-5">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-[#5A0E12]">
            Payment Ledger
          </h2>

          <p className="mt-1 text-xs text-[#6B625A]">
            Track payments received against the project
            contract value.
          </p>
        </div>

        <PaymentLedger
          projectId={project.id}
          totalContractValue={
            project.totalContractValue
          }
          payments={project.payments}
        />
      </section>
    </div>
  );
}