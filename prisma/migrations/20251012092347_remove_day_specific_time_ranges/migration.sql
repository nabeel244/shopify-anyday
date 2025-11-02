/*
  Warnings:

  - You are about to drop the column `daySpecificTimeRanges` on the `product_booking_configs` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_product_booking_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "productPrice" REAL NOT NULL,
    "productRating" REAL,
    "city" TEXT,
    "availableDays" TEXT NOT NULL,
    "timeSlots" TEXT,
    "timeRanges" TEXT,
    "timeRangeStart" TEXT,
    "timeRangeEnd" TEXT,
    "slotDuration" INTEGER,
    "disabledDates" TEXT,
    "services" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 480,
    "maxBookings" INTEGER NOT NULL DEFAULT 1,
    "bookingStartDate" TEXT,
    "bookingEndDate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_product_booking_configs" ("availableDays", "bookingEndDate", "bookingStartDate", "city", "createdAt", "disabledDates", "duration", "id", "isActive", "maxBookings", "productId", "productPrice", "productRating", "productTitle", "services", "slotDuration", "timeRangeEnd", "timeRangeStart", "timeRanges", "timeSlots", "updatedAt") SELECT "availableDays", "bookingEndDate", "bookingStartDate", "city", "createdAt", "disabledDates", "duration", "id", "isActive", "maxBookings", "productId", "productPrice", "productRating", "productTitle", "services", "slotDuration", "timeRangeEnd", "timeRangeStart", "timeRanges", "timeSlots", "updatedAt" FROM "product_booking_configs";
DROP TABLE "product_booking_configs";
ALTER TABLE "new_product_booking_configs" RENAME TO "product_booking_configs";
CREATE UNIQUE INDEX "product_booking_configs_productId_key" ON "product_booking_configs"("productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
