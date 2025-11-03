/*
  Warnings:

  - Added the required column `location` to the `google_sheet_configs` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_google_sheet_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "spreadsheetId" TEXT NOT NULL,
    "sheetName" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_google_sheet_configs" ("createdAt", "credentials", "id", "isActive", "sheetName", "shopDomain", "spreadsheetId", "updatedAt") SELECT "createdAt", "credentials", "id", "isActive", "sheetName", "shopDomain", "spreadsheetId", "updatedAt" FROM "google_sheet_configs";
DROP TABLE "google_sheet_configs";
ALTER TABLE "new_google_sheet_configs" RENAME TO "google_sheet_configs";
CREATE UNIQUE INDEX "google_sheet_configs_shopDomain_location_key" ON "google_sheet_configs"("shopDomain", "location");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
