-- Migration: Add status tracking and notes support for opportunities
-- This migration adds:
-- 1. status_updated_at column to track when status was last changed
-- 2. opportunity_notes table for N amount of notes per opportunity

-- Add status_updated_at column to opportunities table
ALTER TABLE opportunities 
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Set status_updated_at to received_at for existing records
UPDATE opportunities 
SET status_updated_at = received_at 
WHERE status_updated_at IS NULL;

-- Create opportunity_notes table
CREATE TABLE IF NOT EXISTS opportunity_notes (
  id SERIAL PRIMARY KEY,
  opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by VARCHAR(255), -- Optional: track who created the note
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for opportunity_notes
CREATE INDEX IF NOT EXISTS idx_opportunity_notes_opportunity_id ON opportunity_notes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_notes_created_at ON opportunity_notes(created_at DESC);

-- Add trigger to update updated_at for opportunity_notes
CREATE OR REPLACE FUNCTION update_opportunity_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER opportunity_notes_updated_at
BEFORE UPDATE ON opportunity_notes
FOR EACH ROW
EXECUTE FUNCTION update_opportunity_notes_updated_at();

-- Add trigger to update status_updated_at when status changes
CREATE OR REPLACE FUNCTION update_opportunity_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_updated_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER opportunity_status_updated_at
BEFORE UPDATE ON opportunities
FOR EACH ROW
EXECUTE FUNCTION update_opportunity_status_updated_at();

