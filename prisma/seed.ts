/**
 * prisma/seed.ts
 * Seeds the Elkonmix-90 database with realistic starter data.
 * Run with: npx tsx prisma/seed.ts  (or: npx prisma db seed)
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as bcrypt from "bcryptjs";

function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

async function main() {
  console.log("🌱 Seeding Elkonmix-90 database...\n");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // ─── Clear all data (order matters due to FK constraints) ─────────────────
  await prisma.auditLog.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.deliveryNote.deleteMany();
  await prisma.telemetryLog.deleteMany();
  await prisma.maintenanceTicket.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.siloRefillOrder.deleteMany();

  // ─── Operators ────────────────────────────────────────────────────────────
  const admin = await prisma.operator.create({
    data: { 
      name: "Amir Hodžić", 
      email: "admin@elkonmix.com",
      username: "amir_admin",
      password: hashedPassword,
      role: "MANAGER" 
    },
  });
  const op1 = await prisma.operator.create({
    data: { 
      name: "Senad Kovač", 
      email: "operator@elkonmix.com",
      username: "senad_op",
      password: hashedPassword,
      role: "OPERATOR" 
    },
  });
  const op2 = await prisma.operator.create({
    data: { 
      name: "Lejla Bašić", 
      email: "viewer@elkonmix.com",
      username: "lejla_view",
      password: hashedPassword,
      role: "VIEWER" 
    },
  });

  // ─── Phase 6: Assets ──────────────────────────────────────────────────────
  const mixerAsset = await prisma.asset.create({
    data: {
      name: "Glavna Mešalica (Turbo)",
      type: "MOTOR",
      expectedLife: 10000,
      currentUsage: 2450,
      healthScore: 82,
      status: "OPERATIONAL"
    }
  });

  const beltAsset = await prisma.asset.create({
    data: {
      name: "Transportna Traka 1",
      type: "CONVEYOR",
      expectedLife: 5000,
      currentUsage: 4100,
      healthScore: 45,
      status: "OPERATIONAL"
    }
  });

  const screwAsset = await prisma.asset.create({
    data: {
      name: "Cementni Puž S1",
      type: "MOTOR",
      expectedLife: 8000,
      currentUsage: 1200,
      healthScore: 95,
      status: "OPERATIONAL"
    }
  });

  await prisma.maintenanceTicket.create({
    data: {
      assetId: beltAsset.id,
      title: "Habanje ivice trake",
      description: "Traka 1 pokazuje znake bočnog habanja. Potrebna centriranje.",
      priority: "HIGH",
      status: "OPEN"
    }
  });

  await prisma.maintenanceLog.create({
    data: {
      assetId: mixerAsset.id,
      action: "SERVICE",
      description: "Redovna zamena ulja u reduktoru i provera lopatica.",
      performedBy: "Ekipa Održavanja",
      cost: 450
    }
  });

  console.log("  ✓ Created 3 operators with hashed passwords");

  // ─── Recipes ──────────────────────────────────────────────────────────────
  const rc30 = await prisma.recipe.create({
    data: {
      name: "C30/37 XC4",
      cementAmount: 320,
      waterAmount: 170,
      sandAmount: 820,
      gravelAmount: 1050,
      admixtureAmount: 3.5,
    },
  });
  const rc40 = await prisma.recipe.create({
    data: {
      name: "C40/50 XF4",
      cementAmount: 380,
      waterAmount: 160,
      sandAmount: 780,
      gravelAmount: 1100,
      admixtureAmount: 5.2,
    },
  });
  const rc20 = await prisma.recipe.create({
    data: {
      name: "C20/25 XC1",
      cementAmount: 270,
      waterAmount: 190,
      sandAmount: 850,
      gravelAmount: 1000,
      admixtureAmount: null,
    },
  });
  console.log("  ✓ Created 3 recipes");

  // ─── Production Orders ────────────────────────────────────────────────────
  const [o1, o2, o3, o4, o5] = await Promise.all([
    prisma.productionOrder.create({ data: { recipeId: rc30.id, quantity: 30, status: "COMPLETED" } }),
    prisma.productionOrder.create({ data: { recipeId: rc30.id, quantity: 20, status: "COMPLETED" } }),
    prisma.productionOrder.create({ data: { recipeId: rc40.id, quantity: 15, status: "IN_PROGRESS" } }),
    prisma.productionOrder.create({ data: { recipeId: rc20.id, quantity: 10, status: "PENDING" } }),
    prisma.productionOrder.create({ data: { recipeId: rc40.id, quantity: 25, status: "PENDING" } }),
  ]);
  console.log("  ✓ Created 5 production orders");

  // ─── Inventory (with unit + lowThreshold) ─────────────────────────────────
  await prisma.inventory.createMany({
    data: [
      { material: "Cement CEM I 42.5R",    amount: 18500, capacity: 30000, unit: "kg", lowThreshold: 5000  },
      { material: "Pijesak 0-4mm",          amount: 42000, capacity: 80000, unit: "kg", lowThreshold: 10000 },
      { material: "Šljunak 8-16mm",         amount: 35000, capacity: 80000, unit: "kg", lowThreshold: 10000 },
      { material: "Šljunak 16-32mm",        amount: 28000, capacity: 60000, unit: "kg", lowThreshold: 8000  },
      { material: "Voda",                   amount: 12000, capacity: 20000, unit: "L",  lowThreshold: 3000  },
      { material: "Aditiv Sika ViscoCrete", amount:   850, capacity:  2000, unit: "L",  lowThreshold:  200  },
    ],
  });
  console.log("  ✓ Created 6 inventory items (with unit + lowThreshold)");

  // ─── Delivery Notes (Otpremnice) ──────────────────────────────────────────
  // Only COMPLETED orders can have delivery notes
  await prisma.deliveryNote.createMany({
    data: [
      {
        orderId:    o1.id,
        clientName: "Građevinar d.o.o. Sarajevo",
        truckPlate: "S58-K-123",
        volumeM3:   30,
      },
      {
        orderId:    o2.id,
        clientName: "Beton Gradnja Mostar",
        truckPlate: "M12-A-456",
        volumeM3:   20,
      },
    ],
  });
  console.log("  ✓ Created 2 delivery notes");

  // ─── Sensor Readings ──────────────────────────────────────────────────────
  const sensors = [
    { sensorId: "cement_silo_1",   sensorType: "LEVEL",       value: 61.7, unit: "%" },
    { sensorId: "sand_bin_1",      sensorType: "LEVEL",       value: 52.5, unit: "%" },
    { sensorId: "gravel_bin_1",    sensorType: "LEVEL",       value: 43.8, unit: "%" },
    { sensorId: "water_tank_1",    sensorType: "LEVEL",       value: 60.0, unit: "%" },
    { sensorId: "mixer_temp",      sensorType: "TEMPERATURE",  value: 18.3, unit: "°C" },
    { sensorId: "mixer_speed",     sensorType: "FLOW",        value: 22.5, unit: "RPM" },
    { sensorId: "admix_pump_1",    sensorType: "FLOW",        value:  4.2, unit: "L/min" },
    { sensorId: "output_scale_1",  sensorType: "WEIGHT",      value: 2450, unit: "kg" },
  ];
  await prisma.sensorReading.createMany({ data: sensors });
  console.log("  ✓ Created 8 sensor readings");

  // ─── Audit Log ────────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { action: "CREATE", entityType: "Recipe",          entityId: rc30.id, operatorId: admin.id, description: "Created recipe C30/37 XC4" },
      { action: "CREATE", entityType: "Recipe",          entityId: rc40.id, operatorId: admin.id, description: "Created recipe C40/50 XF4" },
      { action: "CREATE", entityType: "ProductionOrder", entityId: o1.id,   operatorId: op1.id,   description: "Created order 30m³ C30/37" },
      { action: "STATUS_CHANGE", entityType: "ProductionOrder", entityId: o1.id, operatorId: op1.id, description: "Order marked COMPLETED" },
      { action: "CREATE", entityType: "DeliveryNote",    entityId: o1.id,   operatorId: op1.id,   description: "Otpremnica za Građevinar Sarajevo" },
    ],
  });
  console.log("  ✓ Created 5 audit log entries");

  // ─── Phase 7: Logistics & Fleet ───────────────────────────────────────────
  await prisma.vehicle.createMany({
    data: [
      { id: "T-01", plate: "BG-123-AA", driver: "Marko M.", status: "TRANSIT", progress: 65, destination: "Gradilište 'West 65'", currentLoad: 9, currentOrderId: "ORD-5501", radarX: 120, radarY: 45 },
      { id: "T-02", plate: "BG-456-BB", driver: "Nikola P.", status: "LOADING", progress: 20, destination: "Zemun Polje", currentLoad: 7, currentOrderId: "ORD-5502", radarX: 5, radarY: 5 },
      { id: "T-03", plate: "BG-789-CC", driver: "Jovan S.", status: "DELIVERING", progress: 100, destination: "Novi Beograd", currentLoad: 9, currentOrderId: "ORD-5498", radarX: 240, radarY: -110 },
      { id: "T-04", plate: "NS-101-DD", driver: "Stefan T.", status: "RETURNING", progress: 40, destination: "Pogon Elkonmix-90", currentLoad: 0, radarX: 80, radarY: -30 },
      { id: "T-05", plate: "BG-202-EE", driver: "Petar I.", status: "IDLE", progress: 0, radarX: -10, radarY: -10 },
    ],
  });
  console.log("  ✓ Created 5 vehicles");

  const cementInventory = await prisma.inventory.findFirst({ where: { material: { contains: "Cement" } } });
  if (cementInventory) {
    await prisma.siloRefillOrder.create({
      data: {
        inventoryId: cementInventory.id,
        material: cementInventory.material,
        quantity: 11500,
        unit: "kg",
        status: "IN_TRANSIT",
        provider: "Holcim Ltd.",
      }
    });
    console.log("  ✓ Created 1 silo refill order");
  }

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
