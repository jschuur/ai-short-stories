'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

import { difficultyLevels, languages, topicIdeas } from '@/config';
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

const getRandomTopic = () => {
  return topicIdeas[Math.floor(Math.random() * topicIdeas.length)];
};

export function StoryForm({ onSubmit, isLoading }: StoryFormProps) {
  const [targetLanguage, setTargetLanguage] = useState(env.NEXT_PUBLIC_DEFAULT_TARGET_LANGUAGE);
  const [storyLength, setStoryLength] = useState(env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH.toString());
  const [difficultyLevel, setDifficultyLevel] = useState(env.NEXT_PUBLIC_DEFAULT_DIFFICULTY_LEVEL);
  const [topic, setTopic] = useState(env.NEXT_PUBLIC_DEFAULT_TOPIC || getRandomTopic());
  const [includeVocabulary, setIncludeVocabulary] = useState(
    env.NEXT_PUBLIC_DEFAULT_INCLUDE_VOCABULARY
  );
  const [includeGrammarTips, setIncludeGrammarTips] = useState(
    env.NEXT_PUBLIC_DEFAULT_INCLUDE_GRAMMAR
  );
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!targetLanguage || !storyLength || !difficultyLevel || !topic) {
      setError('Please fill in all fields');

      return;
    }

    setError('');

    try {
      await onSubmit({
        targetLanguage,
        storyLength: parseInt(storyLength),
        difficultyLevel,
        topic,
        includeVocabulary,
        includeGrammarTips,
      });
    } catch (err) {
      console.error('Form submission failed:', err);
      setError('Failed to submit form. Please try again.');
    }
  };

  return (
    <Card className='mb-8'>
      <CardHeader>
        <CardTitle>Story Settings</CardTitle>
        <CardDescription>What kind of story do you want to generate?</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='flex flex-col gap-6 sm:flex-row'>
          <div className='space-y-2'>
            <Label htmlFor='language'>Target Language</Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger id='language' className='w-auto min-w-[180px]'>
                <SelectValue placeholder='Select language' />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='length'>Length (words)</Label>
            <Input
              id='length'
              type='number'
              value={storyLength}
              onChange={(e) => setStoryLength(e.target.value)}
              className='w-auto min-w-[120px]'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='difficulty'>Difficulty (CEFR)</Label>
            <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
              <SelectTrigger id='difficulty' className='w-auto min-w-[140px]'>
                <SelectValue placeholder='Select level'>
                  {difficultyLevels[difficultyLevel]}
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
        </div>

        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Label htmlFor='topic'>Topic</Label>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-6 w-6 p-0'
              onClick={() => setTopic(getRandomTopic())}
              disabled={isLoading}
            >
              <RefreshCw className='h-3 w-3' />
            </Button>
          </div>
          <Textarea
            id='topic'
            placeholder='Describe the topic or theme for your story...'
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
          />
          <p className='text-sm text-zinc-500 dark:text-zinc-400'>
            Pick a random suggestion or enter your own
          </p>
        </div>

        <div className='flex flex-col gap-4 sm:flex-row'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='include-vocabulary'
              checked={includeVocabulary}
              onChange={(e) => setIncludeVocabulary(e.target.checked)}
            />
            <Label htmlFor='include-vocabulary' className='cursor-pointer'>
              Include vocabulary
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='include-grammar-tips'
              checked={includeGrammarTips}
              onChange={(e) => setIncludeGrammarTips(e.target.checked)}
            />
            <Label htmlFor='include-grammar-tips' className='cursor-pointer'>
              Include grammar tips
            </Label>
          </div>
        </div>

        {error && (
          <div className='rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400'>
            {error}
          </div>
        )}

        <Button onClick={handleSubmit} disabled={isLoading} className='w-full' size='lg'>
          {isLoading ? <>Generating Story...</> : 'Generate Story'}
        </Button>
      </CardContent>
    </Card>
  );
}
