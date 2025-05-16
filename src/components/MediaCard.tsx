import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { getImageUrl } from '@/utils/services/tmdb';
import { posterSizes } from '@/utils/api';
import { Star, Play, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

interface MediaCardProps {
  media: Media;
  className?: string;
}

const MediaCard = ({ media, className }: MediaCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const title = media.title || media.name || 'Untitled';
  const posterUrl = getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg';
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
  const releaseYear = (media.release_date || media.first_air_date || '').slice(0, 4);

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mediaType = media.media_type === 'tv' ? 'tv' : 'movie';
    navigate(`/${mediaType}/${media.id}`);
  };

  const handleWatchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mediaType = media.media_type === 'tv' ? 'tv' : 'movie';
    navigate(`/watch/${mediaType}/${media.id}${mediaType === 'tv' ? '/1/1' : ''}`);
  };

  return (
    <div
      className={cn(
        'relative w-[180px] md:w-[210px] lg:w-[230px] aspect-[2/3.5] rounded-sm border border-transparent bg-zinc-900 shadow-md overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.05] hover:border-white/20',
        className
      )}
      onClick={handleDetailsClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Image */}
      <img
        src={posterUrl}
        alt={title}
        className="w-full h-full object-cover rounded-sm"
        loading="lazy"
      />

      {/* Overlay fade on hover */}
      <div
        className={cn(
          'absolute inset-0 bg-black bg-opacity-60 transition-opacity duration-300',
          isHovered ? 'opacity-60' : 'opacity-0'
        )}
      />

      {/* Bottom-left content */}
      <div className="absolute bottom-2 left-2 z-30 flex flex-col gap-2 max-w-[calc(100%-0.5rem)]">
        {/* Buttons stacked vertically on hover */}
        {isHovered && (
          <div className="flex flex-col gap-2 mb-1">
            <button
              onClick={handleDetailsClick}
              className="flex items-center gap-1 px-3 py-1 border border-white text-white text-xs font-semibold rounded-none hover:bg-white hover:text-black transition"
            >
              Details <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={handleWatchClick}
              className="flex items-center gap-1 px-3 py-1 bg-white text-black text-xs font-semibold rounded-none hover:bg-gray-200 transition"
            >
              <Play className="w-4 h-4" /> Watch
            </button>
          </div>
        )}

        {/* Info always visible at bottom-left */}
        <div className="bg-black bg-opacity-70 rounded px-2 py-1 max-w-full">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-semibold text-xs leading-none">{rating}</span>
          </div>
          <p className="text-white text-xs font-semibold truncate max-w-[150px] leading-tight">{title}</p>
          <p className="text-white/60 text-xs leading-tight">{releaseYear}</p>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
