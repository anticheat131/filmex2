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

  // Get year from release_date or first_air_date
  const year = (media.release_date || media.first_air_date || '').slice(0, 4);

  return (
    <article
      className={cn(
        'relative inline-block rounded-lg border border-[#131313] bg-card shadow-md transition-all duration-300 cursor-pointer overflow-hidden',
        'hover:border-[#181818] hover:shadow-white/10 hover:scale-[1.04]',
        large ? 'w-[240px] md:w-[270px] aspect-[2/3] p-0 m-0' : 'hover:scale-[1.02]',
        className
      )}
      onClick={handleClick}
    >
      <div className={cn('relative w-full overflow-hidden rounded-lg', large ? 'aspect-[2/3]' : 'aspect-[2/3.5')}> 
        <img
          src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, large ? posterSizes.large : posterSizes.medium)}
          alt={media.title || media.name || 'Media Poster'}
          onError={() => setImageError(true)}
          className={cn('w-full h-full object-cover', large ? 'rounded-lg' : '')}
        />
        {/* Bottom overlay bar for IMDB, title, year */}
        <div style={{position:'absolute',left:0,right:0,bottom:0,padding:0}}>
          <div className="media-card-info-gradient" />
          <div className="media-card-info-bar">
            {/* IMDB badge bottom left */}
            {media.vote_average > 0 && (
              <div className="media-card-imdb-badge">
                <span className="imdb-label">IMDB</span>
                <span className="imdb-score">{media.vote_average.toFixed(1)}</span>
              </div>
            )}
            {/* Title and year to the right of badge, left-aligned, stacked */}
            <div className="media-card-title-year">
              <h3 className="media-card-title">{media.title || media.name}</h3>
              <span className="media-card-year">{year || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MediaCard;
