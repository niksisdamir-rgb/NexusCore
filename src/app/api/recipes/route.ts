import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, count: recipes.length, recipes });
  } catch (error: any) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, cementAmount, waterAmount, sandAmount, gravelAmount, admixtureAmount } = body;

    if (!name || cementAmount === undefined || waterAmount === undefined || sandAmount === undefined || gravelAmount === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newRecipe = await prisma.recipe.create({
      data: {
        name,
        cementAmount: Number(cementAmount),
        waterAmount: Number(waterAmount),
        sandAmount: Number(sandAmount),
        gravelAmount: Number(gravelAmount),
        admixtureAmount: admixtureAmount ? Number(admixtureAmount) : null
      }
    });

    return NextResponse.json({ success: true, recipe: newRecipe });
  } catch (error: any) {
    console.error("Error creating recipe:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
