import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const logs = await prisma.telemetryLog.findMany({
      where: { orderId: Number(id) },
      orderBy: { timestamp: "asc" }
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("[Telemetry GET] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
