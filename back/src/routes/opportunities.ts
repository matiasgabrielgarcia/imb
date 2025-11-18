import { Router, Request, Response } from 'express';
import { OpportunityModel, CreateOpportunityData, UpdateOpportunityData } from '../models/Opportunity';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// List opportunities (protected - backoffice only)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status, type } = req.query;
    
    let opportunities;
    if (status) {
      opportunities = await OpportunityModel.findByStatus(status as string);
    } else if (type && (type === 'sale' || type === 'rental')) {
      opportunities = await OpportunityModel.findByType(type as 'sale' | 'rental');
    } else {
      opportunities = await OpportunityModel.findAll();
    }
    
    res.json(opportunities);
  } catch (error) {
    console.error('List opportunities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get opportunities by property id (protected - backoffice only)
router.get('/property/:propertyId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const items = await OpportunityModel.findByPropertyId(propertyId);
    res.json(items);
  } catch (error) {
    console.error('Get opportunities by property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get by id (protected - backoffice only)
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await OpportunityModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create (protected - backoffice only)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const opportunityData: CreateOpportunityData = req.body;
    const created = await OpportunityModel.create(opportunityData);
    res.status(201).json(created);
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update (protected - backoffice only)
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updateData: UpdateOpportunityData = req.body;
    const updated = await OpportunityModel.update(id, updateData);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete (protected - backoffice only)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await OpportunityModel.remove(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add message to opportunity (protected - backoffice only)
router.post('/:id/message', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const updated = await OpportunityModel.addMessage(id, message);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
