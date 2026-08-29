import { getDb } from './index';
import { Shop } from '../types';
import { calculateDistance } from '../distance';

export function createShop(shopData: {
  user_id: number;
  shop_name: string;
  owner_name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  services: string[];
  is_available?: boolean;
}): Shop {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO shops (user_id, shop_name, owner_name, phone, address, latitude, longitude, services, is_available, rating, rating_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 0)
  `);

  const result = stmt.run(
    shopData.user_id,
    shopData.shop_name.trim(),
    shopData.owner_name.trim(),
    shopData.phone.trim(),
    shopData.address.trim(),
    shopData.latitude,
    shopData.longitude,
    JSON.stringify(shopData.services || []),
    shopData.is_available ?? true ? 1 : 0
  );

  const newId = Number(result.lastInsertRowid);
  const shop = getShopById(newId);
  if (!shop) throw new Error('Failed to create shop');
  return shop;
}

export function getShopById(id: number): Shop | null {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM shops WHERE id = ?`);
  const row = stmt.get(id) as any;
  if (!row) return null;
  return mapShopRow(row);
}

export function getShopByUserId(userId: number): Shop | null {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM shops WHERE user_id = ?`);
  const row = stmt.get(userId) as any;
  if (!row) return null;
  return mapShopRow(row);
}

export function setShopAvailability(shopId: number, isAvailable: boolean): boolean {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE shops 
    SET is_available = ? 
    WHERE id = ?
  `);
  stmt.run(isAvailable ? 1 : 0, shopId);
  return true;
}

export function updateShopProfile(
  shopId: number,
  data: Partial<Omit<Shop, 'id' | 'user_id' | 'created_at'>>
): Shop | null {
  const db = getDb();
  const current = getShopById(shopId);
  if (!current) return null;

  const shop_name = data.shop_name ?? current.shop_name;
  const owner_name = data.owner_name ?? current.owner_name;
  const phone = data.phone ?? current.phone;
  const address = data.address ?? current.address;
  const latitude = data.latitude ?? current.latitude;
  const longitude = data.longitude ?? current.longitude;
  const services = data.services ? JSON.stringify(data.services) : JSON.stringify(current.services);
  const is_available = data.is_available !== undefined ? (data.is_available ? 1 : 0) : (current.is_available ? 1 : 0);

  const stmt = db.prepare(`
    UPDATE shops 
    SET shop_name = ?, owner_name = ?, phone = ?, address = ?, latitude = ?, longitude = ?, services = ?, is_available = ?
    WHERE id = ?
  `);

  stmt.run(shop_name, owner_name, phone, address, latitude, longitude, services, is_available, shopId);
  return getShopById(shopId);
}

export function getAllShops(): Shop[] {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM shops ORDER BY rating DESC, shop_name ASC`);
  const rows = stmt.all() as any[];
  return rows.map(mapShopRow);
}

/**
 * Find shops ordered by distance with progressive radius search (5km -> 10km -> 20km -> all)
 */
export function getNearbyShops(
  userLat: number,
  userLng: number,
  radiusKm: number = 20,
  onlyAvailable: boolean = false
): Shop[] {
  const db = getDb();
  const query = onlyAvailable
    ? `SELECT * FROM shops WHERE is_available = 1`
    : `SELECT * FROM shops`;
  
  const stmt = db.prepare(query);
  const rows = stmt.all() as any[];

  const withDistance = rows.map((row) => {
    const shop = mapShopRow(row);
    const dist = calculateDistance(userLat, userLng, shop.latitude, shop.longitude);
    return {
      ...shop,
      distance: dist,
    };
  });

  // Filter within requested radius and sort by distance
  const filtered = withDistance.filter((s) => s.distance <= radiusKm);
  filtered.sort((a, b) => a.distance - b.distance);

  // If no shops found within radius, return the closest shops available anyway
  if (filtered.length === 0 && withDistance.length > 0) {
    withDistance.sort((a, b) => a.distance - b.distance);
    return withDistance.slice(0, 10);
  }

  return filtered;
}

function mapShopRow(row: any): Shop {
  let parsedServices: string[] = [];
  try {
    parsedServices = typeof row.services === 'string' ? JSON.parse(row.services) : row.services || [];
  } catch (e) {
    parsedServices = [];
  }

  return {
    id: row.id,
    user_id: row.user_id,
    shop_name: row.shop_name,
    owner_name: row.owner_name,
    phone: row.phone,
    address: row.address,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    services: parsedServices,
    is_available: Boolean(row.is_available),
    rating: Number(Number(row.rating).toFixed(1)),
    rating_count: Number(row.rating_count || 0),
    created_at: row.created_at,
  };
}
