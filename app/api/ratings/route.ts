import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createRating, getRatingByRequestId } from '@/lib/db/ratings';
import { getRequestById } from '@/lib/db/requests';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized. Only riders can rate services.' }, { status: 401 });
    }

    const body = await req.json();
    const { request_id, rating, comment } = body;

    if (!request_id || !rating) {
      return NextResponse.json(
        { error: 'request_id and rating (1-5) are required.' },
        { status: 400 }
      );
    }

    const request = getRequestById(parseInt(request_id, 10));
    if (!request) {
      return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
    }

    if (request.user_id !== user.id) {
      return NextResponse.json({ error: 'You can only rate your own service requests.' }, { status: 403 });
    }

    if (request.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Ratings can only be submitted for completed services.' }, { status: 400 });
    }

    if (!request.shop_id) {
      return NextResponse.json({ error: 'No mechanic shop was assigned to this request.' }, { status: 400 });
    }

    const existingRating = getRatingByRequestId(request.id);
    if (existingRating) {
      return NextResponse.json({ error: 'This request has already been rated.' }, { status: 400 });
    }

    const created = createRating({
      request_id: request.id,
      user_id: user.id,
      shop_id: request.shop_id,
      rating: parseInt(rating, 10),
      comment,
    });

    return NextResponse.json({ success: true, rating: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit rating.' },
      { status: 500 }
    );
  }
}
