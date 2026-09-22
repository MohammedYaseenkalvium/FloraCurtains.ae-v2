
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ConvertToProject } from "@/components/crm/ConvertToProject";
import { EnquiryEditForm } from "@/components/crm/EnquiryEditForm";
import { TaskManager } from "@/components/crm/TaskManager";
import { SiteVisitManager } from "@/components/crm/SiteVisitManager";

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const enquiry = await db.enquiry.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      contact: true,
      company: true,
      quotations: true,
      project: {
        include: {
          payments: true,
        },
      },
      tasks: true,
      siteVisits: {
      orderBy: {
        scheduledAt: "desc",
      },
      include: {
        measurements: true,
        attachments: true,
      },
    },
    },
  });

  if (!enquiry) notFound();

  const statusColors: Record<string, string> = {
    NEW: "#8B8178",
    CONTACTED: "#185FA5",
    VISIT_SCHEDULED: "#854D0E",
    QUOTED: "#0F6E56",
    NEGOTIATING: "#7F77DD",
    WON: "#166534",
    LOST: "#991B1B",
  };

  const hasWonOrLost =
    enquiry.status === "WON" || enquiry.status === "LOST";

  const hasProject = !!enquiry.project;

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="text-sm text-flora-muted mb-5">
        <Link href="/enquiries" className="hover:underline">
          Enquiries
        </Link>

        <span className="mx-2">›</span>

        <span>{enquiry.contact.name}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {enquiry.contact.name}
          </h1>

          {enquiry.company && (
            <p className="text-flora-muted text-sm">
              {enquiry.company.tradeName}
            </p>
          )}

          <p className="text-flora-muted text-sm">
            {enquiry.contact.phone}
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <span
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: `${statusColors[enquiry.status]}18`,
              color: statusColors[enquiry.status],
            }}
          >
            {enquiry.status.replace(/_/g, " ")}
          </span>

          {!hasWonOrLost && (
            <Link
              href={`/quotations/new?enquiryId=${enquiry.id}`}
              className="bg-flora-primary text-white rounded-lg px-4 py-2 text-sm hover:bg-flora-primary-hover"
            >
              + Create Quote
            </Link>
          )}
        </div>
      </div>

      {/* Convert to Project */}
      {!hasProject &&
        (enquiry.status === "WON" ||
          enquiry.status === "NEGOTIATING" ||
          enquiry.status === "QUOTED") && (
          <div className="mb-6">
            <ConvertToProject
  enquiryId={enquiry.id}
  quotationId={
    enquiry.quotations.find(
      (q) => q.status === "APPROVED"
    )?.id ?? ""
  }
  quoteTotal={
    enquiry.quotations.find(
      (q) => q.status === "APPROVED"
    )?.totalAmount
  }
/>
          </div>
        )}

      {/* Edit Enquiry */}
      <div className="bg-white border border-flora-border rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-4 text-flora-primary">
          Edit Enquiry
        </h3>

        <EnquiryEditForm enquiry={enquiry} />
      </div>

      {/* Enquiry Details + Call Notes */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-flora-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4 text-flora-primary">
            Enquiry Details
          </h3>

          <dl className="space-y-2 text-sm">
            {[
              {
                label: "Service Wanted",
                value: enquiry.serviceWanted,
              },
              {
                label: "Customer Type",
                value: enquiry.customerType,
              },
              {
                label: "Desired Budget",
                value: enquiry.desiredBudget
                  ? `AED ${enquiry.desiredBudget.toLocaleString()}`
                  : "Not provided",
              },
              {
                label: "Assigned To",
                value: enquiry.assignedTo ?? "—",
              },
              {
                label: "Follow-up Date",
                value: enquiry.followUpDate
                  ? new Date(
                      enquiry.followUpDate
                    ).toLocaleDateString("en-AE")
                  : "—",
              },
              {
                label: "Site Address",
                value: enquiry.siteAddress ?? "—",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-2">
                <dt className="text-flora-muted w-36 shrink-0">
                  {label}
                </dt>

                <dd className="font-medium">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white border border-flora-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4 text-flora-primary">
            Call Notes
          </h3>

          <p className="text-sm text-flora-muted whitespace-pre-wrap">
            {enquiry.remarks ?? "No notes recorded."}
          </p>

          {enquiry.interestLevel && (
            <div className="mt-4">
              <p className="text-xs text-flora-muted mb-1">
                Interest Level
              </p>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className="w-4 h-4 rounded"
                    style={{
                      background:
                        n <= enquiry.interestLevel
                          ? "#5A0E12"
                          : "#EFE7DF",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quotations */}
      <div className="bg-white border border-flora-border rounded-xl p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-sm text-flora-primary">
            Quotations
          </h3>

          {!hasWonOrLost && (
            <Link
              href={`/quotations/new?enquiryId=${enquiry.id}`}
              className="text-xs text-flora-primary hover:underline"
            >
              + New Quote
            </Link>
          )}
        </div>

        {enquiry.quotations.length === 0 ? (
          <p className="text-sm text-flora-muted">
            No quotations yet.
          </p>
        ) : (
          <div className="space-y-2">
            {enquiry.quotations.map((q) => (
              <div
                key={q.id}
                className="flex justify-between items-center py-2 border-b border-flora-border/60 last:border-0"
              >
                <div>
                  <Link
                    href={`/quotations/${q.id}`}
                    className="font-medium text-sm text-flora-primary hover:underline"
                  >
                    {q.quoteNumber}
                  </Link>

                  <span className="ml-2 text-xs text-flora-muted">
                    {q.status}
                  </span>
                </div>

                <div className="flex gap-3 items-center">
                  <span className="font-semibold">
                    AED {q.totalAmount.toLocaleString()}
                  </span>

                  <a
                    href={`/api/quotations/${q.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs border border-flora-border rounded-lg px-3 py-1 text-flora-muted hover:bg-[#EFE7DF]"
                  >
                    📄 PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Site Visits */}
      <SiteVisitManager
        enquiryId={enquiry.id}
        initialVisits={enquiry.siteVisits}
        defaultAddress={enquiry.siteAddress}
      />

      {/* Tasks */}
      <div className="bg-white border border-flora-border rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4 text-flora-primary">
          Tasks
        </h3>

        <TaskManager
          enquiryId={enquiry.id}
          initialTasks={enquiry.tasks}
        />
      </div>
    </div>
  );
}
