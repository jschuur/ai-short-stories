'use client';

import { useAtomValue } from 'jotai';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { env } from '@/env';
import { todayUsageAtom, usageStatsAtom } from '@/store/usage';

function UsageRow({
  period,
  characters,
  tokens,
  requests,
}: {
  period: string;
  characters: number;
  tokens: number;
  requests: number;
}) {
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <tr className='border-b border-zinc-100 dark:border-zinc-800'>
      <td className='py-2 pr-4 font-medium'>{period}</td>
      <td className='py-2 pr-4 text-right tabular-nums'>{characters}</td>
      <td className='py-2 pr-4 text-right tabular-nums'>
        {tokens > 0 ? `~${formatNumber(tokens)}` : '0'}
      </td>
      <td className='py-2 text-right tabular-nums'>{requests}</td>
    </tr>
  );
}

export function UsageStats() {
  const usageStats = useAtomValue(usageStatsAtom);
  const todayUsage = useAtomValue(todayUsageAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Toggle the entire card with Ctrl-D
  useHotkeys('ctrl+d', (e) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
  });

  // Toggle the details with Ctrl-Down
  useHotkeys('ctrl+down', (e) => {
    e.preventDefault();
    setIsExpanded((prev) => !prev);
  });

  if (!isOpen) return null;

  return (
    <div className='mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900'>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>LLM Usage</h3>
        {(todayUsage.requests > 0 || usageStats.totalAllTime.requests > 0) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            aria-label={isExpanded ? 'Hide full details' : 'Show full details'}
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className='h-4 w-4' />
              </>
            ) : (
              <>
                <span>Show more</span>
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
              <th className='pb-2 pr-4 text-left font-medium text-zinc-600 dark:text-zinc-400'>
                Period
              </th>
              <th className='pb-2 pr-4 text-right font-medium text-zinc-600 dark:text-zinc-400'>
                Characters
              </th>
              <th className='pb-2 pr-4 text-right font-medium text-zinc-600 dark:text-zinc-400'>
                <a
                  href={env.NEXT_PUBLIC_ANTHROPIC_USAGE_URL}
                  target='_blank'
                  className='underline underline-offset-3'
                >
                  Tokens
                </a>
              </th>
              <th className='pb-2 text-right font-medium text-zinc-600 dark:text-zinc-400'>
                Requests
              </th>
            </tr>
          </thead>
          <tbody className='text-zinc-700 dark:text-zinc-300'>
            {/* Session row - always visible */}
            <UsageRow
              period='Session'
              characters={usageStats.session.characters}
              tokens={usageStats.session.tokens}
              requests={usageStats.session.requests}
            />

            {/* Expandable rows */}
            {isExpanded && (
              <>
                {todayUsage.requests > 0 && (
                  <UsageRow
                    period='Today'
                    characters={todayUsage.characters}
                    tokens={todayUsage.tokens}
                    requests={todayUsage.requests}
                  />
                )}
                {usageStats.totalAllTime.requests > 0 && (
                  <UsageRow
                    period='All-time'
                    characters={usageStats.totalAllTime.characters}
                    tokens={usageStats.totalAllTime.tokens}
                    requests={usageStats.totalAllTime.requests}
                  />
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
