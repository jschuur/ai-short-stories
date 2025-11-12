export const defaultDifficultyLevel = 'B1';

export const difficultyLevels: Record<string, string> = {
  A1: 'A1 (beginners)',
  A2: 'A2 (pre-intermediate)',
  B1: 'B1 (intermediate)',
  B2: 'B2 (upper-intermediate)',
  C1: 'C1 (advanced)',
  C2: 'C2 (proficiency)',
};

export const languages = [
  'German',
  'Dutch',
  'French',
  'Spanish',
  'English',
  'Italian',
  'Portuguese',
  'Chinese',
  'Ukrainian',
];
export const defaultLanguage = 'Dutch';

export const defaultStoryLength = 100;
export const defaultTopic = 'A story about a journey to a new country';

export const topicIdeas = [
  'A story about a journey to a new country',
  'An unexpected encounter at a local market',
  'A day in the life of a street musician',
  'A mysterious package arrives at the wrong address',
  'Two strangers meet on a train and share their stories',
  'A chef discovers a forgotten family recipe',
  'Someone finds an old photograph in a second-hand book',
  'A letter written decades ago is finally delivered',
  'A person learns a new skill that changes their perspective',
  'A scientist uses their knowledge to solve a big problem to save the world',
  'An ordinary day turns extraordinary due to a small coincidence',
  'A neighbour helps solve a puzzling problem',
  'Someone revisits their childhood hometown after many years',
  'An explorer finds beauty and wonder in the strangest place',
  'A lost pet brings together an unlikely friendship',
  'A café regular notices something unusual one morning',
  'An aspiring artist finds inspiration in an unexpected place',
  'A family tradition is questioned by the younger generation',
  'Someone discovers a hidden talent during a crisis',
  'A technological mishap leads to a fortunate discovery',
  'Two people bond over their shared love of books',
  'A gardener witnesses the changing seasons and reflects on life',
];

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

export const defaultAnthropicModel = 'claude-sonnet-4-5-20250929';
