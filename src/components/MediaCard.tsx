import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { getImageUrl } from '@/utils/services/tmdb';
import { posterSizes } from '@/utils/api';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  media: Media;
  className?: string;
}

const genreMap: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

const MediaCard = ({ media, className }: MediaCardProps) => {
  const navigate = useNavigate();
  const mediaId = media.id || media.media_id;
  const type = media.media_type || 'movie';
  const release = media.release_date || media.first_air_date || '';
  const releaseYear = release ? new Date(release).getFullYear() : '';
  const genreNames = media.genre_ids?.map(id => genreMap[id])?.slice(0, 2).filter(Boolean) || [];

  const handleClick = () => {
    navigate(`/${type}/${mediaId}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative w-[180px] md:w-[220px] cursor-pointer transition-transform duration-300 hover:scale-[1.03]',
        className
      )}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-md">
        <img
          src={getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg'}
          alt={media.title || media.name}
          className="w-full h-[270px] md:h-[330px] object-cover rounded-2xl"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 py-4">
          <h3 className="text-white text-base font-semibold truncate">
            {media.title || media.name}
          </h3>

          <div className="text-white/80 text-sm mt-1 flex items-center justify-between">
            <span>{releaseYear}</span>
            {media.vote_average > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Star className="h-4 w-4 fill-yellow-400" />
                {media.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          <div className="text-xs text-white/60 mt-1 line-clamp-1">
            {genreNames.join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
