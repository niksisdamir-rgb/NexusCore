import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { eventBus } from "@/lib/events";

// ─── POST /api/logistics/sync ──────────────────────────────────────────
// Simulates fleet movement and status transitions
export async function POST() {
  try {
    const vehicles = await prisma.vehicle.findMany();

    const updatedVehicles = [];

    for (const truck of vehicles) {
      if (truck.status === "IDLE") continue;

      let newProgress = truck.progress + (Math.random() * 5);
      let newStatus = truck.status;
      let newLat = truck.lastLat;
      let newLng = truck.lastLng;
      let newRadarX = truck.radarX;
      let newRadarY = truck.radarY;

      // Simple radial simulation
      if (truck.status === "TRANSIT") {
        newLat += (Math.random() - 0.4) * 0.001;
        newLng += (Math.random() - 0.5) * 0.001;
        newRadarX += (Math.random() - 0.2) * 2;
        newRadarY += (Math.random() - 0.5) * 2;
        if (newProgress >= 100) {
          newProgress = 0;
          newStatus = "DELIVERING";
        }
      } else if (truck.status === "LOADING") {
        if (newProgress >= 100) {
          newProgress = 0;
          newStatus = "TRANSIT";
        }
      } else if (truck.status === "DELIVERING") {
        if (newProgress >= 100) {
          newProgress = 0;
          newStatus = "RETURNING";
        }
      } else if (truck.status === "RETURNING") {
        // Move back toward plant origin
        newLat -= Math.sign(newLat) * 0.0005;
        newLng -= Math.sign(newLng) * 0.0005;
        newRadarX -= Math.sign(newRadarX) * 1.5;
        newRadarY -= Math.sign(newRadarY) * 1.5;
        if (newProgress >= 100) {
          newStatus = "IDLE";
          newProgress = 0;
        }
      }

      if (newStatus !== truck.status) {
        eventBus.emitEvent("VEHICLE_STATUS_CHANGE", {
          truckId: truck.id,
          number: truck.number,
          from: truck.status,
          to: newStatus
        });
      }

      const updated = await prisma.vehicle.update({
        where: { id: truck.id },
        data: {
          progress: Math.min(newProgress, 100),
          status: newStatus,
          lastLat: newLat,
          lastLng: newLng,
          radarX: newRadarX,
          radarY: newRadarY,
          lastUpdate: new Date(),
        },
      });
      updatedVehicles.push(updated);
    }

    // Also advance refill orders
    const activeRefillOrders = await prisma.siloRefillOrder.findMany({
      where: { status: { notIn: ["COMPLETED", "CANCELLED"] } }
    });

    for (const order of activeRefillOrders) {
      if (order.status === "PENDING") {
        await prisma.siloRefillOrder.update({
          where: { id: order.id },
          data: { status: "ORDERED" }
        });
      } else if (order.status === "ORDERED") {
        if (Math.random() > 0.7) {
          await prisma.siloRefillOrder.update({
            where: { id: order.id },
            data: { status: "IN_TRANSIT", eta: new Date(Date.now() + 15 * 60000) }
          });
        }
      } else if (order.status === "IN_TRANSIT") {
        if (Math.random() > 0.8) {
          const updatedRefill = await prisma.siloRefillOrder.update({
            where: { id: order.id },
            data: { status: "COMPLETED" },
            include: { inventory: true }
          });
          // Update actual inventory
          await prisma.inventory.update({
            where: { id: order.inventoryId },
            data: { amount: { increment: order.quantity } }
          });

          eventBus.emitEvent("SILO_REFILLED", {
            silo: updatedRefill.inventory.material,
            amount: order.quantity
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updatedVehicles.length,
      refillOrdersCount: activeRefillOrders.length,
    });
  } catch (error: any) {
    console.error("Error syncing logistics:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
