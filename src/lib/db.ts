/**
 * src/lib/db.ts
 * Prisma client singleton for production-grade PostgreSQL.
 * Reuses a single instance across hot-reloads in dev mode.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

function createPrismaClient() {
  const envUrl = process.env.DATABASE_URL;
  console.log("[Prisma] Initializing client. env.DATABASE_URL:", envUrl);
  
  // Default path for SQLite if env is missing or broken
  let dbPath = "prisma/dev.db"; 
  
  if (envUrl && typeof envUrl === "string") {
    // Handle "file:./prisma/dev.db" or "file:prisma/dev.db" or "./prisma/dev.db"
    dbPath = envUrl.replace(/^file:/, "");
  }
  
  console.log("[Prisma] Resolved dbPath for better-sqlite3:", dbPath);
  
  try {
    const db = new Database(dbPath);
    const adapter = new PrismaBetterSqlite3(db);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } catch (err: any) {
    console.error("[Prisma] Failed to initialize Database or PrismaClient:", err.message);
    throw err;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
