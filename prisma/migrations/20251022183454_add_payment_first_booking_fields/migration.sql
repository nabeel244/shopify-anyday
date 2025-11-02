-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT,
    "productBookingConfigId" TEXT,
    "selectedServices" TEXT,
    "bookingDate" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "specialRequests" TEXT,
    "totalPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "shopifyOrderId" TEXT,
    "shopifyCheckoutUrl" TEXT,
    "isTemporary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookings_productBookingConfigId_fkey" FOREIGN KEY ("productBookingConfigId") REFERENCES "product_booking_configs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_bookings" ("bookingDate", "createdAt", "endTime", "id", "paymentStatus", "productBookingConfigId", "selectedServices", "serviceId", "shopifyCheckoutUrl", "shopifyOrderId", "specialRequests", "startTime", "status", "totalPrice", "updatedAt", "userId") SELECT "bookingDate", "createdAt", "endTime", "id", "paymentStatus", "productBookingConfigId", "selectedServices", "serviceId", "shopifyCheckoutUrl", "shopifyOrderId", "specialRequests", "startTime", "status", "totalPrice", "updatedAt", "userId" FROM "bookings";
DROP TABLE "bookings";
ALTER TABLE "new_bookings" RENAME TO "bookings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
