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
  media: Media[];       // your “seed” array (can be <10)
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
    (async () => {
      try {
        // 1) Fetch TMDB trending movie/week + tv/week
        const [mvRes, tvRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`),
          fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
        ]);
        const [mvJson, tvJson] = await Promise.all([mvRes.json(), tvRes.json()]);

        // 2) Combine initial + trending → dedupe by id+media_type
        const combined = [...initialMedia, ...(mvJson.results || []), ...(tvJson.results || [])];
        const uniqueMap = new Map<string, Media>();
        combined.forEach(item => {
          if (!item || !item.backdrop_path) return;
          const key = `${item.media_type}-${item.id}`;
          if (!uniqueMap.has(key)) uniqueMap.set(key, item);
        });

        // 3) Sort and take top 10
        const sorted = Array.from(uniqueMap.values())
          .sort((a, b) => {
            // popularity desc
            if (b.popularity !== a.popularity) return b.popularity - a.popularity;
            // then release date desc
            const bd = new Date(b.release_date || b.first_air_date || '').getTime();
            const ad = new Date(a.release_date || a.first_air_date || '').getTime();
            return bd - ad;
          })
          .slice(0, 10);

        setPool(sorted);
      } catch (e) {
        // on error, just use whatever valid initialMedia you have
        setPool(initialMedia.filter(m => m.backdrop_path).slice(0, 10));
      }
    })();
  }, [initialMedia]);

  // 4) Apply user preference ordering
  const filteredMedia = useMemo(() => {
    if (preference && preference !== 'balanced') {
      const pref = pool.filter(m => m.media_type === preference);
      const others = pool.filter(m => m.media_type !== preference);
      return [...pref, ...others].slice(0, 10);
    }
    return pool;
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

  return (
    <section
      cla
