import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserRole } from "@prisma/client";

import { requireRole, parseBody, withErrorHandling, conflict } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { db } from "@/lib/db";

const createStaffSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100, "Name is too long."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(100, "Password is too long."),
  role: z.nativeEnum(UserRole, { message: "Role must be ADMIN or STAFF." }),
});

export const GET = withErrorHandling(async () => {
  await requireRole("ADMIN");
  const staff = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json({ staff });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireRole("ADMIN");
  const { name, email, password, role } = await parseBody(req, createStaffSchema);

  const existingUser = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) throw conflict("A user with this email already exists.");

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    await logActivity(
      {
        session,
        action: "STAFF_CREATED",
        entityType: "USER",
        entityId: createdUser.id,
        summary: `Created staff account for ${createdUser.name}.`,
        meta: { email: createdUser.email, role: createdUser.role },
      },
      tx
    );
    return createdUser;
  });

  return NextResponse.json({ staff: user }, { status: 201 });
});
