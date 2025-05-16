import { useState, useEffect, useRef, useMemo, useCallback } from 'react'; import { useNavigate } from 'react-router-dom'; import { Media } from '@/utils/types'; import { backdropSizes } from '@/utils/api'; import { getImageUrl } from '@/utils/services/tmdb'; import { Button } from '@/components/ui/button'; import { Play, Info, Star, Calendar } from 'lucide-react'; import { Skeleton } from '@/components/ui/skeleton'; import { motion, AnimatePresence } from 'framer-motion'; import { useMediaPreferences } from '@/hooks/use-media-preferences'; import { trackMediaPreference } from '@/lib/analytics';

interface HeroProps { media: Media[]; className?: string; }

const genreMap: Record<number, string> = { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western', };

const Hero = ({ media, className = '' }: HeroProps) => { const [currentIndex, setCurrentIndex] = useState(0); const [isLoaded, setIsLoaded] = useState(false); const [paused, setPaused] = useState(false); const [progress, setProgress] = useState(0); const navigate = useNavigate(); const intervalRef = useRef<NodeJS.Timeout | null>(null); const progressRef = useRef<NodeJS.Timeout | null>(null); const { preference } = useMediaPreferences();

const filteredMedia = useMemo(() => { const withBackdrop = media.filter(item => item.backdrop_path); if (preference && preference !== 'balanced') { const preferred = withBackdrop.filter(item => item.media_type === preference); const others = withBackdrop.filter(item => item.media_type !== preference); return [...preferred, ...others]; } return withBackdrop; }, [media, preference]);

const featuredMedia = filteredMedia[currentIndex];

const goToNext = useCallback(() => { setCurrentIndex(prev => (prev + 1) % filteredMedia.length); setProgress(0); setIsLoaded(false); }, [filteredMedia.length]);

const handlePlay = () => { const mediaType = featuredMedia.media_type; const id = featuredMedia.id; if (mediaType === 'tv') { navigate(/watch/tv/${id}/1/1); } else { navigate(/watch/${mediaType}/${id}); } };

const handleMoreInfo = () => { navigate(/${featuredMedia.media_type}/${featuredMedia.id}); };

useEffect(() => { if (paused || filteredMedia.length <= 1) return; intervalRef.current = setInterval(goToNext, 6000); return () => clearInterval(intervalRef.current as NodeJS.Timeout); }, [goToNext, paused, filteredMedia.length]);

useEffect(() => { if (paused || filteredMedia.length <= 1) return; progressRef.current = setInterval(() => { setProgress(p => (p < 100 ? p + 1.67 : 0)); }, 100); return () => clearInterval(progressRef.current as NodeJS.Timeout); }, [paused, currentIndex, filteredMedia.length]);

const title = featuredMedia.title || featuredMedia.name || 'Untitled'; const releaseDate = featuredMedia.release_date || featuredMedia.first_air_date; const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : ''; const quality = featuredMedia.video_source?.toLowerCase().includes('cam') ? 'CAM' : 'HD'; const genres = featuredMedia.genre_ids?.slice(0, 3).map(id => genreMap[id]).filter(Boolean) || [];

return ( <section className={relative w-full h-[60vh] md:h-[75vh] overflow-hidden ${className}} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} > {!isLoaded && ( <div className="absolute inset-0 bg-background flex items-center justify-center z-10"> <Skeleton className="w-full h-full" /> </div> )}

<AnimatePresence mode="wait">
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.05 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0"
    >
      <img
        src={getImageUrl(featuredMedia.backdrop_path, backdropSizes.original)}
        alt={title}
        className="w-full h-full object-cover"
        onLoad={() => setIsLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
    </motion.div>
  </AnimatePresence>

  <div className="absolute inset-0 flex items-center justify-center px-6 py-6 md:px-12 md:py-10 z-20">
    <div className="text-center max-w-3xl space-y-4">
      <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">{title}</h1>
      <div className="flex justify-center flex-wrap gap-3 text-white text-sm font-medium">
        {releaseYear && (
          <span className="bg-white/10 px-2 py-1 rounded flex items-center">
            <Calendar className="h-4 w-4 mr-1" /> {releaseYear}
          </span>
        )}
        <span className="bg-white/10 px-2 py-1 rounded">{quality}</span>
        {featuredMedia.vote_average > 0 && (
          <span className="bg-white/10 px-2 py-1 rounded flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
            {featuredMedia.vote_average.toFixed(1)}
          </span>
        )}
        {genres.map((g, idx) => (
          <span key={idx} className="bg-white/10 px-2 py-1 rounded">{g}</span>
        ))}
      </div>
      <p className="text-white/90 text-sm md:text-base line-clamp-4">{featuredMedia.overview}</p>
      <div className="flex justify-center gap-4 mt-4">
        <Button onClick={handlePlay} className="bg-accent hover:bg-accent/90 text-white flex items-center gap-2">
          <Play className="h-5 w-5" /> Watch
        </Button>
        <Button
          onClick={handleMoreInfo}
          variant="outline"
          className="border-white/30 bg-black/50 text-white hover:bg-black/70"
        >
          <Info className="h-5 w-5 mr-1" /> Details
        </Button>
      </div>
    </div>
  </div>

  <div className="absolute bottom-4 right-6 z-30">
    <button
      onClick={() => setPaused(p => !p)}
      className="bg-black/40 hover:bg-black/60 text-white px-3 py-1 rounded text-sm opacity-70 hover:opacity-90"
    >
      {paused ? 'Play ▶' : 'Pause ⏸'}
    </button>
  </div>

  {filteredMedia.length > 1 && (
    <div className="absolute bottom-1.5 left-0 right-0 h-1 bg-white/20 z-20">
      <div
        className="h-full bg-accent transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  )}
</section>

); };

export default Hero;

