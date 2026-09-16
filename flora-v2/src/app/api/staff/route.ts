import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const createStaffSchema = z.object({
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
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password is too long."),

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

export async function GET() {
  const { response } = await getAdminSession();

  if (response) {
    return response;
  }

  const staff = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    staff,
  });
}

export async function POST(request: Request) {
  const { session, response } = await getAdminSession();

  if (response) {
    return response;
  }

  try {
    const body = await request.json();

    const parsed = createStaffSchema.safeParse(body);

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
          email,
        },
        select: {
          id: true,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "A user with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user = await db.$transaction(
      async (tx) => {
        const createdUser =
          await tx.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
              role,
            },
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
            action: "STAFF_CREATED",
            entityType: "USER",
            entityId: createdUser.id,
            summary: `Created staff account for ${createdUser.name}.`,
            meta: {
              email: createdUser.email,
              role: createdUser.role,
            },
          },
        });

        return createdUser;
      }
    );

    return NextResponse.json(
      {
        staff: user,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create staff error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create the staff account.",
      },
      {
        status: 500,
      }
    );
  }
}