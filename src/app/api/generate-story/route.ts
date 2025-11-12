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

    const prompt = builtPrompt(
      targetLanguage,
      storyLength,
      difficultyLevel,
      topic,
      includeVocabulary || false,
      includeGrammarTips || false
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
