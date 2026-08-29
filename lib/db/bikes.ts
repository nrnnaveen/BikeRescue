import { getDb } from './index';
import { Bike } from '../types';

export function createBike(bikeData: {
  user_id: number;
  brand: string;
  model: string;
  registration_number: string;
  year: number;
  color?: string;
  fuel_type?: string;
}): Bike {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO bikes (user_id, brand, model, registration_number, year, color, fuel_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    bikeData.user_id,
    bikeData.brand.trim(),
    bikeData.model.trim(),
    bikeData.registration_number.trim().toUpperCase(),
    bikeData.year,
    bikeData.color?.trim() || null,
    bikeData.fuel_type?.trim() || 'Petrol'
  );

  const newId = Number(result.lastInsertRowid);
  const bike = getBikeById(newId);
  if (!bike) throw new Error('Failed to create bike');
  return bike;
}

export function getBikesByUserId(userId: number): Bike[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM bikes 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `);
  const rows = stmt.all(userId) as any[];
  return rows.map(mapBikeRow);
}

export function getBikeById(id: number): Bike | null {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM bikes WHERE id = ?`);
  const row = stmt.get(id) as any;
  if (!row) return null;
  return mapBikeRow(row);
}

export function updateBike(
  id: number,
  userId: number,
  data: Partial<Omit<Bike, 'id' | 'user_id' | 'created_at'>>
): Bike | null {
  const db = getDb();
  const current = getBikeById(id);
  if (!current || current.user_id !== userId) return null;

  const brand = data.brand?.trim() || current.brand;
  const model = data.model?.trim() || current.model;
  const registration_number = data.registration_number?.trim().toUpperCase() || current.registration_number;
  const year = data.year || current.year;
  const color = data.color !== undefined ? data.color?.trim() : current.color;
  const fuel_type = data.fuel_type !== undefined ? data.fuel_type?.trim() : current.fuel_type;

  const stmt = db.prepare(`
    UPDATE bikes 
    SET brand = ?, model = ?, registration_number = ?, year = ?, color = ?, fuel_type = ?
    WHERE id = ? AND user_id = ?
  `);

  stmt.run(brand, model, registration_number, year, color, fuel_type, id, userId);
  return getBikeById(id);
}

export function deleteBike(id: number, userId: number): boolean {
  const db = getDb();
  const stmt = db.prepare(`DELETE FROM bikes WHERE id = ? AND user_id = ?`);
  const result = stmt.run(id, userId);
  return result.changes > 0;
}

function mapBikeRow(row: any): Bike {
  return {
    id: row.id,
    user_id: row.user_id,
    brand: row.brand,
    model: row.model,
    registration_number: row.registration_number,
    year: Number(row.year),
    color: row.color || undefined,
    fuel_type: row.fuel_type || undefined,
    created_at: row.created_at,
  };
}
