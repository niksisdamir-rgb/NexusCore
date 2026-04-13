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
