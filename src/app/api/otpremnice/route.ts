import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ─── GET /api/otpremnice ──────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientFilter = searchParams.get("client");

    const notes = await prisma.deliveryNote.findMany({
      where: clientFilter
        ? { clientName: { contains: clientFilter } }
        : undefined,
      include: {
        order: {
          include: { recipe: { select: { id: true, name: true } } },
        },
      },
      orderBy: { deliveredAt: "desc" },
    });

    return NextResponse.json({ success: true, count: notes.length, notes });
  } catch (error: any) {
    console.error("Error fetching delivery notes:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── POST /api/otpremnice ─────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, clientName, truckPlate, volumeM3 } = body;

    if (!orderId || !clientName || !truckPlate || volumeM3 === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: orderId, clientName, truckPlate, volumeM3" },
        { status: 400 }
      );
    }

    // Validate the order exists and is COMPLETED
    const order = await prisma.productionOrder.findUnique({ where: { id: Number(orderId) } });
    if (!order) {
      return NextResponse.json({ success: false, error: "Production order not found" }, { status: 404 });
    }
    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Delivery note can only be created for COMPLETED orders" },
        { status: 422 }
      );
    }

    const note = await prisma.deliveryNote.create({
      data: {
        orderId: Number(orderId),
        clientName,
        truckPlate,
        volumeM3: Number(volumeM3),
      },
      include: {
        order: { include: { recipe: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A delivery note already exists for this order" },
        { status: 409 }
      );
    }
    console.error("Error creating delivery note:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
