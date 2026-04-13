import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ─── GET /api/sensors ─────────────────────────────────────────────────────
// Returns the LATEST reading per sensorId.
// Optionally filter by ?type=LEVEL
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type");

    // Fetch all readings then group by sensorId — SQLite lacks native window fns
    const all = await prisma.sensorReading.findMany({
      where: typeFilter ? { sensorType: typeFilter } : undefined,
      orderBy: { recordedAt: "desc" },
    });

    // Keep only the latest reading per sensorId
    const latestMap = new Map<string, typeof all[number]>();
    for (const reading of all) {
      if (!latestMap.has(reading.sensorId)) {
        latestMap.set(reading.sensorId, reading);
      }
    }

    const latest = Array.from(latestMap.values());
    return NextResponse.json({ success: true, count: latest.length, sensors: latest });
  } catch (error: any) {
    console.error("Error fetching sensor readings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── POST /api/sensors ────────────────────────────────────────────────────
// Ingest a new sensor reading (called by mock daemon or real PLC).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sensorId, sensorType, value, unit } = body;

    if (!sensorId || !sensorType || value === undefined || !unit) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: sensorId, sensorType, value, unit" },
        { status: 400 }
      );
    }

    const VALID_TYPES = ["LEVEL", "TEMPERATURE", "PRESSURE", "FLOW", "WEIGHT"];
    if (!VALID_TYPES.includes(sensorType)) {
      return NextResponse.json(
        { success: false, error: `Invalid sensorType. Must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const reading = await prisma.sensorReading.create({
      data: {
        sensorId,
        sensorType,
        value: Number(value),
        unit,
      },
    });

    return NextResponse.json({ success: true, reading });
  } catch (error: any) {
    console.error("Error ingesting sensor reading:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
