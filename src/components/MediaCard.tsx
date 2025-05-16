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
        'relative rounded-md border border-transparent bg-zinc-900 shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:border-white/20',
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
        className="w-full aspect-[2/3] object-cover"
        loading="lazy"
      />

      {/* Bottom-left overlay: rating, title, year */}
      <div className="absolute left-3 bottom-3 z-20 bg-black/70 rounded-md px-2 py-1 max-w-[calc(100%-2rem)]">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-white font-semibold text-sm">{rating}</span>
        </div>
        <p className="mt-0.5 text-white text-xs truncate max-w-[150px]">{title}</p>
        <p className="text-white/60 text-xs">{releaseYear}</p>
      </div>

      {/* Bottom buttons container */}
      {isHovered && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 bg-opacity-90 flex justify-center gap-3 py-2 z-30 border-t border-white/10">
          <button
            onClick={handleDetailsClick}
            className="flex items-center gap-1 px-4 py-1 border border-white/60 rounded-md text-white text-sm hover:bg-white/10 transition"
          >
            Details
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleWatchClick}
            className="flex items-center gap-1 px-4 py-1 border border-white/60 rounded-md text-white text-sm hover:bg-white/10 transition"
          >
            <Play className="w-4 h-4" />
            Watch
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaCard;
