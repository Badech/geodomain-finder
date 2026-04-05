-- Add latitude and longitude columns to BusinessLead table
ALTER TABLE "BusinessLead" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "BusinessLead" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
