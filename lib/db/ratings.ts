import { getDb } from './index';
import { Rating } from '../types';
import { getShopById } from './shops';

export function createRating(data: {
  request_id: number;
  user_id: number;
  shop_id: number;
  rating: number;
  comment?: string;
}): Rating {
  const db = getDb();
  
  // Validate rating value
  const stars = Math.min(5, Math.max(1, Math.round(data.rating)));

  const stmt = db.prepare(`
    INSERT INTO ratings (request_id, user_id, shop_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  stmt.run(
    data.request_id,
    data.user_id,
    data.shop_id,
    stars,
    data.comment?.trim() || null
  );

  // Recalculate and update shop average rating
  recalculateShopRating(data.shop_id);

  const created = db.prepare(`
    SELECT r.*, u.name as user_name 
    FROM ratings r
    JOIN users u ON u.id = r.user_id
    WHERE r.request_id = ?
  `).get(data.request_id) as any;

  return mapRating(created);
}

export function getShopRatings(shopId: number): Rating[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT r.*, u.name as user_name 
    FROM ratings r
    JOIN users u ON u.id = r.user_id
    WHERE r.shop_id = ? 
    ORDER BY r.created_at DESC
  `);
  const rows = stmt.all(shopId) as any[];
  return rows.map(mapRating);
}

export function getRatingByRequestId(requestId: number): Rating | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT r.*, u.name as user_name 
    FROM ratings r
    JOIN users u ON u.id = r.user_id
    WHERE r.request_id = ?
  `);
  const row = stmt.get(requestId) as any;
  if (!row) return null;
  return mapRating(row);
}

function recalculateShopRating(shopId: number) {
  const db = getDb();
  const stats = db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as count 
    FROM ratings 
    WHERE shop_id = ?
  `).get(shopId) as any;

  if (stats && stats.count > 0) {
    const avg = Number(Number(stats.avg_rating).toFixed(1));
    const count = Number(stats.count);
    db.prepare(`
      UPDATE shops 
      SET rating = ?, rating_count = ?
      WHERE id = ?
    `).run(avg, count, shopId);
  }
}

function mapRating(row: any): Rating {
  return {
    id: row.id,
    request_id: Number(row.request_id),
    user_id: Number(row.user_id),
    shop_id: Number(row.shop_id),
    rating: Number(row.rating),
    comment: row.comment || undefined,
    created_at: row.created_at,
    user_name: row.user_name || undefined,
  };
}
