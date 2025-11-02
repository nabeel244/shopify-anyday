-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_google_sheet_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "spreadsheetId" TEXT NOT NULL,
    "sheetName" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_google_sheet_configs" ("createdAt", "credentials", "id", "sheetName", "shopDomain", "spreadsheetId", "updatedAt") SELECT "createdAt", "credentials", "id", "sheetName", "shopDomain", "spreadsheetId", "updatedAt" FROM "google_sheet_configs";
DROP TABLE "google_sheet_configs";
ALTER TABLE "new_google_sheet_configs" RENAME TO "google_sheet_configs";
CREATE UNIQUE INDEX "google_sheet_configs_shopDomain_key" ON "google_sheet_configs"("shopDomain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
