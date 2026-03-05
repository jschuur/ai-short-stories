import { NextResponse } from 'next/server';

import {
  createStoryRequirementCategory,
  getStoryRequirementCategories,
} from '@/db/queries/settings';
import { requireAdmin } from '@/lib/admin';

import { createStoryRequirementCategoryBodySchema } from '@/types';

export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return adminCheck.error;

    const categories = await getStoryRequirementCategories();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch story requirement categories:', error);

    return NextResponse.json(
      { error: 'Failed to fetch story requirement categories' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return adminCheck.error;

    const bodyResult = createStoryRequirementCategoryBodySchema.safeParse(await req.json());

    if (!bodyResult.success)
      return NextResponse.json(
        { error: 'Invalid request body', details: bodyResult.error.issues },
        { status: 400 },
      );

    const category = await createStoryRequirementCategory(bodyResult.data);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Failed to create story requirement category:', error);

    return NextResponse.json(
      { error: 'Failed to create story requirement category' },
      { status: 500 },
    );
  }
}
