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

const MediaCard = ({ media, className, featured = false, minimal = false }: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleImageError = () => {
    setImageError(true);
  };

  const mediaId = media.media_id || media.id;

  const detailPath = media.media_type === 'movie'
    ? `/movie/${mediaId}`
    : `/tv/${mediaId}`;

  const handleClick = async () => {
    const detailPath = `/${media.media_type}/${media.id}`;
    await Promise.all([
      trackMediaPreference(media.media_type, 'select'),
      trackMediaView({
        mediaType: media.media_type as 'movie' | 'tv',
        mediaId: media.id.toString(),
        title: media.title || media.name || '',
      })
    ]);
    navigate(detailPath);
  };

  // Fallback logic to ensure quality is always present
  let quality = media.quality?.toUpperCase();
  if (!quality) {
    if (typeof media.hd === 'boolean') {
      quality = media.hd ? 'HD' : 'CAM';
    } else if (media.video_source && typeof media.video_source === 'string') {
      quality = media.video_source.toLowerCase().includes('cam') ? 'CAM' : 'HD';
    } else if (!media.backdrop_path) {
      quality = 'CAM';
    } else {
      quality = 'HD';
    }
  }

  // Reduce size by ~10%: scale down width from ~160/180px to ~144/162px
  // You can adjust width here to achieve 10% smaller cards

  return (
    <Link
      to={detailPath}
      className={cn(
        "relative block group/card transform transition-all duration-300 hover:-translate-y-2",
        className
      )}
      onClick={handleClick}
      style={{ width: featured ? 198 : 144 }} // featured wider, else smaller width for grid
    >
      <motion.div>
        <div className="relative rounded-md overflow-hidden shadow-md aspect-[2/3]" style={{ width: '100%', height: 'auto' }}>
          <img
            src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg'}
            alt={media.title || media.name || 'Media Poster'}
            className="object-cover w-full h-full transition-transform duration-500 group-hover/card:scale-110"
            loading="lazy"
            onError={handleImageError}
          />

          {quality && (
            <span
              className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${
                quality === 'HD'
                  ? 'bg-green-600 text-white'
                  : quality === 'CAM'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-600 text-white'
              }`}
            >
              {quality}
            </span>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

          {/* Removed description as requested */}
        </div>

        <div className="mt-2 px-1 transition-all duration-300 group-hover/card:translate-y-0">
          <h3 className="text-white font-medium line-clamp-1 text-balance">{media.title || media.name}</h3>

          <div className="flex flex-col gap-0.5 mt-1 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span className="line-clamp-1">
                {media.media_type === 'movie'
                  ? media.release_date?.substring(0, 4)
                  : media.first_air_date?.substring(0, 4)}
              </span>

              {media.vote_average > 0 && (
                <div className="flex items-center text-amber-400">
                  <Star className="h-4 w-4 mr-1 fill-amber-400 group-hover/card:animate-pulse" />
                  {media.vote_average.toFixed(1)}
                </div>
              )}
            </div>

            {/* Runtime display */}
            {media.runtime && (
              <div>
                <span>{media.runtime} min</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default MediaCard;
