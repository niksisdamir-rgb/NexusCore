const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const xlsx = require('xlsx');
const path = require('path');

const adapter = new PrismaBetterSqlite3({ url: `file:prisma/dev.db` });
const prisma = new PrismaClient({ adapter });

function parseDate(dStr) {
  if (!dStr) return null;
  const [datePart, timePart] = String(dStr).split(" ");
  if (!datePart || !timePart) return null;
  const [y, m, d] = datePart.split(".");
  const [h, min, s] = timePart.split(":");
  const dt = new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0, s || 0);
  if (isNaN(dt.getTime())) return null;
  return dt;
}

async function main() {
  const filePath = path.resolve('real data/Report.xlsx');
  const wb = xlsx.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(ws);

  console.log(`Searching through ${data.length} rows...`);

  let imported = 0;
  // skip header string which is row index 0
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    const orderNumber = String(row['Rezultati proizvodnje '] || '').trim();
    if (!orderNumber || orderNumber === '' || orderNumber.toLowerCase().includes('total') || orderNumber.toLowerCase().includes('zbir') || orderNumber === 'Broj narudžbe') continue;

    const prodStartTimeRaw = row['Rezultati proizvodnje _1'];
    const prodEndTimeRaw = row['Rezultati proizvodnje _3'];
    const quantityStr = row['Rezultati proizvodnje _5'];
    const clientName = row['Rezultati proizvodnje _7'] || "Unknown Client";
    const recipeFullName = row['Rezultati proizvodnje _9'] || "Unknown Recipe";
    const siteName = row['Rezultati proizvodnje _13'];
    const truckPlate = row['Rezultati proizvodnje _15'];

    const quantity = parseFloat(quantityStr) || 0;
    
    if (quantity === 0) continue;

    const pStart = parseDate(prodStartTimeRaw) || new Date();
    const pEnd = parseDate(prodEndTimeRaw) || new Date();

    // Look up recipe
    const cleanRecipe = String(recipeFullName).trim();
    let recipe = await prisma.recipe.findFirst({
      where: { name: cleanRecipe }
    });
    
    if (!recipe) {
      recipe = await prisma.recipe.create({
        data: {
          name: cleanRecipe,
          cementAmount: 200,
          waterAmount: 180,
          sandAmount: 1000,
          gravelAmount: 1000,
          admixtureAmount: 0
        }
      });
    }

    const order = await prisma.productionOrder.create({
      data: {
        recipeId: recipe.id,
        quantity,
        status: 'COMPLETED',
        createdAt: pStart,
        updatedAt: pEnd,
      }
    });

    await prisma.deliveryNote.create({
      data: {
        orderId: order.id,
        clientName: String(clientName).trim(),
        siteName: siteName ? String(siteName).trim() : null,
        truckPlate: truckPlate ? String(truckPlate).trim() : null,
        volumeM3: quantity,
        deliveredAt: pEnd,
        recipeFullName: cleanRecipe,
        orderNumber: orderNumber,
        productionStartTime: pStart,
        productionEndTime: pEnd,
      }
    });

    imported++;
  }

  console.log(`Successfully imported ${imported} reports (production orders + delivery notes).`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
