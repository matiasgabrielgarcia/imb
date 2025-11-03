import { query } from '../database/connection';

export interface RentalPayment {
  id: number;
  rental_id: number;
  amount: number;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  payment_reference?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  late_fee: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRentalPaymentData {
  rental_id: number;
  amount: number;
  due_date: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
}

export interface UpdateRentalPaymentData {
  paid_date?: string;
  payment_method?: string;
  payment_reference?: string;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  late_fee?: number;
  notes?: string;
}

export class RentalPaymentModel {
  static async create(data: CreateRentalPaymentData): Promise<RentalPayment> {
    const result = await query(
      `INSERT INTO rental_payments (rental_id, amount, due_date, payment_method, payment_reference, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.rental_id,
        data.amount,
        data.due_date,
        data.payment_method,
        data.payment_reference,
        data.notes,
      ]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<RentalPayment | null> {
    const result = await query('SELECT * FROM rental_payments WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByRentalId(rentalId: number): Promise<RentalPayment[]> {
    const result = await query('SELECT * FROM rental_payments WHERE rental_id = $1 ORDER BY due_date DESC', [rentalId]);
    return result.rows;
  }

  static async findAll(): Promise<RentalPayment[]> {
    const result = await query('SELECT * FROM rental_payments ORDER BY due_date DESC');
    return result.rows;
  }

  static async findByStatus(status: string): Promise<RentalPayment[]> {
    const result = await query('SELECT * FROM rental_payments WHERE status = $1 ORDER BY due_date DESC', [status]);
    return result.rows;
  }

  static async update(id: number, data: UpdateRentalPaymentData): Promise<RentalPayment | null> {
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
      `UPDATE rental_payments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0] || null;
  }

  static async remove(id: number): Promise<void> {
    await query('DELETE FROM rental_payments WHERE id = $1', [id]);
  }

  // Business logic methods
  static async markAsPaid(id: number, paymentMethod: string, paymentReference?: string): Promise<RentalPayment | null> {
    return this.update(id, {
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
      payment_method: paymentMethod,
      payment_reference: paymentReference
    });
  }

  static async markAsOverdue(id: number, lateFee: number = 0): Promise<RentalPayment | null> {
    return this.update(id, {
      status: 'overdue',
      late_fee: lateFee
    });
  }

  static async getOverduePayments(): Promise<RentalPayment[]> {
    const result = await query(`
      SELECT * FROM rental_payments 
      WHERE status = 'pending' 
      AND due_date < CURRENT_DATE 
      ORDER BY due_date ASC
    `);
    return result.rows;
  }

  static async getUpcomingPayments(days: number = 7): Promise<RentalPayment[]> {
    const result = await query(`
      SELECT * FROM rental_payments 
      WHERE status = 'pending' 
      AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
      ORDER BY due_date ASC
    `);
    return result.rows;
  }

  static async generateMonthlyPayments(rentalId: number, startDate: string, endDate: string, monthlyAmount: number): Promise<RentalPayment[]> {
    const payments: RentalPayment[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dueDate = new Date(currentDate);
      dueDate.setMonth(dueDate.getMonth() + 1);
      
      if (dueDate <= end) {
        const payment = await this.create({
          rental_id: rentalId,
          amount: monthlyAmount,
          due_date: dueDate.toISOString().split('T')[0]
        });
        payments.push(payment);
      }
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return payments;
  }

  static async getPaymentStats(rentalId?: number): Promise<{
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
    overdue_amount: number;
    total_payments: number;
    paid_payments: number;
    pending_payments: number;
    overdue_payments: number;
  }> {
    const whereClause = rentalId ? 'WHERE rental_id = $1' : '';
    const params = rentalId ? [rentalId] : [];
    
    const result = await query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount + late_fee ELSE 0 END), 0) as overdue_amount,
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_payments
      FROM rental_payments
      ${whereClause}
    `, params);
    
    return result.rows[0];
  }
}
