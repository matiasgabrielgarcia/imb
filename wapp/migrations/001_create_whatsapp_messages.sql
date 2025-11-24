-- Migration: Create whatsapp_messages table
-- Description: Stores WhatsApp messages from the webhook

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id SERIAL PRIMARY KEY,
  message_from VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  datetime TIMESTAMP NOT NULL DEFAULT NOW(),
  message_type VARCHAR(50) DEFAULT 'text',
  message_id VARCHAR(255) UNIQUE,
  category VARCHAR(50) DEFAULT 'UNCATEGORIZED',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_datetime ON whatsapp_messages(datetime DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_category ON whatsapp_messages(category);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from ON whatsapp_messages(message_from);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_message_id ON whatsapp_messages(message_id);

-- Add a comment to the table
COMMENT ON TABLE whatsapp_messages IS 'Stores WhatsApp messages received from the webhook';
COMMENT ON COLUMN whatsapp_messages.message_from IS 'Phone number of the sender';
COMMENT ON COLUMN whatsapp_messages.message IS 'Content of the message';
COMMENT ON COLUMN whatsapp_messages.datetime IS 'When the message was sent';
COMMENT ON COLUMN whatsapp_messages.message_type IS 'Type of message (text, image, video, audio, etc.)';
COMMENT ON COLUMN whatsapp_messages.message_id IS 'Unique WhatsApp message ID';
COMMENT ON COLUMN whatsapp_messages.category IS 'Message category (BUYER, SELLER, TENANT, LANDLORD, UNCATEGORIZED)';



