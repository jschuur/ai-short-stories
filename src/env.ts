import { createEnv } from '@t3-oss/env-nextjs';
import { boolean } from 'boolean';
import { z } from 'zod';

import {
  defaultAnthropicModel,
  defaultDifficultyLevel,
  defaultStoryLength,
  defaultTargetLanguage,
} from '@/config';

export const env = createEnv({
  server: {
    ANTHROPIC_API_KEY: z.string().min(1),
    ANTHROPIC_MODEL: z.string().min(4).default(defaultAnthropicModel),
    SITE_HOSTNAME: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_DEFAULT_TARGET_LANGUAGE: z.string().min(1).default(defaultTargetLanguage),
    NEXT_PUBLIC_DEFAULT_STORY_LENGTH: z.coerce.number().default(defaultStoryLength),
    NEXT_PUBLIC_DEFAULT_DIFFICULTY_LEVEL: z.string().min(1).default(defaultDifficultyLevel),
    NEXT_PUBLIC_DEFAULT_TOPIC: z.string().optional(),
    NEXT_PUBLIC_DEFAULT_INCLUDE_VOCABULARY: z.preprocess((val) => {
      if (val === undefined || val === '') return false;
      return boolean(val as string);
    }, z.boolean().default(false)),
    NEXT_PUBLIC_DEFAULT_INCLUDE_GRAMMAR: z.preprocess((val) => {
      if (val === undefined || val === '') return false;
      return boolean(val as string);
    }, z.boolean().default(false)),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_DEFAULT_TARGET_LANGUAGE: process.env.NEXT_PUBLIC_DEFAULT_TARGET_LANGUAGE,
    NEXT_PUBLIC_DEFAULT_STORY_LENGTH: process.env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH,
    NEXT_PUBLIC_DEFAULT_DIFFICULTY_LEVEL: process.env.NEXT_PUBLIC_DEFAULT_DIFFICULTY_LEVEL,
    NEXT_PUBLIC_DEFAULT_TOPIC: process.env.NEXT_PUBLIC_DEFAULT_TOPIC,
    NEXT_PUBLIC_DEFAULT_INCLUDE_VOCABULARY: process.env.NEXT_PUBLIC_DEFAULT_INCLUDE_VOCABULARY,
    NEXT_PUBLIC_DEFAULT_INCLUDE_GRAMMAR: process.env.NEXT_PUBLIC_DEFAULT_INCLUDE_GRAMMAR,
  },
});
