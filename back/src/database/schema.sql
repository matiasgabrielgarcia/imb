-- Create database (run this manually in PostgreSQL)
-- CREATE DATABASE 2fa_auth;

-- Users table
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

-- Login attempts table for security
CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    ip_address INET,
    success BOOLEAN DEFAULT false,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2FA backup codes table
CREATE TABLE IF NOT EXISTS backup_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    code VARCHAR(10) NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_backup_codes_user_id ON backup_codes(user_id);

-- Properties table (ABM)
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

-- Indexes for properties
CREATE INDEX IF NOT EXISTS idx_properties_numero ON properties(numero);
CREATE INDEX IF NOT EXISTS idx_properties_cliente ON properties(cliente);

-- Sales table
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

-- Rentals table (contracts)
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

-- Rental price history table (for price changes over time)
CREATE TABLE IF NOT EXISTS rental_price_history (
    id SERIAL PRIMARY KEY,
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
    price DECIMAL(12,2) NOT NULL,
    effective_date DATE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for sales and rentals
CREATE INDEX IF NOT EXISTS idx_sales_property_id ON sales(property_id);
CREATE INDEX IF NOT EXISTS idx_rentals_property_id ON rentals(property_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_contract_number ON rentals(contract_number);
CREATE INDEX IF NOT EXISTS idx_rental_price_history_rental_id ON rental_price_history(rental_id);
CREATE INDEX IF NOT EXISTS idx_rental_price_history_effective_date ON rental_price_history(effective_date);