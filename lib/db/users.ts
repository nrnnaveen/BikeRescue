import { getDb } from './index';
import { User, UserSafe, UserRole } from '../types';
import bcrypt from 'bcryptjs';

export function createUser(userData: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}): UserSafe {
  const db = getDb();
  const passwordHash = bcrypt.hashSync(userData.password, 10);

  const stmt = db.prepare(`
    INSERT INTO users (name, email, phone, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    userData.name.trim(),
    userData.email.trim().toLowerCase(),
    userData.phone.trim(),
    passwordHash,
    userData.role
  );

  const newId = Number(result.lastInsertRowid);
  const created = getUserById(newId);
  if (!created) {
    throw new Error('Failed to create user');
  }
  return created;
}

export function getUserByEmail(email: string): (User & { shop_id?: number }) | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT u.*, s.id as shop_id 
    FROM users u
    LEFT JOIN shops s ON s.user_id = u.id
    WHERE LOWER(u.email) = ?
  `);
  const row = stmt.get(email.trim().toLowerCase()) as any;
  if (!row) return null;
  return row as User & { shop_id?: number };
}

export function getUserById(id: number): UserSafe | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at, s.id as shop_id
    FROM users u
    LEFT JOIN shops s ON s.user_id = u.id
    WHERE u.id = ?
  `);
  const row = stmt.get(id) as any;
  if (!row) return null;
  return row as UserSafe;
}
