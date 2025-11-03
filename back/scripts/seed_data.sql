-- Insert sample properties data
INSERT INTO properties (numero, direccion, m2, cliente, fecha, rev, latitude, longitude) VALUES
('1', 'esparza 111', 600, 'Juan Perez', '10/23/2014', 'A', -37.1, -56.85),
('2', 'calle principal 456', 450, 'Maria Garcia', '11/15/2014', 'B', -34.6100, -58.3900),
('3', 'avenida central 789', 800, 'Carlos Rodriguez', '12/05/2014', 'C', -34.5900, -58.3700);

-- Insert sample sales data
INSERT INTO sales (property_id, fecha, precio, algo, direccion, m2) VALUES
(1, '10/10/2010', 150000, '600', 'esparza 111', 600),
(2, '11/01/2010', 120000, '450', 'calle principal 456', 450);

-- Insert sample rental contracts
INSERT INTO rentals (property_id, contract_number, start_date, end_date, status, monthly_rent, deposit, tenant_name, tenant_email, tenant_phone, notes) VALUES
(1, 'CON-2024-001', '2024-01-15', '2024-12-15', 'in_progress', 1200.00, 2400.00, 'María González', 'maria.gonzalez@email.com', '+54 11 1234-5678', 'Contrato anual renovable'),
(2, 'CON-2024-002', '2024-02-01', '2025-01-31', 'in_progress', 1500.00, 3000.00, 'Carlos Rodríguez', 'carlos.rodriguez@email.com', '+54 11 2345-6789', 'Contrato con opción de compra'),
(3, 'CON-2024-003', '2024-03-10', '2024-09-10', 'completed', 1800.00, 3600.00, 'Ana Martínez', 'ana.martinez@email.com', '+54 11 3456-7890', 'Contrato de 6 meses');

-- Insert sample price history
INSERT INTO rental_price_history (rental_id, price, effective_date, reason) VALUES
(1, 1200.00, '2024-01-15', 'Initial contract price'),
(1, 1300.00, '2024-07-15', 'Mid-year rent increase'),
(2, 1500.00, '2024-02-01', 'Initial contract price'),
(3, 1800.00, '2024-03-10', 'Initial contract price');
