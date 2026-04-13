const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

async function test() {
  console.log("--- TEST LOGISTICS START ---");

  // 1. Check current status
  let vehicles = await prisma.vehicle.findMany();
  console.log(`Current vehicles: ${vehicles.length}`);
  vehicles.forEach(v => console.log(`  ${v.id}: ${v.status} (${v.radarX}, ${v.radarY})`));

  // 2. Mock a sync tick (I'll just look at the code for /api/logistics/sync)
  // Since I can't easily trigger the API without a server, I'll just check if the model is updated correctly.
  
  // 3. Test Refill Automation Trigger
  // Lower inventory of Cement
  const cement = await prisma.inventory.findFirst({ where: { material: { contains: "Cement" } } });
  if (cement) {
     console.log(`Cement level: ${cement.amount}`);
     await prisma.inventory.update({
        where: { id: cement.id },
        data: { amount: 2000 } // Below threshold (5000)
     });
     console.log("Cement level lowered to 2000.");
  }

  // Check if we can trigger the logic manually here
  const lowStock = await prisma.inventory.findMany({
    where: {
      amount: { lte: prisma.inventory.fields.lowThreshold as any }
    }
  });
  console.log(`Low stock items found: ${lowStock.length}`);
  
  console.log("--- TEST LOGISTICS END ---");
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
