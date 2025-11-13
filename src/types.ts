export type StoryRequirement = {
  count: number;
  options: (string | number)[];
  template: string;
  label?: string;
};
export type StoryRequirements = Record<string, StoryRequirement>;

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
