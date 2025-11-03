import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { UserModel } from '../models/User';
import { query } from '../database/connection';

export class TwoFactorService {
  static generateSecret(username: string, appName: string): { secret: string; qrCodeUrl: string } {
    const secret = speakeasy.generateSecret({
      name: `${appName} (${username})`,
      issuer: appName,
      length: 32
    });

    console.log("generateSecret - raw secret object:", secret);
    console.log("generateSecret - secret.base32:", secret.base32);
    console.log("generateSecret - secret.base32 type:", typeof secret.base32);
    console.log("generateSecret - secret.base32 length:", secret.base32?.length);

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url!
    };
  }

  static async generateQRCode(qrCodeUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(qrCodeUrl);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  // this is returning Error: 
  static verifyToken(secret: string, token: string): boolean {
    console.log("verifyToken", secret, token);
    console.log("secret type:", typeof secret);
    console.log("secret length:", secret ? secret.length : 'null/undefined');
    console.log("secret value (first 20 chars):", secret ? secret.substring(0, 20) : 'null/undefined');
    console.log("secret value (last 20 chars):", secret ? secret.substring(secret.length - 20) : 'null/undefined');
    
    // Check if secret is valid before calling speakeasy
    if (!secret || secret.trim() === '') {
      console.error("Invalid secret: secret is null, undefined, or empty");
      return false;
    }
    
    // Check if secret contains only valid base32 characters
    const base32Regex = /^[A-Z2-7]+$/;
    if (!base32Regex.test(secret)) {
      console.error("Invalid secret: contains invalid base32 characters");
      console.log("Secret contains invalid chars:", secret.split('').filter(char => !base32Regex.test(char)));
      return false;
    }
    
    try {
      // Error: secretOrPrivateKey must have a value
      // it should return true
      const result = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps (60 seconds) of tolerance
      });
      console.log("speakeasy.totp.verify result:", result);
      return result;
    } catch (error) {
      console.error("speakeasy.totp.verify error:", error);
      return false;
    }
  }

  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(Math.random().toString(36).substring(2, 12).toUpperCase());
    }
    return codes;
  }

  static async setupTwoFactor(userId: number, username: string, appName: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    qrCodeDataUrl: string;
    backupCodes: string[];
  }> {
    const { secret, qrCodeUrl } = this.generateSecret(username, appName);
    const qrCodeDataUrl = await this.generateQRCode(qrCodeUrl);
    const backupCodes = this.generateBackupCodes();

    // Store the secret in the database
    console.log('setupTwoFactor - storing secret:', secret);
    console.log('setupTwoFactor - secret type:', typeof secret);
    console.log('setupTwoFactor - secret length:', secret.length);
    
    await UserModel.updateTwoFactorSecret(userId, secret);

    console.log('setupTwoFactor - secret stored successfully');
    // Store backup codes
    for (const code of backupCodes) {
      await this.storeBackupCode(userId, code);
    }
    console.log('storing secret3', secret);
    return {
      secret,
      qrCodeUrl,
      qrCodeDataUrl,
      backupCodes
    };
  }

  static async verifyTwoFactor(userId: number, token: string): Promise<boolean> {
    const user = await UserModel.findById(userId);
    console.log("verifyTwoFactor - user found:", !!user);
    console.log("verifyTwoFactor - user.two_factor_secret:", user?.two_factor_secret);
    console.log("verifyTwoFactor - user.two_factor_enabled:", user?.two_factor_enabled);
    
    if (!user || !user.two_factor_secret) {
      console.log("verifyTwoFactor - returning false: no user or no secret");
      return false;
    }

    console.log("verifyTwoFactor - calling verifyToken with secret:", user.two_factor_secret);

    return this.verifyToken(user.two_factor_secret, token);
  }

  static async verifyBackupCode(userId: number, code: string): Promise<boolean> {
    const result = await query(
      'SELECT id FROM backup_codes WHERE user_id = $1 AND code = $2 AND used = false',
      [userId, code]
    );

    if (result.rows.length === 0) {
      return false;
    }

    // Mark the backup code as used
    await query(
      'UPDATE backup_codes SET used = true WHERE id = $1',
      [result.rows[0].id]
    );

    return true;
  }

  private static async storeBackupCode(userId: number, code: string): Promise<void> {
    await query(
      'INSERT INTO backup_codes (user_id, code) VALUES ($1, $2)',
      [userId, code]
    );
  }
}

