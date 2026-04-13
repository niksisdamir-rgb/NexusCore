import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const status: any = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: "unknown",
    environment: process.env.NODE_ENV,
  };

  try {
    // Simple query to check DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    status.database = "healthy";
  } catch (error) {
    console.error("[Health Check] Database connection failed:", error);
    status.database = "unhealthy";
    return NextResponse.json(status, { status: 503 });
  }

  return NextResponse.json(status);
}
