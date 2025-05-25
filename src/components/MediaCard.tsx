import React, { useState, useEffect, useCallback } from 'react'; import { useNavigate } from 'react-router-dom'; import { motion, AnimatePresence } from 'framer-motion'; import { ArrowRight, Star } from 'lucide-react'; import { getImageUrl } from '@/utils/services/tmdb'; import { posterSizes } from '@/utils/api'; import { cn } from '@/lib/utils'; import { trackMediaPreference, trackMediaView } from '@/lib/analytics'; import { Media } from '@/utils/types';

const genreMap: Record<number, string> = { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western', };

interface MediaCardProps { media: Media; }

const slugifyTitle = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const MediaCard = ({ media }: MediaCardProps) => { const [imageError, setImageError] = useState(false); const [showPopup, setShowPopup] = useState(false); const [popupPos, setPopupPos] = useState({ x: 0, y: 0 }); const [quality, setQuality] = useState<string | null>(null); const navigate = useNavigate();

const mediaId = media.media_id || media.id; const slug = slugifyTitle(media.title || media.name || ''); const detailPath = media.media_type === 'movie' ? /movie/${mediaId}-${slug} : /tv/${mediaId}-${slug};

const genreNames = (media.genre_ids || []) .map(id => genreMap[id]) .filter(Boolean) .slice(0, 2);

const releaseDate = new Date(media.release_date || media.first_air_date || ''); const formattedYear = !isNaN(releaseDate.getTime()) ? releaseDate.getFullYear() : '—';

const handleClick = async () => { await Promise.all([ trackMediaPreference(media.media_type, 'select'), trackMediaView({ mediaType: media.media_type as 'movie' | 'tv', mediaId: media.id.toString(), title: media.title || media.name || '', }), ]); navigate(detailPath); };

const handleMouseEnter = useCallback((e: React.MouseEvent) => { const { clientX, clientY } = e; setPopupPos({ x: clientX, y: clientY }); setShowPopup(true); }, []); const handleMouseLeave = () => setShowPopup(false);

useEffect(() => { // simplified quality badge logic setQuality(media.hd ? 'HD' : 'CAM'); }, [media.hd]);

return ( <article
className="relative w-[300px] flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
onClick={handleClick}
onMouseEnter={handleMouseEnter}
onMouseMove={handleMouseEnter}
onMouseLeave={handleMouseLeave}
> <div className="relative aspect-video w-full"> <img src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, posterSizes.large)} alt={media.title || media.name} onError={() => setImageError(true)} className="w-full h-full object-cover" /> {/* Gradient overlay bottom /} <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /> {/ Rating badge /} {media.vote_average > 0 && ( <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-md"> <Star className="w-4 h-4 text-amber-400" /> <span className="text-xs text-white">{media.vote_average.toFixed(1)}</span> </div> )} {/ Quality badge */} {quality && ( <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-md"> {quality} </div> )} </div>

<div className="absolute bottom-4 left-4 text-white">
    <h3 className="text-lg font-bold line-clamp-1">{media.title || media.name}</h3>
    <div className="flex items-center gap-2 text-sm mt-1">
      <span>{formattedYear}</span>
      <span>•</span>
      <span>{genreNames.join(', ') || '—'}</span>
    </div>
  </div>

  {/* Popup details on hover */}
  <AnimatePresence>
    {showPopup && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 w-80 bg-black/90 p-4 rounded-xl text-white shadow-lg"
        style={{ top: popupPos.y + 10, left: popupPos.x - 160 }}
      >
        <h4 className="text-xl font-bold mb-2 line-clamp-1">{media.title || media.name}</h4>
        <p className="text-sm mb-1 text-gray-300">Year: {formattedYear}</p>
        <p className="text-sm mb-1 text-gray-300">Genres: {genreNames.join(', ') || '—'}</p>
        <p className="text-sm mb-2">{media.overview || 'No synopsis available.'}</p>
        <button
          className="flex items-center gap-2 text-white font-semibold mt-2"
          onClick={e => { e.stopPropagation(); navigate(detailPath); }}
        >
          Details <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
</article>

); };

export default MediaCard;

