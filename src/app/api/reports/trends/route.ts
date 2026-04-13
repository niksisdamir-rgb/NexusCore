import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("id") || "mixer_temp";
  const hours = parseInt(searchParams.get("hours") || "24");
  
  const since = new Date();
  since.setHours(since.getHours() - hours);

  try {
    // Fetch individual readings for the requested sensor
    const readings = await prisma.sensorReading.findMany({
      where: {
        sensorId,
        recordedAt: {
          gte: since,
        },
      },
      orderBy: {
        recordedAt: "asc",
      },
      select: {
        value: true,
        recordedAt: true,
      }
    });

    // Sample data to avoid sending thousands of points to the client
    // We aim for ~100-200 points for a smooth chart
    const targetPoints = 150;
    let sampledData = readings;

    if (readings.length > targetPoints) {
      const step = Math.ceil(readings.length / targetPoints);
      sampledData = readings.filter((_, i) => i % step === 0);
    }

    return NextResponse.json({
      success: true,
      sensorId,
      hours,
      count: sampledData.length,
      data: sampledData.map(r => ({
        time: r.recordedAt.toISOString(),
        value: r.value
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
