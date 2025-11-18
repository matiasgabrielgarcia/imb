-- Insertar oportunidades de prueba directamente

-- Oportunidades de VENTA
INSERT INTO opportunities (
  channel, property_id, email, phone, mobile, contact_name,
  messages, status, opportunity_type, received_at
) VALUES 
  ('public_website', NULL, 'juan.perez@example.com', '011-4567-8910', '+54 9 11 1234-5678', 'Juan Pérez',
   ARRAY['Estoy muy interesado en comprar una propiedad. ¿Podríamos coordinar una visita?'], 'pending_contact', 'sale', NOW() - INTERVAL '2 hours'),
  
  ('public_website', NULL, 'carlos.rodriguez@example.com', '011-2345-6789', '+54 9 11 5555-4444', 'Carlos Rodríguez',
   ARRAY['Vi propiedades en el sitio web. ¿Están disponibles para escriturar este mes?'], 'pending_contact', 'sale', NOW() - INTERVAL '1 day'),
  
  ('public_website', NULL, 'pedro.sanchez@example.com', NULL, '+54 9 11 7777-8888', 'Pedro Sánchez',
   ARRAY['Quiero comprar pero necesito financiación. ¿Tienen opciones?'], 'waiting_response', 'sale', NOW() - INTERVAL '3 days');

-- Oportunidades de ALQUILER
INSERT INTO opportunities (
  channel, property_id, email, phone, mobile, contact_name,
  messages, status, opportunity_type, received_at
) VALUES 
  ('public_website', NULL, 'maria.gonzalez@example.com', NULL, '+54 9 11 9876-5432', 'María González',
   ARRAY['Necesito alquilar un departamento de 2 ambientes. Mi presupuesto es $50,000/mes'], 'pending_contact', 'rental', NOW() - INTERVAL '5 hours'),
  
  ('public_website', NULL, 'ana.martinez@example.com', NULL, '+54 9 11 3333-2222', 'Ana Martínez',
   ARRAY['Busco alquilar por 2 años. ¿Aceptan mascotas?'], 'pending_contact', 'rental', NOW() - INTERVAL '1 day'),
  
  ('whatsapp', NULL, 'laura.fernandez@example.com', '011-8888-9999', '+54 9 11 2222-3333', 'Laura Fernández',
   ARRAY['Contacté por WhatsApp', 'Necesito algo cerca del centro'], 'evolved', 'rental', NOW() - INTERVAL '2 days');

-- Verificar inserción
SELECT COUNT(*) as total_opportunities FROM opportunities;
SELECT opportunity_type, COUNT(*) as count FROM opportunities GROUP BY opportunity_type;

