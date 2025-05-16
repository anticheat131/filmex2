import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Media } from '@/utils/types';
import { posterSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Star, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackMediaPreference, trackMediaView } from '@/lib/analytics';

interface MediaCardProps {
  media: Media;
  className?: string;
  minimal?: boolean;
  smaller?: boolean;
}

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

const MediaCard = ({ media, className, minimal = false, smaller = false }: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);
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

  const genreNames = media.genre_ids?.map(id => genreMap[id]).filter(Boolean).slice(0, 3);
  const fullDate = media.release_date || media.first_air_date || '';
  const runtime = media.runtime ? `${media.runtime} min` : undefined;

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
    <motion.div
      onClick={handleClick}
      className={cn(
        'relative group/card cursor-pointer overflow-visible rounded-lg border border-white/10 bg-card shadow-lg transition-all duration-300 hover:shadow-accent/30 hover:border-accent',
        smaller ? 'scale-90 origin-top-left' : '',
        className
      )}
      whileHover={{ scale: smaller ? 0.93 : 1.03 }}
    >
      <div className="relative rounded-t-lg overflow-hidden aspect-[2/3]">
        <img
          src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg'}
          alt={media.title || media.name || 'Media Poster'}
          className="object-cover w-full h-full transition-transform duration-500 group-hover/card:scale-110"
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

      <div className="p-3 space-y-1 text-white">
        <h3 className="text-base font-semibold line-clamp-1">{media.title || media.name}</h3>

        {genreNames?.length > 0 && (
          <p className="text-xs text-white/70 line-clamp-1">{genreNames.join(', ')}</p>
        )}

        <div className="flex justify-between items-center text-sm text-white/70 mt-1">
          <span>
            {fullDate}{runtime ? ` · ${runtime}` : ''}
          </span>
          {media.vote_average > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4 fill-amber-400" />
              {media.vote_average.toFixed(1)}
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/90 text-xs text-white opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20 max-h-40 overflow-auto rounded-b-md">
          <p className="font-semibold">{media.title || media.name}</p>
          {media.overview && <p className="mt-1 text-white/80">{media.overview}</p>}
          <div className="mt-2 flex justify-center">
            <button
              className="glass px-3 py-1 rounded text-xs flex items-center gap-1 text-white hover:bg-white/20 transition-colors"
              onClick={e => {
                e.stopPropagation();
                navigate(detailPath);
              }}
              aria-label="View Details"
            >
              <Info size={12} /> Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MediaCard;
