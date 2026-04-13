import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ─── POST /api/logistics/refill ──────────────────────────────────────────
// Logic to check inventory and trigger automated refill orders
export async function POST() {
  try {
    // 1. Get all materials with low stock
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        // Simple condition: amount <= lowThreshold
        // We only care about materials that need logistics (Cement, Admixtures)
        material: {
          contains: "Cement" // Simplified for demo, can be expanded
        }
      }
    });

    const createdOrders = [];

    for (const item of lowStockItems) {
      if (item.amount <= item.lowThreshold) {
        // Check if there is already an active refill order for this item
        const existingOrder = await prisma.siloRefillOrder.findFirst({
          where: {
            inventoryId: item.id,
            status: { notIn: ["COMPLETED", "CANCELLED"] }
          }
        });

        if (!existingOrder) {
          // Trigger automated refill
          // Calculate quantity: refill to full or at least 50%
          const refillQuantity = item.capacity - item.amount;
          
          const order = await prisma.siloRefillOrder.create({
            data: {
              inventoryId: item.id,
              material: item.material,
              quantity: refillQuantity,
              unit: item.unit,
              status: "PENDING",
              provider: item.material.includes("Cement") ? "Holcim Ltd." : "BASF Chemicals",
            }
          });
          createdOrders.push(order);
        }
      }
    }

    return NextResponse.json({
      success: true,
      triggeredCount: createdOrders.length,
      orders: createdOrders
    });
  } catch (error: any) {
    console.error("Error triggering refill automation:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
