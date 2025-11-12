'use client';

import { useCompletion } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';

import { StoryForm } from '@/components/StoryForm';
import { StoryResponse } from '@/components/StoryResponse';

export default function Home() {
  const [formData, setFormData] = useState<{
    targetLanguage: string;
    difficultyLevel: string;
  } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const prevIsLoadingRef = useRef<boolean>(false);

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/generate-story',
    onError: (err) => {
      console.error('Completion error:', err);
    },
  });

  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading && startTime && !endTime) {
      queueMicrotask(() => {
        setEndTime(Date.now());
      });
    }
    prevIsLoadingRef.current = isLoading;
  }, [isLoading, startTime, endTime]);

  const handleFormSubmit = async (data: {
    targetLanguage: string;
    storyLength: number;
    difficultyLevel: string;
    topic: string;
    includeVocabulary: boolean;
    includeGrammarTips: boolean;
  }) => {
    setFormData({
      targetLanguage: data.targetLanguage,
      difficultyLevel: data.difficultyLevel,
    });
    setStartTime(Date.now());
    setEndTime(null);

    await complete('', {
      body: {
        targetLanguage: data.targetLanguage,
        storyLength: data.storyLength,
        difficultyLevel: data.difficultyLevel,
        topic: data.topic,
        includeVocabulary: data.includeVocabulary,
        includeGrammarTips: data.includeGrammarTips,
      },
    });
  };

  return (
    <div className='min-h-screen bg-linear-to-b from-blue-50 to-blue-100 py-12 px-4 dark:from-indigo-900 dark:to-fuchsia-950'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-8 text-center'>
          <h1 className='mb-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50'>
            Bite Sized Stories
          </h1>
          <p className='text-lg text-zinc-600 dark:text-zinc-400'>
            Generate custom short stories to practice a new language
          </p>
        </div>

        <StoryForm onSubmit={handleFormSubmit} isLoading={isLoading} />

        {(isLoading || completion) && formData && (
          <StoryResponse
            completion={completion}
            isLoading={isLoading}
            difficultyLevel={formData.difficultyLevel}
            targetLanguage={formData.targetLanguage}
            startTime={startTime}
            endTime={endTime}
          />
        )}
      </div>
    </div>
  );
}
