import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db/users';
import { createShop } from '@/lib/db/shops';
import { signToken, AUTH_COOKIE_OPTIONS } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      role = 'USER',
      name,
      email,
      phone,
      password,
      shop_name,
      owner_name,
      address,
      latitude,
      longitude,
      services,
    } = body;

    // Validation
    if (!email || !password || !phone) {
      return NextResponse.json(
        { error: 'Email, phone, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    if (role === 'SHOP') {
      if (!shop_name || !owner_name || !address) {
        return NextResponse.json(
          { error: 'Shop name, owner name, and address are required for mechanical shop registration.' },
          { status: 400 }
        );
      }

      // Create shop user
      const user = createUser({
        name: owner_name,
        email,
        phone,
        password,
        role: 'SHOP',
      });

      // Default lat/lng if not provided
      const lat = typeof latitude === 'number' ? latitude : 12.9716;
      const lng = typeof longitude === 'number' ? longitude : 77.5946;

      const shop = createShop({
        user_id: user.id,
        shop_name,
        owner_name,
        phone,
        address,
        latitude: lat,
        longitude: lng,
        services: Array.isArray(services) && services.length > 0 ? services : ['Puncture', 'General Service'],
        is_available: true,
      });

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: 'SHOP',
        shopId: shop.id,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          ...user,
          shop_id: shop.id,
        },
      });

      response.cookies.set({
        ...AUTH_COOKIE_OPTIONS,
        value: token,
      });

      return response;
    } else {
      if (!name) {
        return NextResponse.json(
          { error: 'Full name is required.' },
          { status: 400 }
        );
      }

      const user = createUser({
        name,
        email,
        phone,
        password,
        role: 'USER',
      });

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: 'USER',
      });

      const response = NextResponse.json({
        success: true,
        user,
      });

      response.cookies.set({
        ...AUTH_COOKIE_OPTIONS,
        value: token,
      });

      return response;
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register account.' },
      { status: 500 }
    );
  }
}
