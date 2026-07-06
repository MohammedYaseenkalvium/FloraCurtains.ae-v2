import type { Prisma, PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import { db } from "@/lib/db";

type DbClient = PrismaClient | Prisma.TransactionClient;

export interface ActivityInput {
  session: Session | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary?: string;
  meta?: Prisma.InputJsonValue;
}

/**
 * Records an audit-trail entry. Failures are swallowed and logged so that an
 * audit problem never breaks the primary operation. Pass a transaction client
 * to keep the log atomic with the change it describes.
 */
export async function logActivity(input: ActivityInput, client: DbClient = db): Promise<void> {
  try {
    await client.activityLog.create({
      data: {
        userId: input.session?.user?.id ?? null,
        userName: input.session?.user?.name ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary,
        meta: input.meta,
      },
    });
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}
