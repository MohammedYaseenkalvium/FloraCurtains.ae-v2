import { db } from "@/lib/db";

export default async function TasksPage() {
  const tasks = await db.task.findMany({
    where:   { done: false },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    include: { enquiry: { include: { contact: true } }, project: true },
  });

  const priorityColors = { HIGH: "#991B1B", MEDIUM: "#854D0E", LOW: "#166534" };
  const priorityBg     = { HIGH: "#FEF2F2", MEDIUM: "#FFFBEB", LOW: "#F0FDF4" };

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-6">Tasks</h1>
      <div className="bg-white border border-[#D8C9BC] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F5F2] text-[#6B625A] text-[10px] uppercase tracking-widest">
              {["Task","Priority","Client","Assigned To","Due Date"].map(h => (
                <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} className="border-t border-[#F8F5F2] hover:bg-[#F8F5F2]/60">
                <td className="px-5 py-3">
                  <div className="font-medium">{t.title}</div>
                  {t.description && <div className="text-xs text-[#6B625A]">{t.description}</div>}
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: priorityBg[t.priority], color: priorityColors[t.priority] }}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#6B625A]">{t.enquiry?.contact?.name ?? "—"}</td>
                <td className="px-5 py-3 text-[#6B625A]">{t.assignedTo ?? "—"}</td>
                <td className="px-5 py-3 text-xs text-[#6B625A]">
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-AE") : "—"}
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-[#6B625A]">No open tasks 🎉</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}