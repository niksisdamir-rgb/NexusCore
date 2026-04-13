import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ─── GET /api/recipes/[id] ────────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipe = await prisma.recipe.findUnique({
      where: { id: Number(id) },
      include: { ProductionOrder: { select: { id: true, status: true, quantity: true } } },
    });
    if (!recipe) {
      return NextResponse.json({ success: false, error: "Recipe not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, recipe });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── PUT /api/recipes/[id] ────────────────────────────────────────────────
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, cementAmount, waterAmount, sandAmount, gravelAmount, admixtureAmount } = body;

    const updated = await prisma.recipe.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(cementAmount !== undefined && { cementAmount: Number(cementAmount) }),
        ...(waterAmount !== undefined && { waterAmount: Number(waterAmount) }),
        ...(sandAmount !== undefined && { sandAmount: Number(sandAmount) }),
        ...(gravelAmount !== undefined && { gravelAmount: Number(gravelAmount) }),
        ...(admixtureAmount !== undefined && { admixtureAmount: admixtureAmount ? Number(admixtureAmount) : null }),
      },
    });

    return NextResponse.json({ success: true, recipe: updated });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Recipe not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── DELETE /api/recipes/[id] ─────────────────────────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Guard: cannot delete if recipe has production orders
    const orderCount = await prisma.productionOrder.count({
      where: { recipeId: Number(id) },
    });
    if (orderCount > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete: recipe is used in ${orderCount} production order(s)` },
        { status: 409 }
      );
    }

    await prisma.recipe.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true, message: "Recipe deleted" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Recipe not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
