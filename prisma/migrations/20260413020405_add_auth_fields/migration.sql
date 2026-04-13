/*
  Warnings:

  - Added the required column `email` to the `Operator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Operator` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Operator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL
);
INSERT INTO "new_Operator" ("id", "name", "role") SELECT "id", "name", "role" FROM "Operator";
DROP TABLE "Operator";
ALTER TABLE "new_Operator" RENAME TO "Operator";
CREATE UNIQUE INDEX "Operator_email_key" ON "Operator"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
