import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, requireRole, parseBody, withErrorHandling } from "@/lib/api";
import { logActivity } from "@/lib/activity";

const settingsSchema = z.object({
  companyName: z.string().min(1),
  vatNumber: z.string(),
  currency: z.enum(["AED", "USD", "EUR"]),
  defaultVatRate: z.coerce.number().min(0).max(100),
  quoteValidityDays: z.coerce.number().min(1),
});

const DEFAULTS = {
  companyName: "Flora Interior Operations",
  vatNumber: "100000000000003",
  currency: "AED",
  defaultVatRate: 5,
  quoteValidityDays: 30,
};

export const GET = withErrorHandling(async () => {
  await requireAuth();
  const settings = await db.appSettings.findFirst();
  return NextResponse.json(settings ?? DEFAULTS);
});

export const PATCH = withErrorHandling(async (req: NextRequest) => {
  const session = await requireRole("ADMIN");
  const data = await parseBody(req, settingsSchema);

  const existing = await db.appSettings.findFirst();
  const settings = existing
    ? await db.appSettings.update({ where: { id: existing.id }, data })
    : await db.appSettings.create({ data });

  await logActivity({
    session,
    action: "UPDATE",
    entityType: "AppSettings",
    entityId: settings.id,
    summary: "Updated app settings",
  });

  return NextResponse.json(settings);
});
