import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const settingsSchema = z.object({
  companyName: z.string().min(1),
  vatNumber: z.string(),
  currency: z.enum(["AED", "USD", "EUR"]),
  defaultVatRate: z.coerce.number().min(0).max(100),
  quoteValidityDays: z.coerce.number().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await db.appSettings.findFirst();
  return NextResponse.json(settings ?? {
    companyName: "Flora Interior Operations",
    vatNumber: "100000000000003",
    currency: "AED",
    defaultVatRate: 5,
    quoteValidityDays: 30,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const existing = await db.appSettings.findFirst();
  
  const settings = existing 
    ? await db.appSettings.update({ where: { id: existing.id }, data: parsed.data })
    : await db.appSettings.create({ data: parsed.data });

  return NextResponse.json(settings);
}