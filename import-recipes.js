const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const xlsx = require('xlsx');
const path = require('path');

const adapter = new PrismaBetterSqlite3({ url: `file:prisma/dev.db` });
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const filePath = path.resolve('real data/Recipe Data Table Transcription.xlsx');
  const wb = xlsx.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(ws);

  console.log(`Found ${data.length} recipes in the Excel file.`);

  let imported = 0;
  for (const row of data) {
    const name = row['Recipe Name'];
    if (!name || name === '-') continue;

    const cementAmount = Number(row['Cement 1'] || 0) + Number(row['Cement 2'] || 0);
    const waterAmount = Number(row['WAT 1'] || 0);
    const admixtureAmount = Number(row['Additive 1'] || 0) + Number(row['Additive 2'] || 0) + Number(row['Additive 3'] || 0);
    
    const sandAmount = Number(row['Aggregate 3'] || 0) + Number(row['Aggregate 4'] || 0);
    const gravelAmount = Number(row['Aggregate 1'] || 0) + Number(row['Aggregate 2'] || 0);

    await prisma.recipe.create({
      data: {
        name: String(name).trim(),
        cementAmount,
        waterAmount,
        sandAmount,
        gravelAmount,
        admixtureAmount,
      }
    });
    imported++;
  }

  console.log(`Successfully imported ${imported} recipes.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
