import { NextResponse } from 'next/server';

import { createTopicIdea, getTopicIdeasWithStoryCounts } from '@/db/queries/settings';
import { requireAdmin } from '@/lib/admin';

import { createTopicIdeaBodySchema } from '@/types';

export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return adminCheck.error;

    const ideas = await getTopicIdeasWithStoryCounts();

    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Failed to fetch topic ideas:', error);

    return NextResponse.json({ error: 'Failed to fetch topic ideas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return adminCheck.error;

    const bodyResult = createTopicIdeaBodySchema.safeParse(await req.json());
    if (!bodyResult.success)
      return NextResponse.json(
        { error: 'Invalid request body', details: bodyResult.error.issues },
        { status: 400 },
      );

    const idea = await createTopicIdea(bodyResult.data);

    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    console.error('Failed to create topic idea:', error);

    return NextResponse.json({ error: 'Failed to create topic idea' }, { status: 500 });
  }
}
