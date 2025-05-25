import React, { useState, useEffect, useCallback } from 'react'; import { useNavigate } from 'react-router-dom'; import { motion, AnimatePresence } from 'framer-motion'; import { ArrowRight, Star } from 'lucide-react'; import { getImageUrl } from '@/utils/services/tmdb'; import { posterSizes } from '@/utils/api'; import { cn } from '@/lib/utils'; import { trackMediaPreference, trackMediaView } from '@/lib/analytics'; import { Media } from '@/utils/types';

const genreMap: Record<number, string> = { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western', };

interface MediaCardProps { media: Media; className?: string; minimal?: boolean; smaller?: boolean; }

const slugifyTitle = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const MediaCard = ({ media, className }: MediaCardProps) => { const [imageError, setImageError] = useState(false); const navigate = useNavigate(); const mediaId = media.media_id || media.id; const slug = slugifyTitle(media.title || media.name || ''); const detailPath = media.media_type === 'movie' ? /movie/${mediaId}-${slug} : /tv/${mediaId}-${slug};

const genreNames = (media.genre_ids || []) .map(id => genreMap[id]) .filter(Boolean) .slice(0, 2);

const fullReleaseDate = media.media_type === 'movie' ? media.release_date : media.first_air_date;

return ( <article className={cn( 'relative min-w-[200px] max-w-[200px] rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 bg-[#111]', className )} onClick={() => navigate(detailPath)} > <div className="relative w-full aspect-[2/3]"> <img src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, posterSizes.medium)} alt={media.title || media.name || 'Media Poster'} onError={() => setImageError(true)} className="w-full h-full object-cover" />

{media.vote_average > 0 && (
      <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-xs font-semibold px-2 py-1 rounded shadow">
        <Star className="w-3 h-3 inline mr-1 fill-yellow-400" />
        {media.vote_average.toFixed(1)}
      </div>
    )}
  </div>

  <div className="p-2 text-white text-sm">
    <h3 className="font-medium truncate text-center text-sm leading-snug">
      {media.title || media.name}
    </h3>
    <div className="text-xs text-white/60 text-center mt-1">
      {genreNames.length > 0 ? genreNames.join(', ') : '—'}
    </div>
    <p className="text-center text-[11px] text-white/50 mt-1">
      {fullReleaseDate?.split('-')[0] || 'Unknown'}
    </p>
  </div>
</article>

); };

export default MediaCard;

