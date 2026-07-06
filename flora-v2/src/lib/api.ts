import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "next-auth";
import { ZodError, type ZodSchema } from "zod";
import { auth } from "@/lib/auth";

/**
 * Shared helpers for API route handlers: authentication, role checks,
 * consistent error responses, and a wrapper that turns thrown errors into
 * structured JSON responses instead of leaking stack traces.
 */

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const unauthorized = (msg = "Unauthorized") => new ApiError(401, msg);
export const forbidden = (msg = "Forbidden") => new ApiError(403, msg);
export const notFound = (msg = "Not found") => new ApiError(404, msg);
export const conflict = (msg = "Conflict") => new ApiError(409, msg);
export const badRequest = (msg = "Bad request", details?: unknown) =>
  new ApiError(400, msg, details);

/** Returns the current session or throws a 401 ApiError. */
export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) throw unauthorized();
  return session;
}

/** Ensures the current user has one of the allowed roles, else throws 403. */
export async function requireRole(...roles: string[]): Promise<Session> {
  const session = await requireAuth();
  const role = session.user?.role;
  if (!role || !roles.includes(role)) throw forbidden("Insufficient permissions");
  return session;
}

/** Parses a JSON body against a Zod schema, throwing a 422 ApiError on failure. */
export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw badRequest("Invalid JSON body");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(422, "Validation failed", parsed.error.flatten());
  }
  return parsed.data;
}

function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: err.message, ...(err.details ? { details: err.details } : {}) },
      { status: err.status }
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: err.flatten() },
      { status: 422 }
    );
  }
  // Prisma "record not found" on update/delete.
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code?: string }).code;
    if (code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (code === "P2002") {
      return NextResponse.json({ error: "A record with this value already exists" }, { status: 409 });
    }
  }
  console.error("Unhandled API error:", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

type RouteContext = { params: Promise<Record<string, string>> };
type Handler<C> = (req: NextRequest, ctx: C) => Promise<NextResponse> | NextResponse;

/**
 * Wraps a route handler so any thrown error (including ApiError) becomes a
 * consistent JSON response. Use this around every handler body.
 */
export function withErrorHandling<C = RouteContext>(handler: Handler<C>): Handler<C> {
  return async (req: NextRequest, ctx: C) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}
