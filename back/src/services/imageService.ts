import sharp from 'sharp';
import { createStorageService, IStorageService } from './storageService';
import pool from '../database/connection';

export interface ImageUploadResult {
  id: number;
  propertyId: number;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
}

export class ImageService {
  private storage: IStorageService;

  constructor() {
    this.storage = createStorageService();
  }

  /**
   * Upload image for a property
   * Automatically creates thumbnail
   */
  async uploadPropertyImage(
    propertyId: number,
    file: Buffer,
    filename: string,
    mimeType: string,
    isPrimary: boolean = false
  ): Promise<ImageUploadResult> {
    // Validate image
    const image = sharp(file);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image file');
    }

    // Optimize original image (max 2000px width)
    const optimizedImage = await image
      .resize(2000, 2000, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Create thumbnail (300px width)
    const thumbnail = await sharp(file)
      .resize(300, 300, { 
        fit: 'cover',
        position: 'center' 
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload both
    const folder = `properties/${propertyId}`;
    const originalResult = await this.storage.upload(optimizedImage, filename, folder);
    const thumbnailResult = await this.storage.upload(thumbnail, `thumb_${filename}`, folder);

    // If this should be primary, unset other primary images
    if (isPrimary) {
      await pool.query(
        'UPDATE property_images SET is_primary = false WHERE property_id = $1',
        [propertyId]
      );
    }

    // Save to database
    const result = await pool.query(
      `INSERT INTO property_images 
       (property_id, storage_path, url, thumbnail_path, thumbnail_url, is_primary, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, property_id, url, thumbnail_url, is_primary`,
      [
        propertyId,
        originalResult.path,
        originalResult.url,
        thumbnailResult.path,
        thumbnailResult.url,
        isPrimary,
        optimizedImage.length,
        mimeType
      ]
    );

    return {
      id: result.rows[0].id,
      propertyId: result.rows[0].property_id,
      url: result.rows[0].url,
      thumbnailUrl: result.rows[0].thumbnail_url,
      isPrimary: result.rows[0].is_primary
    };
  }

  /**
   * Get all images for a property
   */
  async getPropertyImages(propertyId: number) {
    const result = await pool.query(
      `SELECT id, property_id, url, thumbnail_url, is_primary, created_at
       FROM property_images
       WHERE property_id = $1
       ORDER BY is_primary DESC, created_at ASC`,
      [propertyId]
    );
    return result.rows;
  }

  /**
   * Get primary image for a property
   */
  async getPrimaryImage(propertyId: number) {
    const result = await pool.query(
      `SELECT id, property_id, url, thumbnail_url, is_primary
       FROM property_images
       WHERE property_id = $1 AND is_primary = true
       LIMIT 1`,
      [propertyId]
    );
    return result.rows[0] || null;
  }

  /**
   * Set an image as primary
   */
  async setPrimaryImage(propertyId: number, imageId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Unset all primary images for this property
      await client.query(
        'UPDATE property_images SET is_primary = false WHERE property_id = $1',
        [propertyId]
      );
      
      // Set the new primary image
      await client.query(
        'UPDATE property_images SET is_primary = true WHERE id = $1 AND property_id = $2',
        [imageId, propertyId]
      );
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete an image
   */
  async deleteImage(propertyId: number, imageId: number): Promise<void> {
    // Get image paths
    const result = await pool.query(
      'SELECT storage_path, thumbnail_path FROM property_images WHERE id = $1 AND property_id = $2',
      [imageId, propertyId]
    );

    if (result.rows.length === 0) {
      throw new Error('Image not found');
    }

    const { storage_path, thumbnail_path } = result.rows[0];

    // Delete from storage
    await this.storage.delete(storage_path);
    if (thumbnail_path) {
      await this.storage.delete(thumbnail_path);
    }

    // Delete from database
    await pool.query('DELETE FROM property_images WHERE id = $1', [imageId]);
  }
}

