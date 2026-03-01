'use client';

import { useCompletion } from '@ai-sdk/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { StoryForm } from '@/components/StoryForm';
import { StoryList } from '@/components/StoryList';
import { StoryResponse } from '@/components/StoryResponse';
import { UsageStats } from '@/components/UsageStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLanguage } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import type { Story } from '@/types';
import {
  completeStoryAtom,
  resetSessionAtom,
  startStoryAtom,
  updateStoryUsageAtom,
} from '@/store/usage';

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;
  
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [formData, setFormData] = useState<{
    targetLanguage: string;
    difficultyLevel: string;
  } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('stories');
  const prevIsLoadingRef = useRef<boolean>(false);

  const queryClient = useQueryClient();

  // Usage tracking atoms
  const startStory = useSetAtom(startStoryAtom);
  const updateStoryUsage = useSetAtom(updateStoryUsageAtom);
  const completeStory = useSetAtom(completeStoryAtom);
  const resetSession = useSetAtom(resetSessionAtom);

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/generate-story',
    onError: (err) => {
      console.error('Completion error:', err);
    },
  });

  // Fetch specific story by ID
  const { data: storyData, isLoading: storyLoading, error: storyError } = useQuery<Story>({
    queryKey: ['story', storyId],
    queryFn: async () => {
      const response = await fetch(`/api/stories/${storyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch story');
      }
      return response.json();
    },
    enabled: !!storyId,
  });

  // Reset session stats on page load and prefetch stories
  useEffect(() => {
    resetSession();
    
    // Prefetch all stories to populate React Query cache
    queryClient.prefetchQuery({
      queryKey: ['stories'],
      queryFn: async () => {
        const response = await fetch('/api/stories?limit=10');
        if (!response.ok) {
          throw new Error('Failed to fetch stories');
        }
        return response.json();
      },
    });
  }, [resetSession, queryClient]);

  // Auto-select story when data is loaded
  useEffect(() => {
    if (storyData && !selectedStory) {
      setSelectedStory(storyData);
    }
  }, [storyData, selectedStory]);

  // Scroll to story when selected
  useEffect(() => {
    if (selectedStory) {
      const timer = setTimeout(() => {
        const storyCard = document.querySelector('[data-story-card]');
        if (storyCard) {
          storyCard.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100); // Small delay to ensure DOM is updated
      
      return () => clearTimeout(timer);
    }
  }, [selectedStory]);

  // Track when story generation completes
  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading && startTime && !endTime) {
      queueMicrotask(() => {
        setEndTime(Date.now());

        // Finalize usage tracking
        // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
        const estimatedTokens = Math.ceil(completion.length / 4);
        completeStory({
          characters: completion.length,
          tokens: estimatedTokens,
        });

        // Invalidate stories cache to refresh the list with the new story
        queryClient.invalidateQueries({ queryKey: ['stories'] });
      });
    }
    prevIsLoadingRef.current = isLoading;
  }, [isLoading, startTime, endTime, completion.length, completeStory, queryClient]);

  // Update current story usage during streaming
  useEffect(() => {
    if (isLoading && completion.length > 0) {
      const estimatedTokens = Math.ceil(completion.length / 4);
      updateStoryUsage({
        characters: completion.length,
        tokens: estimatedTokens,
      });
    }
  }, [completion.length, isLoading, updateStoryUsage]);

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

    // Start tracking a new story
    startStory();

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'generate') {
      setSelectedStory(null);
      router.push('/new');
    } else {
      router.push('/');
    }
  };

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
    router.push(`/story/${story.id}`);
  };

  if (storyLoading) {
    return (
      <div className='min-h-screen bg-linear-to-b from-blue-50 to-blue-100 py-12 px-4 dark:from-indigo-900 dark:to-fuchsia-950'>
        <div className='mx-auto max-w-4xl'>
          <div className="flex justify-center p-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading story...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (storyError) {
    return (
      <div className='min-h-screen bg-linear-to-b from-blue-50 to-blue-100 py-12 px-4 dark:from-indigo-900 dark:to-fuchsia-950'>
        <div className='mx-auto max-w-4xl'>
          <div className="text-center p-8 text-red-600">
            Failed to load story. <button onClick={() => router.push('/')} className="underline">Go back to stories</button>
          </div>
        </div>
      </div>
    );
  }

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

        <Card>
          <CardContent className='pt-6'>
            <Tabs value={activeTab} className='space-y-6' onValueChange={handleTabChange}>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='stories'>Recent Stories</TabsTrigger>
                <TabsTrigger value='generate'>Generate Story</TabsTrigger>
              </TabsList>

              <TabsContent value='stories'>
                <StoryList onStorySelect={handleStorySelect} />
              </TabsContent>

              <TabsContent value='generate' className='space-y-6'>
                <StoryForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                <UsageStats />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {(isLoading || completion) && formData && (
          <Card className='mt-6'>
            <CardContent className='pt-6'>
              <StoryResponse
                completion={completion}
                isLoading={isLoading}
                difficultyLevel={formData.difficultyLevel}
                targetLanguage={formData.targetLanguage}
                startTime={startTime}
                endTime={endTime}
              />
            </CardContent>
          </Card>
        )}

        {selectedStory && (
          <Card className='mt-6' data-story-card>
            <CardContent className='pt-6'>
              <div className='space-y-4'>
                <div className='flex justify-between items-start'>
                  <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
                    <span className='font-medium text-foreground'>Language:</span>
                    <span>{getLanguage({ languageCode: selectedStory.language })?.name || selectedStory.language}</span>
                    <span className='font-medium text-foreground'>Difficulty:</span>
                    <span className='capitalize'>{selectedStory.difficultyLevel}</span>
                    {selectedStory.wordCount && (
                      <>
                        <span className='font-medium text-foreground'>Length:</span>
                        <span>{selectedStory.wordCount} words</span>
                      </>
                    )}
                    <span className='font-medium text-foreground'>Created:</span>
                    <span>{new Date(selectedStory.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      setSelectedStory(null);
                      router.push('/');
                    }}
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    ✕
                  </button>
                </div>

                {selectedStory.story && (
                  <div className='space-y-4'>
                    <h3 className='text-xl font-semibold border-b pb-2'>
                      {selectedStory.title || 'Untitled Story'}
                    </h3>
                    <div className='prose max-w-none dark:prose-invert'>
                      <ReactMarkdown>{selectedStory.story}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}