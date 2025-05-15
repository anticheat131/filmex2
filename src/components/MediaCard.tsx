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

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await trackMediaPreference(media.media_type as 'movie' | 'tv', 'favorite');
  };

  // Get quality from media object; fallback to empty string
  const quality = media.quality?.toUpperCase() || '';

  if (minimal) {
    return (
      <Link 
        to={detailPath} 
        className={cn(
          "block h-full",
          className
        )}
      >
        <div className="relative h-full rounded-md overflow-hidden shadow-md">
          <img
            src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg'}
            alt={media.title || media.name || 'Media Poster'}
            className="object-cover w-full h-full"
            loading="lazy"
            onError={handleImageError}
          />

          {/* Quality Badge */}
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
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={detailPath} 
      className={cn(
        "relative block group/card transform transition-all duration-300 hover:-translate-y-2",
        className
      )}
      onClick={handleClick}
    >
      <motion.div>
        <div className="relative rounded-md overflow-hidden shadow-md aspect-[2/3]">
          <img
            src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg'}
            alt={media.title || media.name || 'Media Poster'}
            className="object-cover w-full h-full transition-transform duration-500 group-hover/card:scale-110"
            loading="lazy"
            onError={handleImageError}
          />

          {/* Quality Badge */}
          {quality && (
            <span
              className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded
