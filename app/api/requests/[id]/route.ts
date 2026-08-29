import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getRequestById,
  acceptRequest,
  updateRequestStatus,
  cancelRequest,
} from '@/lib/db/requests';
import { getShopByUserId } from '@/lib/db/shops';
import { RequestStatus } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestId = parseInt(params.id, 10);
    const request = getRequestById(requestId);

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ request });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch request details.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestId = parseInt(params.id, 10);
    const body = await req.json();
    const { action, status } = body;

    if (action === 'accept') {
      if (user.role !== 'SHOP') {
        return NextResponse.json({ error: 'Only registered shops can accept requests.' }, { status: 403 });
      }

      const shop = getShopByUserId(user.id);
      if (!shop) {
        return NextResponse.json({ error: 'Shop profile not found' }, { status: 404 });
      }

      const updated = acceptRequest(requestId, shop.id);
      return NextResponse.json({ success: true, request: updated });
    }

    if (action === 'cancel') {
      const success = cancelRequest(requestId, user.id);
      if (!success) {
        return NextResponse.json(
          { error: 'Cannot cancel this request.' },
          { status: 400 }
        );
      }
      const updated = getRequestById(requestId);
      return NextResponse.json({ success: true, request: updated });
    }

    if (action === 'update_status') {
      const allowedStatuses: RequestStatus[] = [
        'ON_THE_WAY',
        'ARRIVED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
      ];

      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 });
      }

      let shopId: number | undefined;
      if (user.role === 'SHOP') {
        const shop = getShopByUserId(user.id);
        if (shop) shopId = shop.id;
      }

      const updated = updateRequestStatus(requestId, status, shopId);
      return NextResponse.json({ success: true, request: updated });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update request.' },
      { status: 500 }
    );
  }
}
