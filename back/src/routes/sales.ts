import { Router, Request, Response } from 'express';
import { SaleModel } from '../models/Sale';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// List sales
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const items = await SaleModel.findAll();
    res.json(items);
  } catch (error) {
    console.error('List sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sales by property id
router.get('/property/:propertyId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const items = await SaleModel.findByPropertyId(propertyId);
    res.json(items);
  } catch (error) {
    console.error('Get sales by property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get by id
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await SaleModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const created = await SaleModel.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await SaleModel.update(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await SaleModel.remove(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
