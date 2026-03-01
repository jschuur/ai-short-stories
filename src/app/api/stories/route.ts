import { NextRequest, NextResponse } from 'next/server';

import { getRecentStories } from '@/db/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const stories = await getRecentStories(limit);

    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Failed to fetch stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}
