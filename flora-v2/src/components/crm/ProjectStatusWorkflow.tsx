"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectStatus } from "@prisma/client";
import {
  Check,
  CirclePause,
  Play,
  Wrench,
} from "lucide-react";

type WorkflowAction = {
  status: ProjectStatus;
  label: string;
  icon: typeof Play;
};

const transitions: Record<
  ProjectStatus,
  WorkflowAction[]
> = {
  NOT_STARTED: [
    {
      status: "IN_PROGRESS",
      label: "Start Project",
      icon: Play,
    },
    {
      status: "ON_HOLD",
      label: "Put On Hold",
      icon: CirclePause,
    },
  ],

  IN_PROGRESS: [
    {
      status: "INSTALLATION",
      label: "Start Installation",
      icon: Wrench,
    },
    {
      status: "ON_HOLD",
      label: "Put On Hold",
      icon: CirclePause,
    },
  ],

  INSTALLATION: [
    {
      status: "SNAGGING",
      label: "Start Snagging",
      icon: Wrench,
    },
    {
      status: "ON_HOLD",
      label: "Put On Hold",
      icon: CirclePause,
    },
  ],

  SNAGGING: [
    {
      status: "COMPLETED",
      label: "Mark Completed",
      icon: Check,
    },
    {
      status: "ON_HOLD",
      label: "Put On Hold",
      icon: CirclePause,
    },
  ],

  COMPLETED: [],

  ON_HOLD: [
    {
      status: "IN_PROGRESS",
      label: "Resume Project",
      icon: Play,
    },
    {
      status: "INSTALLATION",
      label: "Resume Installation",
      icon: Wrench,
    },
  ],
};

const statusLabels: Record<
  ProjectStatus,
  string
> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  INSTALLATION: "Installation",
  SNAGGING: "Snagging",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

const statusStyles: Record<
  ProjectStatus,
  {
    background: string;
    text: string;
    border: string;
  }
> = {
  NOT_STARTED: {
    background: "#F8F5F2",
    text: "#6B625A",
    border: "#D8C9BC",
  },

  IN_PROGRESS: {
    background: "#EEF4FA",
    text: "#185FA5",
    border: "#B8D0E5",
  },

  INSTALLATION: {
    background: "#FEF9E7",
    text: "#854D0E",
    border: "#E6D19B",
  },

  SNAGGING: {
    background: "#F1F0FC",
    text: "#7F77DD",
    border: "#C9C5F0",
  },

  COMPLETED: {
    background: "#EDF7F3",
    text: "#166534",
    border: "#B7D8CC",
  },

  ON_HOLD: {
    background: "#FEF2F2",
    text: "#991B1B",
    border: "#E8BDBD",
  },
};

export function ProjectStatusWorkflow({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: ProjectStatus;
}) {
  const router = useRouter();

  const [status, setStatus] =
    useState<ProjectStatus>(
      currentStatus
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const actions = transitions[status];

  const currentStyle =
    statusStyles[status];

  async function updateStatus(
    newStatus: ProjectStatus
  ) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/projects/${projectId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error?.message ??
            data?.error ??
            data?.message ??
            "Failed to update project status."
        );
      }

      setStatus(newStatus);

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update project status."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Current status */}
        <span
          className="inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold"
          style={{
            backgroundColor:
              currentStyle.background,

            color:
              currentStyle.text,

            borderColor:
              currentStyle.border,
          }}
        >
          {statusLabels[status]}
        </span>

        {actions.length > 0 && (
          <>
            <span className="text-[#D8C9BC]">
              →
            </span>

            {actions.map((action) => {
              const Icon = action.icon;

              const isHold =
                action.status ===
                "ON_HOLD";

              const isComplete =
                action.status ===
                "COMPLETED";

              return (
                <button
                  key={action.status}
                  type="button"
                  onClick={() =>
                    updateStatus(
                      action.status
                    )
                  }
                  disabled={loading}
                  className={[
                    "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",

                    isHold
                      ? "border border-[#E8BDBD] bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FDE8E8]"
                      : isComplete
                        ? "border border-[#B7D8CC] bg-[#EDF7F3] text-[#166534] hover:bg-[#E0F1EB]"
                        : "bg-[#5A0E12] text-white hover:bg-[#74171C]",
                  ].join(" ")}
                >
                  <Icon size={13} />

                  {loading
                    ? "Updating..."
                    : action.label}
                </button>
              );
            })}
          </>
        )}
      </div>

      {error && (
        <p
          className="text-xs text-[#991B1B]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}