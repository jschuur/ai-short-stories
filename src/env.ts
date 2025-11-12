import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { defaultAnthropicModel } from '@/config';

export const env = createEnv({
  server: {
    ANTHROPIC_API_KEY: z.string().min(1),
    ANTHROPIC_MODEL: z.string().min(4).default(defaultAnthropicModel),
    SITE_HOSTNAME: z.string().optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
});
