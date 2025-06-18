import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { WatchHistoryItem } from '@/contexts/types/watch-history';
import { Play, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { getContinueWatching, setContinueWatching, removeContinueWatching } from '@/api/continue-watching';
import { useUserPreferences } from '@/hooks/user-preferences';
import { useTranslation } from 'react-i18next';

interface ContinueWatchingProps {
  maxItems?: number;
}

const ContinueWatching = ({ maxItems = 20 }: ContinueWatchingProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { userPreferences } = useUserPreferences();
  const [continuableItems, setContinuableItems] = useState<WatchHistoryItem[]>([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    getContinueWatching(user.uid, maxItems).then(items => {
      console.log('[ContinueWatching][READ]', items);
      setContinuableItems(items);
    }).catch(err => {
      console.error('[ContinueWatching][READ] error', err);
    });
  }, [user, maxItems]);

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollLeft = () => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: -rowRef.current.clientWidth * 0.75, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: rowRef.current.clientWidth * 0.75, behavior: 'smooth' });
  };

  const handleRemoveItem = async (id: string) => {
    if (!user) return;
    setContinuableItems(prev => prev.filter(item => item.id !== id)); // Remove from UI immediately
    try {
      await removeContinueWatching(user.uid, id);
    } catch (err) {
      // Optionally, show error or revert UI
      console.error('Failed to remove continue watching item', err);
    }
  };

  const handleContinueWatching = async (item: WatchHistoryItem) => {
    if (user) {
      await setContinueWatching(user.uid, item);
    }
    if (item.media_type === 'movie') {
      navigate(`/watch/${item.media_type}/${item.media_id}`);
    } else {
      navigate(`/watch/${item.media_type}/${item.media_id}/${item.season}/${item.episode}`);
    }
  };

  const handleNavigateToDetails = (e: React.MouseEvent, item: WatchHistoryItem) => {
    e.stopPropagation();
    navigate(`/${item.media_type}/${item.media_id}`);
  };

  // Deduplicate, filter out finished and invalid items
  const processedItems = useMemo(() => {
    const map = new Map<string, WatchHistoryItem>();
    continuableItems.forEach(item => {
      // Consider finished if less than 2 minutes left
      const isFinished = item.duration > 0 && (item.duration - item.watch_position) < 120;
      // Filter out items with missing title or backdrop_path
      const isInvalid = !item.title || !item.backdrop_path;
      if (isFinished || isInvalid) return;
      // Unique key: movie = media_type-media_id, tv = media_type-media_id-s{season}-e{episode}
      const key = item.media_type === 'tv'
        ? `${item.media_type}-${item.media_id}-s${item.season}-e${item.episode}`
        : `${item.media_type}-${item.media_id}`;
      // Only keep the most recent
      if (!map.has(key) || new Date(item.created_at) > new Date(map.get(key)!.created_at)) {
        map.set(key, item);
      }
    });
    // Sort by most recent
    return Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [continuableItems]);

  if (!user || processedItems.length === 0 || userPreferences?.isContinueWatchingEnabled === false) return null;

  return (
    <div className="px-4 md:px-8 mt-8 mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-accent" />
        {t('Continue Watching')}
      </h2>

      <div
        className="relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {showLeftArrow && (
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white transition-all hidden md:flex"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <motion.div
          ref={rowRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 pb-4"
          onScroll={handleScroll}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {processedItems.map(item => (
            <motion.div
              key={item.id}
              className="relative flex-none w-[280px] md:w-[300px] aspect-video bg-card rounded-[6px] overflow-hidden group cursor-pointer hover-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleContinueWatching(item)}
            >
              {/* ✕ Close button */}
              <button
                className="absolute top-2 right-2 z-20 bg-black/70 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600"
                onClick={e => {
                  e.stopPropagation();
                  handleRemoveItem(item.id);
                }}
              >
                ×
              </button>

              <img
                src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`}
                alt={item.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-110 group-hover:brightness-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

              {/* Remove details/info button and move title back to bottom overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <h3 className="text-white font-medium line-clamp-1 text-base md:text-lg mb-1">{item.title}</h3>
                <div className="flex items-center justify-between text-xs text-white/70 mb-2">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {t('about {{time}} ago', { time: formatDistanceToNow(new Date(item.created_at), { addSuffix: false, locale: i18n.language === 'de' ? undefined : undefined })
                      .replace('about ', '')
                      .replace('vor ', '')
                      .replace('ago', t('ago', 'ago')) })}
                  </span>
                  {item.media_type === 'tv' && <span>S{item.season} E{item.episode}</span>}
                </div>
                <div className="mb-3 relative">
                  <Progress value={(item.watch_position / item.duration) * 100} className="h-1" />
                  <div className="text-xs text-white/70 mt-1 text-right">
                    {`${Math.floor((item.duration - item.watch_position) / 60)} ${t('min left')}`}
                  </div>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/80 text-white flex items-center justify-center gap-1" size="sm">
                  <Play className="h-3 w-3" />
                  {t('Continue')}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {showRightArrow && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white transition-all hidden md:flex"
            onClick={scrollRight}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContinueWatching;
