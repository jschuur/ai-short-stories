'use client';

import { useCompletion } from '@ai-sdk/react';
import { useState } from 'react';

import { StoryForm } from '@/components/StoryForm';
import { StoryResponse } from '@/components/StoryResponse';

export default function Home() {
  const [formData, setFormData] = useState<{
    targetLanguage: string;
    difficultyLevel: string;
  } | null>(null);

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/generate-story',
    onError: (err) => {
      console.error('Completion error:', err);
    },
  });

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
    <div className='min-h-screen bg-linear-to-b from-zinc-50 to-zinc-100 py-12 px-4 dark:from-zinc-900 dark:to-zinc-950'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-8 text-center'>
          <h1 className='mb-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50'>
            Learning with Stories
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
          />
        )}
      </div>
    </div>
  );
}
