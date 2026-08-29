import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createRequest,
  getUserRequests,
  getActiveUserRequest,
  getShopAssignedRequests,
  getNearbyIncomingRequests,
} from '@/lib/db/requests';
import { getShopByUserId } from '@/lib/db/shops';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === 'SHOP') {
      const shop = getShopByUserId(user.id);
      if (!shop) {
        return NextResponse.json({ error: 'Shop profile not found' }, { status: 404 });
      }

      const assigned = getShopAssignedRequests(shop.id);
      const incoming = getNearbyIncomingRequests(shop.latitude, shop.longitude, 30);

      return NextResponse.json({
        assigned,
        incoming,
        shop,
      });
    }

    // Role: USER
    const requests = getUserRequests(user.id);
    const active = getActiveUserRequest(user.id);

    return NextResponse.json({
      requests,
      active,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch requests.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bike_id, problem, description, phone, latitude, longitude } = body;

    if (!bike_id || !problem || !phone || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Bike, problem, phone, and valid GPS location are required.' },
        { status: 400 }
      );
    }

    const request = createRequest({
      user_id: user.id,
      bike_id: parseInt(bike_id, 10),
      problem,
      description,
      phone,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create help request.' },
      { status: 500 }
    );
  }
}
