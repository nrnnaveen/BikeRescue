import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getShopByUserId } from '@/lib/db/shops';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    let shopDetails = null;
    if (user.role === 'SHOP') {
      shopDetails = getShopByUserId(user.id);
    }

    return NextResponse.json({
      user,
      shop: shopDetails,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch current user.' },
      { status: 500 }
    );
  }
}
