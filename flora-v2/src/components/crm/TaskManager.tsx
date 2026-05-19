"use client";

import { useState } from "react";
import { PlusCircle, Trash2, CheckCircle2, Circle } from "lucide-react";
import type { Task, TaskPriority } from "@prisma/client";

export function TaskManager({
  enquiryId,
  projectId,
  initialTasks,
}: {
  enquiryId?: string;
  projectId?: string;
  initialTasks: Task[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "MEDIUM" as TaskPriority,
  });

  const field = "border border-[#D8C9BC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2] w-full";
  const label = "text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1";

  async function addTask() {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
              ...form,
              ...(enquiryId ? { enquiryId } : {}),
              ...(projectId ? { projectId } : {}),
            }),
    });
    if (res.ok) {
      const task = await res.json();
      setTasks(prev => [...prev, task]);
      setOpen(false);
      setForm({ title: "", description: "", assignedTo: "", dueDate: "", priority: "MEDIUM" });
    }
  }

  async function toggleDone(task: Task) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    }
  }

  async function deleteTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) setTasks(prev => prev.filter(t => t.id !== id));
  }

  const priorityColors = { HIGH: "#991B1B", MEDIUM: "#854D0E", LOW: "#166534" };
  const priorityBg = { HIGH: "#FEF2F2", MEDIUM: "#FFFBEB", LOW: "#F0FDF4" };

  return (
    <div>
      <div className="space-y-2 mb-4">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 text-sm group">
            <button onClick={() => toggleDone(task)} className="shrink-0">
              {task.done ? (
                <CheckCircle2 size={16} className="text-green-600" />
              ) : (
                <Circle size={16} className="text-[#5A0E12]" />
              )}
            </button>
            <span className={task.done ? "line-through text-[#6B625A]" : "flex-1"}>
              {task.title}
            </span>
            {task.assignedTo && (
              <span className="text-xs text-[#6B625A]">@{task.assignedTo}</span>
            )}
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: priorityBg[task.priority], color: priorityColors[task.priority] }}
            >
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="text-xs text-[#6B625A]">
                {new Date(task.dueDate).toLocaleDateString("en-AE")}
              </span>
            )}
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-[#6B625A] hover:text-red-700 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-[#6B625A]">No tasks yet.</p>
        )}
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-[#5A0E12] text-sm hover:underline"
        >
          <PlusCircle size={15} /> Add Task
        </button>
      ) : (
        <div className="border border-[#D8C9BC] rounded-xl p-4 space-y-3">
          <h4 className="font-semibold text-sm text-[#5A0E12]">New Task</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={label}>Title *</label>
              <input
                className={field}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className={label}>Description</label>
              <input
                className={field}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className={label}>Assigned To</label>
              <input
                className={field}
                value={form.assignedTo}
                onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                placeholder="Staff name"
              />
            </div>
            <div>
              <label className={label}>Due Date</label>
              <input
                type="date"
                className={field}
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className={label}>Priority</label>
              <select
                className={field}
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={addTask}
              disabled={!form.title}
              className="bg-[#5A0E12] text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-[#7A1E22] disabled:opacity-50"
            >
              Add Task
            </button>
            <button
              onClick={() => setOpen(false)}
              className="bg-[#EFE7DF] text-[#6B625A] rounded-lg px-6 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}