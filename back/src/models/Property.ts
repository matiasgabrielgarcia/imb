import { query } from '../database/connection';

export interface Property {
  id: number;
  numero: string;
  direccion: string;
  m2: number;
  cliente: string;
  fecha: string;
  rev: string;
  latitude: number;
  longitude: number;
  dni?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePropertyData {
  numero: string;
  direccion: string;
  m2: number;
  cliente: string;
  fecha: string;
  rev: string;
  latitude: number;
  longitude: number;
  dni?: string;
}

export interface UpdatePropertyData {
  numero?: string;
  direccion?: string;
  m2?: number;
  cliente?: string;
  fecha?: string;
  rev?: string;
  latitude?: number;
  longitude?: number;
  dni?: string;
}

export class PropertyModel {
  static async create(data: CreatePropertyData): Promise<Property> {
    const result = await query(
      `INSERT INTO properties (numero, direccion, m2, cliente, fecha, rev, latitude, longitude, dni)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.numero,
        data.direccion,
        data.m2,
        data.cliente,
        data.fecha,
        data.rev,
        data.latitude,
        data.longitude,
        data.dni || null,
      ]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<Property | null> {
    const result = await query('SELECT * FROM properties WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findAll(): Promise<Property[]> {
    const result = await query('SELECT * FROM properties ORDER BY id DESC');
    return result.rows;
  }

  static async update(id: number, data: UpdatePropertyData): Promise<Property | null> {
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
      `UPDATE properties SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0] || null;
  }

  static async remove(id: number): Promise<void> {
    await query('DELETE FROM properties WHERE id = $1', [id]);
  }
}


