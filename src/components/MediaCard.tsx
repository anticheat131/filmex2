import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { getImageUrl } from '@/utils/services/tmdb';
import { posterSizes } from '@/utils/api';
import { cn } from '@/lib/utils';
import { trackMediaPreference, trackMediaView } from '@/lib/analytics';
import { Media } from '@/utils/types';
import { useTranslation } from 'react-i18next';

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

interface MediaCardProps {
  media: Media;
  className?: string;
  minimal?: boolean;
  smaller?: boolean;
  large?: boolean; // NEW: for homepage big cards
  hideInfoBar?: boolean; // NEW: hide info bar for Trending Today
  trendingNow?: boolean; // For Trending Now Movies or TV Shows
  popularPage?: boolean; // Only for /movie/popular
}

const slugifyTitle = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const MediaCard = ({
  media,
  className,
  minimal = false,
  smaller = false,
  large = false,
  hideInfoBar = false,
  trendingNow = false,
  popularPage = false,
}: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [quality, setQuality] = useState<string | null>(null);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const mediaId = media.media_id || media.id;
  const slug = slugifyTitle(media.title || media.name || '');
  const detailPath =
    media.media_type === 'movie' ? `/movie/${mediaId}-${slug}` : `/tv/${mediaId}-${slug}`;

  const genreNames = (media.genre_ids || [])
    .map(id => genreMap[id])
    .filter(Boolean)
    .slice(0, 2);

  const runtimeMinutes = !large && (
    media.media_type === 'movie'
      ? (media as any).runtime
      : Array.isArray((media as any).episode_run_time) && (media as any).episode_run_time.length > 0
      ? (media as any).episode_run_time[0]
      : undefined
  );

  const fullReleaseDate =
    media.media_type === 'movie' ? media.release_date : media.first_air_date;
  const releaseDate = new Date(fullReleaseDate || '');
  const formattedMonthYear = !isNaN(releaseDate.getTime())
    ? `${releaseDate.toLocaleString('default', { month: 'long' })} ${releaseDate.getFullYear()}`
    : 'Unknown';

  const handleClick = async () => {
    await Promise.all([
      trackMediaPreference(media.media_type, 'select'),
      trackMediaView({
        mediaType: media.media_type as 'movie' | 'tv',
        mediaId: media.id.toString(),
        title: media.title || media.name || '',
      }),
    ]);
    navigate(detailPath);
  };

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setPopupPos({ x: clientX, y: clientY });
    setShowPopup(true);
  }, []);

  const handleMouseLeave = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    const fetchQuality = async () => {
      if (media.media_type !== 'movie') return;

      try {
        const release = new Date(media.release_date);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));

        const FOUR_MONTHS_DAYS = 120;
        if (diffInDays > FOUR_MONTHS_DAYS) {
          setQuality('HD');
          return;
        }

        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${mediaId}/release_dates?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const data = await res.json();
        const allReleaseDates = data.results || [];

        const allTypes = allReleaseDates.flatMap((r: any) =>
          r.release_dates.map((rd: any) => ({
            type: rd.type,
            date: new Date(rd.release_date),
            note: rd.note?.toLowerCase() || '',
          }))
        );

        const validDigital = allTypes.some(
          rd => rd.type === 4 && rd.date <= now && !rd.note.includes('pre-order')
        );

        const allTypesSet = new Set(allTypes.map(rd => rd.type));
        const onlyTheatrical = [...allTypesSet].every(t => t === 2 || t === 3);

        if (allTypes.length === 0 || onlyTheatrical) {
          setQuality(diffInDays >= 60 ? 'HD' : 'CAM');
        } else {
          setQuality(validDigital ? 'HD' : 'CAM');
        }
      } catch {
        setQuality(null);
      }
    };

    fetchQuality();
  }, [mediaId, media.media_type, media.release_date]);

  const year = (media.release_date || media.first_air_date || '').slice(0, 4);

  // Use the same size as all grid cards for all non-large cards
  let uniformCardClass = large
    ? 'w-[200px] h-[320px] sm:w-[240px] sm:h-[380px] md:w-[209px] md:h-[309px]'
    : 'w-[175px] h-[261px] md:h-[350px] sm:w-full'; // md:h-[350px] for md screens

  // If trendingNow, increase height by 20%
  if (trendingNow && !large) {
    uniformCardClass = 'w-[175px] h-[313px] md:h-[420px] sm:w-full'; // 261*1.20 ≈ 313, 350*1.20 ≈ 420
  }

  return (
    <div
      className={cn(
        'relative bg-neutral-900 overflow-hidden shadow-lg group transition-all duration-200',
        uniformCardClass,
        className,
      )}
      style={{ border: '0.5px solid rgba(255,255,255,0.03)', borderRadius: '6px' }} // force border radius inline
      tabIndex={0}
      aria-label={media.title || media.name}
      onClick={() => navigate(detailPath)}
      onKeyDown={e => {
        if (e.key === 'Enter') navigate(detailPath);
      }}
      onMouseEnter={e => {
        if (!minimal && !smaller) setShowPopup(true);
        setPopupPos({ x: e.clientX, y: e.clientY });
      }}
      onMouseLeave={() => setShowPopup(false)}
    >
      <div className={cn('relative w-full overflow-hidden', large ? 'aspect-[2/3]' : 'aspect-[2/3]')}
        style={{ borderRadius: '6px' }} // force border radius inline
      > 
        {/* Quality badge at top left */}
        {quality && (
          <div className="absolute top-2 left-2 z-20 px-3 py-1 rounded-full bg-black/70 border border-white/20 shadow-md backdrop-blur-md text-white text-xs font-semibold select-none pointer-events-none tracking-wider uppercase" style={{letterSpacing:'0.06em', fontSize:'0.78rem'}}>
            {quality}
          </div>
        )}
        <img
          src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, large ? posterSizes.large : posterSizes.medium)}
          alt={media.title || media.name || 'Media Poster'}
          onError={() => setImageError(true)}
          className={cn('w-full h-full object-cover')}
          style={{ border: '0.5px solid rgba(255,255,255,0.03)' }} // smallest, most subtle border for image
        />
        {/* Info bar: score, name, year in a single row, centered below buttons, always visible */}
        <div className="media-card-info-bar flex flex-row items-end gap-3 absolute left-1/2 -translate-x-1/2 z-20 px-2 py-1 rounded-sm bg-transparent justify-center w-[90%] pointer-events-auto" style={{ bottom: '5%' }}>
          {media.vote_average > 0 && (
            <div className="flex items-center bg-white text-black rounded-full h-[22px] min-w-[32px] px-[10px] font-bold text-[13px] shadow justify-center">
              {media.vote_average.toFixed(1)}
            </div>
          )}
          <div className="media-card-title-year flex flex-col items-start min-w-0 flex-1 justify-end">
            <div className="media-card-title font-semibold text-[15px] sm:text-[17px] text-white leading-tight truncate max-w-[150px] sm:max-w-[180px] mb-0">
              {media.title || media.name}
            </div>
            <div className="media-card-year text-[13px] text-neutral-300 font-medium leading-none mt-0">
              {(media.release_date || media.first_air_date || '').slice(0, 4)}
            </div>
          </div>
        </div>
        {/* Centered Details/Watch buttons, stacked vertically, only on hover, moved 6% higher */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity" style={{ justifyContent: 'center', top: '-6%' }}>
          <div className="flex flex-col items-center justify-center h-full">
            <a
              className="flex items-center justify-center rounded bg-white/95 px-4 py-2 mb-2 text-black font-semibold text-sm shadow hover:bg-red-200 hover:text-black transition pointer-events-auto"
              href={media.media_type === 'movie' ? `/movie/${mediaId}-${slug}` : `/tv/${mediaId}-${slug}`}
              tabIndex={-1}
              style={{ pointerEvents: 'auto' }}
            >
              <span>{t('Details')}</span>
              <ArrowRight className="ml-2 size-4" />
            </a>
            <a
              className="flex items-center justify-center rounded bg-black/90 px-4 py-2 text-white font-semibold text-sm shadow hover:bg-red-200 hover:text-black transition pointer-events-auto"
              href={media.media_type === 'movie' ? `/watch/movie/${mediaId}-${slug}` : `/watch/tv/${mediaId}-${slug}`}
              tabIndex={-1}
              style={{ pointerEvents: 'auto' }}
            >
              <span>{t('Watch')}</span>
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="ml-2 size-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M133 440a35.37 35.37 0 0 1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440z"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;

// To reduce the gap between cards by 5%, ensure the parent container (e.g., grid or flex row) uses a smaller gap utility, such as gap-3 instead of gap-4, or add style={{gap: '0.95rem'}} if using inline styles.
// If you want to enforce it here, you can add a prop to MediaCard for custom margin, but best practice is to set the gap on the parent container.
