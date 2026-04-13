import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { orderId, mixerLoad, temperature, humidity, vibrationLevel } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 });
    }

    // Verify order exists and is in a state that allows logging (optional but good)
    const order = await prisma.productionOrder.findUnique({
      where: { id: Number(orderId) }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const log = await prisma.telemetryLog.create({
      data: {
        orderId: Number(orderId),
        mixerLoad: Number(mixerLoad || 0),
        temperature: Number(temperature || 0),
        humidity: Number(humidity || 0),
        vibrationLevel: Number(vibrationLevel || 0),
        timestamp: new Date()
      }
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error: any) {
    console.error("[Telemetry Archive] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
