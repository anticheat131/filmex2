import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { getImageUrl } from '@/utils/services/tmdb';
import { posterSizes } from '@/utils/api';
import { Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  media: Media;
  className?: string;
}

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

const MediaCard = ({ media, className }: MediaCardProps) => {
  const navigate = useNavigate();

  const title = media.title || media.name || 'Untitled';
  const posterUrl = getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg';
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
  const releaseYear = (media.release_date || media.first_air_date || '').slice(0, 4);
  const genres = (media.genre_ids || [])
    .map(id => genreMap[id])
    .filter(Boolean)
    .slice(0, 2)
    .join(', ');
  const runtime = media.runtime || (Array.isArray(media.episode_run_time) ? media.episode_run_time[0] : undefined);
  const runtimeText = runtime ? `${runtime} min` : '';

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mediaType = media.media_type === 'tv' ? 'tv' : 'movie';
    navigate(`/${mediaType}/${media.id}`);
  };

  return (
    <div
      className={cn(
        'relative w-[250px] aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer',
        className
      )}
      onClick={handleDetailsClick}
    >
      {/* Poster Image */}
      <img
        src={posterUrl}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Rating badge top-right */}
      {media.vote_average > 0 && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
          <Star className="w-3 h-3 fill-yellow-400 text-black" />
          {rating}
        </div>
      )}

      {/* Details button top-left */}
      <div className="absolute top-2 left-2 z-10">
        <button
          onClick={handleDetailsClick}
          className="flex items-center gap-1 px-2 py-0.5 text-xs border border-white/20 text-white hover:bg-white hover:text-black transition rounded"
        >
          Details <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Bottom overlay with text info */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 py-3 z-10">
        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">{title}</h3>
        <p className="text-xs text-white/70 mt-0.5">
          {releaseYear}
          {genres && ` • ${genres}`}
          {runtimeText && ` • ${runtimeText}`}
        </p>
      </div>
    </div>
  );
};

export default MediaCard;
