import { NextResponse } from 'next/server';

import { deleteLanguage, getLanguageStoryCount, updateLanguage } from '@/db/queries/settings';
import { requireAdmin } from '@/lib/admin';

import { routeIdParamSchema, updateLanguageBodySchema } from '@/types';

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

    const bodyResult = updateLanguageBodySchema.safeParse(await req.json());
    if (!bodyResult.success)
      return NextResponse.json(
        { error: 'Invalid request body', details: bodyResult.error.issues },
        { status: 400 },
      );

    const language = await updateLanguage(paramResult.data.id, bodyResult.data);

    return NextResponse.json(language);
  } catch (error) {
    console.error('Failed to update language:', error);

    return NextResponse.json({ error: 'Failed to update language' }, { status: 500 });
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

    const storyCount = await getLanguageStoryCount(paramResult.data.id);
    if (storyCount > 0)
      return NextResponse.json(
        { error: 'Cannot delete a language that has stories. Deactivate it instead.' },
        { status: 409 },
      );

    await deleteLanguage(paramResult.data.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete language:', error);

    return NextResponse.json({ error: 'Failed to delete language' }, { status: 500 });
  }
}
