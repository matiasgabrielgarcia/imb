import { query } from '../database/connection';

export interface Rental {
  id: number;
  property_id: number;
  contract_number: string;
  start_date: string;
  end_date: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  monthly_rent: number;
  deposit: number;
  tenant_name: string;
  tenant_email?: string;
  tenant_phone?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RentalPriceHistory {
  id: number;
  rental_id: number;
  price: number;
  effective_date: string;
  reason?: string;
  created_at: Date;
}

export interface CreateRentalData {
  property_id: number;
  contract_number: string;
  start_date: string;
  end_date: string;
  status?: 'in_progress' | 'completed' | 'cancelled';
  monthly_rent: number;
  deposit?: number;
  tenant_name: string;
  tenant_email?: string;
  tenant_phone?: string;
  notes?: string;
}

export interface UpdateRentalData {
  contract_number?: string;
  start_date?: string;
  end_date?: string;
  status?: 'in_progress' | 'completed' | 'cancelled';
  monthly_rent?: number;
  deposit?: number;
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
  notes?: string;
}

export interface AddPriceChangeData {
  rental_id: number;
  price: number;
  effective_date: string;
  reason?: string;
}

export class RentalModel {
  static async create(data: CreateRentalData): Promise<Rental> {
    const result = await query(
      `INSERT INTO rentals (property_id, contract_number, start_date, end_date, status, monthly_rent, deposit, tenant_name, tenant_email, tenant_phone, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.property_id,
        data.contract_number,
        data.start_date,
        data.end_date,
        data.status || 'in_progress',
        data.monthly_rent,
        data.deposit || 0,
        data.tenant_name,
        data.tenant_email,
        data.tenant_phone,
        data.notes,
      ]
    );
    
    // Add initial price to price history
    await this.addPriceChange(result.rows[0].id, {
      rental_id: result.rows[0].id,
      price: data.monthly_rent,
      effective_date: data.start_date,
      reason: 'Initial contract price'
    });
    
    return result.rows[0];
  }

  static async findById(id: number): Promise<Rental | null> {
    const result = await query('SELECT * FROM rentals WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByPropertyId(propertyId: number): Promise<Rental[]> {
    const result = await query('SELECT * FROM rentals WHERE property_id = $1 ORDER BY start_date DESC', [propertyId]);
    return result.rows;
  }

  static async findAll(): Promise<Rental[]> {
    const result = await query('SELECT * FROM rentals ORDER BY start_date DESC');
    return result.rows;
  }

  static async findByStatus(status: 'in_progress' | 'completed' | 'cancelled'): Promise<Rental[]> {
    const result = await query('SELECT * FROM rentals WHERE status = $1 ORDER BY start_date DESC', [status]);
    return result.rows;
  }

  static async findActiveRentals(): Promise<Rental[]> {
    const result = await query(
      `SELECT * FROM rentals 
       WHERE status = 'in_progress' 
       AND start_date <= CURRENT_DATE 
       AND end_date >= CURRENT_DATE 
       ORDER BY start_date DESC`
    );
    return result.rows;
  }

  static async update(id: number, data: UpdateRentalData): Promise<Rental | null> {
    const fields: string[] = [];
    const values: any[] = [];

    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    entries.forEach(([key, value], index) => {
      fields.push(`${key} = $${index + 1}`);
      values.push(value as any);
    });

    if (fields.length === 0) {
      const current = await this.findById(id);
      return current;
    }

    const result = await query(
      `UPDATE rentals SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0] || null;
  }

  static async remove(id: number): Promise<void> {
    // Delete price history first
    await query('DELETE FROM rental_price_history WHERE rental_id = $1', [id]);
    // Then delete the rental
    await query('DELETE FROM rentals WHERE id = $1', [id]);
  }

  // Price history methods
  static async addPriceChange(rentalId: number, data: AddPriceChangeData): Promise<RentalPriceHistory> {
    const result = await query(
      `INSERT INTO rental_price_history (rental_id, price, effective_date, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [rentalId, data.price, data.effective_date, data.reason]
    );
    return result.rows[0];
  }

  static async getPriceHistory(rentalId: number): Promise<RentalPriceHistory[]> {
    const result = await query(
      'SELECT * FROM rental_price_history WHERE rental_id = $1 ORDER BY effective_date DESC',
      [rentalId]
    );
    return result.rows;
  }

  static async getCurrentPrice(rentalId: number): Promise<number | null> {
    const result = await query(
      `SELECT price FROM rental_price_history 
       WHERE rental_id = $1 AND effective_date <= CURRENT_DATE 
       ORDER BY effective_date DESC LIMIT 1`,
      [rentalId]
    );
    return result.rows[0]?.price || null;
  }

  // Contract validation
  static async validateContractDates(propertyId: number, startDate: string, endDate: string, excludeId?: number): Promise<boolean> {
    const queryStr = excludeId 
      ? `SELECT COUNT(*) FROM rentals 
         WHERE property_id = $1 
         AND status = 'in_progress'
         AND id != $4
         AND ((start_date <= $2 AND end_date >= $2) OR (start_date <= $3 AND end_date >= $3) OR (start_date >= $2 AND end_date <= $3))`
      : `SELECT COUNT(*) FROM rentals 
         WHERE property_id = $1 
         AND status = 'in_progress'
         AND ((start_date <= $2 AND end_date >= $2) OR (start_date <= $3 AND end_date >= $3) OR (start_date >= $2 AND end_date <= $3))`;
    
    const params = excludeId ? [propertyId, startDate, endDate, excludeId] : [propertyId, startDate, endDate];
    const result = await query(queryStr, params);
    return parseInt(result.rows[0].count) === 0;
  }
}