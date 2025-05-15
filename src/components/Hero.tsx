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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { preference } = useMediaPreferences();

  const filteredMedia = useMemo(() => {
    const withBackdrop = media.filter(item => item.backdrop_path);
    const prioritized = preference && preference !== 'balanced'
      ? [...withBackdrop.filter(m => m.media_type === preference), ...withBackdrop.filter(m => m.media_type !== preference)]
      : withBackdrop;
    return prioritized.slice(0, 10); // limit to 10 items
  }, [media, preference]);

  const featuredMedia = filteredMedia[currentIndex];

  const goToNext = useCallback(() => {
    setIsLoaded(false); 
    setCurrentIndex((prev) => (prev + 1) % filteredMedia.length);
  }, [filteredMedia.length]);

  const goToPrev = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev - 1 + filteredMedia.length) % filteredMedia.length);
  }, [filteredMedia.length]);

  useKeyPress("ArrowRight", goToNext);
  useKeyPress("ArrowLeft", goToPrev);

  const startAutoRotation = useCallback(() => {
    if (filteredMedia.length <= 1) return;
    intervalRef.current = setInterval(goToNext, 6000);
  }, [filteredMedia.length, goToNext]);

  const pauseAutoRotation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoRotation();
    return pauseAutoRotation;
  }, [startAutoRotation]);

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

  if (!featuredMedia) return null;

  const title = featuredMedia.title || featuredMedia.name || 'Untitled';
  const releaseYear = featuredMedia.release_date
    ? new Date(featuredMedia.release_date).getFullYear()
    : featuredMedia.first_air_date
    ? new Date(featuredMedia.first_air_date).getFullYear()
    : '';

  return (
    <section
      className={`relative w-full h-[70vh] md:h-[80vh] overflow-hidden ${className}`}
      onMouseEnter={pauseAutoRotation}
      onMouseLeave={startAutoRotation}
      role="region"
      aria-label="Featured media carousel"
    >
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
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
          animate={{ opacity: isLoaded ? 1 : 0, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
          className="absolute inset-x-0 bottom-0 p-6 md:p-12 lg:p-16 flex flex-col items-start max-w-3xl"
        >
          <div className="flex gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-accent/90 text-xs font-medium text-white uppercase">
              {featuredMedia.media_type === 'movie' ? 'Movie' : 'TV Series'}
            </span>
            {releaseYear && (
              <span className="flex items-center px-3 py-1 rounded-full bg-white/10 text-xs text-white">
                <Calendar className="w-3 h-3 mr-1" />
                {releaseYear}
              </span>
            )}
            {featuredMedia.vote_average > 0 && (
              <span className="flex items-center px-3 py-1 rounded-full bg-white/10 text-xs text-white">
                <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                {featuredMedia.vote_average.toFixed(1)}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 text-shadow text-balance">
            {title}
          </h1>
          <p className="text-white/90 mb-8 text-sm md:text-base line-clamp-3 text-shadow">
            {featuredMedia.overview}
          </p>
          <div className="flex gap-4">
            <Button onClick={handlePlay} className="bg-accent hover:bg-accent/90 text-white" size="lg">
              <Play className="w-4 h-4 mr-2" /> Play Now
            </Button>
            <Button
              onClick={handleMoreInfo}
              variant="outline"
              className="border-white/30 bg-black/40 text-white hover:border-white/50 hover:bg-black/60"
              size="lg"
            >
              <Info className="w-4 h-4 mr-2" /> More Info
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {filteredMedia.length > 1 && (
        <nav className="absolute bottom-6 right-6 flex gap-2" aria-label="Carousel navigation">
          {filteredMedia.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-6 bg-accent' : 'w-2 bg-white/30'
              }`}
              onClick={() => {
                setIsLoaded(false);
                setCurrentIndex(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </nav>
      )}
    </section>
  );
};

export default Hero;
