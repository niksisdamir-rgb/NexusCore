import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { note, shiftId } = body;

    if (!note) {
      return NextResponse.json({ success: false, error: "Note is empty" }, { status: 400 });
    }

    // If shiftId is provided, update that shift record
    // Otherwise, update the most recent active shift for the user
    const operatorId = Number((session.user as any).id);
    
    const targetShift = shiftId 
      ? { id: Number(shiftId) }
      : await prisma.shift.findFirst({
          where: { operatorId, endTime: null },
          orderBy: { startTime: 'desc' }
        });

    if (!targetShift) {
       // Create a new shift if none active
       const newShift = await prisma.shift.create({
         data: {
           operatorId,
           handoffNote: note,
           startTime: new Date()
         }
       });
       return NextResponse.json({ success: true, shift: newShift });
    }

    const updatedShift = await prisma.shift.update({
      where: { id: targetShift.id },
      data: { handoffNote: note }
    });

    return NextResponse.json({ success: true, shift: updatedShift });

  } catch (error: any) {
    console.error("[Handoff API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
