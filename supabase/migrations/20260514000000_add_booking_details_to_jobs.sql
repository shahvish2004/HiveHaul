-- Add booking details fields to jobs table
-- Captures pickup date, preferred time, and item description for better intake information

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_date DATE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_time TIME;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS item_description TEXT;

-- Add documentation
COMMENT ON COLUMN jobs.pickup_date IS 'Requested pickup date from intake form (YYYY-MM-DD format)';
COMMENT ON COLUMN jobs.pickup_time IS 'Preferred pickup time from intake form (HH:MM format)';
COMMENT ON COLUMN jobs.item_description IS 'Description of items being transported (e.g., Office furniture, equipment, boxes)';
