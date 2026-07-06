import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ConvertToProject } from "@/components/crm/ConvertToProject";
import { EnquiryEditForm } from "@/components/crm/EnquiryEditForm";
import { TaskManager } from "@/components/crm/TaskManager";

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const enquiry = await db.enquiry.findFirst({
    where:   { id, deletedAt: null },
    include: { contact: true, company: true, quotations: true, project: { include: { payments: true } }, tasks: true },
  });
  if (!enquiry) notFound();

  const statusColors: Record<string, string> = {
    NEW: "#8B8178", CONTACTED: "#185FA5", VISIT_SCHEDULED: "#854D0E",
    QUOTED: "#0F6E56", NEGOTIATING: "#7F77DD", WON: "#166534", LOST: "#991B1B",
  };

  const hasWonOrLost = enquiry.status === "WON" || enquiry.status === "LOST";
  const hasProject = !!enquiry.project;

  return (
    <div className="max-w-4xl">
      <div className="text-sm text-[#6B625A] mb-5">
        <Link href="/enquiries" className="hover:underline">Enquiries</Link>
        <span className="mx-2">›</span>
        <span>{enquiry.contact.name}</span>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{enquiry.contact.name}</h1>
          {enquiry.company && <p className="text-[#6B625A] text-sm">{enquiry.company.tradeName}</p>}
          <p className="text-[#6B625A] text-sm">{enquiry.contact.phone}</p>
        </div>
        <div className="flex gap-3 items-center">
          <span className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ background: `${statusColors[enquiry.status]}18`, color: statusColors[enquiry.status] }}>
            {enquiry.status.replace(/_/g, " ")}
          </span>
          {!hasWonOrLost && (
            <Link href={`/quotations/new?enquiryId=${enquiry.id}`}
              className="bg-[#5A0E12] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#7A1E22]">
              + Create Quote
            </Link>
          )}
        </div>
      </div>

      {!hasProject && (enquiry.status === "WON" || enquiry.status === "NEGOTIATING" || enquiry.status === "QUOTED") && (
        <div className="mb-6">
          <ConvertToProject
            enquiryId={enquiry.id}
            quoteTotal={enquiry.quotations.find(q => q.status === "APPROVED")?.totalAmount}
          />
        </div>
      )}

      <div className="bg-white border border-[#D8C9BC] rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Edit Enquiry</h3>
        <EnquiryEditForm enquiry={enquiry} />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Enquiry Details</h3>
          <dl className="space-y-2 text-sm">
            {[
              { label: "Service Wanted",  value: enquiry.serviceWanted },
              { label: "Customer Type",   value: enquiry.customerType },
              { label: "Desired Budget",  value: enquiry.desiredBudget ? `AED ${enquiry.desiredBudget.toLocaleString()}` : "Not provided" },
              { label: "Assigned To",     value: enquiry.assignedTo ?? "—" },
              { label: "Follow-up Date",  value: enquiry.followUpDate ? new Date(enquiry.followUpDate).toLocaleDateString("en-AE") : "—" },
              { label: "Site Address",    value: enquiry.siteAddress ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-2">
                <dt className="text-[#6B625A] w-36 shrink-0">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Call Notes</h3>
          <p className="text-sm text-[#6B625A] whitespace-pre-wrap">{enquiry.remarks ?? "No notes recorded."}</p>
          {enquiry.interestLevel && (
            <div className="mt-4">
              <p className="text-xs text-[#6B625A] mb-1">Interest Level</p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className="w-4 h-4 rounded"
                    style={{ background: n <= enquiry.interestLevel ? "#5A0E12" : "#EFE7DF" }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#D8C9BC] rounded-xl p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-sm text-[#5A0E12]">Quotations</h3>
          {!hasWonOrLost && (
            <Link href={`/quotations/new?enquiryId=${enquiry.id}`} className="text-xs text-[#5A0E12] hover:underline">+ New Quote</Link>
          )}
        </div>
        {enquiry.quotations.length === 0 ? (
          <p className="text-sm text-[#6B625A]">No quotations yet.</p>
        ) : (
          <div className="space-y-2">
            {enquiry.quotations.map(q => (
              <div key={q.id} className="flex justify-between items-center py-2 border-b border-[#EFE7DF] last:border-0">
                <div>
                  <Link href={`/quotations/${q.id}`} className="font-medium text-sm text-[#5A0E12] hover:underline">{q.quoteNumber}</Link>
                  <span className="ml-2 text-xs text-[#6B625A]">{q.status}</span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="font-semibold">AED {q.totalAmount.toLocaleString()}</span>
                  <a href={`/api/quotations/${q.id}/pdf`} target="_blank" rel="noopener noreferrer"
                    className="text-xs border border-[#D8C9BC] rounded-lg px-3 py-1 text-[#6B625A] hover:bg-[#EFE7DF]">
                    📄 PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Tasks</h3>
        <TaskManager enquiryId={enquiry.id} initialTasks={enquiry.tasks} />
      </div>
    </div>
  );
}