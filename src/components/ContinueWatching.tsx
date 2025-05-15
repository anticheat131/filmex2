import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
      const raw = localStorage.getItem('vidLinkProgress') || '{}';
      const parsed = JSON.parse(raw);

      const allEntries = Object.values(parsed);

      const filtered = allEntries.filter((item: any) => {
        const watched = Number(item.progress?.watched);
        const duration = Number(item.progress?.duration);
        return isNaN(watched) || isNaN(duration) || watched < duration - END_THRESHOLD_SECONDS;
      });

      setItems(filtered);
    } catch (e) {
      console.error('Error reading vidLinkProgress from localStorage:', e);
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
