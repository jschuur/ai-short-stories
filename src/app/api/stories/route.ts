import { NextRequest, NextResponse } from 'next/server';

import { getRecentStories, getStoriesPaginated } from '@/db/queries';

import { storiesQuerySchema } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const query = Object.fromEntries(request.nextUrl.searchParams.entries());
    const queryResult = storiesQuerySchema.safeParse(query);

    if (!queryResult.success)
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.issues },
        { status: 400 },
      );

    const params = queryResult.data;

    if (params.paginated === 'true') {
      const result = await getStoriesPaginated(params);

      return NextResponse.json(result);
    }

    const stories = await getRecentStories(params.limit);

    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Failed to fetch stories:', error);

    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}
