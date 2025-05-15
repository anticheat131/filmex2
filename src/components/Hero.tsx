import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { backdropSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Info, Star, Calendar, Pause, Play as PlayIcon } from 'lucide-react';
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { preference } = useMediaPreferences();

  // Filter and prioritize media based on user preferences
  const filteredMedia = useMemo(() => {
    const withBackdrop = media.filter(item => item.backdrop_path);

    if (preference && preference !== 'balanced') {
      const preferred = withBackdrop.filter(item => item.media_type === preference);
      const others = withBackdrop.filter(item => item.media_type !== preference);
      return [...preferred, ...others];
    }

    return withBackdrop;
  }, [media, preference]);

  const featuredMedia = filteredMedia[currentIndex];

  // Navigation functions
  const goToNext = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex(prev => (prev + 1) % filteredMedia.length);
  }, [filteredMedia.length]);

  const goToPrev = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex(prev => (prev - 1 + filteredMedia.length) % filteredMedia.length);
  }, [filteredMedia.length]);

  // Keyboard navigation
  useKeyPress('ArrowRight', goToNext);
  useKeyPress('ArrowLeft', goToPrev);

  const handleMediaClick = useCallback(
    (media: Media) => {
      trackMediaPreference(media.media_type as 'movie' | 'tv', 'select');
      navigate(media.media_type === 'movie' ? `/movie/${media.id}` : `/tv/${media.id}`);
    },
    [navigate]
  );

  // Touch handling for swipes
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    pauseAutoRotation();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    restartAutoRotation();
  };

  // Auto rotation management
  const startAutoRotation = useCallback(() => {
    if (filteredMedia.length <= 1) return;

    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        goToNext();
      }
    }, 6000); // 6 seconds interval
  }, [filteredMedia.length, goToNext, isPaused]);

  const pauseAutoRotation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const restartAutoRotation = () => {
    pauseAutoRotation();
    startAutoRotation();
  };

  // Initialize and clean up auto rotation
  useEffect(() => {
    startAutoRotation();
    return pauseAutoRotation;
  }, [startAutoRotation]);

  // Handle mouse interactions
  const handleMouseEnter = pauseAutoRotation;
  const handleMouseLeave = restartAutoRotation;

  // Play/pause toggle handler
  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(prev => !prev);
  };

  if (!featuredMedia) return null;

  const title = featuredMedia.title || featuredMedia.name || 'Untitled';
  const releaseDate = featuredMedia.release_date || featuredMedia.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : '';

  const handlePlay = () => {
    const mediaType = featuredMedia.media_type;
    const id = featuredMedia.id;

    if (mediaType === 'tv') {
      navigate(`/watch/tv/${id}/1/1`);
    } else {
      navigate(`/watch/${mediaType}/${id}`);
    }
  };

  const handleMoreInfo = () => {
    navigate(`/${featuredMedia.media_type}/${featuredMedia.id}`);
  };

  return (
    <section
      className={`relative w-full h-[42vh] md:h-[48vh] overflow-hidden ${className}`} // approx 60% smaller height
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Featured media carousel"
      aria-roledescription="carousel"
    >
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-background flex items-center justify-center z-10">
          <div className="w-full h-full">
            <Skeleton className="w-full h-full" />
          </div>
        </div>
      )}

      {/* Background Image with Gradient Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 1.05,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Hero Image */}
          <img
            src={getImageUrl(featuredMedia.backdrop_path, backdropSizes.original)}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoaded(true)}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
          />

          {/* Combined gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"
            style={{ backdropFilter: 'brightness(0.8)' }}
          />

          {/* Side gradient for better text contrast */}
          <div className="absolute inset-0 md:w-1/2 bg-gradient-to-r from-background/90 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          className="absolute inset-x-0 bottom-0 p-6 md:p-12 lg:p-16 flex flex-col items-start max-w-3xl"
        >
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-accent/90 backdrop-blur-sm text-xs font-medium text-white uppercase tracking-wider">
              {featuredMedia.media_type === 'movie' ? 'Movie' : 'TV Series'}
            </span>

            {releaseYear && (
              <span className="flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium text-white">
                <Calendar className="w-3 h-3 mr-1" />
                {releaseYear}
              </span>
            )}

            {featuredMedia.vote_average > 0 && (
              <span className="flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium text-white">
                <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                {featuredMedia.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 text-shadow text-balance">{title}</h1>

          {/* Overview */}
          <p className="text-white/90 mb-8 line-clamp-3 md:line-clamp-3 text-sm md:text-base max-w-2xl text-shadow">
            {featuredMedia.overview}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePlay}
              className="hero-button bg-accent hover:bg-accent/90 text-white flex items-center transition-all hover:scale-105 shadow-lg shadow-accent/20"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              Play Now
            </Button>

            <Button
              onClick={handleMoreInfo}
              variant="outline"
              size="lg"
              className="hero-button border-white/30 bg-black/40 text-white hover:bg-black/60 hover:border-white/50 flex items-center transition-all hover:scale-105"
            >
              <Info className="h-4 w-4 mr-2" />
              More Info
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls: left arrow, pause/play, right arrow */}
      {filteredMedia.length > 1 && (
        <nav
          className="absolute bottom-4 right-6 flex items-center space-x-4 z-20"
          aria-label="Hero carousel controls"
        >
          <button
            className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition"
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition"
            onClick={togglePause}
            aria-label={isPaused ? 'Play carousel' : 'Pause carousel'}
          >
            {isPaused ? <PlayIcon className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </button>

          <button
            className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition"
            onClick={goToNext}
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      )}
    </section>
  );
};

export default Hero;
