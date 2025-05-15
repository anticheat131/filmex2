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

  useKeyPress("ArrowRight", goToNext);
  useKeyPress("ArrowLeft", goToPrev);

  const handlePlay = () => {
    if (!featuredMedia) return;
    const { media_type, id } = featuredMedia;
    navigate(media_type === 'tv' ? `/watch/tv/${id}/1/1` : `/watch/${media_type}/${id}`);
  };

  const handleMoreInfo = () => {
    if (!featuredMedia) return;
    navigate(`/${featuredMedia.media_type}/${featuredMedia.id}`);
  };

  useEffect(() => {
    intervalRef.current = setInterval(goToNext, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [goToNext]);

  if (!featuredMedia) return null;

  const title = featuredMedia.title || featuredMedia.name || 'Untitled';
  const releaseDate = featuredMedia.release_date || featuredMedia.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : '';

  return (
    <section
      className={`relative w-full h-[36vh] md:h-[48vh] overflow-hidden ${className}`}
      role="region"
      aria-label="Featured media carousel"
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-background z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.03 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={getImageUrl(featuredMedia.backdrop_path, backdropSizes.original)}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 md:w-1/2 bg-gradient-to-r from-black/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex + "-content"}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute bottom-0 left-0 p-6 md:p-12 max-w-2xl"
        >
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-accent text-white text-xs px-3 py-1 rounded-full uppercase">
              {featuredMedia.media_type === 'movie' ? 'Movie' : 'TV Show'}
            </span>
            {releaseYear && (
              <span className="text-xs text-white/80 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {releaseYear}
              </span>
            )}
            {featuredMedia.vote_average > 0 && (
              <span className="text-xs text-white/80 flex items-center">
                <Star className="w-4 h-4 mr-1 fill-amber-400" />
                {featuredMedia.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          <h1 className="text-white text-2xl md:text-4xl font-bold mb-3">
            {title}
          </h1>

          <p className="text-white/90 line-clamp-3 text-sm md:text-base mb-5">
            {featuredMedia.overview}
          </p>

          <div className="flex gap-4 flex-wrap">
            <Button onClick={handlePlay} className="bg-accent hover:bg-accent/80 text-white px-5">
              <Play className="w-4 h-4 mr-2" />
              Play Now
            </Button>
            <Button onClick={handleMoreInfo} variant="outline" className="text-white border-white/40 hover:bg-white/10 px-5">
              <Info className="w-4 h-4 mr-2" />
              More Info
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default Hero;
