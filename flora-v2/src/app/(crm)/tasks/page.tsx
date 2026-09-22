import { db } from "@/lib/db";
import { TaskManager } from "@/components/crm/TaskManager";

export default async function TasksPage() {
  const tasks = await db.task.findMany({
    orderBy: [{ done: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    include: { enquiry: { include: { contact: true } }, project: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-2">Tasks</h1>
      <p className="text-sm text-[#6B625A] mb-6">
        New tasks are created from an enquiry or project so they stay linked. Use Delete on this page to clean up.
      </p>
      <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
        <TaskManager initialTasks={tasks} allowCreate={false} />
      </div>
    </div>
  );
}