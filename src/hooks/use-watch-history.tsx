// This file is deprecated. Import from '@/hooks/watch-history' instead.
// src/hooks/use-watch-history.tsx

import { useState, useEffect } from 'react';

export interface WatchHistoryItem {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  backdrop_path: string;
  duration: number;
  watch_position: number;
  created_at: string;
  season?: number;
  episode?: number;
}

export const useWatchHistory = () => {
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fdf_watch_history');
      if (stored) {
        const parsed: WatchHistoryItem[] = JSON.parse(stored);
        setWatchHistory(parsed);
      }
    } catch (err) {
      console.error('Failed to load watch history:', err);
    }
  }, []);

  return { watchHistory };
};
