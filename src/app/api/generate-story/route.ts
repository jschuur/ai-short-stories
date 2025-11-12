import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

import { builtPrompt } from '@/lib/ai';

import { env } from '@/env';

export async function POST(req: Request) {
  try {
    const {
      targetLanguage,
      storyLength,
      difficultyLevel,
      topic,
      includeVocabulary,
      includeGrammarTips,
    } = await req.json();

    if (!targetLanguage || !storyLength || !difficultyLevel || !topic) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Clamp story length to min/max bounds
    const numStoryLength = parseInt(String(storyLength), 10);
    const clampedStoryLength = Math.max(
      env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MIN,
      Math.min(env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MAX, numStoryLength)
    );

    // Force disable if env vars are set
    const finalIncludeVocabulary = env.NEXT_PUBLIC_DISABLE_VOCABULARY_CHECKBOX
      ? false
      : includeVocabulary || false;
    const finalIncludeGrammarTips = env.NEXT_PUBLIC_DISABLE_GRAMMAR_CHECKBOX
      ? false
      : includeGrammarTips || false;

    const prompt = builtPrompt(
      targetLanguage,
      clampedStoryLength,
      difficultyLevel,
      topic,
      finalIncludeVocabulary,
      finalIncludeGrammarTips
    );

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
