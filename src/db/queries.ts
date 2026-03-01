import { desc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { audios, stories } from '@/db/schema';

import type { Audio, CreateAudio, CreateStory, Story, UpdateStory } from '@/types';

export async function createStory(params: CreateStory): Promise<Story> {
  const [story] = await db
    .insert(stories)
    .values({ status: 'pending', ...params })
    .returning();

  return story;
}

export async function updateStory(params: UpdateStory): Promise<void> {
  if (!params.id) throw new Error('Story ID is required for updatingStory');

  await db
    .update(stories)
    .set({
      updatedAt: new Date(),
      ...params,
    })
    .where(eq(stories.id, params.id));
}

export async function getStoryById(id: string): Promise<Story | null> {
  const res = await db.select().from(stories).where(eq(stories.id, id)).limit(1);

  return res.length > 0 ? res[0] : null;
}

export async function getLastStory(): Promise<Story | null> {
  const res = await db.select().from(stories).orderBy(desc(stories.createdAt)).limit(1);

  return res.length > 0 ? res[0] : null;
}

export async function getRecentStories(limit: number = 10): Promise<Story[]> {
  return await db.select().from(stories).orderBy(desc(stories.createdAt)).limit(limit);
}

export async function createAudio(params: CreateAudio): Promise<Audio> {
  const [audio] = await db.insert(audios).values(params).returning();

  return audio;
}
