-- This is a SQL script to add latitude and longitude columns to the cafes table if they don't exist
-- Run this in your Supabase SQL editor

-- Check if latitude column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cafes' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE cafes ADD COLUMN latitude DOUBLE PRECISION;
    END IF;
END $$;

-- Check if longitude column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cafes' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE cafes ADD COLUMN longitude DOUBLE PRECISION;
    END IF;
END $$;

-- Create an index for faster geospatial queries
CREATE INDEX IF NOT EXISTS idx_cafes_location ON cafes (latitude, longitude);

-- Comment on columns
COMMENT ON COLUMN cafes.latitude IS 'Latitude coordinate of the cafe location';
COMMENT ON COLUMN cafes.longitude IS 'Longitude coordinate of the cafe location'; 