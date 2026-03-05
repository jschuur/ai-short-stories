import { NextResponse } from 'next/server';

import { createLanguage, getLanguagesWithStoryCounts } from '@/db/queries/settings';
import { requireAdmin } from '@/lib/admin';

import { createLanguageBodySchema } from '@/types';

export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return adminCheck.error;

    const languages = await getLanguagesWithStoryCounts();

    return NextResponse.json(languages);
  } catch (error) {
    console.error('Failed to fetch languages:', error);

    return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return adminCheck.error;

    const bodyResult = createLanguageBodySchema.safeParse(await req.json());
    if (!bodyResult.success)
      return NextResponse.json(
        { error: 'Invalid request body', details: bodyResult.error.issues },
        { status: 400 },
      );

    const language = await createLanguage(bodyResult.data);

    return NextResponse.json(language, { status: 201 });
  } catch (error) {
    console.error('Failed to create language:', error);

    return NextResponse.json({ error: 'Failed to create language' }, { status: 500 });
  }
}
