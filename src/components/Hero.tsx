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
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const { preference } = useMediaPreferences();

  const SLIDE_DURATION = 6000;

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
    setCurrentIndex((prev) => (prev + 1) % filteredMedia.length);
    setProgress(0);
  }, [filteredMedia.length]);

  const goToPrev = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev - 1 + filteredMedia.length) % filteredMedia.length);
    setProgress(0);
  }, [filteredMedia.length]);

  useKeyPress("ArrowRight", goToNext);
  useKeyPress("ArrowLeft", goToPrev);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(goToNext, SLIDE_DURATION);
    return () => clearInterval(intervalRef.current!);
  }, [goToNext, isPaused]);

  useEffect(() => {
    if (isPaused) return;

    progressRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 100 / (SLIDE_DURATION / 100)));
    }, 100);

    return () => clearInterval(progressRef.current!);
  }, [isPaused, currentIndex]);

  const handlePlay = () => {
    const { media_type, id } = featuredMedia;
    if (media_type === 'tv') {
      navigate(`/watch/tv/${id}/1/1`);
    } else {
      navigate(`/watch/${media_type}/${id}`);
    }
  };

  const handleMoreInfo = () => {
    navigate(`/${featuredMedia.media_type}/${featuredMedia.id}`);
  };

  if (!featuredMedia) return null;

  const title = featuredMedia.title || featuredMedia.name || 'Untitled';
  const releaseDate = featuredMedia.release_date || featuredMedia.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const genreNames = featuredMedia.genre_names?.join(', ') || 'Various';
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
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

      {/* Text & Controls */}
      <motion.div
        key={currentIndex + '-content'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute inset-x-0 bottom-0 p-6 md:p-12 max-w-4xl text-white"
      >
        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs font-medium">
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

        <h1 className="text-3xl md:text-5xl font-bold mb-2">{title}</h1>

        <p className="text-white/80 text-sm mb-1">
          <strong>Genres:</strong> {genreNames}
        </p>

        <p className="text-white/90 mb-6 line-clamp-3 max-w-2xl text-sm md:text-base">
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

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-1 bg-accent transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Navigation buttons */}
      <button
        onClick={goToPrev}
        className="absolute left-0 top-0 bottom-0 w-10 bg-black/20 hover:bg-black/30 transition-opacity text-white z-10"
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={goToNext}
        className="absolute right-0 top-0 bottom-0 w-10 bg-black/20 hover:bg-black/30 transition-opacity text-white z-10"
        aria-label="Next"
      >
        ›
      </button>

      {/* Pause Indicator */}
      <div className="absolute bottom-4 right-16 text-white text-xs opacity-60">
        {isPaused ? 'Paused' : ''}
      </div>
    </section>
  );
};

export default Hero;
