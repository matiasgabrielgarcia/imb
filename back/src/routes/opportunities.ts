import { Router, Request, Response } from 'express';
import { OpportunityModel, CreateOpportunityData, UpdateOpportunityData } from '../models/Opportunity';
import { OpportunityNoteModel, CreateOpportunityNoteData, UpdateOpportunityNoteData } from '../models/OpportunityNote';
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

// Opportunity Notes routes
// Get all notes for an opportunity
router.get('/:opportunityId/notes', authenticateToken, async (req: Request, res: Response) => {
  try {
    const opportunityId = Number(req.params.opportunityId);
    const notes = await OpportunityNoteModel.findByOpportunityId(opportunityId);
    res.json(notes);
  } catch (error) {
    console.error('Get opportunity notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new note
router.post('/:opportunityId/notes', authenticateToken, async (req: Request, res: Response) => {
  try {
    const opportunityId = Number(req.params.opportunityId);
    const noteData: CreateOpportunityNoteData = {
      opportunity_id: opportunityId,
      note: req.body.note,
      created_by: req.body.created_by,
    };
    
    if (!noteData.note || !noteData.note.trim()) {
      return res.status(400).json({ error: 'Note is required' });
    }

    const created = await OpportunityNoteModel.create(noteData);
    res.status(201).json(created);
  } catch (error) {
    console.error('Create opportunity note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a note
router.put('/:opportunityId/notes/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const opportunityId = Number(req.params.opportunityId);
    const updateData: UpdateOpportunityNoteData = req.body;

    // Verify note belongs to opportunity
    const note = await OpportunityNoteModel.findById(id);
    if (!note || note.opportunity_id !== opportunityId) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updated = await OpportunityNoteModel.update(id, updateData);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (error) {
    console.error('Update opportunity note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a note
router.delete('/:opportunityId/notes/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const opportunityId = Number(req.params.opportunityId);

    // Verify note belongs to opportunity
    const note = await OpportunityNoteModel.findById(id);
    if (!note || note.opportunity_id !== opportunityId) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await OpportunityNoteModel.remove(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete opportunity note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
