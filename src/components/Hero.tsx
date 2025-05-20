import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { backdropSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Video, Star, X, Calendar, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaPreferences } from '@/hooks/use-media-preferences';

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci‑Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

interface HeroProps {
  media: Media[];
  className?: string;
}

const Hero = ({ media: initialMedia, className = '' }: HeroProps) => {
  const [pool, setPool] = useState<Media[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { preference } = useMediaPreferences();

  // Build pool of up to 10 unique, backdrop-equipped items
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

  // Apply user preference ordering
  const filteredMedia = useMemo(() => {
    if (preference && preference !== 'balanced') {
      const pref = pool.filter(m => m.media_type === preference);
      const others = pool.filter(m => m.media_type !== preference);
      return [...pref, ...others].slice(0, 10);
    }
    return pool;
  }, [pool, preference]);

  const featured = filteredMedia[currentIndex] || null;

  // Fetch YouTube trailer key
  useEffect(() => {
    if (!featured) return;
    (async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${featured.media_type}/${featured.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const data = await res.json();
        const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        setTrailerKey(trailer?.key || null);
      } catch {
        setTrailerKey(null);
      }
    })();
  }, [featured]);

  // Advance immediately with zero-duration fade
  const goToNext = useCallback(() => {
    setCurrentIndex(i => (i + 1) % filteredMedia.length);
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
  const openTrailer = () => setShowTrailer(true);
  const closeTrailer = () => setShowTrailer(false);

  if (!featured) return null;

  const title = featured.title || featured.name || '';
  const overview = featured.overview || '';
  const year = new Date(featured.release_date || featured.first_air_date || '').getFullYear();
  const score = featured.vote_average.toFixed(1);
  const genres = featured.genre_ids?.map(id => genreMap[id]).filter(Boolean).slice(0,3);

  return (
    <>
      <section
        className={`relative w-full h-[72vh] md:h-[81vh] overflow-hidden bg-black ${className}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={getImageUrl(featured.backdrop_path, backdropSizes.original)}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0 }}
          />
          <motion.div
            key={`overlay-${currentIndex}`}
            className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0 }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 md:px-16 text-center text-white max-w-5xl mx-auto space-y-4">
          {/* Badges */}
          <div className="flex gap-3 items-center">
            <span className="text-xs md:text-sm bg-white/90 text-black rounded-full px-3 py-1 uppercase font-medium tracking-wider">
              Trending Now
            </span>
            <span className="text-xs md:text-sm bg-blue-600 text-white rounded-full px-3 py-1 uppercase font-medium tracking-wider">
              {featured.media_type === 'tv' ? 'TV Show' : 'Movie'}
            </span>
          </div>
          {/* Professional Info Tags */}
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="bg-white/10 text-white flex items-center gap-1 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
              <Calendar className="w-4 h-4" /> {year}
            </span>
            <span className="bg-amber-900/30 text-amber-300 flex items-center gap-1 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
              <Star className="w-4 h-4" /> {score}
            </span>
            <span className="bg-white/10 text-white flex items-center gap-1 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
              <Tag className="w-4 h-4" /> {genres?.join(', ')}
            </span>
          </div>
          {/* Title & Overview */}
          <h1 className="text-3xl md:text-6xl font-extrabold max-w-4xl leading-tight">{title}</h1>
          <p className="max-w-3xl text-sm md:text-base text-white/80 line-clamp-4">{overview}</p>
          {/* Buttons */}
          <div className="flex gap-4 mt-4 justify-center flex-wrap">
            {trailerKey && (
              <Button onClick={openTrailer} variant="outline" className="flex items-center gap-2 border-white/70 bg-white/90 text-black px-5 py-2 rounded-md font-semibold text-sm shadow hover:bg-white">
                <Video className="w-4 h-4" /> Trailer
              </Button>
            )}
            <Button onClick={handleMoreInfo} variant="outline" className="flex items-center gap-2 border-white/70 bg-white/90 text-black px-5 py-2 rounded-md font-semibold text-sm shadow hover:bg-white">
              Details <ArrowRight className="w-4 h-4" />
            </Button>
            <Button onClick={handlePlay} className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-md font-semibold text-sm shadow hover:bg-gray-900">
              <Play className="w-5 h-5" /> Watch
            </Button>
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailerKey && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative w-full max-w-3xl mx-auto">
              <button onClick={closeTrailer} className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-1 hover:bg-black">
                <X className="w-6 h-6" />
              </button>
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full rounded-xl shadow-lg"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Hero;
