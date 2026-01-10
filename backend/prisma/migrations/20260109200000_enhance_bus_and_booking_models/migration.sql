-- AlterTable: Add new columns to Bus table
ALTER TABLE "Bus" ADD COLUMN "make" TEXT;
ALTER TABLE "Bus" ADD COLUMN "model" TEXT;
ALTER TABLE "Bus" ADD COLUMN "seatLayout" JSONB;
ALTER TABLE "Bus" ADD COLUMN "totalSeats" INTEGER;

-- AlterTable: Add new columns to Booking table
-- First, add bookingId as nullable
ALTER TABLE "Booking" ADD COLUMN "bookingId" TEXT;

-- Populate bookingId for existing bookings using gen_random_uuid()
UPDATE "Booking" SET "bookingId" = gen_random_uuid()::TEXT WHERE "bookingId" IS NULL;

-- Now make bookingId unique and add default
ALTER TABLE "Booking" ALTER COLUMN "bookingId" SET DEFAULT gen_random_uuid()::TEXT;
CREATE UNIQUE INDEX "Booking_bookingId_key" ON "Booking"("bookingId");

-- Add passengerName and phoneNumber (both nullable for migration)
ALTER TABLE "Booking" ADD COLUMN "passengerName" TEXT;
ALTER TABLE "Booking" ADD COLUMN "phoneNumber" TEXT;

-- Populate passengerName for existing bookings from User table
UPDATE "Booking" 
SET "passengerName" = "User"."name"
FROM "User"
WHERE "Booking"."userId" = "User"."id" 
  AND "Booking"."passengerName" IS NULL;

-- Populate phoneNumber for existing bookings from User table (if available)
UPDATE "Booking" 
SET "phoneNumber" = "User"."phone"
FROM "User"
WHERE "Booking"."userId" = "User"."id" 
  AND "Booking"."phoneNumber" IS NULL
  AND "User"."phone" IS NOT NULL;
