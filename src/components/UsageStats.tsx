'use client';

import { useAtomValue } from 'jotai';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { todayUsageAtom, usageStatsAtom } from '@/store/usage';

export function UsageStats() {
  const usageStats = useAtomValue(usageStatsAtom);
  const todayUsage = useAtomValue(todayUsageAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle the entire card with Ctrl-D
  useHotkeys('ctrl+d', (e) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
  });

  const formatNumber = (num: number) => num.toLocaleString();

  if (!isOpen) return null;

  return (
    <div className='mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900'>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
          Usage Statistics
          <span className='ml-2 text-xs text-zinc-400'>(Ctrl-D to toggle)</span>
        </h3>
        {(todayUsage.requests > 0 || usageStats.totalAllTime.requests > 0) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? (
              <>
                <span>Hide details</span>
                <ChevronUp className='h-4 w-4' />
              </>
            ) : (
              <>
                <span>Show details</span>
                <ChevronDown className='h-4 w-4' />
              </>
            )}
          </button>
        )}
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-zinc-200 dark:border-zinc-700'>
              <th className='pb-2 pr-4 text-left font-medium text-zinc-600 dark:text-zinc-400'>Period</th>
              <th className='pb-2 pr-4 text-right font-medium text-zinc-600 dark:text-zinc-400'>Characters</th>
              <th className='pb-2 pr-4 text-right font-medium text-zinc-600 dark:text-zinc-400'>Tokens</th>
              <th className='pb-2 text-right font-medium text-zinc-600 dark:text-zinc-400'>Requests</th>
            </tr>
          </thead>
          <tbody className='text-zinc-700 dark:text-zinc-300'>
            {/* Session row - always visible */}
            <tr className='border-b border-zinc-100 dark:border-zinc-800'>
              <td className='py-2 pr-4 font-medium'>Session</td>
              <td className='py-2 pr-4 text-right tabular-nums'>{formatNumber(usageStats.session.characters)}</td>
              <td className='py-2 pr-4 text-right tabular-nums'>~{formatNumber(usageStats.session.tokens)}</td>
              <td className='py-2 text-right tabular-nums'>{usageStats.session.requests}</td>
            </tr>

            {/* Expandable rows */}
            {isExpanded && (
              <>
                {todayUsage.requests > 0 && (
                  <tr className='border-b border-zinc-100 dark:border-zinc-800'>
                    <td className='py-2 pr-4 font-medium'>Today</td>
                    <td className='py-2 pr-4 text-right tabular-nums'>{formatNumber(todayUsage.characters)}</td>
                    <td className='py-2 pr-4 text-right tabular-nums'>~{formatNumber(todayUsage.tokens)}</td>
                    <td className='py-2 text-right tabular-nums'>{todayUsage.requests}</td>
                  </tr>
                )}
                {usageStats.totalAllTime.requests > 0 && (
                  <tr>
                    <td className='py-2 pr-4 font-medium'>All-time</td>
                    <td className='py-2 pr-4 text-right tabular-nums'>{formatNumber(usageStats.totalAllTime.characters)}</td>
                    <td className='py-2 pr-4 text-right tabular-nums'>~{formatNumber(usageStats.totalAllTime.tokens)}</td>
                    <td className='py-2 text-right tabular-nums'>{usageStats.totalAllTime.requests}</td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
