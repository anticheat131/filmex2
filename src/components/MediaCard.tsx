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
  const runtime = media.runtime || (media.episode_run_time?.[0] ?? null);
  const runtimeText = runtime ? `${runtime} min` : '';

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
        'm-2 relative w-[210px] md:w-[240px] aspect-[2/3.2] rounded-[6px] border border-transparent bg-zinc-900 shadow-md overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.05] hover:border-white/20',
        className
      )}
      onClick={handleDetailsClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster */}
      <img
        src={posterUrl}
        alt={title}
        className="w-full h-full object-cover rounded-[6px]"
        loading="lazy"
      />

      {/* Score badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span>{rating}</span>
        </div>
      </div>

      {/* Always-visible info block at bottom */}
      <div className="absolute bottom-0 left-0 w-full px-3 py-2 bg-gradient-to-t from-black via-black/60 to-transparent z-10">
        <h3 className="text-sm font-bold text-white truncate">{title}</h3>
        <p className="text-xs text-white/80">{releaseYear} • {genres}{runtimeText && ` • ${runtimeText}`}</p>
      </div>

      {/* Buttons on hover */}
      <div
        className={cn(
          'absolute top-2 left-2 z-20 flex gap-2 transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <button
          onClick={handleDetailsClick}
          className="flex items-center gap-1 px-3 py-1 border border-white text-white text-xs font-medium bg-black/70 hover:bg-white hover:text-black transition rounded-sm"
        >
          Details
          <ArrowRight className="w-3 h-3" />
        </button>
        <button
          onClick={handleWatchClick}
          className="flex items-center gap-1 px-3 py-1 bg-white text-black text-xs font-medium hover:bg-gray-200 transition rounded-sm"
        >
          <Play className="w-4 h-4" />
          Watch
        </button>
      </div>
    </div>
  );
};

export default MediaCard;
