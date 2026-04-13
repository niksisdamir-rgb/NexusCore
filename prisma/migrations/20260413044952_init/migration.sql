/*
  Warnings:

  - Added the required column `updatedAt` to the `ProductionOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "totalVolume" REAL NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TelemetryLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "mixerLoad" REAL NOT NULL,
    "temperature" REAL NOT NULL,
    "humidity" REAL NOT NULL,
    "vibrationLevel" REAL NOT NULL DEFAULT 0,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TelemetryLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ProductionOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductionOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipeId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "operatorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductionOrder_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductionOrder_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProductionOrder" ("createdAt", "id", "quantity", "recipeId", "status") SELECT "createdAt", "id", "quantity", "recipeId", "status" FROM "ProductionOrder";
DROP TABLE "ProductionOrder";
ALTER TABLE "new_ProductionOrder" RENAME TO "ProductionOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Shift_userId_idx" ON "Shift"("userId");

-- CreateIndex
CREATE INDEX "TelemetryLog_orderId_idx" ON "TelemetryLog"("orderId");

-- CreateIndex
CREATE INDEX "TelemetryLog_timestamp_idx" ON "TelemetryLog"("timestamp");
