import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { backdropSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaPreferences } from '@/hooks/use-media-preferences';

interface HeroProps {
  media: Media[];
  className?: string;
}

const Hero = ({ media, className = '' }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { preference } = useMediaPreferences();

  const filteredMedia = useMemo(() => {
    const withBackdrop = media.filter(item => item.backdrop_path);
    if (preference && preference !== 'balanced') {
      const preferred = withBackdrop.filter(item => item.media_type === preference);
      const others = withBackdrop.filter(item => item.media_type !== preference);
      return [...preferred, ...others];
    }
    return withBackdrop;
  }, [media, preference]);

  const featured = filteredMedia[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % filteredMedia.length);
    setIsLoaded(false);
  }, [filteredMedia.length]);

  useEffect(() => {
    if (paused || filteredMedia.length <= 1) return;
    intervalRef.current = setInterval(goToNext, 6000);
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [goToNext, paused, filteredMedia.length]);

  const handlePlay = () => {
    if (!featured) return;
    navigate(
      featured.media_type === 'tv'
        ? `/watch/tv/${featured.id}/1/1`
        : `/watch/movie/${featured.id}`
    );
  };

  const handleMoreInfo = () => {
    if (!featured) return;
    navigate(`/${featured.media_type}/${featured.id}`);
  };

  const title = featured?.title || featured?.name || '';
  const overview = featured?.overview || '';

  return (
    <section
      className={`
        relative w-full h-[80vh] md:h-[90vh] overflow-hidden bg-black ${className}
      `}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img
            src={getImageUrl(featured.backdrop_path, backdropSizes.original)}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />
        </motion.div>
      </AnimatePresence>

      {/* Content overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 md:px-16 text-center text-white">
        <p className="text-xs md:text-sm text-accent tracking-widest mb-3 uppercase">Trending Now</p>
        <h1 className="text-3xl md:text-5xl font-bold max-w-3xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm md:text-base text-white/80 line-clamp-4">{overview}</p>
        <div className="mt-6 flex gap-4">
          <Button
            onClick={handlePlay}
            className="bg-accent hover:bg-accent/80 text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Watch
          </Button>
          <Button
            onClick={handleMoreInfo}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
          >
            <Info className="w-4 h-4" />
            Details
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
