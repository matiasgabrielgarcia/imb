import express, { Request, Response } from 'express';
import multer from 'multer';
import { ImageService } from '../services/imageService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const imageService = new ImageService();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * Upload image for a property
 * POST /api/properties/:id/images
 */
router.post(
  '/:id/images',
  authenticateToken,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      const isPrimary = req.body.isPrimary === 'true';

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const result = await imageService.uploadPropertyImage(
        propertyId,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        isPrimary
      );

      res.json(result);
    } catch (error: any) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
  }
);

/**
 * Get all images for a property
 * GET /api/properties/:id/images
 */
router.get('/:id/images', authenticateToken, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    const images = await imageService.getPropertyImages(propertyId);
    res.json(images);
  } catch (error: any) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

/**
 * Get primary image for a property
 * GET /api/properties/:id/images/primary
 */
router.get('/:id/images/primary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    const image = await imageService.getPrimaryImage(propertyId);
    res.json(image);
  } catch (error: any) {
    console.error('Get primary image error:', error);
    res.status(500).json({ error: 'Failed to fetch primary image' });
  }
});

/**
 * Set an image as primary
 * PUT /api/properties/:id/images/:imageId/primary
 */
router.put(
  '/:id/images/:imageId/primary',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      const imageId = parseInt(req.params.imageId);

      await imageService.setPrimaryImage(propertyId, imageId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Set primary image error:', error);
      res.status(500).json({ error: 'Failed to set primary image' });
    }
  }
);

/**
 * Delete an image
 * DELETE /api/properties/:id/images/:imageId
 */
router.delete(
  '/:id/images/:imageId',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      const imageId = parseInt(req.params.imageId);

      await imageService.deleteImage(propertyId, imageId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete image error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  }
);

export default router;

