import { getDb } from './index';
import { HelpRequest, RequestStatus, BikeProblem } from '../types';
import { calculateDistance } from '../distance';
import { createNotification } from './notifications';
import { getNearbyShops } from './shops';

export function createRequest(data: {
  user_id: number;
  bike_id: number;
  problem: BikeProblem;
  description?: string;
  phone: string;
  latitude: number;
  longitude: number;
}): HelpRequest {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO requests (user_id, bike_id, problem, description, phone, latitude, longitude, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'SEARCHING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  const result = stmt.run(
    data.user_id,
    data.bike_id,
    data.problem,
    data.description?.trim() || null,
    data.phone.trim(),
    data.latitude,
    data.longitude
  );

  const newId = Number(result.lastInsertRowid);
  const created = getRequestById(newId);
  if (!created) throw new Error('Failed to create request');

  // Notify nearby available shops
  try {
    const nearbyShops = getNearbyShops(data.latitude, data.longitude, 20, true);
    for (const shop of nearbyShops) {
      createNotification({
        shop_id: shop.id,
        request_id: newId,
        message: `🚨 New nearby breakdown: ${data.problem} (${shop.distance} km away)`,
      });
    }
  } catch (e) {
    console.error('Failed to send nearby notifications:', e);
  }

  return created;
}

export function getRequestById(id: number): HelpRequest | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      r.*,
      u.name as user_name,
      b.brand as bike_brand,
      b.model as bike_model,
      b.registration_number as bike_registration,
      b.year as bike_year,
      s.shop_name,
      s.owner_name as shop_owner,
      s.phone as shop_phone,
      s.address as shop_address,
      s.latitude as shop_latitude,
      s.longitude as shop_longitude,
      s.rating as shop_rating,
      rt.rating as user_rating
    FROM requests r
    JOIN users u ON u.id = r.user_id
    JOIN bikes b ON b.id = r.bike_id
    LEFT JOIN shops s ON s.id = r.shop_id
    LEFT JOIN ratings rt ON rt.request_id = r.id
    WHERE r.id = ?
  `);

  const row = stmt.get(id) as any;
  if (!row) return null;
  return mapRequestRow(row);
}

export function getUserRequests(userId: number): HelpRequest[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      r.*,
      u.name as user_name,
      b.brand as bike_brand,
      b.model as bike_model,
      b.registration_number as bike_registration,
      b.year as bike_year,
      s.shop_name,
      s.owner_name as shop_owner,
      s.phone as shop_phone,
      s.address as shop_address,
      s.latitude as shop_latitude,
      s.longitude as shop_longitude,
      s.rating as shop_rating,
      rt.rating as user_rating
    FROM requests r
    JOIN users u ON u.id = r.user_id
    JOIN bikes b ON b.id = r.bike_id
    LEFT JOIN shops s ON s.id = r.shop_id
    LEFT JOIN ratings rt ON rt.request_id = r.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `);

  const rows = stmt.all(userId) as any[];
  return rows.map(mapRequestRow);
}

export function getActiveUserRequest(userId: number): HelpRequest | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      r.*,
      u.name as user_name,
      b.brand as bike_brand,
      b.model as bike_model,
      b.registration_number as bike_registration,
      b.year as bike_year,
      s.shop_name,
      s.owner_name as shop_owner,
      s.phone as shop_phone,
      s.address as shop_address,
      s.latitude as shop_latitude,
      s.longitude as shop_longitude,
      s.rating as shop_rating,
      rt.rating as user_rating
    FROM requests r
    JOIN users u ON u.id = r.user_id
    JOIN bikes b ON b.id = r.bike_id
    LEFT JOIN shops s ON s.id = r.shop_id
    LEFT JOIN ratings rt ON rt.request_id = r.id
    WHERE r.user_id = ? AND r.status NOT IN ('COMPLETED', 'CANCELLED')
    ORDER BY r.created_at DESC
    LIMIT 1
  `);

  const row = stmt.get(userId) as any;
  if (!row) return null;
  return mapRequestRow(row);
}

export function getShopAssignedRequests(shopId: number): HelpRequest[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      r.*,
      u.name as user_name,
      b.brand as bike_brand,
      b.model as bike_model,
      b.registration_number as bike_registration,
      b.year as bike_year,
      s.shop_name,
      s.owner_name as shop_owner,
      s.phone as shop_phone,
      s.address as shop_address,
      s.latitude as shop_latitude,
      s.longitude as shop_longitude,
      s.rating as shop_rating,
      rt.rating as user_rating
    FROM requests r
    JOIN users u ON u.id = r.user_id
    JOIN bikes b ON b.id = r.bike_id
    LEFT JOIN shops s ON s.id = r.shop_id
    LEFT JOIN ratings rt ON rt.request_id = r.id
    WHERE r.shop_id = ?
    ORDER BY r.created_at DESC
  `);

  const rows = stmt.all(shopId) as any[];
  return rows.map(mapRequestRow);
}

