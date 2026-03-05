import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';

import {
  audioProviders,
  difficultyLevels,
  storyRequirementsConfig,
} from '@/config';
import { audios, stories } from '@/db/schema';
import { env } from '@/env';

export type SupportedLanguage = {
  languageCode: string;
  name: string;
  googleCloudTts: boolean;
};
export type Story = InferSelectModel<typeof stories>;
export type CreateStory = InferInsertModel<typeof stories>;
export type UpdateStory = Partial<CreateStory>;

export type StoryStatus = Story['status'];

export type StoryRequirementOptions = {
  count: number;
  options: (string | number)[];
  template: string;
  label?: string;
};

export type StoryRequirementType = keyof typeof storyRequirementsConfig;
export type StoryRequirementValue = (string | number)[];
export type StoryRequirementsConfig = Record<StoryRequirementType, StoryRequirementOptions>;
export type StoryRequirements = Record<StoryRequirementType, (string | number)[]>;

export const storyRequestSchema = z.object({
  targetLanguage: z.string().min(1, { message: 'Target language is required' }),
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
  topic: z.string().default(''),
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
export type StoryRequest = z.infer<typeof storyRequestSchema>;

// API parameter schemas
export const routeIdParamSchema = z.object({
  id: z.string().min(1, { message: 'ID is required' }),
});
export type RouteIdParam = z.infer<typeof routeIdParamSchema>;

export const createTopicIdeaBodySchema = z.object({
  topic: z.string().min(1, { message: 'Topic is required' }),
});
export type CreateTopicIdeaBody = z.infer<typeof createTopicIdeaBodySchema>;

export const updateTopicIdeaBodySchema = z.object({
  topic: z.string().min(1).optional(),
}).strict();
export type UpdateTopicIdeaBody = z.infer<typeof updateTopicIdeaBodySchema>;

export const createStoryRequirementCategoryBodySchema = z.object({
  key: z.string().min(1, { message: 'Key is required' }),
  label: z.string().min(1, { message: 'Label is required' }),
  count: z.number().int().min(1).optional().default(1),
  template: z.string().min(1, { message: 'Template is required' }),
  options: z.array(z.union([z.string(), z.number()])).min(1, { message: 'Options are required' }),
}).strict();
export type CreateStoryRequirementCategoryBody = z.infer<typeof createStoryRequirementCategoryBodySchema>;

export const updateStoryRequirementCategoryBodySchema = z.object({
  key: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  count: z.number().int().min(1).optional(),
  template: z.string().min(1).optional(),
  options: z.array(z.union([z.string(), z.number()])).min(1).optional(),
}).strict();
export type UpdateStoryRequirementCategoryBody = z.infer<typeof updateStoryRequirementCategoryBodySchema>;

export const createLanguageBodySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  languageCode: z.string().min(1, { message: 'Language code is required' }),
  googleCloudTts: z.coerce.boolean().optional().default(false),
}).strict();
export type CreateLanguageBody = z.infer<typeof createLanguageBodySchema>;

export const updateLanguageBodySchema = z.object({
  name: z.string().min(1).optional(),
  languageCode: z.string().min(1).optional(),
  googleCloudTts: z.boolean().optional(),
  active: z.boolean().optional(),
}).strict();
export type UpdateLanguageBody = z.infer<typeof updateLanguageBodySchema>;

export const configQuerySchema = z.object({
  includeInactive: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => v === 'true'),
});
export type ConfigQuery = z.infer<typeof configQuerySchema>;

export const storiesQuerySchema = z.object({
  paginated: z.union([z.literal('true'), z.literal('false')]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(['title', 'language', 'difficultyLevel', 'wordCount', 'updatedAt', 'createdAt']).optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  language: z.string().optional(),
  difficulty: z.string().optional(),
  lengthRange: z.string().optional(),
  createdWithinDays: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});
export type StoriesQuery = z.infer<typeof storiesQuerySchema>;

// Usage tracking types
export type StoryUsage = {
  characters: number;
  tokens: number;
  requests: number;
  timestamp: number;
};

export type DailyUsage = {
  date: string; // YYYY-MM-DD format
  characters: number;
  tokens: number;
  requests: number;
};

export type SessionUsage = {
  characters: number;
  tokens: number;
  requests: number;
};

export type UsageStats = {
  currentStory: StoryUsage | null;
  session: SessionUsage;
  dailyHistory: DailyUsage[];
  totalAllTime: {
    characters: number;
    tokens: number;
    requests: number;
  };
};

export type Audio = InferSelectModel<typeof audios>;
export type CreateAudio = InferInsertModel<typeof audios>;
export type UpdateAudio = Partial<CreateAudio>;

export type AudioProvider = (typeof audioProviders)[number];

export type AudioProviderSettings = {
  voice: string;
  model: string;
  prompt: string;
};

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  canCreateStory: boolean;
  canCreateAudio: boolean;
  createdAt: string;
};

export type DashboardStats = {
  cards: {
    stories: number;
    languages: number;
    users: number;
    totalTokens: number;
  };
  charts: {
    storiesByDay: { date: string; stories: number }[];
    tokensByDay: { date: string; inputTokens: number; outputTokens: number }[];
  };
  users: DashboardUser[];
};
