import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { getImageUrl } from '@/utils/services/tmdb';
import { posterSizes } from '@/utils/api';
import { cn } from '@/lib/utils';
import { trackMediaPreference, trackMediaView } from '@/lib/analytics';
import { Media } from '@/utils/types';

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
}

const slugifyTitle = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const MediaCard = ({
  media,
  className,
  minimal = false,
  smaller = false,
  large = false,
}: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [quality, setQuality] = useState<string | null>(null);

  const navigate = useNavigate();

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

  return (
    <article
      className={cn(
        'group',
        'relative inline-block rounded-sm border border-[#131313] bg-card shadow-md transition-all duration-300 cursor-pointer overflow-hidden',
        'hover:border-[#181818] hover:shadow-white/10 hover:scale-[1.04]',
        large ? 'w-[240px] md:w-[270px] aspect-[2/3] p-0 m-0' : 'hover:scale-[1.02]',
        className
      )}
      style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)', outline: 'none', borderWidth: '1px', borderRadius: '3px' }}
      tabIndex={-1}
      onMouseDown={e => e.preventDefault()}
      onClick={handleClick}
    >
      <div className={cn('relative w-full overflow-hidden rounded-sm', large ? 'aspect-[2/3]' : 'aspect-[2/3.5')}> 
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
        />
        {/* Buttons overlay, visible on hover, centered in card */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center space-y-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:pointer-events-auto md:group-hover:pointer-events-auto">
          <a
            className="flex min-w-24 items-center justify-between rounded-sm bg-white/95 px-4 py-2 text-black transition-all hover:bg-red-200 hover:text-black md:bg-white/80 text-sm font-semibold shadow gap-2"
            href={media.media_type === 'movie' ? `/movie/${mediaId}-${slug}` : `/tv/${mediaId}-${slug}`}
            tabIndex={-1}
            style={{ pointerEvents: 'auto' }}
          >
            <span>Details</span>
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="ml-2 size-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M13 5h8"></path><path d="M13 9h5"></path><path d="M13 15h8"></path><path d="M13 19h5"></path><path d="M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path><path d="M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path></svg>
          </a>
          <a
            className="flex min-w-24 items-center justify-between rounded-sm bg-black/90 px-4 py-2 text-white transition-all hover:bg-red-200 hover:text-black md:bg-black/80 text-sm font-semibold shadow gap-2"
            href={media.media_type === 'movie' ? `/watch/movie/${mediaId}-${slug}` : `/watch/tv/${mediaId}-${slug}`}
            tabIndex={-1}
            style={{ pointerEvents: 'auto' }}
          >
            <span>Watch</span>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="ml-2 size-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M133 440a35.37 35.37 0 0 1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440z"></path></svg>
          </a>
        </div>
        {/* Bottom overlay bar for IMDB, title, year */}
        <div style={{position:'absolute',left:0,right:0,bottom:0,padding:0}}>
          <div className="media-card-info-bar flex flex-col items-start gap-0 absolute left-1.5 bottom-3 z-10 px-2 py-1 rounded-sm" style={{maxWidth:'85%'}}>
            {/* IMDB badge */}
            {media.vote_average > 0 && (
              <div className="flex items-center bg-white text-black rounded-full h-[22px] min-w-[32px] px-[10px] font-bold text-[13px] shadow mb-1 justify-center">
                {media.vote_average.toFixed(1)}
              </div>
            )}
            {/* Title */}
            <div className="font-semibold text-[17px] text-white leading-tight truncate max-w-[180px] mb-0">
              {media.title || media.name}
            </div>
            {/* Year */}
            <div className="text-[13px] text-neutral-300 font-medium leading-none mt-0">
              {(media.release_date || media.first_air_date || '').slice(0, 4)}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MediaCard;
