import { query } from '../database/connection';

export interface OpportunityNote {
  id: number;
  opportunity_id: number;
  note: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOpportunityNoteData {
  opportunity_id: number;
  note: string;
  created_by?: string;
}

export interface UpdateOpportunityNoteData {
  note?: string;
}

export class OpportunityNoteModel {
  static async create(data: CreateOpportunityNoteData): Promise<OpportunityNote> {
    const result = await query(
      `INSERT INTO opportunity_notes (opportunity_id, note, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        data.opportunity_id,
        data.note,
        data.created_by || null,
      ]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<OpportunityNote | null> {
    const result = await query(
      'SELECT * FROM opportunity_notes WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByOpportunityId(opportunityId: number): Promise<OpportunityNote[]> {
    const result = await query(
      'SELECT * FROM opportunity_notes WHERE opportunity_id = $1 ORDER BY created_at DESC',
      [opportunityId]
    );
    return result.rows;
  }

  static async update(id: number, data: UpdateOpportunityNoteData): Promise<OpportunityNote | null> {
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
      `UPDATE opportunity_notes SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0] || null;
  }

  static async remove(id: number): Promise<void> {
    await query('DELETE FROM opportunity_notes WHERE id = $1', [id]);
  }
}

