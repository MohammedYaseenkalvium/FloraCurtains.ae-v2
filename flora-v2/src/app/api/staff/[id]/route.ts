import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { requireRole, parseBody, withErrorHandling, notFound, conflict } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { db } from "@/lib/db";

const STAFF_ROLES = ["ADMIN", "STAFF"] as const;

const updateStaffSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100, "Name is too long."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z
    .string()
    .max(100, "Password is too long.")
    .optional()
    .refine((v) => v === undefined || v.trim() === "" || v.trim().length >= 8, {
      message: "Password must be at least 8 characters.",
    }),
  role: z.enum(STAFF_ROLES, { message: "Role must be ADMIN or STAFF." }),
});

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_req: NextRequest, { params }: Ctx) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const staff = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!staff) throw notFound("Staff member not found.");
  return NextResponse.json({ staff });
});

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: Ctx) => {
  const session = await requireRole("ADMIN");
  const { id } = await params;
  const { name, email, password, role } = await parseBody(req, updateStaffSchema);

  const existingUser = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!existingUser) throw notFound("Staff member not found.");

  const duplicateEmail = await db.user.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });
  if (duplicateEmail) throw conflict("Another user already uses this email.");

  const updateData: { name: string; email: string; role: string; password?: string } = {
    name,
    email,
    role,
  };
  const passwordChanged = Boolean(password && password.trim());
  if (passwordChanged) updateData.password = await bcrypt.hash(password!.trim(), 12);

  const updatedUser = await db.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    await logActivity(
      {
        session,
        action: "STAFF_UPDATED",
        entityType: "USER",
        entityId: user.id,
        summary: `Updated staff account for ${user.name}.`,
        meta: {
          previousName: existingUser.name,
          previousEmail: existingUser.email,
          previousRole: existingUser.role,
          newEmail: user.email,
          newRole: user.role,
          passwordChanged,
        },
      },
      tx
    );
    return user;
  });

  return NextResponse.json({ staff: updatedUser });
});
