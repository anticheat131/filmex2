import React, { useState } from 'react'; import { Link, useNavigate } from 'react-router-dom'; import { cn } from '@/lib/utils'; import { Media } from '@/utils/types'; import { posterSizes } from '@/utils/api'; import { getImageUrl } from '@/utils/services/tmdb'; import { Star, Info } from 'lucide-react'; import { motion } from 'framer-motion'; import { trackMediaPreference, trackMediaView } from '@/lib/analytics';

interface MediaCardProps { media: Media; className?: string; minimal?: boolean; smaller?: boolean; }

const genreMap: Record<number, string> = { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western' };

const MediaCard = ({ media, className, minimal = false, smaller = false }: MediaCardProps) => { const [imageError, setImageError] = useState(false); const [showPopup, setShowPopup] = useState(false); const navigate = useNavigate();

const handleImageError = () => setImageError(true); const mediaId = media.media_id || media.id; const detailPath = media.media_type === 'movie' ? /movie/${mediaId} : /tv/${mediaId};

let quality = media.quality?.toUpperCase(); if (!quality) { if (typeof media.hd === 'boolean') quality = media.hd ? 'HD' : 'CAM'; else if (media.video_source?.toLowerCase().includes('cam')) quality = 'CAM'; else quality = 'HD'; }

const handleClick = async () => { await Promise.all([ trackMediaPreference(media.media_type, 'select'), trackMediaView({ mediaType: media.media_type as 'movie' | 'tv', mediaId: media.id.toString(), title: media.title || media.name || '', }), ]); navigate(detailPath); };

const genreNames = media.genre_ids?.map(id => genreMap[id]).filter(Boolean).slice(0, 3); const runtime = media.media_type === 'movie' && media.runtime ? ${media.runtime} min : ''; const releaseDate = media.release_date || media.first_air_date || '';

return ( <div className="relative" onMouseEnter={() => setShowPopup(true)} onMouseLeave={() => setShowPopup(false)} > <Link to={detailPath} className={cn( 'relative group/card cursor-pointer overflow-visible rounded-lg border border-white/10 bg-card shadow-lg transition-all duration-300 hover:shadow-accent/30 hover:border-accent', smaller ? 'scale-90 origin-top-left' : '', className )} onClick={handleClick} > <div className="relative rounded-t-lg overflow-hidden aspect-[2/3]"> <img src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg'} alt={media.title || media.name || 'Media Poster'} className="object-cover w-full h-full transition-transform duration-500 group-hover/card:scale-110" loading="lazy" onError={handleImageError} /> {quality && ( <span className={absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded backdrop-blur-sm ${ quality === 'HD' ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white' }} > {quality} </span> )} </div> </Link>

{showPopup && (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-50 w-72 p-3 bg-zinc-900 border border-white/10 text-white rounded-lg shadow-lg animate-fade-in">
      <h3 className="text-lg font-semibold mb-1">{media.title || media.name}</h3>
      {genreNames && <p className="text-xs text-white/70 mb-1">{genreNames.join(', ')}</p>}
      {media.vote_average > 0 && (
        <p className="text-sm text-amber-400 flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400" /> {media.vote_average.toFixed(1)}
        </p>
      )}
      {releaseDate && <p className="text-xs text-white/70">Release: {releaseDate}</p>}
      {runtime && <p className="text-xs text-white/70">Duration: {runtime}</p>}
      {media.overview && <p className="text-sm mt-2 text-white/80 line-clamp-4">{media.overview}</p>}
    </div>
  )}
</div>

); };

export default MediaCard;

