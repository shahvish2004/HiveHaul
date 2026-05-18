-- Phase 2: Add structured address fields to jobs table
-- This migration adds columns for parsed address components and geocoding data

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_formatted_address TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_street_number TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_street_name TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_city TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_province TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_postal_code TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_country TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_latitude DECIMAL(10, 8);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_longitude DECIMAL(11, 8);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_place_id TEXT;

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dropoff_formatted_address TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dropoff_street_number TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dropoff_street_name TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dropoff_city TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dropoff_province TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dropoff_postal_code TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dropoff_country TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dropoff_latitude DECIMAL(10, 8);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dropoff_longitude DECIMAL(11, 8);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dropoff_place_id TEXT;

-- Add index for faster lookups by place_id (useful for deduplication)
CREATE INDEX IF NOT EXISTS idx_pickup_place_id ON jobs(pickup_place_id);
CREATE INDEX IF NOT EXISTS idx_dropoff_place_id ON jobs(dropoff_place_id);

-- Add index for geographic lookups (future maps/navigation integration)
CREATE INDEX IF NOT EXISTS idx_pickup_geo ON jobs(pickup_latitude, pickup_longitude);
CREATE INDEX IF NOT EXISTS idx_dropoff_geo ON jobs(dropoff_latitude, dropoff_longitude);
