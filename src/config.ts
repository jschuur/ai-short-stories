export const defaultDifficultyLevel = 'B1';

export const difficultyLevels: Record<string, string> = {
  A1: 'A1 (beginners)',
  A2: 'A2 (pre-intermediate)',
  B1: 'B1 (intermediate)',
  B2: 'B2 (upper-intermediate)',
  C1: 'C1 (advanced)',
  C2: 'C2 (proficiency)',
};

export const languages = ['German', 'Dutch', 'French', 'Spanish'];
export const defaultLanguage = 'Dutch';

export const defaultStoryLength = 100;
export const defaultTopic = 'A story about a journey to a new country';

export type StoryRequirement = {
  count: number;
  options: (string | number)[];
  template: string;
  label?: string;
};
export type StoryRequirements = Record<string, StoryRequirement>;

export const storyRequirements: StoryRequirements = {
  tones: {
    count: 3,
    options: [
      'excitement',
      'anger',
      'joy',
      'pride',
      'earnestness',
      'dedication',
      'desperation',
      'sadness',
      'fear',
      'hope',
      'nostalgia',
      'curiosity',
      'melancholy',
      'wonder',
      'anxiety',
      'serenity',
      'anticipation',
      'tension',
      'relief',
      'confusion',
      'determination',
      'loneliness',
      'contentment',
      'regret',
      'euphoria',
      'suspense',
      'gratitude',
    ],
    template: 'Use these tones: {value}',
    label: 'Tones to incorporate',
  },
  type: {
    count: 1,
    options: [
      'Comedy',
      'Drama',
      'Thriller',
      'Horror',
      'Romance',
      'Science Fiction',
      'Fantasy',
      'Historical',
      'Biography',
      'Essay',
      'News Article',
      'Travel Guide',
      'Travel Diary',
    ],
    template: 'Is written in the {value} genre/style',
    label: 'Story Type',
  },
  characterCount: {
    count: 1,
    options: [1, 2, 3],
    template: 'Features {value} main character{plural}',
    label: 'Number of Main Characters',
  },
  conflictType: {
    count: 1,
    options: ['internal', 'external', 'person vs nature', 'person vs society', 'person vs person'],
    template: 'Centers around {value} conflict',
    label: 'Conflict Type',
  },
  endingStyle: {
    count: 1,
    options: ['happy', 'open-ended', 'twist ending', 'bittersweet', 'tragic'],
    template: 'Has a {value} ending',
    label: 'Ending Style',
  },
  focus: {
    count: 1,
    options: ['character-driven', 'plot-driven', 'atmosphere-driven'],
    template: 'Is {value} in its approach',
    label: 'Focus',
  },
  pacing: {
    count: 1,
    options: ['fast-paced', 'slow-paced', 'varied pacing'],
    template: 'Has {value} pacing',
    label: 'Pacing',
  },
  dialogueRatio: {
    count: 1,
    options: ['dialogue-heavy', 'narrative-heavy', 'balanced'],
    template: 'Uses a {value} balance between dialogue and narration',
    label: 'Dialogue Ratio',
  },
};

export const ANTHROPIC_MODEL = 'claude-sonnet-4-5-20250929';
