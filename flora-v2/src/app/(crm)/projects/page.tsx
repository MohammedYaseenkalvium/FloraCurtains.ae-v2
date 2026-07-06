import { db } from "@/lib/db";
import Link from "next/link";

import type { ProjectStatus } from "@prisma/client";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const projects = await db.project.findMany({
    where: { deletedAt: null, ...(status ? { status: status as ProjectStatus } : {}) },
    orderBy: { createdAt: "desc" },
    include: { enquiry: { include: { contact: true, company: true } }, quotation: true },
  });

  const statusColors: Record<string, string> = {
    NOT_STARTED: "#8B8178", IN_PROGRESS: "#185FA5", INSTALLATION: "#854D0E",
    SNAGGING: "#7F77DD", COMPLETED: "#166534", ON_HOLD: "#991B1B",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Projects</h1>
      </div>

      <div className="bg-white border border-[#D8C9BC] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F5F2] text-[#6B625A] text-[10px] uppercase tracking-widest">
              {["Client","Company","Service","Status","Contract Value","Quote","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} className="border-t border-[#F8F5F2] hover:bg-[#F8F5F2]/60">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.enquiry.contact.name}</div>
                </td>
                <td className="px-4 py-3 text-[#6B625A] text-xs">{p.enquiry.company?.tradeName ?? "—"}</td>
                <td className="px-4 py-3 text-[#6B625A]">{p.enquiry.serviceWanted}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: `${statusColors[p.status]}18`, color: statusColors[p.status] }}>
                    {p.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">AED {p.totalContractValue.toLocaleString()}</td>
                <td className="px-4 py-3 text-[#6B625A] text-xs">
                  {p.quotation ? p.quotation.quoteNumber : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/projects/${p.id}`} className="text-[#5A0E12] text-xs hover:underline">View →</Link>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6B625A]">No projects yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}