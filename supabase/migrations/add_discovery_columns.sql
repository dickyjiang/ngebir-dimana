-- Add google_place_id for deduplication
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS
  google_place_id TEXT;

-- Unique constraint (allow nulls for existing manual entries)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cafes_google_place_id
  ON cafes(google_place_id)
  WHERE google_place_id IS NOT NULL;

-- Track how the cafe was added
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS
  source TEXT DEFAULT 'manual';
