import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { env } from '@/env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debug(message: string) {
  if (typeof window !== 'undefined') {
    if (!env.NEXT_PUBLIC_DEBUG) return;
  } else {
    if (!env.DEBUG) return;
  }

  console.log(`[DEBUG] ${message}`);
}
