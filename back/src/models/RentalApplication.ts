import { query } from '../database/connection';

export interface RentalApplication {
  id: number;
  property_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_dni: string;
  monthly_income?: number;
  employment_status?: string;
  employer_name?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
  application_date: Date;
  review_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRentalApplicationData {
  property_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_dni: string;
  monthly_income?: number;
  employment_status?: string;
  employer_name?: string;
  notes?: string;
}

export interface UpdateRentalApplicationData {
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
  review_date?: Date;
  notes?: string;
}

export class RentalApplicationModel {
  static async create(data: CreateRentalApplicationData): Promise<RentalApplication> {
    const result = await query(
      `INSERT INTO rental_applications (property_id, applicant_name, applicant_email, applicant_phone, applicant_dni, monthly_income, employment_status, employer_name, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.property_id,
        data.applicant_name,
        data.applicant_email,
        data.applicant_phone,
        data.applicant_dni,
        data.monthly_income,
        data.employment_status,
        data.employer_name,
        data.notes,
      ]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<RentalApplication | null> {
    const result = await query('SELECT * FROM rental_applications WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByPropertyId(propertyId: number): Promise<RentalApplication[]> {
    const result = await query('SELECT * FROM rental_applications WHERE property_id = $1 ORDER BY application_date DESC', [propertyId]);
    return result.rows;
  }

  static async findAll(): Promise<RentalApplication[]> {
    const result = await query('SELECT * FROM rental_applications ORDER BY application_date DESC');
    return result.rows;
  }

  static async findByStatus(status: string): Promise<RentalApplication[]> {
    const result = await query('SELECT * FROM rental_applications WHERE status = $1 ORDER BY application_date DESC', [status]);
    return result.rows;
  }

  static async update(id: number, data: UpdateRentalApplicationData): Promise<RentalApplication | null> {
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
      `UPDATE rental_applications SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0] || null;
  }

  static async remove(id: number): Promise<void> {
    await query('DELETE FROM rental_applications WHERE id = $1', [id]);
  }

  // Business logic methods
  static async approveApplication(id: number): Promise<RentalApplication | null> {
    return this.update(id, { 
      status: 'approved', 
      review_date: new Date() 
    });
  }

  static async rejectApplication(id: number, reason?: string): Promise<RentalApplication | null> {
    return this.update(id, { 
      status: 'rejected', 
      review_date: new Date(),
      notes: reason 
    });
  }

  static async getPendingApplications(): Promise<RentalApplication[]> {
    return this.findByStatus('pending');
  }

  static async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    under_review: number;
  }> {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review
      FROM rental_applications
    `);
    return result.rows[0];
  }
}
