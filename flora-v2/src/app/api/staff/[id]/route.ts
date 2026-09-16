import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const updateStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address."),

  password: z
    .string()
    .max(100, "Password is too long.")
    .optional(),

  role: z
    .string()
    .trim()
    .min(1, "Role is required.")
    .max(50, "Role is too long."),
});

async function getAdminSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      session: null,
      response: NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      session: null,
      response: NextResponse.json(
        {
          error: "You do not have permission to manage staff.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    session,
    response: null,
  };
}

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const { response } = await getAdminSession();

  if (response) {
    return response;
  }

  const { id } = await params;

  const staff = await db.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!staff) {
    return NextResponse.json(
      {
        error: "Staff member not found.",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json({
    staff,
  });
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const { session, response } =
    await getAdminSession();

  if (response) {
    return response;
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const parsed =
      updateStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid staff data.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      name,
      email,
      password,
      role,
    } = parsed.data;

    const existingUser =
      await db.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

    if (!existingUser) {
      return NextResponse.json(
        {
          error: "Staff member not found.",
        },
        {
          status: 404,
        }
      );
    }

    const duplicateEmail =
      await db.user.findFirst({
        where: {
          email,
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

    if (duplicateEmail) {
      return NextResponse.json(
        {
          error:
            "Another user already uses this email.",
        },
        {
          status: 409,
        }
      );
    }

    const updateData: {
      name: string;
      email: string;
      role: string;
      password?: string;
    } = {
      name,
      email,
      role,
    };

    if (password && password.trim()) {
      updateData.password =
        await bcrypt.hash(
          password.trim(),
          12
        );
    }

    const updatedUser =
      await db.$transaction(
        async (tx) => {
          const user =
            await tx.user.update({
              where: {
                id,
              },
              data: updateData,
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
              },
            });

          await tx.activityLog.create({
            data: {
              userId: session!.user.id,
              userName:
                session!.user.name ??
                session!.user.email ??
                "Administrator",
              action: "STAFF_UPDATED",
              entityType: "USER",
              entityId: user.id,
              summary: `Updated staff account for ${user.name}.`,
              meta: {
                previousName:
                  existingUser.name,
                previousEmail:
                  existingUser.email,
                previousRole:
                  existingUser.role,
                newEmail: user.email,
                newRole: user.role,
                passwordChanged:
                  Boolean(
                    password &&
                      password.trim()
                  ),
              },
            },
          });

          return user;
        }
      );

    return NextResponse.json({
      staff: updatedUser,
    });
  } catch (error) {
    console.error(
      "Update staff error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update the staff account.",
      },
      {
        status: 500,
      }
    );
  }
}