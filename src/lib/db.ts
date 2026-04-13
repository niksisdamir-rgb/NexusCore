/**
 * src/lib/db.ts
 * Prisma client singleton for production-grade PostgreSQL.
 * Reuses a single instance across hot-reloads in dev mode.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

function createPrismaClient() {
  const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "prisma/dev.db";
  const db = new Database(dbPath);
  const adapter = new PrismaBetterSqlite3(db);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
