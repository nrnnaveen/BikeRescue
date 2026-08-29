import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getBikesByUserId, createBike } from '@/lib/db/bikes';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bikes = getBikesByUserId(user.id);
    return NextResponse.json({ bikes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bikes.' },
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
    const { brand, model, registration_number, year, color, fuel_type } = body;

    if (!brand || !model || !registration_number || !year) {
      return NextResponse.json(
        { error: 'Brand, model, registration number, and year are required.' },
        { status: 400 }
      );
    }

    const bike = createBike({
      user_id: user.id,
      brand,
      model,
      registration_number,
      year: parseInt(year, 10),
      color,
      fuel_type,
    });

    return NextResponse.json({ success: true, bike }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add bike.' },
      { status: 500 }
    );
  }
}
