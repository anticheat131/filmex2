import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getImageUrl } from '@/utils/services/tmdb';
import { posterSizes } from '@/utils/api';
import { cn } from '@/lib/utils';
import { trackMediaPreference, trackMediaView } from '@/lib/analytics';
import { Media } from '@/utils/types';

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

interface MediaCardProps {
  media: Media;
  className?: string;
}

const slugifyTitle = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const MediaCard = ({ media, className }: MediaCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [quality, setQuality] = useState<string | null>(null);

  const mediaId = media.media_id || media.id;
  const slug = slugifyTitle(media.title || media.name || '');
  const detailPath =
    media.media_type === 'movie' ? `/movie/${mediaId}-${slug}` : `/tv/${mediaId}-${slug}`;

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

  useEffect(() => {
    if (media.media_type !== 'movie') return;

    const fetchQuality = async () => {
      try {
        const release = new Date(media.release_date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));
        setQuality(diffDays >= 60 ? 'HD' : 'CAM');
      } catch {
        setQuality(null);
      }
    };

    fetchQuality();
  }, [media]);

  const genreNames = (media.genre_ids || [])
    .map(id => genreMap[id])
    .filter(Boolean)
    .slice(0, 2)
    .join(', ');

  return (
    <div
      onClick={handleClick}
      className={cn(
        'w-[220px] md:w-[240px] flex flex-col cursor-pointer transition-transform hover:scale-105',
        className
      )}
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900">
        <img
          src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, posterSizes.large)}
          alt={media.title || media.name || 'Poster'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-xl"
        />

        {quality && (
          <span className="absolute top-2 left-2 bg-black/80 text-white text-xs font-semibold px-2 py-0.5 rounded">
            {quality}
          </span>
        )}

        {media.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400" /> {media.vote_average.toFixed(1)}
          </div>
        )}
      </div>

      <div className="mt-2 text-center">
        <h3 className="text-sm font-semibold text-white line-clamp-1">
          {media.title || media.name}
        </h3>
        <p className="text-xs text-white/70 mt-0.5 line-clamp-1">{genreNames}</p>
      </div>
    </div>
  );
};

export default MediaCard;
