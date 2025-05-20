import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { backdropSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Video, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaPreferences } from '@/hooks/use-media-preferences';

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

interface HeroProps {
  media: Media[];
  className?: string;
}

const Hero = ({ media: initialMedia, className = '' }: HeroProps) => {
  const [pool, setPool] = useState<Media[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { preference } = useMediaPreferences();

  useEffect(() => {
    (async () => {
      try {
        const [mvRes, tvRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`),
          fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
        ]);
        const [mvJson, tvJson] = await Promise.all([mvRes.json(), tvRes.json()]);

        const combined = [...initialMedia, ...(mvJson.results || []), ...(tvJson.results || [])];
        const map = new Map<string, Media>();
        combined.forEach(item => {
          if (!item.backdrop_path) return;
          const key = `${item.media_type}-${item.id}`;
          if (!map.has(key)) map.set(key, item);
        });

        const sorted = Array.from(map.values())
          .sort((a, b) => {
            if (b.popularity !== a.popularity) return b.popularity - a.popularity;
            const bd = new Date(b.release_date || b.first_air_date || '1970-01-01').getTime();
            const ad = new Date(a.release_date || a.first_air_date || '1970-01-01').getTime();
            return bd - ad;
          })
          .slice(0, 10);

        setPool(sorted);
      } catch {
        setPool(initialMedia.filter(m => m.backdrop_path).slice(0, 10));
      }
    })();
  }, [initialMedia]);

  const filteredMedia = useMemo(() => {
    if (preference && preference !== 'balanced') {
      const pref = pool.filter(m => m.media_type === preference);
      const others = pool.filter(m => m.media_type !== preference);
      return [...pref, ...others].slice(0, 10);
    }
    return pool;
  }, [pool, preference]);

  const featured = filteredMedia[currentIndex] || null;

  useEffect(() => {
    if (!featured) return;
    (async () => {
      try {
        const url = `https://api.themoviedb.org/3/${featured.media_type}/${featured.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        const trailer = (data.results || []).find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        setTrailerKey(trailer ? trailer.key : null);
      } catch {
        setTrailerKey(null);
      }
    })();
  }, [featured]);

  const goToNext = useCallback(() => {
    setCurrentIndex(i => (i + 1) % filteredMedia.length);
    setIsLoaded(false);
  }, [filteredMedia.length]);

  useEffect(() => {
    if (paused || filteredMedia.length <= 1) return;
    intervalRef.current = setInterval(goToNext, 6000);
    return () => clearInterval(intervalRef.current!);
  }, [paused, filteredMedia.length, goToNext]);

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
  const typeLabel = featured.media_type === 'tv' ? 'TV Show' : 'Movie';
  const year = (new Date(featured.release_date || featured.first_air_date || '')).getFullYear();
  const genres = (featured.genre_ids || []).map(id => genreMap[id]).filter(Boolean).slice(0, 3);
  const score = featured.vote_average.toFixed(1);

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

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 md:px-16 text-center text-white max-w-5xl mx-auto space-y-4">
        <div className="flex gap-3 items-center">
          <span className="text-xs md:text-sm bg-white/90 text-black rounded-sm px-2 py-[2px] uppercase font-semibold">
            Trending Now
          </span>
          <span className="text-xs md:text-sm bg-blue-600 text-white rounded-sm px-2 py-[2px] uppercase font-semibold">
            {typeLabel}
          </span>
        </div>
        <div className="flex gap-4 text-sm md:text-base text-white/80 items-center">
          <span>{year}</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400" />
            <span>{score}</span>
          </div>
          <span>{genres.join(', ')}</span>
        </div>
        <h1 className="text-3xl md:text-6xl font-extrabold max-w-4xl leading-tight">{title}</h1>
        <p className="max-w-3xl text-sm md:text-base text-white/80 line-clamp-4">{overview}</p>
        <div className="flex gap-4 mt-4 justify-center flex-wrap">
          {trailerKey && (
            <Button
              onClick={() => window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank')}
              variant="outline"
              className="flex items-center gap-2 border-white/70 bg-white/90 text-black px-5 py-2 rounded-md font-semibold text-sm shadow hover:bg-white"
            >
              <Video className="w-4 h-4" />
              Trailer
            </Button>
          )}
          <Button
            onClick={handleMoreInfo}
            variant="outline"
            className="flex items-center gap-2 border-white/70 bg-white/90 text-black px-5 py-2 rounded-md font-semibold text-sm shadow hover:bg-white"
          >
            Details
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={handlePlay}
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-md font-semibold text-sm shadow hover:bg-gray-900"
          >
            <Play className="w-5 h-5" />
            Watch
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
