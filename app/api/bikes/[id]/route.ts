import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateBike, deleteBike, getBikeById } from '@/lib/db/bikes';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bikeId = parseInt(params.id, 10);
    const body = await req.json();

    const updated = updateBike(bikeId, user.id, body);
    if (!updated) {
      return NextResponse.json(
        { error: 'Bike not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, bike: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update bike.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bikeId = parseInt(params.id, 10);
    const success = deleteBike(bikeId, user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Bike not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete bike.' },
      { status: 500 }
    );
  }
}
