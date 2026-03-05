import { NextResponse } from 'next/server';

import { deleteTopicIdea, updateTopicIdea } from '@/db/queries/settings';
import { requireAdmin } from '@/lib/admin';

import { routeIdParamSchema, updateTopicIdeaBodySchema } from '@/types';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return adminCheck.error;

    const paramResult = routeIdParamSchema.safeParse(await params);
    if (!paramResult.success)
      return NextResponse.json(
        { error: 'Invalid route parameters', details: paramResult.error.issues },
        { status: 400 },
      );

    const bodyResult = updateTopicIdeaBodySchema.safeParse(await req.json());
    if (!bodyResult.success)
      return NextResponse.json(
        { error: 'Invalid request body', details: bodyResult.error.issues },
        { status: 400 },
      );

    const idea = await updateTopicIdea(paramResult.data.id, bodyResult.data);

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Failed to update topic idea:', error);

    return NextResponse.json({ error: 'Failed to update topic idea' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return adminCheck.error;

    const paramResult = routeIdParamSchema.safeParse(await params);
    if (!paramResult.success)
      return NextResponse.json(
        { error: 'Invalid route parameters', details: paramResult.error.issues },
        { status: 400 },
      );

    await deleteTopicIdea(paramResult.data.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete topic idea:', error);

    return NextResponse.json({ error: 'Failed to delete topic idea' }, { status: 500 });
  }
}
