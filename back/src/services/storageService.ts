import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generic Storage Interface
 * Implement this interface for any storage provider:
 * - Local File System
 * - Cloudflare R2
 * - AWS S3
 * - Backblaze B2
 * - DigitalOcean Spaces
 * - Google Cloud Storage
 * - Azure Blob Storage
 * - Supabase Storage
 */
export interface IStorageService {
  /**
   * Upload a file to storage
   * @param file - File buffer
   * @param filename - Original filename
   * @param folder - Folder path (e.g., 'properties/123')
   * @returns Storage path and public URL
   */
  upload(file: Buffer, filename: string, folder: string): Promise<{
    path: string;
    url: string;
  }>;

  /**
   * Delete a file from storage
   * @param path - Storage path returned from upload
   */
  delete(path: string): Promise<void>;

  /**
   * Get public URL for a file
   * @param path - Storage path
   */
  getPublicUrl(path: string): string;
}

/**
 * Local File System Storage Implementation
 * Free, runs on your server
 */
export class LocalStorageService implements IStorageService {
  private baseDir: string;
  private baseUrl: string;

  constructor() {
    // Store files in /back/uploads/
    this.baseDir = path.join(__dirname, '../../uploads');
    // Serve via /uploads/* endpoint
    this.baseUrl = process.env.STORAGE_BASE_URL || 'http://localhost:3001/uploads';
  }

  async upload(file: Buffer, filename: string, folder: string): Promise<{ path: string; url: string }> {
    // Generate unique filename
    const ext = path.extname(filename);
    const uniqueName = `${uuidv4()}${ext}`;
    const storagePath = path.join(folder, uniqueName);
    const fullPath = path.join(this.baseDir, storagePath);

    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write file
    await fs.writeFile(fullPath, file);

    return {
      path: storagePath,
      url: this.getPublicUrl(storagePath)
    };
  }

  async delete(storagePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, storagePath);
    try {
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getPublicUrl(storagePath: string): string {
    return `${this.baseUrl}/${storagePath.replace(/\\/g, '/')}`;
  }
}

/**
 * Cloudflare R2 Storage Implementation (EXAMPLE - ready to use)
 * Uncomment and install: npm install @aws-sdk/client-s3
 * 
 * import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
 * 
 * export class CloudflareR2StorageService implements IStorageService {
 *   private client: S3Client;
 *   private bucket: string;
 *   private publicUrl: string;
 * 
 *   constructor() {
 *     this.bucket = process.env.R2_BUCKET_NAME!;
 *     this.publicUrl = process.env.R2_PUBLIC_URL!;
 *     
 *     this.client = new S3Client({
 *       region: 'auto',
 *       endpoint: process.env.R2_ENDPOINT,
 *       credentials: {
 *         accessKeyId: process.env.R2_ACCESS_KEY_ID!,
 *         secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
 *       },
 *     });
 *   }
 * 
 *   async upload(file: Buffer, filename: string, folder: string): Promise<{ path: string; url: string }> {
 *     const ext = path.extname(filename);
 *     const uniqueName = `${uuidv4()}${ext}`;
 *     const storagePath = `${folder}/${uniqueName}`;
 * 
 *     await this.client.send(new PutObjectCommand({
 *       Bucket: this.bucket,
 *       Key: storagePath,
 *       Body: file,
 *       ContentType: this.getContentType(ext),
 *     }));
 * 
 *     return {
 *       path: storagePath,
 *       url: this.getPublicUrl(storagePath)
 *     };
 *   }
 * 
 *   async delete(storagePath: string): Promise<void> {
 *     await this.client.send(new DeleteObjectCommand({
 *       Bucket: this.bucket,
 *       Key: storagePath,
 *     }));
 *   }
 * 
 *   getPublicUrl(storagePath: string): string {
 *     return `${this.publicUrl}/${storagePath}`;
 *   }
 * 
 *   private getContentType(ext: string): string {
 *     const types: Record<string, string> = {
 *       '.jpg': 'image/jpeg',
 *       '.jpeg': 'image/jpeg',
 *       '.png': 'image/png',
 *       '.webp': 'image/webp',
 *       '.gif': 'image/gif',
 *     };
 *     return types[ext.toLowerCase()] || 'application/octet-stream';
 *   }
 * }
 */

/**
 * Backblaze B2 Storage Implementation (EXAMPLE - ready to use)
 * Same S3-compatible API as above, just different endpoint/config
 */

/**
 * Factory to create storage service
 * Change provider by setting STORAGE_PROVIDER env variable
 */
export function createStorageService(): IStorageService {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  switch (provider) {
    case 'local':
      return new LocalStorageService();
    // case 'r2':
    //   return new CloudflareR2StorageService();
    // case 'b2':
    //   return new BackblazeB2StorageService();
    default:
      return new LocalStorageService();
  }
}

