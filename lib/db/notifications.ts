import { getDb } from './index';
import { Notification } from '../types';

export function createNotification(data: {
  user_id?: number | null;
  shop_id?: number | null;
  request_id: number;
  message: string;
}): Notification {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO notifications (user_id, shop_id, request_id, message, is_read, created_at)
    VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
  `);

  const result = stmt.run(
    data.user_id || null,
    data.shop_id || null,
    data.request_id,
    data.message
  );

  const newId = Number(result.lastInsertRowid);
  const row = db.prepare(`SELECT * FROM notifications WHERE id = ?`).get(newId) as any;
  return mapNotification(row);
}

export function getUserNotifications(userId: number): Notification[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 20
  `);
  const rows = stmt.all(userId) as any[];
  return rows.map(mapNotification);
}

export function getShopNotifications(shopId: number): Notification[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM notifications 
    WHERE shop_id = ? 
    ORDER BY created_at DESC 
    LIMIT 20
  `);
  const rows = stmt.all(shopId) as any[];
  return rows.map(mapNotification);
}

export function markNotificationAsRead(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
}

export function markAllNotificationsAsRead(userId?: number, shopId?: number): boolean {
  const db = getDb();
  if (userId) {
    db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`).run(userId);
  } else if (shopId) {
    db.prepare(`UPDATE notifications SET is_read = 1 WHERE shop_id = ?`).run(shopId);
  }
  return true;
}

function mapNotification(row: any): Notification {
  return {
    id: row.id,
    user_id: row.user_id ? Number(row.user_id) : null,
    shop_id: row.shop_id ? Number(row.shop_id) : null,
    request_id: Number(row.request_id),
    message: row.message,
    is_read: Boolean(row.is_read),
    created_at: row.created_at,
  };
}
