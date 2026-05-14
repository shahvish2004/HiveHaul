-- Add JSON column to store extended booking details
-- This consolidates: size, weight, building types, access info, assistance levels, and terms

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS booking_details JSONB DEFAULT '{}'::JSONB;

-- Add documentation
COMMENT ON COLUMN jobs.booking_details IS 'Extended booking details stored as JSON: size, weight, building_types, access, assistance, terms_accepted';
