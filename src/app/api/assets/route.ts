import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        tickets: { orderBy: { createdAt: 'desc' } },
        logs: { orderBy: { timestamp: 'desc' }, take: 5 }
      },
      orderBy: { healthScore: 'asc' }
    });
    
    return NextResponse.json({ success: true, assets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, assetId, ticketId, data } = body;

    if (action === "RESOLVE_TICKET") {
       const ticket = await prisma.maintenanceTicket.update({
         where: { id: Number(ticketId) },
         data: { status: "RESOLVED" }
       });
       
       // Create log entry for resolution
       await prisma.maintenanceLog.create({
         data: {
           assetId: Number(assetId),
           action: "REPAIR",
           description: `Resolved ticket: ${ticket.title}. ${data?.note || ''}`,
           performedBy: data?.technician || "System"
         }
       });

       return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
