import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { setShopAvailability, getShopByUserId } from '@/lib/db/shops';

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SHOP') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shop = getShopByUserId(user.id);
    if (!shop) {
      return NextResponse.json({ error: 'Shop profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { is_available } = body;

    if (typeof is_available !== 'boolean') {
      return NextResponse.json(
        { error: 'is_available boolean field is required' },
        { status: 400 }
      );
    }

    setShopAvailability(shop.id, is_available);

    return NextResponse.json({
      success: true,
      is_available,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update availability.' },
      { status: 500 }
    );
  }
}
