import { db } from "@/lib/db";
import { TaskManager } from "@/components/crm/TaskManager";

export default async function TasksPage() {
  const tasks = await db.task.findMany({
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    include: { enquiry: { include: { contact: true } }, project: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-6">Tasks</h1>
      <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
        <TaskManager initialTasks={tasks} />
      </div>
    </div>
  );
}