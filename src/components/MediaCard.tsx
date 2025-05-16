import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Media } from '@/utils/types';
import { posterSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Star, ArrowRight } from 'lucide-react';
import { trackMediaPreference, trackMediaView } from '@/lib/analytics';

interface MediaCardProps {
  media: Media;
  className?: string;
  minimal?: boolean;
  smaller?: boolean;
}

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

const MediaCard = ({ media, className, minimal = false, smaller = false }: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleImageError = () => setImageError(true);
  const mediaId = media.media_id || media.id;
  const detailPath = media.media_type === 'movie' ? `/movie/${mediaId}` : `/tv/${mediaId}`;

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

  let quality = media.quality?.toUpperCase();
  if (!quality) {
    if (typeof media.hd === 'boolean') quality = media.hd ? 'HD' : 'CAM';
    else if (media.video_source?.toLowerCase().includes('cam')) quality = 'CAM';
    else quality = 'HD';
  }

  const genreNames = media.genre_ids?.map(id => genreMap[id]).filter(Boolean).slice(0, 3);
  const runtimeMinutes = media.media_type === 'movie'
    ? media.runtime
    : Array.isArray(media.episode_run_time) && media.episode_run_time.length > 0
      ? media.episode_run_time[0]
      : undefined;

  const durationText = runtimeMinutes ? `${runtimeMinutes} min` : '';
  const releaseYear = media.media_type === 'movie'
    ? media.release_date?.slice(0, 4)
    : media.first_air_date?.slice(0, 4);

  return (
    <div
      className={cn(
        'relative bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden transition duration-300 hover:border-white/30 shadow-md',
        className,
        smaller ? 'scale-90 origin-top-left' : ''
      )}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <img
          src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg'}
          alt={media.title || media.name || 'Media Poster'}
          onError={handleImageError}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        {/* Quality Label */}
        {quality && (
          <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-[2px] rounded-md text-white backdrop-blur-sm ${quality === 'HD' ? 'bg-green-600/90' : 'bg-red-600/90'}`}>
            {quality}
          </span>
        )}

        {/* IMDB Score */}
        {media.vote_average > 0 && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-amber-400 text-xs px-2 py-[2px] rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            {media.vote_average.toFixed(1)}
          </span>
        )}

        {/* Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 text-sm font-medium px-4 py-1.5 rounded-md bg-white text-black hover:bg-gray-200 transition"
        >
          Details <ArrowRight className="inline w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Info Section */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">
          {media.title || media.name}
        </h3>
        <div className="text-xs text-white/70 mb-1">
          {(releaseYear || durationText) && (
            <span>{releaseYear}{durationText ? ` · ${durationText}` : ''}</span>
          )}
        </div>
        {genreNames && genreNames.length > 0 && (
          <p className="text-xs text-white/50 line-clamp-1">{genreNames.join(', ')}</p>
        )}
      </div>
    </div>
  );
};

export default MediaCard;
