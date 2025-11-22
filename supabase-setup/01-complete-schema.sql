-- =====================================================
-- IMB Property Management System - Complete Database Schema
-- For Supabase PostgreSQL Database
-- =====================================================

-- =====================================================
-- 1. AUTHENTICATION & USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    ip_address INET,
    success BOOLEAN DEFAULT false,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS backup_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    code VARCHAR(10) NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. PROPERTIES (Core Entity)
-- =====================================================

CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    m2 INTEGER NOT NULL,
    cliente VARCHAR(150) NOT NULL,
    fecha VARCHAR(50) NOT NULL,
    rev VARCHAR(10) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property Images (Multiple images per property)
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

-- =====================================================
-- 3. SALES
-- =====================================================

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    fecha VARCHAR(50) NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    algo VARCHAR(50) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    m2 INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. RENTALS (Comprehensive Rental Management)
-- =====================================================

CREATE TABLE IF NOT EXISTS rentals (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    monthly_rent DECIMAL(12,2) NOT NULL,
    deposit DECIMAL(12,2) DEFAULT 0,
    tenant_name VARCHAR(255) NOT NULL,
    tenant_email VARCHAR(255),
    tenant_phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rental_price_history (
    id SERIAL PRIMARY KEY,
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
    price DECIMAL(12,2) NOT NULL,
    effective_date DATE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rental_applications (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50),
    applicant_dni VARCHAR(20) NOT NULL,
    monthly_income DECIMAL(12,2),
    employment_status VARCHAR(100),
    employer_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'withdrawn')),
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guarantors (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES rental_applications(id) ON DELETE CASCADE,
    guarantor_name VARCHAR(255) NOT NULL,
    guarantor_dni VARCHAR(20) NOT NULL,
    guarantor_phone VARCHAR(50),
    guarantor_email VARCHAR(255),
    property_address VARCHAR(500),
    property_value DECIMAL(12,2),
    relationship_to_applicant VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_date TIMESTAMP,
    verification_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rental_payments (
    id SERIAL PRIMARY KEY,
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    late_fee DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
    id SERIAL PRIMARY KEY,
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
    request_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
    requested_by VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255),
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    scheduled_date TIMESTAMP,
    completed_date TIMESTAMP,
    photos TEXT[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contract_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    template_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inflation_adjustments (
    id SERIAL PRIMARY KEY,
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
    adjustment_date DATE NOT NULL,
    old_amount DECIMAL(12,2) NOT NULL,
    new_amount DECIMAL(12,2) NOT NULL,
    adjustment_percentage DECIMAL(5,2) NOT NULL,
    index_used VARCHAR(100),
    index_value DECIMAL(10,4),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contract_terminations (
    id SERIAL PRIMARY KEY,
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
    termination_date DATE NOT NULL,
    termination_type VARCHAR(50) NOT NULL CHECK (termination_type IN ('normal', 'early', 'breach', 'mutual')),
    notice_period_days INTEGER,
    penalty_amount DECIMAL(12,2) DEFAULT 0,
    deposit_returned DECIMAL(12,2) DEFAULT 0,
    final_inspection_date DATE,
    inspection_notes TEXT,
    final_settlement_amount DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. OPPORTUNITIES (Lead Management)
-- =====================================================

CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  channel VARCHAR(50) NOT NULL DEFAULT 'public_website',
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  contact_name VARCHAR(255),
  messages TEXT[],
  status VARCHAR(50) NOT NULL DEFAULT 'pending_contact',
  opportunity_type VARCHAR(20) NOT NULL CHECK (opportunity_type IN ('sale', 'rental')),
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- =====================================================
-- 6. WHATSAPP INTEGRATION
-- =====================================================

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

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_backup_codes_user_id ON backup_codes(user_id);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_numero ON properties(numero);
CREATE INDEX IF NOT EXISTS idx_properties_cliente ON properties(cliente);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_primary ON property_images(property_id, is_primary);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_per_property ON property_images(property_id) WHERE is_primary = true;

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_property_id ON sales(property_id);

-- Rentals indexes
CREATE INDEX IF NOT EXISTS idx_rentals_property_id ON rentals(property_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_contract_number ON rentals(contract_number);
CREATE INDEX IF NOT EXISTS idx_rental_price_history_rental_id ON rental_price_history(rental_id);
CREATE INDEX IF NOT EXISTS idx_rental_price_history_effective_date ON rental_price_history(effective_date);
CREATE INDEX IF NOT EXISTS idx_rental_applications_property_id ON rental_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_rental_applications_status ON rental_applications(status);
CREATE INDEX IF NOT EXISTS idx_guarantors_application_id ON guarantors(application_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_rental_id ON rental_payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_due_date ON rental_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_rental_payments_status ON rental_payments(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_rental_id ON maintenance_requests(rental_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_inflation_adjustments_rental_id ON inflation_adjustments(rental_id);
CREATE INDEX IF NOT EXISTS idx_contract_terminations_rental_id ON contract_terminations(rental_id);

-- Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_property_id ON opportunities(property_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_opportunity_type ON opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_channel ON opportunities(channel);
CREATE INDEX IF NOT EXISTS idx_opportunities_received_at ON opportunities(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_email ON opportunities(email);
CREATE INDEX IF NOT EXISTS idx_opportunities_phone ON opportunities(phone);
CREATE INDEX IF NOT EXISTS idx_opportunities_mobile ON opportunities(mobile);
CREATE INDEX IF NOT EXISTS idx_opportunities_type_status ON opportunities(opportunity_type, status);

-- WhatsApp indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_datetime ON whatsapp_messages(datetime DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_category ON whatsapp_messages(category);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from ON whatsapp_messages(message_from);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_message_id ON whatsapp_messages(message_id);

-- =====================================================
-- 8. TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================

-- Property images trigger
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

-- Opportunities trigger
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

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

