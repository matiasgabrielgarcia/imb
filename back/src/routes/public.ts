import { Router, Request, Response } from 'express';
import { query } from '../database/connection';
import { OpportunityModel, CreateOpportunityData } from '../models/Opportunity';

const router = Router();

// Get all properties with their sales and rentals (public endpoint - no auth)
router.get('/properties', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'precio', s.precio,
              'fecha', s.fecha,
              'algo', s.algo,
              'direccion', s.direccion,
              'm2', s.m2
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) as ventas,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', r.id,
              'contract_number', r.contract_number,
              'monthly_rent', r.monthly_rent,
              'status', r.status,
              'start_date', r.start_date,
              'end_date', r.end_date,
              'tenant_name', r.tenant_name
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as alquileres
      FROM properties p
      LEFT JOIN sales s ON p.id = s.property_id
      LEFT JOIN rentals r ON p.id = r.property_id
      GROUP BY p.id
      ORDER BY p.id DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('List public properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get properties for sale (public endpoint - no auth)
router.get('/properties/for-sale', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        p.*,
        json_agg(
          jsonb_build_object(
            'id', s.id,
            'precio', s.precio,
            'fecha', s.fecha,
            'algo', s.algo,
            'direccion', s.direccion,
            'm2', s.m2
          )
        ) as ventas
      FROM properties p
      INNER JOIN sales s ON p.id = s.property_id
      GROUP BY p.id
      ORDER BY p.id DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('List properties for sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get properties for rent (public endpoint - no auth)
router.get('/properties/for-rent', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        p.*,
        json_agg(
          jsonb_build_object(
            'id', r.id,
            'contract_number', r.contract_number,
            'monthly_rent', r.monthly_rent,
            'status', r.status,
            'start_date', r.start_date,
            'end_date', r.end_date
          )
        ) as alquileres
      FROM properties p
      INNER JOIN rentals r ON p.id = r.property_id
      WHERE r.status = 'in_progress'
      GROUP BY p.id
      ORDER BY p.id DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('List properties for rent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get property details by id (public endpoint - no auth)
router.get('/properties/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    const result = await query(`
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'precio', s.precio,
              'fecha', s.fecha,
              'algo', s.algo,
              'direccion', s.direccion,
              'm2', s.m2
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) as ventas,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', r.id,
              'contract_number', r.contract_number,
              'monthly_rent', r.monthly_rent,
              'status', r.status,
              'start_date', r.start_date,
              'end_date', r.end_date,
              'tenant_name', r.tenant_name
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as alquileres
      FROM properties p
      LEFT JOIN sales s ON p.id = s.property_id
      LEFT JOIN rentals r ON p.id = r.property_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get public property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create opportunity from public website (no auth required)
router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { property_id, contact_name, email, phone, message, opportunity_type } = req.body;
    
    // Validation
    if (!property_id || !contact_name || !opportunity_type) {
      return res.status(400).json({ 
        error: 'Missing required fields: property_id, contact_name, and opportunity_type are required' 
      });
    }
    
    if (!email && !phone) {
      return res.status(400).json({ 
        error: 'At least one contact method (email or phone) is required' 
      });
    }
    
    if (!['sale', 'rental'].includes(opportunity_type)) {
      return res.status(400).json({ 
        error: 'opportunity_type must be either "sale" or "rental"' 
      });
    }
    
    const opportunityData: CreateOpportunityData = {
      channel: 'public_website',
      property_id: Number(property_id),
      contact_name,
      email,
      phone,
      mobile: phone, // Store phone in mobile field as well for compatibility
      messages: message ? [message] : [],
      status: 'pending_contact',
      opportunity_type,
      metadata: {
        user_agent: req.headers['user-agent'],
        ip_address: req.ip,
        submitted_at: new Date().toISOString()
      }
    };
    
    const created = await OpportunityModel.create(opportunityData);
    
    // Return a success message without exposing internal data
    res.status(201).json({ 
      success: true,
      message: 'Gracias por contactarnos. Nos pondremos en contacto contigo pronto.',
      id: created.id
    });
  } catch (error) {
    console.error('Create public opportunity error:', error);
    res.status(500).json({ error: 'Error al procesar tu solicitud. Por favor, intenta nuevamente.' });
  }
});

export default router;
