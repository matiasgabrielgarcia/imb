import { query } from '../database/connection';

export interface Sale {
  id: number;
  property_id: number;
  fecha: string;
  precio: number;
  algo: string;
  direccion: string;
  m2: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSaleData {
  property_id: number;
  fecha: string;
  precio: number;
  algo: string;
  direccion: string;
  m2: number;
}

export interface UpdateSaleData {
  fecha?: string;
  precio?: number;
  algo?: string;
  direccion?: string;
  m2?: number;
}

export class SaleModel {
  static async create(data: CreateSaleData): Promise<Sale> {
    const result = await query(
      `INSERT INTO sales (property_id, fecha, precio, algo, direccion, m2)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.property_id,
        data.fecha,
        data.precio,
        data.algo,
        data.direccion,
        data.m2,
      ]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<Sale | null> {
    const result = await query('SELECT * FROM sales WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByPropertyId(propertyId: number): Promise<Sale[]> {
    const result = await query('SELECT * FROM sales WHERE property_id = $1 ORDER BY id DESC', [propertyId]);
    return result.rows;
  }

  static async findAll(): Promise<Sale[]> {
    const result = await query('SELECT * FROM sales ORDER BY id DESC');
    return result.rows;
  }

  static async update(id: number, data: UpdateSaleData): Promise<Sale | null> {
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
      `UPDATE sales SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0] || null;
  }

  static async remove(id: number): Promise<void> {
    await query('DELETE FROM sales WHERE id = $1', [id]);
  }
}
