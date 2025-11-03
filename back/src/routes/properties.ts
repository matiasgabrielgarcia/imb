import { Router, Request, Response } from 'express';
import { PropertyModel } from '../models/Property';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// List properties
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const items = await PropertyModel.findAll();
    res.json(items);
  } catch (error) {
    console.error('List properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get by id
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await PropertyModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const created = await PropertyModel.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await PropertyModel.update(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await PropertyModel.remove(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


