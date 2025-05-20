import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { backdropSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaPreferences } from '@/hooks/use-media-preferences';

interface HeroProps {
  media: Media[];       // your seed list
  className?: string;
}

const Hero = ({ media: initialMedia, className = '' }: HeroProps) => {
  const [pool, setPool] = useState<Media[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { preference } = useMediaPreferences();

  useEffect(() => {
    const base = initialMedia.filter(item => item.backdrop_path);

    // If we already have 10+ valid backdrops, just use those first 10
    if (base.length >= 10) {
      setPool(base.slice(0, 10));
      return;
    }

    // Otherwise, fetch trending movie & TV to top up
    (async () => {
      try {
        const toFetch = 10 - base.length;
        const [mvRes, tvRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`),
          fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
        ]);

        const [mvJson, tvJson] = await Promise.all([mvRes.json(), tvRes.json()]);
        const extras = [...(mvJson.results || []), ...(tvJson.results || [])]
          .filter((m: any) => m.backdrop_path)
          .sort((a: any, b: any) => {
            // popularity desc, then date desc
            if (b.popularity !== a.popularity) return b.popularity - a.popularity;
            const bd = new Date(b.release_date || b.first_air_date).getTime();
            const ad = new Date(a.release_date || a.first_air_date).getTime();
            return bd - ad;
          })
          .slice(0, toFetch);

        setPool([...base, ...extras].slice(0, 10));
      } catch {
        // fallback: whatever base we had
        setPool(base.slice(0, 10));
      }
    })();
  }, [initialMedia]);

  // reorder according to user preference and cap at 10
  const filteredMedia = useMemo(() => {
    const withBackdrop = pool; // already backdrop‑filtered
    if (preference && preference !== 'balanced') {
      const pref = withBackdrop.filter(m => m.media_type === preference);
      const others = withBackdrop.filter(m => m.media_type !== preference);
      return [...pref, ...others].slice(0, 10);
    }
    return withBackdrop.slice(0, 10);
  }, [pool, preference]);

  const featured = filteredMedia[currentIndex] || null;

  const goToNext = useCallback(() => {
    setCurrentIndex(i => (i + 1) % filteredMedia.length);
    setIsLoaded(false);
  }, [filteredMedia.length]);

  useEffect(() => {
    if (paused || filteredMedia.length <= 1) return;
    intervalRef.current = setInterval(goToNext, 6000);
    return () => clearInterval(intervalRef.current!);
  }, [paused, filteredMedia.length, goToNext]);

  // navigation handlers
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

  // if still nothing, show a placeholder
  if (!featured) {
    return (
      <section className={`relative w-full h-[72vh] md:h-[81vh] bg-black ${className}`}>
        <div className="flex items-center justify-center h-full text-white">
          No featured content available.
        </div>
      </section>
    );
  }

  const title = featured.title || featured.name || '';
  const overview = featured.overview || '';

  return (
    <section
      className={`relative w-full h-[72vh] md:h-[81vh] overflow-hidden bg-black ${className}`}
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

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 md:px-16 text-center text-white max-w-5xl mx-auto">
        <p
          className="text-xs md:text-sm text-black/80 bg-white/90 rounded-sm px-2 py-[2px] tracking-widest mb-3 uppercase font-semibold select-none"
          style={{ letterSpacing: '0.15em' }}
        >
          Trending Now
        </p>
        <h1 className="text-3xl md:text-6xl font-extrabold max-w-4xl leading-tight">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm md:text-base text-white/80 line-clamp-4">
          {overview}
        </p>
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <Button
            onClick={handleMoreInfo}
            variant="outline"
            className="flex items-center gap-2 border-white/70 bg-white/90 text-black px-6 py-3 rounded-md font-semibold text-sm shadow-md hover:bg-white/100 hover:border-white"
          >
            Details
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={handlePlay}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-md font-semibold text-sm shadow-md hover:bg-gray-900"
          >
            <Play className="w-5 h-5 text-white" />
            Watch
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
