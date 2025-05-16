import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Media } from '@/utils/types';
import { posterSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackMediaPreference, trackMediaView } from '@/lib/analytics';

interface MediaCardProps {
  media: Media;
  className?: string;
  minimal?: boolean;
  smaller?: boolean;
}

const genreMap: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

const MediaCard = ({ media, className, minimal = false, smaller = false }: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleImageError = () => setImageError(true);

  const mediaId = media.media_id || media.id;
  const detailPath = media.media_type === 'movie' ? `/movie/${mediaId}` : `/tv/${mediaId}`;

  let quality = media.quality?.toUpperCase();
  if (!quality) {
    if (typeof media.hd === 'boolean') quality = media.hd ? 'HD' : 'CAM';
    else if (media.video_source?.toLowerCase().includes('cam')) quality = 'CAM';
    else quality = 'HD';
  }

  const genreNames = media.genre_ids
    ?.map(id => genreMap[id])
    .filter(Boolean)
    .slice(0, 3);

  const runtimeMinutes = media.media_type === 'movie'
    ? media.runtime
    : media.media_type === 'tv' && Array.isArray(media.episode_run_time) && media.episode_run_time.length > 0
      ? media.episode_run_time[0]
      : undefined;

  const durationText = runtimeMinutes ? `${runtimeMinutes} min` : undefined;

  const fullReleaseDate = media.media_type === 'movie'
    ? media.release_date
    : media.first_air_date;

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

  if (minimal) {
    return (
      <Link to={detailPath} className={cn("block h-full", className)}>
        <div className="relative h-full rounded-lg overflow-hidden shadow-md border border-white/10 hover:border-accent transition-colors">
          <img
            src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg'}
            alt={media.title || media.name || 'Media Poster'}
            className="object-cover w-full h-full"
            loading="lazy"
            onError={handleImageError}
          />
          {quality && (
            <span
              className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded backdrop-blur-sm ${
                quality === 'HD' ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'
              }`}
            >
              {quality}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div
      className={cn(
        'relative inline-block rounded-lg border border-white/10 bg-card shadow-lg transition-all duration-300 hover:shadow-accent/30 hover:border-accent cursor-pointer',
        smaller ? 'scale-90 origin-top-left' : '',
        className
      )}
      style={{ transformOrigin: 'top left' }}
      onClick={handleClick}
      // Wrap hover for both card and popup:
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
    >
      <div className="relative rounded-t-lg overflow-hidden aspect-[2/3]">
        <img
          src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg'}
          alt={media.title || media.name || 'Media Poster'}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={handleImageError}
        />

        {quality && (
          <span
            className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded backdrop-blur-sm ${
              quality === 'HD' ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'
            }`}
          >
            {quality}
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-3 space-y-1 text-white">
        <h3 className="text-base font-semibold line-clamp-1">{media.title || media.name}</h3>

        {genreNames && genreNames.length > 0 && (
          <p className="text-xs text-white/70 line-clamp-1">
            {genreNames.join(', ')}
          </p>
        )}

        <div className="flex justify-between items-center text-sm text-white/70 mt-1">
          <span>
            {media.media_type === 'movie'
              ? media.release_date?.slice(0, 4)
              : media.first_air_date?.slice(0, 4)}{durationText ? ` · ${durationText}` : ''}
          </span>
          {media.vote_average > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4 fill-amber-400" />
              {media.vote_average.toFixed(1)}
            </span>
          )}
        </div>

      {/* Popup container, absolute and above card */}
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
            <h4 className="font-bold text-lg mb-1">{media.title || media.name}</h4>
            <p className="text-xs mb-2 text-white/70">Release: {fullReleaseDate || 'Unknown'}</p>
            <p className="text-xs mb-2 text-white/70">Genres: {genreNames?.join(', ') || 'Unknown'}</p>
            {media.vote_average > 0 && (
              <p className="flex items-center text-amber-400 mb-2">
                <Star className="h-4 w-4 mr-1 fill-amber-400" /> {media.vote_average.toFixed(1)}
              </p>
            )}
            <p className="text-xs max-h-28 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {media.overview || 'No description available.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default MediaCard;
