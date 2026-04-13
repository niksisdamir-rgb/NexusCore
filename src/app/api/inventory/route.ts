import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ─── GET /api/inventory ───────────────────────────────────────────────────
// Returns all materials sorted by fill percentage (lowest first = most urgent)
export async function GET() {
  try {
    const items = await prisma.inventory.findMany({
      orderBy: { material: "asc" },
    });

    // Attach computed fill percentage and low-stock flag
    const enriched = items.map((item) => ({
      ...item,
      fillPercent: Math.round((item.amount / item.capacity) * 100),
      isLow: item.amount <= item.lowThreshold,
    }));

    const lowCount = enriched.filter((i) => i.isLow).length;

    return NextResponse.json({
      success: true,
      count: items.length,
      lowStockCount: lowCount,
      inventory: enriched,
    });
  } catch (error: any) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── POST /api/inventory ──────────────────────────────────────────────────
// Create a new inventory item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { material, amount, capacity, unit = "kg", lowThreshold = 0 } = body;

    if (!material || amount === undefined || capacity === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: material, amount, capacity" },
        { status: 400 }
      );
    }

    const item = await prisma.inventory.create({
      data: {
        material,
        amount: Number(amount),
        capacity: Number(capacity),
        unit,
        lowThreshold: Number(lowThreshold),
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A material with that name already exists" },
        { status: 409 }
      );
    }
    console.error("Error creating inventory item:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
