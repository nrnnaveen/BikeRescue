import { NextRequest, NextResponse } from 'next/server';
import { getShopById } from '@/lib/db/shops';
import { getShopRatings } from '@/lib/db/ratings';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shopId = parseInt(params.id, 10);
    const shop = getShopById(shopId);

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const ratings = getShopRatings(shopId);

    return NextResponse.json({
      shop,
      ratings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch shop details.' },
      { status: 500 }
    );
  }
}
