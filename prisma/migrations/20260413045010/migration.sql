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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductionOrder_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductionOrder_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProductionOrder" ("createdAt", "id", "operatorId", "quantity", "recipeId", "status", "updatedAt") SELECT "createdAt", "id", "operatorId", "quantity", "recipeId", "status", "updatedAt" FROM "ProductionOrder";
DROP TABLE "ProductionOrder";
ALTER TABLE "new_ProductionOrder" RENAME TO "ProductionOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
