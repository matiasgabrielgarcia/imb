-- Migration: Add opportunities table for lead management
-- This table stores leads/opportunities from various channels (public website, WhatsApp, etc.)

CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  
  -- Channel and source information
  channel VARCHAR(50) NOT NULL DEFAULT 'public_website', -- public_website, whatsapp, phone, email, etc.
  
  -- Property of interest
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Contact information
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  contact_name VARCHAR(255),
  
  -- Opportunity details
  messages TEXT[], -- Array of messages/notes
  status VARCHAR(50) NOT NULL DEFAULT 'pending_contact',
  opportunity_type VARCHAR(20) NOT NULL CHECK (opportunity_type IN ('sale', 'rental')),
  
  -- Timestamps
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Additional metadata
  metadata JSONB -- For flexible additional data like UTM params, referrer, etc.
);

-- Indexes for performance
CREATE INDEX idx_opportunities_property_id ON opportunities(property_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_opportunity_type ON opportunities(opportunity_type);
CREATE INDEX idx_opportunities_channel ON opportunities(channel);
CREATE INDEX idx_opportunities_received_at ON opportunities(received_at DESC);
CREATE INDEX idx_opportunities_email ON opportunities(email);
CREATE INDEX idx_opportunities_phone ON opportunities(phone);
CREATE INDEX idx_opportunities_mobile ON opportunities(mobile);

-- Composite index for common queries
CREATE INDEX idx_opportunities_type_status ON opportunities(opportunity_type, status);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER opportunities_updated_at
BEFORE UPDATE ON opportunities
FOR EACH ROW
EXECUTE FUNCTION update_opportunities_updated_at();

-- Valid status values (document them here for reference):
-- 'pending_contact' - Pendiente a contactar
-- 'waiting_response' - Esperando la respuesta
-- 'evolved' - Evolucionado
-- 'take_action' - Tomar acción
-- 'frozen' - Congelado
-- 'appraisals' - Tasaciones
-- 'rental_agency' - Alquiler Inmobiliaria
-- 'rental_outsourced' - Alquiler tercerizado

