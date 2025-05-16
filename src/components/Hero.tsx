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
import { trackMediaPreference } from '@/lib/analytics';

interface HeroProps {
  media: Media[];
  className?: string;
}

const genreMap: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

const Hero = ({ media, className = '' }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
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
    setCurrentIndex(prev => (prev + 1) % filteredMedia.length);
    setProgress(0);
    setIsLoaded(false);
  }, [filteredMedia.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + filteredMedia.length) % filteredMedia.length);
    setProgress(0);
    setIsLoaded(false);
  }, [filteredMedia.length]);

  const handleMediaClick = (media: Media) => {
    trackMediaPreference(media.media_type as 'movie' | 'tv', 'select');
    navigate(media.media_type === 'movie' ? `/movie/${media.id}` : `/tv/${media.id}`);
  };

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

  useEffect(() => {
    if (paused || filteredMedia.length <= 1) return;
    intervalRef.current = setInterval(goToNext, 6000);
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [goToNext, paused, filteredMedia.length]);

  useEffect(() => {
    if (paused || filteredMedia.length <= 1) return;
    progressRef.current = setInterval(() => {
      setProgress(p => (p < 100 ? p + 1.67 : 0));
    }, 100);
    return () => clearInterval(progressRef.current as NodeJS.Timeout);
  }, [paused, currentIndex, filteredMedia.length]);

  const title = featuredMedia.title || featuredMedia.name || 'Untitled';
  const releaseDate = featuredMedia.release_date || featuredMedia.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const quality = featuredMedia.video_source?.toLowerCase().includes('cam') ? 'CAM' : 'HD';
  const genres = featuredMedia.genre_ids?.slice(0, 3).map(id => genreMap[id]).filter(Boolean) || [];

  return (
    <section
      className={`relative w-full h-[180px] md:h-[250px] overflow-hidden select-none ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.05 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img
            src={getImageUrl(featuredMedia.backdrop_path, backdropSizes.original)}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoaded(true)}
          />
          {/* Mapple.tv style dark gradient left to right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/90 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Left text block */}
      <div className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-4xl px-8 md:px-20 z-20 text-white">
        <h1 className="uppercase font-extrabold text-3xl md:text-5xl tracking-tight leading-tight mb-2">
          {title}
        </h1>
        <div className="flex gap-6 text-sm font-light opacity-80 mb-3 flex-wrap">
          <span>{genres.join(', ')}</span>
          {releaseYear && <span>{releaseYear}</span>}
          <span>{quality}</span>
        </div>
        <p className="max-w-xl text-white/70 text-sm md:text-base line-clamp-3">
          {featuredMedia.overview}
        </p>

        <div className="flex gap-6 mt-6">
          <Button
            onClick={handlePlay}
            className="bg-accent px-8 py-2 text-lg font-semibold flex items-center gap-2 hover:bg-accent/90"
          >
            <Play className="h-5 w-5" /> Play
          </Button>
          <Button
            onClick={handleMoreInfo}
            variant="outline"
            className="border-white/50 text-white px-8 py-2 text-lg font-semibold flex items-center gap-2 hover:bg-white/70"
          >
            <Info className="h-5 w-5" /> More Info
          </Button>
        </div>
      </div>

      {/* Pause/play button bottom right */}
      <button
        onClick={() => setPaused(p => !p)}
        className="absolute bottom-4 right-8 z-30 bg-black/40 hover:bg-black/60 text-white rounded-md px-4 py-1 text-sm transition opacity-60 hover:opacity-90 select-none"
      >
        {paused ? 'Play ▶' : 'Pause ⏸'}
      </button>

      {/* Left Nav Arrow */}
      <button
        onClick={goToPrev}
        className="absolute top-0 left-0 h-full w-12 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white opacity-70 hover:opacity-100 transition select-none"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Right Nav Arrow */}
      <button
        onClick={goToNext}
        className="absolute top-0 right-0 h-full w-12 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white opacity-70 hover:opacity-100 transition select-none"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
        </svg>
      </button>

      {/* Thin progress bar bottom */}
      {filteredMedia.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 z-20 rounded-r-md">
          <div
            className="h-full bg-accent rounded-r-md transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </section>
  );
};

export default Hero;
