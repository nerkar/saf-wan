/** @vercel-platform prisma — serverless-friendly client; env DATABASE_URL */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

/** Reuse one client per serverless instance (Vercel) and across HMR in dev. */
globalForPrisma.prisma = prisma;
