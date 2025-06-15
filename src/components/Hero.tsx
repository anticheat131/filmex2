import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { backdropSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Video, Star, X, Calendar, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaPreferences } from '@/hooks/use-media-preferences';
import { fetchLogo } from '@/utils/fetchLogo';

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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { preference } = useMediaPreferences();

  const loadTrendingMedia = useCallback(async () => {
    try {
      const [mvRes, tvRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`),
        fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
      ]);
      const [mvJson, tvJson] = await Promise.all([mvRes.json(), tvRes.json()]);
      const combined = [...initialMedia, ...(mvJson.results || []), ...(tvJson.results || [])];

      // Filter only newest (last 14 days) and trending
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const filteredNewestTrending = combined.filter(item => {
        if (!item.backdrop_path) return false;
        const dateStr = item.release_date || item.first_air_date;
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date >= twoWeeksAgo;
      });

      const unique = new Map<string, Media>();
      filteredNewestTrending.forEach(item => {
        const key = `${item.media_type || 'unknown'}-${item.id}`;
        if (!unique.has(key)) unique.set(key, item);
      });

      const sorted = Array.from(unique.values())
        .sort((a, b) => {
          // Sort by vote_average (descending), then by date (descending)
          const voteDiff = (b.vote_average || 0) - (a.vote_average || 0);
          if (voteDiff !== 0) return voteDiff;
          const bDate = new Date(b.release_date || b.first_air_date || '1970-01-01').getTime();
          const aDate = new Date(a.release_date || a.first_air_date || '1970-01-01').getTime();
          return bDate - aDate;
        })
        .slice(0, 10);

      setPool(sorted);
    } catch (error) {
      console.error('Error loading trending media:', error);
      setPool(initialMedia.filter(m => m.backdrop_path).slice(0, 10));
    }
  }, [initialMedia]);

  useEffect(() => {
    loadTrendingMedia();
  }, [loadTrendingMedia]);

  const filteredMedia = useMemo(() => {
    if (preference && preference !== 'balanced') {
      const preferred = pool.filter(m => m.media_type === preference);
      const fallback = pool.filter(m => m.media_type !== preference);
      return [...preferred, ...fallback].slice(0, 10);
    }
    return pool;
  }, [pool, preference]);

  const featured = filteredMedia[currentIndex] || null;

  useEffect(() => {
    async function getLogo() {
      if (featured) {
        const logo = await fetchLogo(featured.id, featured.media_type);
        setLogoUrl(logo ? `https://image.tmdb.org/t/p/w780${logo}` : null);
      } else {
        setLogoUrl(null);
      }
    }
    getLogo();
  }, [featured]);

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
        className={`h-hero relative w-full aspect-[1.88/1] min-h-[386px] max-h-[795px] md:aspect-[2/1] md:min-h-[420px] md:max-h-[700px] bg-black rounded-md shadow-2xl border border-white/10 flex items-center justify-center overflow-hidden -mt-[4vh] md:mt-0 ${className}`}
        style={{boxShadow: '0 8px 40px 0 rgba(0,0,0,0.65), 0 1.5px 8px 0 rgba(0,0,0,0.25)'}}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <img
          alt={title}
          loading="lazy"
          decoding="async"
          className="size-full rounded-md border bg-muted object-cover absolute inset-0 w-full h-full"
          src={getImageUrl(featured.backdrop_path, backdropSizes.original)}
          style={{position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent'}}
        />
        <div className="overlay absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/95 z-10" />
        <button className="absolute right-2 top-2 z-10 rounded-full p-2 text-white bg-black/40 hover:bg-black/70" title="Add to Favorites">
          <svg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24' className='size-6'><path fill="none" d="M0 0h24v24H0z"></path><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>
        </button>
        <div className="overlay absolute inset-0 flex items-end justify-center z-20">
          <div className="mx-auto max-w-3xl space-y-4 p-4 pb-8 text-center md:p-14">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-primary text-primary-foreground hover:bg-primary/80 select-none mb-2">Trending Now</div>
            <div className="flex size-full items-center justify-center object-cover mb-2">
              {logoUrl ? (
                <img alt={title} width="300" height="70" decoding="async" src={logoUrl} style={{color: 'transparent', maxHeight: '100px', width: 'auto'}} />
              ) : (
                <h1 className="text-4xl md:text-6xl font-extrabold uppercase text-yellow-400 drop-shadow-lg leading-tight">{title}</h1>
              )}
            </div>
            <p className="line-clamp-3 text-sm text-muted-foreground md:text-lg mb-4">{overview}</p>
            <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
              <a className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8" href={`/${featured.media_type}/${featured.id}`}>Details <ArrowRight className="ml-2 size-4" /></a>
              <a className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8 !bg-black text-white hover:!bg-red-200 hover:!text-black hover:!shadow-lg" href={featured.media_type === 'tv' ? `/watch/tv/${featured.id}/1/1` : `/watch/movie/${featured.id}`}>Watch <Play className="ml-2 size-4" /></a>
            </div>
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
