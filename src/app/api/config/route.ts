import { NextRequest, NextResponse } from 'next/server';

import { getLanguages, getStoryRequirementCategories, getTopicIdeas } from '@/db/queries/settings';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/permissions';

import { configQuerySchema } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const query = Object.fromEntries(req.nextUrl.searchParams.entries());
    const queryResult = configQuerySchema.safeParse(query);

    const includeInactive = queryResult.success && queryResult.data.includeInactive === true;

    let activeOnly = true;

    if (includeInactive) {
      const session = await auth.api.getSession({ headers: req.headers });

      if (session?.user && isAdmin(session.user)) activeOnly = false;
    }

    const [languages, topicIdeas, storyRequirements] = await Promise.all([
      getLanguages(activeOnly),
      getTopicIdeas(),
      getStoryRequirementCategories(),
    ]);

    return NextResponse.json({ languages, topicIdeas, storyRequirements });
  } catch (error) {
    console.error('Failed to fetch config:', error);

    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}
