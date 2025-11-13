import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import type { DailyUsage, StoryUsage, UsageStats } from '@/types';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();

  return today.toISOString().split('T')[0];
};

// Initial state
const initialUsageStats: UsageStats = {
  currentStory: null,
  session: {
    characters: 0,
    tokens: 0,
    requests: 0,
  },
  dailyHistory: [],
  totalAllTime: {
    characters: 0,
    tokens: 0,
    requests: 0,
  },
};

// Base atom with localStorage persistence
export const usageStatsAtom = atomWithStorage<UsageStats>('ai-stories-usage', initialUsageStats);

// Derived atom to get today's usage
export const todayUsageAtom = atom((get) => {
  const stats = get(usageStatsAtom);
  const today = getTodayDate();
  const todayStats = stats.dailyHistory.find((day) => day.date === today);

  return (
    todayStats || {
      date: today,
      characters: 0,
      tokens: 0,
      requests: 0,
    }
  );
});

// Action atom to start a new story
export const startStoryAtom = atom(null, (get, set) => {
  const stats = get(usageStatsAtom);

  set(usageStatsAtom, {
    ...stats,
    currentStory: {
      characters: 0,
      tokens: 0,
      requests: 0,
      timestamp: Date.now(),
    },
  });
});

// Action atom to update story usage (called during streaming)
export const updateStoryUsageAtom = atom(
  null,
  (get, set, update: { characters?: number; tokens?: number; incrementRequests?: boolean }) => {
    const stats = get(usageStatsAtom);
    if (!stats.currentStory) return;

    const currentStory: StoryUsage = {
      ...stats.currentStory,
      characters: update.characters ?? stats.currentStory.characters,
      tokens: update.tokens ?? stats.currentStory.tokens,
      requests: update.incrementRequests
        ? stats.currentStory.requests + 1
        : stats.currentStory.requests,
    };

    set(usageStatsAtom, {
      ...stats,
      currentStory,
    });
  }
);

// Action atom to complete a story (finalizes usage)
export const completeStoryAtom = atom(
  null,
  (get, set, finalUsage: { characters: number; tokens: number }) => {
    const stats = get(usageStatsAtom);
    if (!stats.currentStory) return;

    const today = getTodayDate();
    const todayIndex = stats.dailyHistory.findIndex((day) => day.date === today);

    let updatedDailyHistory: DailyUsage[];

    if (todayIndex >= 0) {
      // Update existing day
      updatedDailyHistory = [...stats.dailyHistory];
      updatedDailyHistory[todayIndex] = {
        date: today,
        characters: updatedDailyHistory[todayIndex].characters + finalUsage.characters,
        tokens: updatedDailyHistory[todayIndex].tokens + finalUsage.tokens,
        requests: updatedDailyHistory[todayIndex].requests + 1,
      };
    } else {
      // Add new day
      updatedDailyHistory = [
        ...stats.dailyHistory,
        {
          date: today,
          characters: finalUsage.characters,
          tokens: finalUsage.tokens,
          requests: 1,
        },
      ];
    }

    set(usageStatsAtom, {
      currentStory: null,
      session: {
        characters: stats.session.characters + finalUsage.characters,
        tokens: stats.session.tokens + finalUsage.tokens,
        requests: stats.session.requests + 1,
      },
      dailyHistory: updatedDailyHistory,
      totalAllTime: {
        characters: stats.totalAllTime.characters + finalUsage.characters,
        tokens: stats.totalAllTime.tokens + finalUsage.tokens,
        requests: stats.totalAllTime.requests + 1,
      },
    });
  }
);

// Action atom to reset session stats
export const resetSessionAtom = atom(null, (get, set) => {
  const stats = get(usageStatsAtom);

  set(usageStatsAtom, {
    ...stats,
    session: {
      characters: 0,
      tokens: 0,
      requests: 0,
    },
  });
});
