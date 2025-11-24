-- Migration: Add user assignment to opportunities
-- Description: Links opportunities to users when they start chatting

-- Add user_id to opportunities table
ALTER TABLE opportunities 
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_phone ON opportunities(phone);
CREATE INDEX IF NOT EXISTS idx_opportunities_mobile ON opportunities(mobile);

-- Add comment
COMMENT ON COLUMN opportunities.user_id IS 'User who is handling this opportunity. NULL = unassigned, visible to all users';


