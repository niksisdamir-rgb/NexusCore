const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const INITIAL_VEHICLES = [
    { id: "T-01", plate: "BG-123-AA", driver: "Marko M.", status: "TRANSIT", progress: 65, destination: "Gradilište 'West 65'", currentLoad: 9, currentOrderId: "ORD-5501", radarX: 120, radarY: 45 },
    { id: "T-02", plate: "BG-456-BB", driver: "Nikola P.", status: "LOADING", progress: 20, destination: "Zemun Polje", currentLoad: 7, currentOrderId: "ORD-5502", radarX: 5, radarY: 5 },
    { id: "T-03", plate: "BG-789-CC", driver: "Jovan S.", status: "DELIVERING", progress: 100, destination: "Novi Beograd", currentLoad: 9, currentOrderId: "ORD-5498", radarX: 240, radarY: -110 },
    { id: "T-04", plate: "NS-101-DD", driver: "Stefan T.", status: "RETURNING", progress: 40, destination: "Pogon Elkonmix-90", currentLoad: 0, radarX: 80, radarY: -30 },
    { id: "T-05", plate: "BG-202-EE", driver: "Petar I.", status: "IDLE", progress: 0, radarX: -10, radarY: -10 },
  ];

  console.log("Seeding vehicles...");
  for (const v of INITIAL_VEHICLES) {
    await prisma.vehicle.upsert({
      where: { id: v.id },
      update: v,
      create: v,
    });
  }
  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
