'use client';

import { Loader2 } from 'lucide-react';
import { useElapsedTime } from 'use-elapsed-time';

interface StoryProgressProps {
  completion: string;
  startTime: number | null;
  endTime: number | null;
  isLoading: boolean;
}

export function StoryProgress({ completion, startTime, endTime, isLoading }: StoryProgressProps) {
  const { elapsedTime } = useElapsedTime({
    isPlaying: endTime === null && startTime !== null,
    updateInterval: 0.1,
  });

  const renderTimer = () => {
    if (!startTime) return null;

    if (endTime) {
      const totalSeconds = ((endTime - startTime) / 1000).toFixed(1);
      return <>{totalSeconds}s</>;
    }

    return <span className='tabular-nums'>{elapsedTime.toFixed(1)}s</span>;
  };

  return (
    <div className='text-xs text-zinc-500 flex items-center tabular-nums gap-2'>
      {completion ? (
        <>
          <div>{completion.length} chars</div>
        </>
      ) : (
        isLoading && (
          <div className='flex items-center justify-center text-zinc-500 gap-2'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>preparing story</span>
          </div>
        )
      )}
      <div>&middot;</div>
      {renderTimer()}
    </div>
  );
}
