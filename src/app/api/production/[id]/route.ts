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
    const { status, quantity } = await req.json();

    const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // ─ Logic for Inventory Depletion on Completion ─
    if (status === "COMPLETED") {
      const order = await prisma.productionOrder.findUnique({
        where: { id: Number(id) },
        include: { recipe: true },
      });

      if (!order) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
      }

      // Avoid double depletion
      if (order.status === "COMPLETED") {
        return NextResponse.json({ success: true, order, message: "Order already completed" });
      }

      const { recipe, quantity } = order;

      // Wrap in transaction to ensure integrity
      const [updatedOrder] = await prisma.$transaction([
        // 1. Update order status
        prisma.productionOrder.update({
          where: { id: Number(id) },
          data: { status: "COMPLETED" },
          include: { recipe: true }
        }),
        // 2. Deduct materials
        prisma.inventory.update({
          where: { material: "Cement CEM I 42.5R" },
          data: { amount: { decrement: recipe.cementAmount * quantity } }
        }),
        prisma.inventory.update({
          where: { material: "Pijesak 0-4mm" },
          data: { amount: { decrement: recipe.sandAmount * quantity } }
        }),
        prisma.inventory.update({
          where: { material: "Šljunak 8-16mm" },
          data: { amount: { decrement: recipe.gravelAmount * quantity } }
        }),
        prisma.inventory.update({
          where: { material: "Voda" },
          data: { amount: { decrement: recipe.waterAmount * quantity } }
        }),
        // Optional admixture
        ...(recipe.admixtureAmount ? [
          prisma.inventory.update({
            where: { material: "Aditiv Sika ViscoCrete" },
            data: { amount: { decrement: recipe.admixtureAmount * quantity } }
          })
        ] : [])
      ]);

      return NextResponse.json({ success: true, order: updatedOrder });
    }

    // Default status/quantity update (non-COMPLETED)
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
    console.error("[Production PATCH] Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Record not found (Check inventory material names)" }, { status: 404 });
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
