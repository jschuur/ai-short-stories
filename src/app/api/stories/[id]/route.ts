import { getStoryById } from '@/db/queries';

import { routeIdParamSchema } from '@/types';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const paramResult = routeIdParamSchema.safeParse(await params);
  if (!paramResult.success)
    return Response.json(
      { error: 'Invalid route parameters', details: paramResult.error.issues },
      { status: 400 },
    );

  const resolvedParams = paramResult.data;
  console.log('Fetching story with ID:', resolvedParams.id);

  try {
    const story = await getStoryById(resolvedParams.id);

    if (!story) {
      console.warn('Story not found with ID:', resolvedParams.id);

      return Response.json({ error: 'Story not found' }, { status: 404 });
    }

    console.log('Story found:', story.id, story.title);
    return Response.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);

    return Response.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}
