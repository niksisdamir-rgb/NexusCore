/**
 * src/lib/db.ts
 * Prisma client singleton for production-grade PostgreSQL.
 * Reuses a single instance across hot-reloads in dev mode.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

function createPrismaClient() {
  console.log("[Prisma] --- createPrismaClient Trace Start ---");
  const envUrl = process.env.DATABASE_URL;
  console.log("[Prisma] env.DATABASE_URL:", envUrl);
  console.log("[Prisma] typeof env.DATABASE_URL:", typeof envUrl);
  
  // Default path for SQLite
  let dbPath = "prisma/dev.db"; 
  
  if (envUrl && typeof envUrl === "string") {
    console.log("[Prisma] envUrl exists and is string. Length:", envUrl.length);
    try {
      dbPath = envUrl.replace(/^file:/, "");
      console.log("[Prisma] .replace success. dbPath:", dbPath);
    } catch (e: any) {
      console.error("[Prisma] Error during .replace:", e.message);
    }
  } else {
    console.log("[Prisma] envUrl is missing or not a string. Using default.");
  }
  
  console.log("[Prisma] Resolved dbPath:", dbPath);
  
  try {
    console.log("[Prisma] Attempting new Database()...");
    const db = new Database(dbPath);
    console.log("[Prisma] Database instance created.");
    
    console.log("[Prisma] Attempting new PrismaBetterSqlite3()...");
    const adapter = new PrismaBetterSqlite3(db);
    console.log("[Prisma] Adapter created.");
    
    console.log("[Prisma] Attempting new PrismaClient()...");
    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
    console.log("[Prisma] PrismaClient instance created.");
    console.log("[Prisma] --- createPrismaClient Trace End ---");
    return client;
  } catch (err: any) {
    console.error("[Prisma] --- TRACE ERROR ---:", err.message);
    if (err.stack) console.error(err.stack);
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
