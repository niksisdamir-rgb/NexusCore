import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
  
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // 1. Fetch all completed production orders for the period
    const orders = await prisma.productionOrder.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "COMPLETED",
      },
      include: {
        recipe: true,
      },
    });

    // 2. Aggregate Material Consumption
    const totals = {
      volume: 0,
      cement: 0,
      water: 0,
      sand: 0,
      gravel: 0,
      admixture: 0,
    };

    const recipeStats: Record<string, { count: number; volume: number }> = {};

    orders.forEach((order) => {
      totals.volume += order.quantity;
      totals.cement += order.quantity * order.recipe.cementAmount;
      totals.water += order.quantity * order.recipe.waterAmount;
      totals.sand += order.quantity * order.recipe.sandAmount;
      totals.gravel += order.quantity * order.recipe.gravelAmount;
      totals.admixture += order.quantity * (order.recipe.admixtureAmount || 0);

      const rName = order.recipe.name;
      if (!recipeStats[rName]) {
        recipeStats[rName] = { count: 0, volume: 0 };
      }
      recipeStats[rName].count++;
      recipeStats[rName].volume += order.quantity;
    });

    // 3. Fetch Delivery Notes for the same period
    const notes = await prisma.deliveryNote.findMany({
      where: {
        deliveredAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        order: {
          include: {
            recipe: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      date: dateStr,
      summary: {
        orderCount: orders.length,
        totalVolume: totals.volume,
        consumption: {
          cement: totals.cement,
          water: totals.water,
          sand: totals.sand,
          gravel: totals.gravel,
          admixture: totals.admixture,
        },
        recipeStats: Object.entries(recipeStats).map(([name, stat]) => ({
          name,
          ...stat,
        })),
      },
      details: orders,
      deliveryNotes: notes
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
