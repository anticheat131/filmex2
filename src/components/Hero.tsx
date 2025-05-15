import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { backdropSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Info, Star, Calendar, Film, Tv, Video } from 'lucide-react';
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

  const featuredMedia = filteredMedia[currentIndex];

  const goToNext = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex(prev => (prev + 1) % filteredMedia.length);
  }, [filteredMedia.length]);

  const goToPrev = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex(prev => (prev - 1 + filteredMedia.length) % filteredMedia.length);
  }, [filteredMedia.length]);

  useKeyPress('ArrowRight', goToNext);
  useKeyPress('ArrowLeft', goToPrev);

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

  // Rotation
  useEffect(() => {
    const interval = setInterval(goToNext, 6000);
    intervalRef.current = interval;
    return () => clearInterval(interval);
  }, [goToNext]);

  if (!featuredMedia) return null;

  const title = featuredMedia.title || featuredMedia.name || 'Untitled';
  const releaseDate = featuredMedia.release_date || featuredMedia.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const genreNames = featuredMedia.genre_names?.join(', ') || '';

  let quality = 'HD';
  if (typeof featuredMedia.hd === 'boolean') {
    quality = featuredMedia.hd ? 'HD' : 'CAM';
  } else if (featuredMedia.video_source?.toLowerCase().includes('cam')) {
    quality = 'CAM';
  } else if (!featuredMedia.backdrop_path) {
    quality = 'CAM';
  }

  return (
    <section
      className={`relative w-full h-[38vh] md:h-[42vh] overflow-hidden ${className}`}
      role="region"
      aria-label="Featured media carousel"
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
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

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute inset-x-0 bottom-0 p-6 md:p-12 flex flex-col items-start max-w-4xl"
        >
          <div className="flex flex-wrap items-center gap-3 mb-3 text-white text-xs font-medium">
            <span className="px-3 py-1 rounded-full bg-accent/90">
              {featuredMedia.media_type === 'movie' ? 'Movie' : 'TV Show'}
            </span>

            {releaseYear && (
              <span className="flex items-center px-3 py-1 rounded-full bg-white/10">
                <Calendar className="w-3 h-3 mr-1" />
                {releaseYear}
              </span>
            )}

            {featuredMedia.vote_average > 0 && (
              <span className="flex items-center px-3 py-1 rounded-full bg-white/10">
                <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                {featuredMedia.vote_average.toFixed(1)}
              </span>
            )}

            {quality && (
              <span className="flex items-center px-3 py-1 rounded-full bg-white/10">
                <Video className="w-3 h-3 mr-1" />
                {quality}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            {title}
          </h1>

          {genreNames && (
            <p className="text-sm text-white/70 mb-4">Genres: {genreNames}</p>
          )}

          <p className="text-white/90 mb-6 line-clamp-3 text-sm md:text-base max-w-2xl">
            {featuredMedia.overview}
          </p>

          <div className="flex gap-4">
            <Button
              onClick={handlePlay}
              className="bg-accent text-white flex items-center hover:bg-accent/80"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>

            <Button
              onClick={handleMoreInfo}
              variant="outline"
              size="lg"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Info className="h-4 w-4 mr-2" />
              More Info
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default Hero;
