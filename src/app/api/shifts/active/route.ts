import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const hour = now.getHours();
    
    // Determine shift type based on 12h blocks (07:00-19:00 and 19:00-07:00)
    const isDayShift = hour >= 7 && hour < 19;
    const shiftType = isDayShift ? "DAY" : "NIGHT";
    
    // Calculate shift start time
    const shiftStart = new Date(now);
    shiftStart.setMinutes(0, 0, 0);
    if (isDayShift) {
      shiftStart.setHours(7);
    } else {
      if (hour < 7) {
        shiftStart.setDate(shiftStart.getDate() - 1);
      }
      shiftStart.setHours(19);
    }

    // Try to find an existing active shift record in the DB
    let activeShift = await prisma.shift.findFirst({
      where: {
        startTime: { gte: shiftStart },
        endTime: null
      },
      include: {
        operator: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    // If no active shift record, provide a "theoretical" one for the UI
    if (!activeShift) {
      // For demo/dev purposes, we'll assume the first operator is on duty if no one checked in
      const defaultOperator = await prisma.operator.findFirst({
         where: { role: { in: ["OPERATOR", "MANAGER"] } }
      });

      return NextResponse.json({
        success: true,
        isTheoretical: true,
        shiftType,
        startTime: shiftStart.toISOString(),
        operator: defaultOperator,
        message: "No operator has officially checked in for this shift."
      });
    }

    return NextResponse.json({
      success: true,
      isTheoretical: false,
      shift: activeShift,
      shiftType
    });

  } catch (error: any) {
    console.error("[Active Shift API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { operatorId, handoffNote } = body;

    if (!operatorId) {
      return NextResponse.json({ success: false, error: "Operator ID required" }, { status: 400 });
    }

    // Create a new shift record (Check-in)
    const newShift = await prisma.shift.create({
      data: {
        operatorId: Number(operatorId),
        handoffNote: handoffNote || null,
        startTime: new Date()
      },
      include: {
        operator: true
      }
    });

    return NextResponse.json({ success: true, shift: newShift });
  } catch (error: any) {
    console.error("[Shift Start API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
