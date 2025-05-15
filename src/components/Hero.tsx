import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { backdropSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Info, Star, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaPreferences } from '@/hooks/use-media-preferences';
import { trackMediaPreference } from '@/lib/analytics';
import useKeyPress from '@/hooks/use-key-press';

interface HeroProps {
  media: Media[];
  className?: string;
}

const Hero = ({ media, className = '' }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
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

  const visibleMedia = filteredMedia.slice(0, 10);
  const featuredMedia = visibleMedia[currentIndex];

  const goToNext = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex(prev => (prev + 1) % visibleMedia.length);
  }, [visibleMedia.length]);

  const goToPrev = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex(prev => (prev - 1 + visibleMedia.length) % visibleMedia.length);
  }, [visibleMedia.length]);

  useKeyPress("ArrowRight", goToNext);
  useKeyPress("ArrowLeft", goToPrev);

  const handleMediaClick = (media: Media) => {
    trackMediaPreference(media.media_type as 'movie' | 'tv', 'select');
    navigate(`/${media.media_type}/${media.id}`);
  };

  const handlePlay = () => {
    const { id, media_type } = featuredMedia;
    navigate(media_type === 'tv' ? `/watch/tv/${id}/1/1` : `/watch/${media_type}/${id}`);
  };

  const handleMoreInfo = () => {
    navigate(`/${featuredMedia.media_type}/${featuredMedia.id}`);
  };

  const startAutoRotate = useCallback(() => {
    intervalRef.current = setInterval(() => {
      goToNext();
    }, 8000);
  }, [goToNext]);

  const pauseAutoRotate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoRotate();
    return pauseAutoRotate;
  }, [startAutoRotate]);

  if (!featuredMedia) return null;

  const title = featuredMedia.title || featuredMedia.name || 'Untitled';
  const releaseYear = featuredMedia.release_date || featuredMedia.first_air_date
    ? new Date(featuredMedia.release_date || featuredMedia.first_air_date!).getFullYear()
    : '';

  return (
    <section
      className={`relative w-full h-[70vh] md:h-[80vh] overflow-hidden ${className}`}
      onMouseEnter={pauseAutoRotate}
      onMouseLeave={startAutoRotate}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-background flex items-center justify-center z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={getImageUrl(featuredMedia.backdrop_path, backdropSizes.original)}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 md:w-1/2 bg-gradient-to-r from-background/90 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-x-0 bottom-0 p-6 md:p-12 lg:p-16 flex flex-col items-start max-w-3xl"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-accent/90 text-xs font-medium text-white uppercase">
              {featuredMedia.media_type === 'movie' ? 'Movie' : 'TV Show'}
            </span>
            {releaseYear && (
              <span className="flex items-center px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white">
                <Calendar className="w-3 h-3 mr-1" />
                {releaseYear}
              </span>
            )}
            {featuredMedia.vote_average > 0 && (
              <span className="flex items-center px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white">
                <Star className="w-3 h-3 mr-1 text-amber-400" />
                {featuredMedia.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 text-shadow">{title}</h1>

          <p className="text-white/90 mb-8 line-clamp-3 md:line-clamp-3 text-sm md:text-base max-w-2xl">
            {featuredMedia.overview}
          </p>

          <div className="flex flex-wrap gap-4">
            <Button onClick={handlePlay} className="bg-accent text-white hover:bg-accent/80">
              <Play className="h-4 w-4 mr-2" />
              Play Now
            </Button>
            <Button onClick={handleMoreInfo} variant="outline" className="text-white border-white/30 hover:border-white/50">
              <Info className="h-4 w-4 mr-2" />
              More Info
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Dots */}
      <nav className="absolute bottom-6 right-6 flex space-x-2 z-10">
        {visibleMedia.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-accent w-8 animate-pulse' : 'bg-white/30 w-2 hover:bg-white/50'
            }`}
            onClick={() => {
              setIsLoaded(false);
              setCurrentIndex(index);
            }}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </nav>
    </section>
  );
};

export default Hero;
