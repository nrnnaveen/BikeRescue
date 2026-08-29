import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export async function POST() {
  try {
    const seedScript = path.resolve(process.cwd(), 'scripts/seed.js');
    execSync(`node "${seedScript}"`, { stdio: 'pipe' });
    return NextResponse.json({
      success: true,
      message: 'Demo database has been reset and seeded successfully!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to seed database.' },
      { status: 500 }
    );
  }
}
