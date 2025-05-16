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
  const genres = (media.genre_ids || []).map(id => genreMap[id]).filter(Boolean).slice(0, 2).join(', ');
  const runtime = media.runtime ? `${media.runtime} min` : '';

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
        'relative w-[220px] h-[330px] rounded-[6px] border border-transparent bg-zinc-900 shadow-md overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.05] hover:border-white/20',
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
        className="w-full h-[260px] object-cover rounded-t-[6px]"
        loading="lazy"
      />

      {/* Bottom Info Section */}
      <div className="px-3 py-2 flex flex-col justify-between h-[70px] bg-black/70">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-semibold text-sm">{rating}</span>
          </div>
          <span className="text-white text-xs">{releaseYear}</span>
        </div>
        <h3 className="text-white text-base font-semibold line-clamp-1">{title}</h3>
        <p className="text-white/70 text-xs truncate">{genres} {runtime && `• ${runtime}`}</p>
      </div>

      {/* Buttons overlay on hover */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-40 flex justify-center gap-3 py-2 bg-black bg-opacity-90 border-t border-white/10 transition-transform duration-300',
          isHovered ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
        )}
      >
        <button
          onClick={handleDetailsClick}
          className="flex items-center gap-1 px-4 py-1 border border-white rounded-none text-white text-sm font-semibold hover:bg-white hover:text-black transition"
        >
          Details
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleWatchClick}
          className="flex items-center gap-1 px-4 py-1 bg-white rounded-none text-black text-sm font-semibold hover:bg-gray-200 transition"
        >
          <Play className="w-5 h-5" />
          Watch
        </button>
      </div>
    </div>
  );
};

export default MediaCard;
