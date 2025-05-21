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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { preference } = useMediaPreferences();

  // Helper: check if release date is within last 30 days
  const isRecent = (dateStr: string | undefined | null) => {
    if (!dateStr) return false;
    const releaseDate = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - releaseDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 30 && diffDays >= 0;
  };

  const loadTrendingNewest = useCallback(async () => {
    try {
      const [mvRes, tvRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`),
        fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`),
      ]);
      const [mvJson, tvJson] = await Promise.all([mvRes.json(), tvRes.json()]);

      // Combine movie and tv trending results
      const combined = [...(mvJson.results || []), ...(tvJson.results || [])];

      // Filter to only recent (released in last 30 days)
      const recentTrending = combined.filter(item =>
        isRecent(item.release_date || item.first_air_date)
      );

      // Sort by popularity descending
      const sorted = recentTrending.sort((a, b) => b.popularity - a.popularity);

      // Limit to 10 items max
      const limited = sorted.slice(0, 10);

      setPool(limited);
    } catch (error) {
      console.error('Failed to load trending newest:', error);
      setPool(initialMedia.filter(m => m.backdrop_path).slice(0, 10));
    }
  }, [initialMedia]);

  useEffect(() => {
    loadTrendingNewest();
  }, [loadTrendingNewest]);

  const filteredMedia = useMemo(() => {
    if (preference && preference !== 'balanced') {
      const preferred = pool.filter(m => m.media_type === preference);
      const fallback = pool.filter(m => m.media_type !== preference);
      return [...preferred, ...fallback].slice(0, 10);
    }
    return pool;
  }, [pool, preference]);

  const featured = filteredMedia[currentIndex] || null;

  const goToNext = useCallback(() => {
    setCurrentIndex(i => (i + 1) % filteredMedia.length);
  }, [filteredMedia.length]);

  useEffect(() => {
    if (paused || filteredMedia.length <= 1) return;
    intervalRef.current = setInterval(goToNext, 6000);
    return () => clearInterval(intervalRef.current!);
  }, [paused, goToNext, filteredMedia.length]);

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

  const openTrailer = async () => {
    if (!featured) return;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${featured.media_type}/${featured.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      );
      const data = await res.json();
      const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      setTrailerKey(trailer?.key || null);
      setShowTrailer(true);
    } catch {
      setTrailerKey(null);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setTrailerKey(null);
  };

  if (!featured) return null;

  const title = featured.title || featured.name || '';
  const overview = featured.overview || '';
  const year = new Date(featured.release_date || featured.first_air_date || '').getFullYear();
  const score = featured.vote_average.toFixed(1);
  const genres = featured.genre_ids?.map(id => genreMap[id]).filter(Boolean).slice(0, 3);

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
          <div className="flex gap-3 items-center">
            <span className="text-xs md:text-sm bg-white/90 text-black rounded-full px-3 py-1 uppercase font-medium tracking-wider">
              Trending & Newest
            </span>
            <span className="text-xs md:text-sm bg-blue-600 text-white rounded-full px-3 py-1 uppercase font-medium tracking-wider">
              {featured.media_type === 'tv' ? 'TV Show' : 'Movie'}
            </span>
          </div>
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

          <h1 className="text-3xl md:text-5xl font-bold max-w-3xl leading-tight">{title}</h1>
          <p className="text-sm md:text-base max-w-2xl text-white/80">{overview}</p>

          <div className="flex gap-4 flex-wrap justify-center">
            <Button variant="default" className="flex gap-2 items-center px-6 py-2 text-base" onClick={handlePlay}>
              <Play className="w-5 h-5" /> Play
            </Button>
            <Button variant="secondary" className="flex gap-2 items-center px-6 py-2 text-base" onClick={handleMoreInfo}>
              <ArrowRight className="w-5 h-5" /> More Info
            </Button>
            <Button variant="outline" className="flex gap-2 items-center px-6 py-2 text-base" onClick={openTrailer}>
              <Video className="w-5 h-5" /> Trailer
            </Button>
          </div>
        </div>

        {showTrailer && trailerKey && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
            <div className="relative w-full max-w-4xl aspect-video">
              <iframe
                className="w-full h-full rounded-xl"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <Button onClick={closeTrailer} className="absolute top-4 right-4 text-white bg-black bg-opacity-60 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Hero;
