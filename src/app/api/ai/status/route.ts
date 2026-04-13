/**
 * GET /api/ai/status
 *
 * Returns the current state of the NexusCore background worker
 * and confirms Gemini API key is configured.
 */

import { NextResponse } from "next/server";
import { getWorkerStatus } from "@/ai/workers/BackgroundWorker";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const worker = getWorkerStatus();

    // DB ping
    let dbOk = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {}

    // Sensor reading count (quick indicator of worker activity)
    const sensorCount = await prisma.sensorReading.count();

    const status = {
      ok: true,
      timestamp: new Date().toISOString(),
      services: {
        database: dbOk ? "UP" : "DOWN",
        geminiApiKey: !!process.env.GEMINI_API_KEY ? "CONFIGURED" : "MISSING",
        backgroundWorker: worker.running ? "RUNNING" : "STOPPED",
      },
      worker: {
        running: worker.running,
        startedAt: worker.startedAt?.toISOString() ?? null,
        lastRunAt: worker.lastRunAt?.toISOString() ?? null,
        lastError: worker.lastError,
        totalRuns: worker.totalRuns,
        totalSensorReadings: sensorCount,
      },
    };

    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
