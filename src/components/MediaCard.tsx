import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { getImageUrl } from '@/utils/services/tmdb';
import { posterSizes } from '@/utils/api';
import { cn } from '@/lib/utils';
import { trackMediaPreference, trackMediaView } from '@/lib/analytics';
import { Media } from '@/utils/types';

interface MediaCardProps {
  media: Media;
  className?: string;
}

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

const MediaCard = ({ media, className }: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [quality, setQuality] = useState<string | null>(null);
  const navigate = useNavigate();

  const mediaId = media.media_id || media.id;
  const detailPath = media.media_type === 'movie' ? `/movie/${mediaId}` : `/tv/${mediaId}`;
  const posterUrl = getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg';
  const title = media.title || media.name || 'Untitled';

  const releaseDate = media.release_date || media.first_air_date || '';
  const year = releaseDate.slice(0, 4);
  const genres = (media.genre_ids || []).map(id => genreMap[id]).filter(Boolean).slice(0, 2).join(', ');
  const runtime = media.runtime ? `${media.runtime} min` : '';
  const rating = media.vote_average?.toFixed(1);

  useEffect(() => {
    async function fetchReleaseType() {
      if (media.media_type !== 'movie') return;

      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${mediaId}/release_dates?api_key=${import.meta.env.VITE_TMDB_API_KEY}`);
        const data = await res.json();
        const usRelease = data.results?.find((r: any) => r.iso_3166_1 === 'US');
        const types = usRelease?.release_dates?.map((r: any) => r.type) || [];

        if (types.includes(2) || types.includes(3)) {
          setQuality('CAM');
        } else {
          setQuality('HD');
        }
      } catch (err) {
        console.error('Failed to fetch release types:', err);
        setQuality('HD'); // Fallback
      }
    }

    fetchReleaseType();
  }, [mediaId, media.media_type]);

  return (
    <div
      className={cn(
        'relative inline-block w-[230px] rounded-xl border border-white/10 bg-card shadow-md transition-all duration-300 cursor-pointer overflow-hidden hover:border-white/30 hover:shadow-white/10',
        className
      )}
      onClick={() => navigate(detailPath)}
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl">
        <img
          src={imageError ? '/placeholder.svg' : posterUrl}
          alt={title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />

        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/75 text-amber-400 rounded-md text-xs font-semibold shadow-sm">
            <Star className="w-4 h-4 fill-amber-400" />
            {rating}
          </div>
        )}

        {quality && (
          <div
            className={`absolute top-2 left-2 px-3 py-1 text-[11px] font-semibold rounded-lg shadow-md text-white
              ${quality === 'HD'
                ? 'bg-gradient-to-r from-green-600 to-green-500'
                : 'bg-gradient-to-r from-red-600 to-red-500'}`}
            style={{ letterSpacing: '0.05em', textShadow: '0 0 3px rgba(0,0,0,0.6)' }}
          >
            {quality}
          </div>
        )}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <div className="flex justify-center">
            <button
              className="flex items-center gap-2 px-3 py-1 bg-white text-black text-xs font-semibold rounded-full shadow hover:bg-gray-200 transition"
              onClick={(e) => {
                e.stopPropagation();
                navigate(detailPath);
              }}
            >
              Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div className="px-3 pb-3 pt-2 text-white text-sm space-y-1">
        <h3 className="text-center text-sm font-medium text-white line-clamp-1">{title}</h3>
        <div className="flex justify-between items-end text-xs">
          <p className="text-white/70 line-clamp-1 max-w-[60%] pl-[5%]">{genres || '—'}</p>
          {runtime && <p className="text-white/60 text-xs text-right min-w-[35%]">{runtime}</p>}
        </div>
        <p className="text-center text-white/50 text-[11px] pt-1">{year}</p>
      </div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-3 w-[320px] max-w-full rounded-lg bg-black/90 p-4 shadow-lg text-white pointer-events-auto"
          >
            <h4 className="font-bold text-lg mb-1">{title}</h4>
            <p className="text-xs mb-2 text-white/70">Release: {releaseDate || 'Unknown'}</p>
            <p className="text-xs mb-2 text-white/70">Genres: {genres || 'Unknown'}</p>
            {rating && (
              <p className="flex items-center text-amber-400 mb-2">
                <Star className="h-4 w-4 mr-1 fill-amber-400" /> {rating}
              </p>
            )}
            <p className="text-xs max-h-28 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {media.overview || 'No description available.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaCard;
