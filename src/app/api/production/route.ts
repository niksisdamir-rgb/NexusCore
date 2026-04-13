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
