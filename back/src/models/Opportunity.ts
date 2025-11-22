import { query } from '../database/connection';

export interface Opportunity {
  id: number;
  channel: string;
  property_id: number | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  contact_name: string | null;
  messages: string[];
  status: string;
  opportunity_type: 'sale' | 'rental';
  received_at: Date;
  status_updated_at: Date;
  created_at: Date;
  updated_at: Date;
  metadata: any;
}

export interface CreateOpportunityData {
  channel?: string;
  property_id: number;
  email?: string;
  phone?: string;
  mobile?: string;
  contact_name: string;
  messages?: string[];
  status?: string;
  opportunity_type: 'sale' | 'rental';
  metadata?: any;
}

export interface UpdateOpportunityData {
  channel?: string;
  property_id?: number | null;
  email?: string;
  phone?: string;
  mobile?: string;
  contact_name?: string;
  messages?: string[];
  status?: string;
  opportunity_type?: 'sale' | 'rental';
  metadata?: any;
}

export class OpportunityModel {
  static async create(data: CreateOpportunityData): Promise<Opportunity> {
    const result = await query(
      `INSERT INTO opportunities (
        channel, property_id, email, phone, mobile, contact_name, 
        messages, status, opportunity_type, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.channel || 'public_website',
        data.property_id,
        data.email,
        data.phone,
        data.mobile,
        data.contact_name,
        data.messages || [],
        data.status || 'pending_contact',
        data.opportunity_type,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<Opportunity | null> {
    const result = await query('SELECT * FROM opportunities WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findAll(): Promise<Opportunity[]> {
    const result = await query('SELECT * FROM opportunities ORDER BY received_at DESC');
    return result.rows;
  }

  static async findByStatus(status: string): Promise<Opportunity[]> {
    const result = await query(
      'SELECT * FROM opportunities WHERE status = $1 ORDER BY received_at DESC',
      [status]
    );
    return result.rows;
  }

  static async findByPropertyId(propertyId: number): Promise<Opportunity[]> {
    const result = await query(
      'SELECT * FROM opportunities WHERE property_id = $1 ORDER BY received_at DESC',
      [propertyId]
    );
    return result.rows;
  }

  static async findByType(type: 'sale' | 'rental'): Promise<Opportunity[]> {
    const result = await query(
      'SELECT * FROM opportunities WHERE opportunity_type = $1 ORDER BY received_at DESC',
      [type]
    );
    return result.rows;
  }

  static async update(id: number, data: UpdateOpportunityData): Promise<Opportunity | null> {
    const fields: string[] = [];
    const values: any[] = [];

    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    entries.forEach(([key, value], index) => {
      if (key === 'metadata') {
        fields.push(`${key} = $${index + 1}`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = $${index + 1}`);
        values.push(value as any);
      }
    });

    if (fields.length === 0) {
      const current = await this.findById(id);
      return current;
    }

    const result = await query(
      `UPDATE opportunities SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0] || null;
  }

  static async remove(id: number): Promise<void> {
    await query('DELETE FROM opportunities WHERE id = $1', [id]);
  }

  static async addMessage(id: number, message: string): Promise<Opportunity | null> {
    const result = await query(
      `UPDATE opportunities 
       SET messages = array_append(messages, $1), updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *`,
      [message, id]
    );
    return result.rows[0] || null;
  }
}
