import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { UserSafe, UserRole } from './types';
import { getUserById } from './db/users';
import { getShopByUserId } from './db/shops';

const JWT_SECRET = process.env.JWT_SECRET || 'bikerescue_super_secure_jwt_secret_dev_2026';
const COOKIE_NAME = 'bikerescue_session';

export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  shopId?: number;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function getSessionFromRequest(request?: NextRequest): TokenPayload | null {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(COOKIE_NAME)?.value;
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch (e) {
      return null;
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser(request?: NextRequest): Promise<(UserSafe & { shopId?: number }) | null> {
  const session = getSessionFromRequest(request);
  if (!session) return null;

  const user = getUserById(session.userId);
  if (!user) return null;

  let shopId = user.shop_id;
  if (!shopId && user.role === 'SHOP') {
    const shop = getShopByUserId(user.id);
    if (shop) shopId = shop.id;
  }

  return {
    ...user,
    shopId,
  };
}

export const AUTH_COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
