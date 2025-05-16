import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { getImageUrl } from '@/utils/services/tmdb';
import { posterSizes } from '@/utils/api';
import { cn } from '@/lib/utils';
import { Media } from '@/utils/types';

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

const MediaCard = ({ media, className }: { media: Media; className?: string }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [quality, setQuality] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const mediaId = media.media_id || media.id;
  const detailPath = media.media_type === 'movie' ? `/movie/${mediaId}` : `/tv/${mediaId}`;
  const title = media.title || media.name || 'Untitled';
  const posterUrl = getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg';
  const releaseYear = (media.release_date || media.first_air_date || '').slice(0, 4);
  const genres = (media.genre_ids || []).map(id => genreMap[id]).filter(Boolean).slice(0, 2).join(', ');
  const runtime = media.runtime ? `${media.runtime} min` : '';
  const score = media.vote_average?.toFixed(1);

  useEffect(() => {
    if (media.media_type === 'movie') {
      const fetchReleaseType = async () => {
        try {
          const res = await fetch(`https://api.themoviedb.org/3/movie/${media.id}/release_dates?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
          const data = await res.json();
          const usRelease = data.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates?.[0];
          const type = usRelease?.type;
          setQuality(type === 2 || type === 3 ? 'CAM' : 'HD');
        } catch (e) {
          setQuality('HD');
        }
      };
      fetchReleaseType();
    } else {
      setQuality('HD');
    }
  }, [media.id, media.media_type]);

  return (
    <div
      className={cn(
        'relative inline-block rounded-xl border border-white/10 bg-card shadow-md transition-all duration-300 cursor-pointer overflow-hidden hover:border-white/30 hover:shadow-white/10',
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

        {score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/75 text-amber-400 rounded-md text-xs font-semibold shadow-sm">
            <Star className="w-4 h-4 fill-amber-400" />
            {score}
          </div>
        )}

        {quality && (
          <div
            className={`absolute top-2 left-2 px-3 py-1 text-[11px] font-semibold rounded-lg shadow-md text-white ${
              quality === 'HD'
                ? 'bg-gradient-to-r from-green-600 to-green-500'
                : 'bg-gradient-to-r from-red-600 to-red-500'
            }`}
          >
            {quality}
          </div>
        )}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <button
            className="flex items-center gap-2 px-3 py-1 bg-white text-black text-xs font-semibold rounded-full shadow hover:bg-gray-200 transition"
            onClick={e => {
              e.stopPropagation();
              navigate(detailPath);
            }}
          >
            Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div className="px-3 pb-3 pt-2 text-white text-sm space-y-1">
        <h3 className="text-center text-sm font-medium text-white line-clamp-1">{title}</h3>
        <div className="flex justify-between items-end text-xs">
          <p className="text-white/70 line-clamp-1 max-w-[60%] pl-[5%]">{genres}</p>
          {runtime && <p className="text-white/60 text-right min-w-[35%]">{runtime}</p>}
        </div>
        <p className="text-center text-white/50 text-[11px] pt-1">{releaseYear}</p>
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
            onMouseEnter={() => setShowPopup(true)}
            onMouseLeave={() => setShowPopup(false)}
          >
            <h4 className="font-bold text-lg mb-1">{title}</h4>
            <p className="text-xs mb-2 text-white/70">Release: {media.release_date || media.first_air_date || 'Unknown'}</p>
            <p className="text-xs mb-2 text-white/70">Genres: {genres || 'Unknown'}</p>
            {score && (
              <p className="flex items-center text-amber-400 mb-2">
                <Star className="h-4 w-4 mr-1 fill-amber-400" /> {score}
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
