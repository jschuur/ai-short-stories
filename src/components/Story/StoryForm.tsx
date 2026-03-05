'use client';

import { useForm } from '@tanstack/react-form';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { useConfig } from '@/hooks/useConfig';
import { useUserPreferences } from '@/hooks/useUserPreferences';

import { difficultyLevels } from '@/config';
import { env } from '@/env';

interface StoryFormProps {
  onSubmit: (data: {
    targetLanguage: string;
    storyLength: number;
    difficultyLevel: string;
    topic: string;
    includeVocabulary: boolean;
    includeGrammarTips: boolean;
  }) => Promise<void>;
  isLoading: boolean;
}

function getRandomTopicFromList(topics: string[], oldTopic?: string) {
  if (topics.length === 0) return '';

  let newTopic: string;

  do {
    newTopic = topics[Math.floor(Math.random() * topics.length)];
  } while (oldTopic && newTopic === oldTopic && topics.length > 1);

  return newTopic;
}

function getInitialTopic(): string {
  const defaultTopic = env.NEXT_PUBLIC_DEFAULT_TOPIC;

  if (defaultTopic && defaultTopic.trim() && defaultTopic !== 'undefined')
    return defaultTopic;

  return '';
}

export function StoryForm({ onSubmit, isLoading }: StoryFormProps) {
  const { data: config } = useConfig();
  const languages = config?.languages ?? [];
  const topicIdeas = config?.topicIdeas?.map((t) => t.topic) ?? [];

  const { targetLanguage, storyLength, difficultyLevel, setTargetLanguage, setStoryLength, setDifficultyLevel } =
    useUserPreferences();

  const vocabularyDisabled = env.NEXT_PUBLIC_DISABLE_VOCABULARY_CHECKBOX;
  const grammarDisabled = env.NEXT_PUBLIC_DISABLE_GRAMMAR_CHECKBOX;

  const [topicInitialized, setTopicInitialized] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const form = useForm({
    defaultValues: {
      targetLanguage,
      storyLength,
      difficultyLevel,
      topic: getInitialTopic(),
      includeVocabulary: vocabularyDisabled ? false : env.NEXT_PUBLIC_DEFAULT_INCLUDE_VOCABULARY,
      includeGrammarTips: grammarDisabled ? false : env.NEXT_PUBLIC_DEFAULT_INCLUDE_GRAMMAR,
    },
    onSubmit: async ({ value }) => {
      setSubmitError('');

      try {
        await onSubmit({
          targetLanguage: value.targetLanguage,
          storyLength: parseInt(value.storyLength),
          difficultyLevel: value.difficultyLevel,
          topic: value.topic,
          includeVocabulary: vocabularyDisabled ? false : value.includeVocabulary,
          includeGrammarTips: grammarDisabled ? false : value.includeGrammarTips,
        });
      } catch (err) {
        console.error('Form submission failed:', err);
        setSubmitError('Failed to submit form. Please try again.');
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        if (!value.targetLanguage || !value.storyLength || !value.difficultyLevel || !value.topic)
          return 'Please fill in all fields';

        return undefined;
      },
    },
  });

  // Set random topic once config loads
  if (!topicInitialized && topicIdeas.length > 0 && !form.getFieldValue('topic')) {
    form.setFieldValue('topic', getRandomTopicFromList(topicIdeas));
    setTopicInitialized(true);
  }

  const handleStoryLengthBlur = (currentValue: string) => {
    if (currentValue === '') return;

    const numValue = parseInt(currentValue, 10);

    if (!isNaN(numValue)) {
      const clamped = Math.max(
        env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MIN,
        Math.min(env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MAX, numValue),
      );

      const clampedStr = clamped.toString();
      form.setFieldValue('storyLength', clampedStr);
      setStoryLength(clampedStr);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h3 className='text-lg font-semibold'>Create a Story</h3>
        <p className='text-sm text-muted-foreground'>What kind of story do you want to generate?</p>
      </div>

      <div className='flex flex-col gap-6 sm:flex-row'>
        <form.Field
          name='targetLanguage'
          listeners={{
            onChange: ({ value }) => setTargetLanguage(value),
          }}
          children={(field) => (
            <div className='space-y-2'>
              <Label htmlFor='language'>Target Language</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger id='language' className='w-auto min-w-45'>
                  <SelectValue placeholder='Select language' />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.languageCode} value={language.languageCode}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <form.Field
          name='storyLength'
          listeners={{
            onChange: ({ value }) => setStoryLength(value),
          }}
          children={(field) => (
            <div className='space-y-2'>
              <Label htmlFor='length'>Length (words)</Label>
              <Input
                id='length'
                type='number'
                value={field.state.value}
                max={env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MAX}
                min={env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MIN}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={() => handleStoryLengthBlur(field.state.value)}
                className='w-auto min-w-30'
              />
            </div>
          )}
        />

        <form.Field
          name='difficultyLevel'
          listeners={{
            onChange: ({ value }) => setDifficultyLevel(value),
          }}
          children={(field) => (
            <div className='space-y-2'>
              <Label htmlFor='difficulty'>Difficulty (CEFR)</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger id='difficulty' className='w-auto min-w-35'>
                  <SelectValue placeholder='Select level'>
                    {difficultyLevels[field.state.value]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(difficultyLevels).map((level) => (
                    <SelectItem key={level} value={level}>
                      {difficultyLevels[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      <form.Field
        name='topic'
        children={(field) => (
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='topic'>Topic</Label>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-6 w-6 p-0'
                onClick={() => field.handleChange(getRandomTopicFromList(topicIdeas, field.state.value))}
                disabled={isLoading}
              >
                <RefreshCw className='h-3 w-3' />
              </Button>
            </div>
            <Textarea
              id='topic'
              placeholder='Describe the topic or theme for your story...'
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={3}
            />
            <p className='text-sm text-zinc-500 dark:text-zinc-400'>
              Pick a random suggestion or enter your own
            </p>
          </div>
        )}
      />

      <div className='flex flex-col gap-4 sm:flex-row'>
        <form.Field
          name='includeVocabulary'
          children={(field) => (
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='include-vocabulary'
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                disabled={vocabularyDisabled}
              />
              <Label
                htmlFor='include-vocabulary'
                className={
                  vocabularyDisabled
                    ? 'text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                    : 'cursor-pointer'
                }
              >
                Include vocabulary
              </Label>
            </div>
          )}
        />

        <form.Field
          name='includeGrammarTips'
          children={(field) => (
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='include-grammar-tips'
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                disabled={grammarDisabled}
              />
              <Label
                htmlFor='include-grammar-tips'
                className={
                  grammarDisabled
                    ? 'text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                    : 'cursor-pointer'
                }
              >
                Include grammar tips
              </Label>
            </div>
          )}
        />
      </div>

      <form.Subscribe
        selector={(state) => state.errorMap}
        children={(errorMap) => {
          const validationError = errorMap.onSubmit;
          const error = typeof validationError === 'string' ? validationError : submitError;
          if (!error) return null;

          return (
            <div className='rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400'>
              {error}
            </div>
          );
        }}
      />

      <Button
        onClick={() => form.handleSubmit()}
        disabled={isLoading}
        className='w-full'
        size='lg'
      >
        {isLoading ? <>Generating Story...</> : 'Generate Story'}
      </Button>
    </div>
  );
}
