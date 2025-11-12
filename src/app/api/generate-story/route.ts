import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { z } from 'zod';

import { buildPrompt } from '@/lib/ai';

import { difficultyLevels, getRandomTopic, languages } from '@/config';
import { env } from '@/env';

const requestSchema = z.object({
  targetLanguage: z.enum(languages as [string, ...string[]], {
    message: 'Invalid target language',
  }),
  storyLength: z.coerce
    .number()
    .int()
    .min(env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MIN)
    .max(env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MAX)
    .transform((val) =>
      Math.max(
        env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MIN,
        Math.min(env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MAX, val)
      )
    ),
  difficultyLevel: z.enum(Object.keys(difficultyLevels) as [string, ...string[]], {
    message: 'Invalid difficulty level',
  }),
  topic: z.string().default(getRandomTopic()),
  includeVocabulary: z.coerce
    .boolean()
    .optional()
    .default(false)
    .transform((val) => (env.NEXT_PUBLIC_DISABLE_VOCABULARY_CHECKBOX ? false : val)),
  includeGrammarTips: z.coerce
    .boolean()
    .optional()
    .default(false)
    .transform((val) => (env.NEXT_PUBLIC_DISABLE_GRAMMAR_CHECKBOX ? false : val)),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);

    if (!parseResult.success)
      return new Response(
        JSON.stringify({
          error: 'Invalid request parameters',
          details: parseResult.error.issues,
        }),
        { status: 400 }
      );

    const prompt = buildPrompt(parseResult.data);

    const result = streamText({
      model: anthropic(env.ANTHROPIC_MODEL),
      prompt,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error generating story:', error);

    return new Response(JSON.stringify({ error: 'Failed to generate story' }), { status: 500 });
  }
}