export function getNearbyIncomingRequests(shopLat: number, shopLng: number, maxRadiusKm: number = 25): HelpRequest[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      r.*,
      u.name as user_name,
      b.brand as bike_brand,
      b.model as bike_model,
      b.registration_number as bike_registration,
      b.year as bike_year,
      s.shop_name,
      s.owner_name as shop_owner,
      s.phone as shop_phone,
      s.address as shop_address,
      s.latitude as shop_latitude,
      s.longitude as shop_longitude,
      s.rating as shop_rating,
      rt.rating as user_rating
    FROM requests r
    JOIN users u ON u.id = r.user_id
    JOIN bikes b ON b.id = r.bike_id
    LEFT JOIN shops s ON s.id = r.shop_id
    LEFT JOIN ratings rt ON rt.request_id = r.id
    WHERE r.status = 'SEARCHING'
    ORDER BY r.created_at DESC
  `);

  const rows = stmt.all() as any[];
  const mapped = rows.map(mapRequestRow);

  return mapped
    .map((req) => {
      const dist = calculateDistance(shopLat, shopLng, req.latitude, req.longitude);
      return { ...req, distance: dist };
    })
    .filter((req) => (req.distance ?? 999) <= maxRadiusKm)
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
}

export function acceptRequest(requestId: number, shopId: number): HelpRequest | null {
  const db = getDb();
  const req = getRequestById(requestId);
  if (!req) return null;
  if (req.status !== 'SEARCHING') {
    throw new Error('Request has already been accepted or closed by another mechanic.');
  }

  const stmt = db.prepare(`
    UPDATE requests 
    SET status = 'ACCEPTED', shop_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'SEARCHING'
  `);

  const result = stmt.run(shopId, requestId);
  if (result.changes === 0) {
    throw new Error('Could not accept request. It may have been accepted already.');
  }

  const updated = getRequestById(requestId);
  if (updated) {
    // Notify rider
    createNotification({
      user_id: updated.user_id,
      request_id: requestId,
      message: `🔧 ${updated.shop_name || 'A mechanic'} has accepted your help request!`,
    });
  }

  return updated;
}

export function updateRequestStatus(requestId: number, status: RequestStatus, shopId?: number): HelpRequest | null {
  const db = getDb();
  const current = getRequestById(requestId);
  if (!current) return null;

  if (shopId && current.shop_id && current.shop_id !== shopId) {
    throw new Error('Unauthorized: You are not assigned to this request');
  }

  const stmt = db.prepare(`
    UPDATE requests 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(status, requestId);
  const updated = getRequestById(requestId);

  if (updated) {
    const statusMessages: Record<string, string> = {
      ON_THE_WAY: `🚗 ${updated.shop_name || 'Mechanic'} is on the way to your location.`,
      ARRIVED: `📍 ${updated.shop_name || 'Mechanic'} has arrived at your location.`,
      IN_PROGRESS: `🛠️ ${updated.shop_name || 'Mechanic'} has started repairing your bike.`,
      COMPLETED: `✅ Repair completed! Please rate ${updated.shop_name || 'the shop'}.`,
      CANCELLED: `❌ Help request was cancelled.`,
    };

    if (statusMessages[status]) {
      createNotification({
        user_id: updated.user_id,
        request_id: requestId,
        message: statusMessages[status],
      });
    }
  }

  return updated;
}

export function cancelRequest(requestId: number, userId: number): boolean {
  const db = getDb();
  const req = getRequestById(requestId);
  if (!req || req.user_id !== userId) return false;
  if (req.status === 'COMPLETED' || req.status === 'CANCELLED') return false;

  const stmt = db.prepare(`
    UPDATE requests 
    SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `);

  stmt.run(requestId, userId);

  if (req.shop_id) {
    createNotification({
      shop_id: req.shop_id,
      request_id: requestId,
      message: `ℹ️ Rider cancelled the breakdown request #${requestId}`,
    });
  }

  return true;
}

function mapRequestRow(row: any): HelpRequest {
  let dist: number | undefined;
  if (row.shop_latitude && row.shop_longitude && row.latitude && row.longitude) {
    dist = calculateDistance(
      Number(row.latitude),
      Number(row.longitude),
      Number(row.shop_latitude),
      Number(row.shop_longitude)
    );
  }

  return {
    id: row.id,
    user_id: row.user_id,
    bike_id: row.bike_id,
    problem: row.problem,
    description: row.description || '',
    phone: row.phone,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    status: row.status,
    shop_id: row.shop_id ? Number(row.shop_id) : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_name: row.user_name,
    bike_brand: row.bike_brand,
    bike_model: row.bike_model,
    bike_registration: row.bike_registration,
    bike_year: row.bike_year ? Number(row.bike_year) : undefined,
    shop_name: row.shop_name,
    shop_owner: row.shop_owner,
    shop_phone: row.shop_phone,
    shop_address: row.shop_address,
    shop_latitude: row.shop_latitude ? Number(row.shop_latitude) : undefined,
    shop_longitude: row.shop_longitude ? Number(row.shop_longitude) : undefined,
    shop_rating: row.shop_rating ? Number(Number(row.shop_rating).toFixed(1)) : undefined,
    distance: dist,
    user_rating: row.user_rating ? Number(row.user_rating) : undefined,
  };
}
