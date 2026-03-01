import { getStoryById } from '@/db/queries';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  console.log('Fetching story with ID:', resolvedParams.id);
  
  try {
    const story = await getStoryById(resolvedParams.id);

    if (!story) {
      console.log('Story not found with ID:', resolvedParams.id);
      return Response.json({ error: 'Story not found' }, { status: 404 });
    }

    console.log('Story found:', story.id, story.title);
    return Response.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    return Response.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}