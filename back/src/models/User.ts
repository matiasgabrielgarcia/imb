import { query } from '../database/connection';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  two_factor_secret?: string;
  two_factor_enabled: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const { username, email, password } = userData;
    const password_hash = await bcrypt.hash(password, 12);
    
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password_hash]
    );
    
    return result.rows[0];
  }

  static async findByUsername(username: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    //console.log('result', result);

    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async updateTwoFactorSecret(userId: number, secret: string): Promise<void> {
    console.log('updateTwoFactorSecret - userId:', userId);
    console.log('updateTwoFactorSecret - secret:', secret);
    console.log('updateTwoFactorSecret - secret type:', typeof secret);
    
    const result = await query(
      'UPDATE users SET two_factor_secret = $1, two_factor_enabled = true, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING two_factor_secret',
      [secret, userId]
    );
    
    console.log('updateTwoFactorSecret - updated secret in DB:', result.rows[0]?.two_factor_secret);
  }

  static async disableTwoFactor(userId: number): Promise<void> {
    await query(
      'UPDATE users SET two_factor_secret = NULL, two_factor_enabled = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    console.log('verifying password', password, hash);
    // this will compare '$2a$12$R9a3Qw1uhbKyXsIT3lq66enPcA9MlUhv0gWAjwQe5xbvTbdCEW.z6' with 'xxx'
    // it should return true
    return await bcrypt.compare(password, hash);
  }

  static async updatePassword(userId: number, newPassword: string): Promise<void> {
    const password_hash = await bcrypt.hash(newPassword, 12);
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [password_hash, userId]
    );
  }
}
