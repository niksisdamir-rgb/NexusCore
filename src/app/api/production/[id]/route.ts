import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ─── GET /api/production/[id] ─────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.productionOrder.findUnique({
      where: { id: Number(id) },
      include: {
        recipe: true,
        DeliveryNote: true,
      },
    });
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── PATCH /api/production/[id] ───────────────────────────────────────────
// Advances order status and optionally updates quantity.
// Valid transitions: PENDING → IN_PROGRESS → COMPLETED | CANCELLED
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, quantity } = body;

    const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await prisma.productionOrder.update({
      where: { id: Number(id) },
      data: {
        ...(status !== undefined && { status }),
        ...(quantity !== undefined && { quantity: Number(quantity) }),
      },
      include: { recipe: true },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── DELETE /api/production/[id] ──────────────────────────────────────────
// Soft-cancel: sets status to CANCELLED rather than hard delete.
// Only PENDING orders can be cancelled.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.productionOrder.findUnique({ where: { id: Number(id) } });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    if (order.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Cannot cancel a completed order" },
        { status: 409 }
      );
    }

    const cancelled = await prisma.productionOrder.update({
      where: { id: Number(id) },
      data: { status: "CANCELLED" },
      include: { recipe: true },
    });

    return NextResponse.json({ success: true, order: cancelled, message: "Order cancelled" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
