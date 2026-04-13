import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Include the related Recipe data
    const orders = await prisma.productionOrder.findMany({
      include: {
        recipe: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    console.error("Error fetching production orders:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipeId, quantity, status = "PENDING" } = body;

    if (!recipeId || !quantity) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newOrder = await prisma.productionOrder.create({
      data: {
        recipeId: Number(recipeId),
        quantity: Number(quantity),
        status
      },
      include: {
        recipe: true
      }
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error("Error creating production order:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
