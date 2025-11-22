-- Migration: Add optional DNI field to properties table
-- This migration adds a DNI (Documento Nacional de Identidad) field
-- to track property owner/client identification for better client management

-- Add DNI column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS dni VARCHAR(20);

-- Add index for faster searches by DNI
CREATE INDEX IF NOT EXISTS idx_properties_dni ON properties(dni) WHERE dni IS NOT NULL;

-- Add comment to document the field
COMMENT ON COLUMN properties.dni IS 'Documento Nacional de Identidad del cliente/propietario (opcional)';

