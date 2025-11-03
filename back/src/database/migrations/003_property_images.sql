-- Migration: Add property_images table for storing property images
-- This allows multiple images per property with one primary image

CREATE TABLE IF NOT EXISTS property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_path TEXT,
  thumbnail_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast property lookups
CREATE INDEX idx_property_images_property_id ON property_images(property_id);

-- Index for finding primary image
CREATE INDEX idx_property_images_primary ON property_images(property_id, is_primary);

-- Ensure only one primary image per property
CREATE UNIQUE INDEX idx_one_primary_per_property 
ON property_images(property_id) 
WHERE is_primary = true;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_property_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_images_updated_at
BEFORE UPDATE ON property_images
FOR EACH ROW
EXECUTE FUNCTION update_property_images_updated_at();

