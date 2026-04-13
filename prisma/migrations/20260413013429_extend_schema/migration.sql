-- CreateTable
CREATE TABLE "DeliveryNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "clientName" TEXT NOT NULL,
    "truckPlate" TEXT NOT NULL,
    "volumeM3" REAL NOT NULL,
    "deliveredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeliveryNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ProductionOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SensorReading" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sensorId" TEXT NOT NULL,
    "sensorType" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "operatorId" INTEGER,
    "description" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "material" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "capacity" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "lowThreshold" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Inventory" ("amount", "capacity", "id", "material", "updatedAt") SELECT "amount", "capacity", "id", "material", "updatedAt" FROM "Inventory";
DROP TABLE "Inventory";
ALTER TABLE "new_Inventory" RENAME TO "Inventory";
CREATE UNIQUE INDEX "Inventory_material_key" ON "Inventory"("material");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryNote_orderId_key" ON "DeliveryNote"("orderId");
