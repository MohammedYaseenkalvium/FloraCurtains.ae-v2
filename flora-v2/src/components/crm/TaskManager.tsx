"use client";

import { useState } from "react";
import { PlusCircle, Trash2, CheckCircle2, Circle } from "lucide-react";
import type { Task, TaskPriority } from "@prisma/client";

export function TaskManager({
  enquiryId,
  projectId,
  initialTasks,
  allowCreate = true,
}: {
  enquiryId?: string;
  projectId?: string;
  initialTasks: Task[];
  allowCreate?: boolean;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [open, setOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "MEDIUM" as TaskPriority,
  });

  const field = "border border-flora-border rounded-lg px-3 py-2 text-sm outline-none focus:border-flora-primary bg-flora-surface w-full";
  const label = "text-[10px] uppercase tracking-widest text-flora-muted block mb-1";

  async function addTask() {
    setCreateError("");
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
    } else {
      const data = await res.json().catch(() => null);
      setCreateError(data?.error ?? "Unable to create task.");
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
            <button onClick={() => toggleDone(task)} aria-label={task.done ? `Reopen task ${task.title}` : `Complete task ${task.title}`} className="shrink-0">
              {task.done ? (
                <CheckCircle2 size={16} className="text-green-600" />
              ) : (
                <Circle size={16} className="text-flora-primary" />
              )}
            </button>
            <span className={task.done ? "line-through text-flora-muted" : "flex-1"}>
              {task.title}
            </span>
            {task.assignedTo && (
              <span className="text-xs text-flora-muted">@{task.assignedTo}</span>
            )}
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: priorityBg[task.priority], color: priorityColors[task.priority] }}
            >
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="text-xs text-flora-muted">
                {new Date(task.dueDate).toLocaleDateString("en-AE")}
              </span>
            )}
            <button
              onClick={() => deleteTask(task.id)}
              aria-label={`Delete task ${task.title}`}
              title="Delete task (admin only)"
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 text-flora-muted hover:text-red-700 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-flora-muted">No tasks yet.</p>
        )}
      </div>

      {!open ? (
        allowCreate ? (
          <button
            onClick={() => { setCreateError(""); setOpen(true); }}
            className="flex items-center gap-2 text-flora-primary text-sm hover:underline"
          >
            <PlusCircle size={15} /> Add Task
          </button>
        ) : null
      ) : (
        <div className="border border-flora-border rounded-xl p-4 space-y-3">
          <h4 className="font-semibold text-sm text-flora-primary">New Task</h4>
          {createError && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {createError}
            </p>
          )}
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
              className="bg-flora-primary text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-flora-primary-hover disabled:opacity-50"
            >
              Add Task
            </button>
            <button
              onClick={() => setOpen(false)}
              className="bg-[#EFE7DF] text-flora-muted rounded-lg px-6 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}