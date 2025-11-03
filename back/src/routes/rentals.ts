import { Router, Request, Response } from 'express';
import { RentalModel, CreateRentalData, UpdateRentalData, AddPriceChangeData } from '../models/Rental';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// List rentals with optional status filter
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    let rentals;
    if (status && ['in_progress', 'completed', 'cancelled'].includes(status as string)) {
      rentals = await RentalModel.findByStatus(status as 'in_progress' | 'completed' | 'cancelled');
    } else if (status === 'active') {
      rentals = await RentalModel.findActiveRentals();
    } else {
      rentals = await RentalModel.findAll();
    }
    
    res.json(rentals);
  } catch (error) {
    console.error('List rentals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get rentals by property id
router.get('/property/:propertyId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const items = await RentalModel.findByPropertyId(propertyId);
    res.json(items);
  } catch (error) {
    console.error('Get rentals by property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get by id
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await RentalModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    console.error('Get rental error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new rental contract
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const rentalData: CreateRentalData = req.body;
    
    // Validate contract dates don't overlap with existing active rentals
    const isValidDates = await RentalModel.validateContractDates(
      rentalData.property_id,
      rentalData.start_date,
      rentalData.end_date
    );
    
    if (!isValidDates) {
      return res.status(400).json({ 
        error: 'Contract dates overlap with existing active rental for this property' 
      });
    }
    
    const created = await RentalModel.create(rentalData);
    res.status(201).json(created);
  } catch (error) {
    console.error('Create rental error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update rental contract
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updateData: UpdateRentalData = req.body;
    
    // If updating dates, validate they don't overlap with other active rentals
    if (updateData.start_date || updateData.end_date) {
      const currentRental = await RentalModel.findById(id);
      if (currentRental) {
        const startDate = updateData.start_date || currentRental.start_date;
        const endDate = updateData.end_date || currentRental.end_date;
        
        const isValidDates = await RentalModel.validateContractDates(
          currentRental.property_id,
          startDate,
          endDate,
          id
        );
        
        if (!isValidDates) {
          return res.status(400).json({ 
            error: 'Contract dates overlap with existing active rental for this property' 
          });
        }
      }
    }
    
    const updated = await RentalModel.update(id, updateData);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (error) {
    console.error('Update rental error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete rental contract
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await RentalModel.remove(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete rental error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Price history routes
// Get price history for a rental
router.get('/:id/price-history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const priceHistory = await RentalModel.getPriceHistory(id);
    res.json(priceHistory);
  } catch (error) {
    console.error('Get price history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add price change to rental
router.post('/:id/price-change', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const priceChangeData: AddPriceChangeData = {
      ...req.body,
      rental_id: id
    };
    
    const priceChange = await RentalModel.addPriceChange(id, priceChangeData);
    res.status(201).json(priceChange);
  } catch (error) {
    console.error('Add price change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current price for a rental
router.get('/:id/current-price', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const currentPrice = await RentalModel.getCurrentPrice(id);
    
    if (currentPrice === null) {
      return res.status(404).json({ error: 'No price found for this rental' });
    }
    
    res.json({ current_price: currentPrice });
  } catch (error) {
    console.error('Get current price error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;