export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PaymentLedger } from "@/components/crm/PaymentLedger";
import { TaskManager } from "@/components/crm/TaskManager";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await db.project.findFirst({
    where:   { id, deletedAt: null },
    include: {
      enquiry:   { include: { contact: true, company: true } },
      quotation: true,
      payments:  { orderBy: { paidAt: "asc" } },
      tasks:     { orderBy: { dueDate: "asc" } },
    },
  });
  if (!project) notFound();

  const { contact, company } = project.enquiry;

  const statusColors: Record<string, string> = {
    NOT_STARTED: "#8B8178", IN_PROGRESS: "#185FA5", INSTALLATION: "#854D0E",
    SNAGGING: "#7F77DD", COMPLETED: "#166534", ON_HOLD: "#991B1B",
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">{contact.name}</h1>
      {company && <p className="text-[#6B625A] text-sm">{company.tradeName}</p>}
      <p className="text-[#6B625A] text-sm mb-6">{project.enquiry.serviceWanted}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Project Info</h3>
          <dl className="space-y-2 text-sm">
            {[
              { label: "Status",         value: <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${statusColors[project.status]}18`, color: statusColors[project.status] }}>{project.status.replace(/_/g, " ")}</span> },
              { label: "Contract Value", value: `AED ${project.totalContractValue.toLocaleString()}` },
              { label: "Start Date",     value: project.startDate ? new Date(project.startDate).toLocaleDateString("en-AE") : "—" },
              { label: "Installation",   value: project.installationDate ? new Date(project.installationDate).toLocaleDateString("en-AE") : "—" },
              { label: "PO Number",      value: project.poNumber ?? "—" },
              { label: "Site",           value: project.siteAddress ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-2 items-center">
                <dt className="text-[#6B625A] w-32 shrink-0">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Tasks</h3>
          <TaskManager projectId={project.id} initialTasks={project.tasks} />
        </div>
      </div>

      <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-5 text-[#5A0E12]">Payment Ledger</h3>
        <PaymentLedger
          projectId={project.id}
          totalContractValue={project.totalContractValue}
          payments={project.payments}
        />
      </div>
    </div>
  );
}