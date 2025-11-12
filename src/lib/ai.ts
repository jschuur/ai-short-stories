import { storyRequirements } from '@/config';

import { StoryRequirement } from '@/types';

function buildStoryRequirements(config: StoryRequirement): (string | number)[] {
  if (config.options.length === 0) {
    throw new Error('No options available in configuration');
  }

  if (config.count === 1) {
    const randomIndex = Math.floor(Math.random() * config.options.length);
    return [config.options[randomIndex]];
  }

  const shuffled = [...config.options].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(config.count, config.options.length));
}

function formatTemplate(
  template: string,
  value: string | number,
  values?: (string | number)[]
): string {
  const displayValue = values && values.length > 1 ? values.join(', ') : String(value);
  let formatted = template.replace('{value}', displayValue);

  if (typeof value === 'number' && value > 1) {
    formatted = formatted.replace('{plural}', 's');
  } else {
    formatted = formatted.replace('{plural}', '');
  }

  return formatted;
}

export type BuiltPromptParams = {
  targetLanguage: string;
  storyLength: number;
  difficultyLevel: string;
  topic: string;
  includeVocabulary: boolean;
  includeGrammarTips: boolean;
};

export function buildPrompt({
  targetLanguage,
  storyLength,
  difficultyLevel,
  topic,
  includeVocabulary,
  includeGrammarTips,
}: BuiltPromptParams) {
  const randomValues: Record<string, (string | number)[]> = {};
  const storyRequirementsList: string[] = [];

  for (const [key, config] of Object.entries(storyRequirements)) {
    const values = buildStoryRequirements(config);
    randomValues[key] = values;

    const value = values[0];
    const formattedTemplate = formatTemplate(
      config.template,
      value,
      values.length > 1 ? values : undefined
    );
    storyRequirementsList.push(formattedTemplate);
  }

  const prompt = `Generate a short story in ${targetLanguage} for language learners.

Please create an engaging story that meets the following requirements:

1. Uses vocabulary and grammar appropriate for ${difficultyLevel} CEFR level learners
2. Is approximately ${storyLength} words long
3. Relates to the topic: ${topic}
${storyRequirementsList.map((req, index) => `${index + 4}. ${req}`).join('\n')}
${storyRequirementsList.length + 4}. Is written entirely in ${targetLanguage}
${
  storyRequirementsList.length + 5
}. Has a clear narrative structure with beginning, middle, and end. Do not add headings for the narrative structure sections.

Give the story a title. Put the title at the beginning of the story as a heading.

${
  includeVocabulary
    ? 'Include a vocabulary section at the end with a clear heading and a line break in markdown.'
    : ''
}
${
  includeGrammarTips
    ? 'Include a summary of key grammar points in English at the end with a clear heading and a line break in markdown.'
    : ''
}`;

  console.log(prompt);

  return prompt;
}
