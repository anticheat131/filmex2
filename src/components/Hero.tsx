import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { backdropSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Info, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaPreferences } from '@/hooks/use-media-preferences';
import { trackMediaPreference } from '@/lib/analytics';

interface HeroProps {
  media: Media[];
  className?: string;
}

const Hero = ({ media, className = '' }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { preference } = useMediaPreferences();

  const filteredMedia = useMemo(() => {
    const withBackdrop = media.filter(item => item.backdrop_path);
    if (preference && preference !== 'balanced') {
      const preferred = withBackdrop.filter(item => item.media_type === preference);
      const others = withBackdrop.filter(item => item.media_type !== preference);
      return [...preferred, ...others].slice(0, 10);
    }
    return withBackdrop.slice(0, 10);
  }, [media, preference]);

  const featuredMedia = filteredMedia[currentIndex];

  const goToNext = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex(prev => (prev + 1) % filteredMedia.length);
  }, [filteredMedia.length]);

  const goToPrev = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex(prev => (prev - 1 + filteredMedia.length) % filteredMedia.length);
  }, [filteredMedia.length]);

  const handlePlay = () => {
    if (featuredMedia.media_type === 'tv') {
      navigate(`/watch/tv/${featuredMedia.id}/1/1`);
    } else {
      navigate(`/watch/${featuredMedia.media_type}/${featuredMedia.id}`);
    }
  };

  const handleMoreInfo = () => {
    navigate(`/${featuredMedia.media_type}/${featuredMedia.id}`);
  };

  const startAutoRotation = useCallback(() => {
    if (filteredMedia.length <= 1) return;
    intervalRef.current = setInterval(goToNext, 6000);
  }, [filteredMedia.length, goToNext]);

  const pauseAutoRotation = () => {
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
  };

  const restartAutoRotation = () => {
    pauseAutoRotation();
    if (!isPaused) startAutoRotation();
  };

  useEffect(() => {
    if (!isPaused) startAutoRotation();
    return pauseAutoRotation;
  }, [startAutoRotation, isPaused]);

  useEffect(() => {
    setIsLoaded(false);
  }, [currentIndex]);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.classList.remove('animate-progress');
      void progressRef.current.offsetWidth;
      progressRef.current.classList.add('animate-progress');
    }
  }, [currentIndex, isPaused]);

  if (!featuredMedia) return null;

  const title = featuredMedia.title || featuredMedia.name || 'Untitled';
  const releaseYear = featuredMedia.release_date
    ? new Date(featuredMedia.release_date).getFullYear()
    : featuredMedia.first_air_date
    ? new Date(featuredMedia.first_air_date).getFullYear()
    : '';

  return (
    <section
      className={`relative w-full h-[62vh] overflow-hidden ${className}`}
    >
      {!isLoaded && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={getImageUrl(featuredMedia.backdrop_path, backdropSizes.original)}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 md:w-1/2 bg-gradient-to-r from-background/90 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 lg:p-16 z-20 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-bold text-white"
        >
          {title}
        </motion.h1>

        <p className="text-white/90 mt-2 mb-6 line-clamp-3">{featuredMedia.overview}</p>

        <div className="flex gap-4">
          <Button onClick={handlePlay} className="bg-accent text-white hover:bg-accent/80">
            <Play className="mr-2 h-4 w-4" /> Play
          </Button>
          <Button variant="outline" onClick={handleMoreInfo} className="text-white border-white/20 hover:bg-white/10">
            <Info className="mr-2 h-4 w-4" /> Details
          </Button>
        </div>
      </div>

      {/* Progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
        <div
          ref={progressRef}
          className={`h-full bg-accent transition-all duration-[6000ms] ease-linear ${
            isPaused ? 'w-0' : 'animate-progress'
          }`}
          style={{ animationDuration: '6s' }}
        />
      </div>

      {/* Left nav */}
      <button
        onClick={goToPrev}
        className="absolute left-0 top-0 bottom-0 w-12 md:w-16 flex items-center justify-center bg-black/10 hover:bg-black/30 text-white z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right nav */}
      <button
        onClick={goToNext}
        className="absolute right-0 top-0 bottom-0 w-12 md:w-16 flex items-center justify-center bg-black/10 hover:bg-black/30 text-white z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Pause button */}
      <button
        onClick={() => setIsPaused(prev => !prev)}
        className="absolute bottom-4 right-20 z-30 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm"
      >
        <Pause className="w-4 h-4" />
      </button>
    </section>
  );
};

export default Hero;
