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

function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

const prisma = createClient();



async function main() {
  console.log("🌱 Seeding Elkonmix-90 database...");

  // ─── Clear existing data ──────────────────────────────────────────────────
  await prisma.productionOrder.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.operator.deleteMany();

  // ─── Operators ────────────────────────────────────────────────────────────
  const admin = await prisma.operator.create({
    data: { name: "Amir Hodžić", role: "ADMIN" },
  });
  const op1 = await prisma.operator.create({
    data: { name: "Senad Kovač", role: "OPERATOR" },
  });
  console.log(`  ✓ Created ${2} operators`);

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

  console.log(`  ✓ Created 3 recipes`);

  // ─── Production Orders ────────────────────────────────────────────────────
  await prisma.productionOrder.createMany({
    data: [
      { recipeId: rc30.id, quantity: 30, status: "COMPLETED" },
      { recipeId: rc30.id, quantity: 20, status: "COMPLETED" },
      { recipeId: rc40.id, quantity: 15, status: "IN_PROGRESS" },
      { recipeId: rc20.id, quantity: 10, status: "PENDING" },
      { recipeId: rc40.id, quantity: 25, status: "PENDING" },
    ],
  });
  console.log(`  ✓ Created 5 production orders`);

  // ─── Inventory ────────────────────────────────────────────────────────────
  await prisma.inventory.createMany({
    data: [
      { material: "Cement CEM I 42.5R", amount: 18500, capacity: 30000 },
      { material: "Pijesak 0-4mm",       amount: 42000, capacity: 80000 },
      { material: "Šljunak 8-16mm",      amount: 35000, capacity: 80000 },
      { material: "Šljunak 16-32mm",     amount: 28000, capacity: 60000 },
      { material: "Voda",                amount: 12000, capacity: 20000 },
      { material: "Aditiv Sika ViscoCrete", amount: 850, capacity: 2000 },
    ],
  });
  console.log(`  ✓ Created 6 inventory items`);

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
