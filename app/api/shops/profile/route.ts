import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateShopProfile, getShopByUserId } from '@/lib/db/shops';

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
    const updated = updateShopProfile(shop.id, body);

    return NextResponse.json({
      success: true,
      shop: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update shop profile.' },
      { status: 500 }
    );
  }
}
