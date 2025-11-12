'use client';

import ReactMarkdown from 'react-markdown';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { StoryProgress } from '@/components/StoryProgress';

import { markdownComponents } from '@/lib/markdown';

interface StoryResponseProps {
  completion: string;
  isLoading: boolean;
  difficultyLevel: string;
  targetLanguage: string;
  startTime: number | null;
  endTime: number | null;
}

export function StoryResponse({
  completion,
  isLoading,
  difficultyLevel,
  targetLanguage,
  startTime,
  endTime,
}: StoryResponseProps) {
  if (!isLoading && !completion) return null;

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-3'>
        <div className='space-y-1.5'>
          <CardTitle>Your Story</CardTitle>
          <CardDescription>
            {difficultyLevel} level · {targetLanguage}
          </CardDescription>
        </div>
        <StoryProgress
          key={startTime}
          completion={completion}
          startTime={startTime}
          endTime={endTime}
          isLoading={isLoading}
        />
      </CardHeader>
      <CardContent>
        {completion && (
          <div className='prose prose-zinc max-w-none text-lg leading-relaxed dark:prose-invert [&>p]:mb-2'>
            <ReactMarkdown components={markdownComponents}>{completion}</ReactMarkdown>
            {isLoading && (
              <span className='inline-block h-5 w-1 animate-pulse bg-zinc-900 dark:bg-zinc-100' />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
