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
  featured?: boolean;
  minimal?: boolean;
}

// Simple TMDB genre ID to name map (adjust or import yours)
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

const MediaCard = ({ media, className, minimal = false }: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleImageError = () => setImageError(true);

  const mediaId = media.media_id || media.id;
  const detailPath = media.media_type === 'movie' ? `/movie/${mediaId}` : `/tv/${mediaId}`;

  // Quality fallback logic
  let quality = media.quality?.toUpperCase();
  if (!quality) {
    if (typeof media.hd === 'boolean') quality = media.hd ? 'HD' : 'CAM';
    else if (media.video_source?.toLowerCase().includes('cam')) quality = 'CAM';
    else quality = 'HD';
  }

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

  // Map genre IDs to names and show max 3
  const genreNames = media.genre_ids
    ?.map(id => genreMap[id])
    .filter(Boolean)
    .slice(0, 3);

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
        className
      )}
      whileHover={{ scale: 1.03 }}
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-3 space-y-1 text-white">
        <h3 className="text-base font-semibold line-clamp-1">{media.title || media.name}</h3>

        {/* Genre list */}
        {genreNames && genreNames.length > 0 && (
          <p className="text-xs text-white/70 line-clamp-1">
            {genreNames.join(', ')}
          </p>
        )}

        <div className="flex justify-between items-center text-sm text-white/70 mt-1">
          <span>
            {media.media_type === 'movie'
              ? media.release_date?.slice(0, 4)
              : media.first_air_date?.slice(0, 4)}
          </span>
          {media.vote_average > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4 fill-amber-400" />
              {media.vote_average.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex justify-center mt-2">
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
    </motion.div>
  );
};

export default MediaCard;
