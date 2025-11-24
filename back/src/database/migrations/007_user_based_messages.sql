-- Migration: Add user-based message isolation
-- Description: Adds user_id tracking to messages and role support for future hierarchy

-- Add role column to users table (for future hierarchy/backoffice support)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'backoffice'));

-- Add user_id to whatsapp_messages (which user "owns" this conversation)
-- NULL means the message was received (not assigned to a user yet)
ALTER TABLE whatsapp_messages 
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add sent_by_user_id to track who sent each message
-- NULL means it was received from WhatsApp (incoming message)
ALTER TABLE whatsapp_messages 
ADD COLUMN IF NOT EXISTS sent_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_sent_by_user_id ON whatsapp_messages(sent_by_user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_from ON whatsapp_messages(user_id, message_from);

-- Add comment
COMMENT ON COLUMN whatsapp_messages.user_id IS 'User who owns this conversation. NULL = unassigned incoming message';
COMMENT ON COLUMN whatsapp_messages.sent_by_user_id IS 'User who sent this message. NULL = incoming message from WhatsApp';
COMMENT ON COLUMN users.role IS 'User role: user (default), admin, or backoffice (can see all messages)';


