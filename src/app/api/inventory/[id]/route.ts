import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ─── GET /api/inventory/[id] ──────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.inventory.findUnique({ where: { id: Number(id) } });
    if (!item) {
      return NextResponse.json({ success: false, error: "Inventory item not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      item: {
        ...item,
        fillPercent: Math.round((item.amount / item.capacity) * 100),
        isLow: item.amount <= item.lowThreshold,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── PATCH /api/inventory/[id] ────────────────────────────────────────────
// Adjust material amount (consumption event or replenishment).
// Pass { delta: -500 } to consume 500 units, or { delta: 2000 } to replenish.
// Alternatively pass { amount } to set an absolute value.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { delta, amount, lowThreshold, capacity } = body;

    const current = await prisma.inventory.findUnique({ where: { id: Number(id) } });
    if (!current) {
      return NextResponse.json({ success: false, error: "Inventory item not found" }, { status: 404 });
    }

    let newAmount = current.amount;
    if (delta !== undefined) {
      newAmount = Math.max(0, current.amount + Number(delta));
    } else if (amount !== undefined) {
      newAmount = Math.max(0, Number(amount));
    }

    // Clamp to capacity
    newAmount = Math.min(newAmount, current.capacity);

    const updated = await prisma.inventory.update({
      where: { id: Number(id) },
      data: {
        amount: newAmount,
        ...(lowThreshold !== undefined && { lowThreshold: Number(lowThreshold) }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        ...updated,
        fillPercent: Math.round((updated.amount / updated.capacity) * 100),
        isLow: updated.amount <= updated.lowThreshold,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
