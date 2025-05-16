import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { getImageUrl } from '@/utils/services/tmdb';
import { posterSizes } from '@/utils/api';
import { Play, ArrowRight } from 'lucide-react';
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
  const [imageError, setImageError] = useState(false);

  const mediaId = media.media_id || media.id;
  const detailPath = media.media_type === 'movie' ? `/movie/${mediaId}` : `/tv/${mediaId}`;
  const watchPath = media.media_type === 'tv' ? `/watch/tv/${mediaId}/1/1` : `/watch/movie/${mediaId}`;

  const title = media.title || media.name || 'Untitled';
  const posterUrl = getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg';
  const releaseYear = (media.release_date || media.first_air_date || '').slice(0, 4);
  const genres = (media.genre_ids || []).map(id => genreMap[id]).filter(Boolean).slice(0, 2).join(', ');
  const runtime = media.runtime ? `${media.runtime} min` : '';
  const score = media.vote_average?.toFixed(1);

  return (
    <div
      className={cn(
        'relative w-[230px] rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shadow hover:shadow-accent/30 transition-all duration-300',
        className
      )}
    >
      {/* Top Section: Poster + IMDb Score */}
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img
          src={imageError ? '/placeholder.svg' : posterUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        {score && (
          <div className="absolute top-2 right-2 bg-black/80 border border-white/20 text-white px-2 py-1 text-xs font-semibold rounded-sm z-10">
            IMDb {score}
          </div>
        )}
      </div>

      {/* Bottom Section: Actions + Metadata */}
      <div className="flex flex-col px-3 py-3 space-y-2">
        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(detailPath)}
            className="flex items-center gap-1 border border-white text-white px-3 py-1 text-sm rounded hover:bg-white hover:text-black transition"
          >
            Details <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(watchPath)}
            className="flex items-center gap-1 bg-white text-black px-3 py-1 text-sm rounded hover:bg-zinc-200 transition"
          >
            <Play className="w-4 h-4" /> Watch
          </button>
        </div>

        {/* Metadata */}
        <div className="text-white text-sm">
          <h3 className="font-semibold leading-tight line-clamp-1">{title}</h3>
          <p className="text-white/70 text-xs">
            {releaseYear} {runtime && `· ${runtime}`} {genres && `· ${genres}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
