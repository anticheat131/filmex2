import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { getImageUrl } from '@/utils/services/tmdb';
import { posterSizes } from '@/utils/api';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

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

  const handleClick = () => {
    const mediaType = media.media_type === 'tv' ? 'tv' : 'movie';
    navigate(`/${mediaType}/${media.id}`);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-zinc-900 shadow-md hover:shadow-lg cursor-pointer group transition-transform duration-300 hover:scale-[1.03]',
        className
      )}
      onClick={handleClick}
    >
      {/* Poster */}
      <img
        src={posterUrl}
        alt={title}
        className="w-full h-auto object-cover aspect-[2/3] rounded-t-lg"
        loading="lazy"
      />

      {/* Rating badge */}
      {media.vote_average > 0 && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-black" />
          {rating}
        </div>
      )}

      {/* Info below poster */}
      <div className="p-3 space-y-1 text-white">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2">{title}</h3>
        <p className="text-xs text-white/70">
          {releaseYear}
          {genres && ` • ${genres}`}
          {runtimeText && ` • ${runtimeText}`}
        </p>
      </div>
    </div>
  );
};

export default MediaCard;
