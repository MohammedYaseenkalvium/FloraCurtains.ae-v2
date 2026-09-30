"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectStatus } from "@prisma/client";
import {
  ArrowRight,
  Check,
  CirclePause,
  Play,
  Wrench,
  X,
} from "lucide-react";
import { statusStyles } from "@/lib/status-styles";

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
    {
      status: "CANCELLED",
      label: "Cancel Project",
      icon: X,
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
    {
      status: "CANCELLED",
      label: "Cancel Project",
      icon: X,
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

  CANCELLED: [],

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
    {
      status: "CANCELLED",
      label: "Cancel Project",
      icon: X,
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
  CANCELLED: "Cancelled",
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
    statusStyles.project[status];

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
            <span className="text-flora-border">
              <ArrowRight size={12} aria-hidden="true" />
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
                      ? "border border-flora-danger/30 bg-flora-danger-surface text-flora-danger hover:bg-flora-danger-surface"
                      : isComplete
                        ? "border border-flora-success-border bg-flora-success-surface text-flora-success-text hover:bg-flora-success-surface-hover"
                        : "bg-flora-primary text-white hover:bg-flora-primary-hover",
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
          className="text-xs text-flora-danger"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}