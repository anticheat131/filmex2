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
}

const slugifyTitle = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const MediaCard = ({
  media,
  className,
  minimal = false,
  smaller = false,
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

  const runtimeMinutes = !minimal && (
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

  // Debug: log logo_path for each card
  useEffect(() => {
    console.log('MediaCard:', media.title || media.name, 'logo_path:', media.logo_path);
  }, [media.logo_path, media.title, media.name]);

  // Log media ID, title, and logo URL for large cards
  useEffect(() => {
    if (minimal) {
      const logo = media.logo_path
        ? `https://wsrv.nl/?url=https://image.tmdb.org/t/p/original${media.logo_path}&w=300&output=webp`
        : null;
      console.log('[MediaCard large]', media.id, media.title || media.name, 'logo:', logo);
    }
  }, [minimal, media.id, media.title, media.name, media.logo_path]);

  // Get year from release_date or first_air_date
  const year = (media.release_date || media.first_air_date || '').slice(0, 4);

  return (
    <article
      className={cn(
        'relative inline-block rounded-[4px] border border-[#23232a99] bg-card shadow transition-all duration-300 cursor-pointer overflow-hidden',
        'hover:shadow-lg hover:border-accent',
        'focus:outline-none focus:ring-0 focus:border-[#23232a99]',
        '[&:focus]:outline-none [&:focus]:ring-0 [&:focus]:border-[#23232a99]',
        className
      )}
      style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)', outline: 'none', borderWidth: '1px', borderRadius: '4px' }}
      tabIndex={-1}
      onMouseDown={e => e.preventDefault()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-full aspect-[2/3] group md:aspect-[9/13] md:min-w-[260px] md:max-w-[340px] md:min-h-[390px] md:max-h-[510px] min-w-[180px] max-w-[220px] min-h-[270px] max-h-[330px]" style={{transition:'all .2s cubic-bezier(.4,0,.2,1)'}}>
        {media.poster_path ? (
          <img
            src={getImageUrl(media.poster_path, posterSizes.large)}
            alt={media.title || media.name || 'Media Poster'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-[4px]"
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-neutral-900 text-white text-2xl md:text-3xl font-bold rounded-[4px]">
            {media.title || media.name || 'No Title'}
          </div>
        )}
        {/* Heart icon: only visible on hover */}
        <button className="absolute top-2 right-2 z-20 bg-black/40 hover:bg-black/70 rounded-full p-2 md:p-2.5 transition opacity-0 group-hover:opacity-100 focus:opacity-100" tabIndex={-1} aria-label="Add to favorites" style={{pointerEvents:'auto'}}>
          <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='white' className='w-6 h-6 md:w-7 md:h-7'><path strokeLinecap='round' strokeLinejoin='round' d='M16.5 3.75a5.25 5.25 0 00-4.5 2.472A5.25 5.25 0 007.5 3.75C4.5 3.75 2.25 6.086 2.25 8.917c0 2.86 2.28 5.342 5.73 8.478l.04.036c.46.41.92.82 1.37 1.22.46.41.92.82 1.37 1.22l.04.036c3.45-3.136 5.73-5.618 5.73-8.478 0-2.831-2.25-5.167-5.25-5.167z' /></svg>
        </button>
        {/* Bottom info: IMDB badge, title, year, left-aligned, stacked, mapple.tv style */}
        <div style={{position:'absolute',left:0,right:0,bottom:0,padding:0}}>
          <div style={{position:'absolute', left: '12px', bottom: '12px', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0'}}>
            {media.vote_average > 0 && (
              <div style={{display:'flex',alignItems:'center',background:'#fff',color:'#111',borderRadius:'999px',height:'22px',minWidth:'32px',padding:'0 10px',fontWeight:700,fontSize:'13px',boxShadow:'0 1px 4px 0 rgba(0,0,0,0.10)',marginBottom:'4px',justifyContent:'center'}}>{media.vote_average.toFixed(1)}</div>
            )}
            <div style={{fontWeight:600,fontSize:'17px',color:'#fff',lineHeight:'1.1',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',marginBottom:'0'}}>{media.title || media.name}</div>
            <div style={{fontSize:'13px',color:'#bdbdbd',fontWeight:500,lineHeight:'1',marginTop:'0'}}>{year || '—'}</div>
          </div>
        </div>
        {/* Action buttons: Details above, Watch below, styled as in mapple.tv, responsive for mobile */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center space-y-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:pointer-events-auto md:group-hover:pointer-events-auto">
          <a
            className="flex min-w-24 items-center justify-between rounded-lg bg-white/95 px-4 py-2 text-black transition-all hover:bg-red-200 hover:text-black md:bg-white/80 text-sm font-semibold shadow gap-2"
            href={detailPath}
            onClick={e => { e.stopPropagation(); navigate(detailPath); }}
            tabIndex={-1}
            style={{pointerEvents:'auto'}}
          >
            <span>Details</span>
            {/* mapple.tv Details icon SVG */}
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="ml-2 size-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 5h8"></path>
              <path d="M13 9h5"></path>
              <path d="M13 15h8"></path>
              <path d="M13 19h5"></path>
              <path d="M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path>
              <path d="M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path>
            </svg>
          </a>
          <a
            className="flex min-w-24 items-center justify-between rounded-lg bg-black/90 px-4 py-2 text-white transition-all hover:bg-red-200 hover:text-black md:bg-black/80 text-sm font-semibold shadow gap-2"
            href={media.media_type === 'movie' ? `/watch/movie/${mediaId}-${slug}` : `/watch/tv/${mediaId}-${slug}`}
            onClick={e => { e.stopPropagation(); navigate(media.media_type === 'movie' ? `/watch/movie/${mediaId}-${slug}` : `/watch/tv/${mediaId}-${slug}`); }}
            tabIndex={-1}
            style={{pointerEvents:'auto'}}
          >
            <span>Watch</span>
            {/* mapple.tv Watch icon SVG */}
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="ml-2 size-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M133 440a35.37 35.37 0 0 1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440z"></path></svg>
          </a>
        </div>
        {/* Quality badge: top-left corner */}
        {quality && (
          <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs md:text-sm font-semibold rounded-full px-3 py-1.5">
            {quality}
          </div>
        )}
        {/* Popup: Media info on hover */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              className="absolute z-50 w-[300px] md:w-[400px] bg-neutral-900 text-white rounded-lg shadow-lg p-4 md:p-6"
              style={{
                top: `${popupPos.y}px`,
                left: `${popupPos.x}px`,
                translate: '-50% -50%',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex flex-col space-y-2">
                <h3 className="text-lg md:text-xl font-semibold">{media.title || media.name}</h3>
                <p className="text-sm md:text-base text-gray-300">
                  {genreNames.join(', ')} • {runtimeMinutes} min • {formattedMonthYear}
                </p>
                {/* Debug: Show media ID and quality */}
                <p className="text-xs text-gray-400">
                  ID: {media.id} • Quality: {quality}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(media as any).production_companies?.map((company: any) => (
                    <span key={company.id} className="text-xs md:text-sm bg-gray-800 rounded-full px-3 py-1">
                      {company.name}
                    </span>
                  ))}
                </div>
                <p className="text-sm md:text-base">{media.overview}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
};

export default MediaCard;
