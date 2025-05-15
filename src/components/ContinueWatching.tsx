import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

const END_THRESHOLD_SECONDS = 30;

const ContinueWatching = () => {
  const [items, setItems] = useState<any[]>([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fdf_watch_history') || '{}';
      const parsed = JSON.parse(raw);

      let changed = false;
      Object.entries(parsed).forEach(([id, entry]: any) => {
        const watched = entry?.progress?.watched ?? 0;
        const duration = entry?.progress?.duration ?? 0;
        if (watched >= duration - END_THRESHOLD_SECONDS) {
          delete parsed[id];
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem('fdf_watch_history', JSON.stringify(parsed));
      }

      const filteredItems = Object.values(parsed);
      setItems(filteredItems);
    } catch (e) {
      console.error('Error loading or cleaning fdf_watch_history:', e);
      setItems([]);
    }
  }, []);

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -rowRef.current.clientWidth * 0.75, behavior: 'smooth' });
  };

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: rowRef.current.clientWidth * 0.75, behavior: 'smooth' });
  };

  const formatLastWatched = (dateString: string) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime()) || date > new Date()) {
        return 'Recently';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const formatTimeRemaining = (position: number, duration: number) => {
    if (!duration) return '';
    const remaining = Math.max(0, duration - position);
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
  };

  if (items.length === 0) return null;

  return (
    <div className="px-4 md:px-8 mt-8 mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-accent" />
        Continue Watching
      </h2>

      <div
        className="relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {showLeftArrow && (
          <button
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white transition-all ${
              isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            } hidden md:flex`}
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <motion.div
          ref={rowRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 pb-4"
          onScroll={handleScroll}
        >
          {items.map((item: any) => (
            <motion.div
              key={item.id}
              className="relative flex-none w-[280px] md:w-[300px] aspect-video bg-card rounded-lg overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() =>
                navigate(
                  item.type === 'tv'
                    ? `/tv/${item.id}/season/${item.last_season_watched}/episode/${item.last_episode_watched}`
                    : `/watch/movie/${item.id}`
                )
              }
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`}
                alt={item.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <h3 className="text-white font-medium line-clamp-1 text-base md:text-lg">{item.title}</h3>

                <Progress
                  value={Math.min(100, (item.progress?.watched / item.progress?.duration) * 100)}
                  className="h-1 my-2"
                />

                <Button
                  className="w-full bg-accent hover:bg-accent/80 text-white flex items-center justify-center gap-1"
                  size="sm"
                >
                  <Play className="h-3 w-3" />
                  Continue
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {showRightArrow && (
          <button
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white transition-all ${
              isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            } hidden md:flex`}
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContinueWatching;
