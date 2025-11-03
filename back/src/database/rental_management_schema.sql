-- Rental Management System Schema
-- Additional tables for comprehensive rental management

-- Rental applications table
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

-- Guarantors table
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

-- Rental payments table
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

-- Maintenance requests table
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
    photos TEXT[], -- Array of photo URLs
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contract templates table
CREATE TABLE IF NOT EXISTS contract_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    template_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inflation adjustments table
CREATE TABLE IF NOT EXISTS inflation_adjustments (
    id SERIAL PRIMARY KEY,
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
    adjustment_date DATE NOT NULL,
    old_amount DECIMAL(12,2) NOT NULL,
    new_amount DECIMAL(12,2) NOT NULL,
    adjustment_percentage DECIMAL(5,2) NOT NULL,
    index_used VARCHAR(100), -- e.g., 'IPC', 'UVA', 'Custom'
    index_value DECIMAL(10,4),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contract termination table
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

-- Indexes for performance
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
