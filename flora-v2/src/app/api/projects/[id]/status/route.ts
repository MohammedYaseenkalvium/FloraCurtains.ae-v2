import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import {
  conflict,
  notFound,
  parseBody,
  requireAuth,
  withErrorHandling,
} from "@/lib/api";
import { logActivity } from "@/lib/activity";

type Ctx = {
  params: Promise<{ id: string }>;
};

const statusSchema = z.object({
  status: z.enum([
    "NOT_STARTED",
    "IN_PROGRESS",
    "INSTALLATION",
    "SNAGGING",
    "COMPLETED",
    "ON_HOLD",
  ]),
});

type ProjectStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "INSTALLATION"
  | "SNAGGING"
  | "COMPLETED"
  | "ON_HOLD";

const allowedTransitions: Record<
  ProjectStatus,
  ProjectStatus[]
> = {
  NOT_STARTED: [
    "IN_PROGRESS",
    "ON_HOLD",
  ],

  IN_PROGRESS: [
    "INSTALLATION",
    "ON_HOLD",
  ],

  INSTALLATION: [
    "SNAGGING",
    "ON_HOLD",
  ],

  SNAGGING: [
    "COMPLETED",
    "ON_HOLD",
  ],

  COMPLETED: [],

  ON_HOLD: [
    "IN_PROGRESS",
    "INSTALLATION",
  ],
};

export const PATCH = withErrorHandling(
  async (
    req: NextRequest,
    { params }: Ctx
  ) => {
    const session = await requireAuth();

    const { id } = await params;

    const { status } =
      await parseBody(req, statusSchema);

    const project = await db.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!project) {
      throw notFound("Project not found");
    }

    const currentStatus =
      project.status as ProjectStatus;

    const allowed =
      allowedTransitions[currentStatus];

    if (!allowed.includes(status)) {
      throw conflict(
        `Project cannot be changed from ${currentStatus} to ${status}`
      );
    }

    const updated =
      await db.$transaction(async (tx) => {
        const result =
          await tx.project.update({
            where: {
              id,
            },

            data: {
              status,
              updatedById: session.user.id,
            },
          });

        await logActivity(
          {
            session,

            action: "STATUS_CHANGE",

            entityType: "Project",

            entityId: id,

            summary: `Project status changed from ${currentStatus} to ${status}`,
          },
          tx
        );

        return result;
      });

    return NextResponse.json(updated);
  }
);