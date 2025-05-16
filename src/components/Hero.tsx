import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { backdropSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Play, Info } from 'lucide-react';
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

  return (
    <section
      className={`relative w-full h-[85vh] md:h-[90vh] overflow-hidden ${className}`}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img
            src={getImageUrl(featuredMedia.backdrop_path, backdropSizes.original)}
            alt={featuredMedia.title || featuredMedia.name || 'Featured media'}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 text-white z-20">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-xl">
            {featuredMedia.title || featuredMedia.name}
          </h1>
          <p className="text-white/90 text-base md:text-lg max-w-xl drop-shadow-md line-clamp-5">
            {featuredMedia.overview}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handlePlay}
              className="bg-white text-black px-6 py-2 rounded font-semibold text-sm hover:bg-white/90 transition"
            >
              <Play className="inline-block w-4 h-4 mr-2" /> Watch
            </button>
            <button
              onClick={handleMoreInfo}
              className="bg-white/10 text-white px-6 py-2 rounded border border-white/20 hover:bg-white/20 transition text-sm"
            >
              <Info className="inline-block w-4 h-4 mr-2" /> Details
            </button>
          </div>
        </div>
      </div>

      {filteredMedia.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 h-1 bg-white/20 z-30">
          <div
            className="h-full bg-accent transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </section>
  );
};

export default Hero;
