import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  // Never log ["query"] in dev: it spams the console with every statement
  // (including Prisma's internal `SELECT 1` connection probes) and buries
  // real slow-query signal. Errors only.
  new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;