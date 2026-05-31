import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  const [activeLeads, ongoingProjects, pendingInstalls, recentEnquiries] = await Promise.all([
    db.enquiry.count({ where: { status: { notIn: ["WON", "LOST"] } } }),
    db.project.count({ where: { status: { in: ["IN_PROGRESS", "INSTALLATION", "SNAGGING"] } } }),
    db.project.count({ where: { status: "INSTALLATION" } }),
    db.enquiry.findMany({
      take:    8,
      orderBy: { createdAt: "desc" },
      include: { contact: true, company: true },
    }),
  ]);

  const kpis = [
    { label: "Active Leads",      value: activeLeads,      color: "#5A0E12" },
    { label: "Ongoing Projects",  value: ongoingProjects,  color: "#1A1A1A" },
    { label: "Pending Installs",  value: pendingInstalls,  color: "#854D0E" },
  ];

  const statusColors: Record<string, string> = {
    NEW: "#8B8178", CONTACTED: "#185FA5", VISIT_SCHEDULED: "#854D0E",
    QUOTED: "#0F6E56", NEGOTIATING: "#7F77DD", WON: "#166534", LOST: "#991B1B",
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-[#6B625A] text-sm mt-1">
            {new Date().toLocaleDateString("en-AE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · Abu Dhabi, UAE
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/enquiries/new" className="bg-[#EFE7DF] border border-[#D8C9BC] rounded-lg px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#D8C9BC]">
            + New Lead
          </Link>
          <Link href="/quotations/new" className="bg-[#5A0E12] rounded-lg px-4 py-2 text-sm text-white hover:bg-[#7A1E22]">
            + Create Quote
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map(({ label, value, color }) => (
          <div key={label} className="bg-white/70 backdrop-blur border border-black/5 rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-2">{label}</div>
            <div className="text-4xl font-extrabold tracking-tight" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Recent Enquiries */}
      <div className="bg-white border border-[#D8C9BC] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EFE7DF] flex justify-between items-center">
          <h2 className="font-semibold">Recent Enquiries</h2>
          <Link href="/enquiries" className="text-xs text-[#5A0E12] hover:underline">View all →</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F5F2] text-[#6B625A] text-[10px] uppercase tracking-widest">
              {["Client","Service","Source","Status","Date"].map(h => (
                <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentEnquiries.map(e => (
              <tr key={e.id} className="border-t border-[#F8F5F2] hover:bg-[#F8F5F2]/60 transition-colors">
                <td className="px-5 py-3">
                  <Link href={`/enquiries/${e.id}`} className="font-medium text-[#5A0E12] hover:underline">
                    {e.contact.name}
                  </Link>
                  {e.company && <div className="text-xs text-[#6B625A]">{e.company.tradeName}</div>}
                </td>
                <td className="px-5 py-3 text-[#6B625A]">{e.serviceWanted}</td>
                <td className="px-5 py-3 text-[#6B625A]">{e.contact.source.replace(/_/g, " ")}</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: `${statusColors[e.status]}20`, color: statusColors[e.status] }}>
                    {e.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#6B625A] text-xs">
                  {new Date(e.createdAt).toLocaleDateString("en-AE")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}