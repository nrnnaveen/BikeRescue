import { NextRequest, NextResponse } from 'next/server';
import { getNearbyShops, getAllShops } from '@/lib/db/shops';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radius');
    const availableOnlyParam = searchParams.get('only_available');

    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      const radius = radiusParam ? parseFloat(radiusParam) : 25;
      const onlyAvailable = availableOnlyParam === 'true';

      const shops = getNearbyShops(lat, lng, radius, onlyAvailable);
      return NextResponse.json({ shops });
    }

    const shops = getAllShops();
    return NextResponse.json({ shops });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch shops.' },
      { status: 500 }
    );
  }
}
