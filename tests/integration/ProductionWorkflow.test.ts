import { prisma } from '../setup';
// Note: We are testing the logic directly or via API mock? 
// Since we don't have a running server in Jest easily, we might test the database logic.
// However, the logic is in the Next.js route.
// For a true integration test, we'd need to mock Request/Response and call the route handler.

import { PATCH } from '@/app/api/production/[id]/route';
import { NextRequest } from 'next/server';

describe('Production Workflow Integration', () => {
  let recipeId: number;

  beforeEach(async () => {
    // Clean and seed
    await prisma.deliveryNote.deleteMany();
    await prisma.productionOrder.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.recipe.deleteMany();

    const recipe = await prisma.recipe.create({
      data: {
        name: 'Test Recipe',
        cementAmount: 100,
        sandAmount: 200,
        gravelAmount: 300,
        waterAmount: 50,
      }
    });
    recipeId = recipe.id;

    await prisma.inventory.createMany({
      data: [
        { material: 'Cement CEM I 42.5R', amount: 1000, capacity: 5000 },
        { material: 'Pijesak 0-4mm', amount: 2000, capacity: 5000 },
        { material: 'Šljunak 8-16mm', amount: 3000, capacity: 5000 },
        { material: 'Voda', amount: 500, capacity: 5000 },
      ]
    });
  });

  it('should deduct inventory when an order is completed', async () => {
    // 1. Create a pending order for 2m3
    const order = await prisma.productionOrder.create({
      data: {
        recipeId,
        quantity: 2,
        status: 'PENDING'
      }
    });

    // 2. Wrap the API call
    const req = new NextRequest(`http://localhost/api/production/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' })
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: order.id.toString() }) });
    const data = await res.json();

    expect(data.success).toBe(true);

    // 3. Verify Inventory
    const cement = await prisma.inventory.findUnique({ where: { material: 'Cement CEM I 42.5R' } });
    const sand = await prisma.inventory.findUnique({ where: { material: 'Pijesak 0-4mm' } });

    // Initial 1000 - (recipe 100 * qty 2) = 800
    expect(cement?.amount).toBe(800);
    // Initial 2000 - (recipe 200 * qty 2) = 1600
    expect(sand?.amount).toBe(1600);

    // 4. Verify Order Status
    const updatedOrder = await prisma.productionOrder.findUnique({ where: { id: order.id } });
    expect(updatedOrder?.status).toBe('COMPLETED');
  });

  it('should not allow double depletion', async () => {
    const order = await prisma.productionOrder.create({
      data: { recipeId, quantity: 1, status: 'COMPLETED' }
    });

    const req = new NextRequest(`http://localhost/api/production/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' })
    });

    await PATCH(req, { params: Promise.resolve({ id: order.id.toString() }) });
    
    // Inventory should still be full (since it was already completed, we assume it was deducted then)
    // Wait, in beforeEach we reset it. So if we start with 1000 and order is ALREADY completed, 
    // the route returns "already completed" and does NO depletion.
    const cement = await prisma.inventory.findUnique({ where: { material: 'Cement CEM I 42.5R' } });
    expect(cement?.amount).toBe(1000); 
  });
});
