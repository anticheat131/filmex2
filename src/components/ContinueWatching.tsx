import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { useWatchHistory } from '@/hooks/watch-history';
import { WatchHistoryItem } from '@/contexts/types/watch-history';
import { Play, Clock, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

// Firebase imports for Firestore delete
import { doc, deleteDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // <-- Adjust this import path as per your project

interface ContinueWatchingProps {
  maxItems?: number;
}

const ContinueWatching = ({ maxItems = 20 }: ContinueWatchingProps) => {
  const { user } = useAuth();
  const [continuableItems, setContinuableItems] = useState<WatchHistoryItem[]>([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load Continue Watching items from Firestore
  const loadContinueWatching = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'continue_watching'),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => doc.data() as WatchHistoryItem);
      setContinuableItems(items.slice(0, maxItems));
    } catch (error) {
      console.error('Failed to load Continue Watching:', error);
    }
  };

  useEffect(() => {
    loadContinueWatching();
  }, [user, maxItems]);

  // Handle scroll position to show/hide arrows
  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };

  const scrollLeft = () => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const formatLastWatched = (dateString: string) => {
    if (!dateString) return 'Recently';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime()) || date > new Date()) {
        return 'Recently';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const formatTimeRemaining = (position: number, duration: number) => {
    if (!duration) return '';
    const remaining = Math.max(0, duration - position);
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
  };

  if (!user || continuableItems.length === 0) {
    return null;
  }

  const handleContinueWatching = (item: WatchHistoryItem) => {
    if (item.media_type === 'movie') {
      navigate(`/watch/${item.media_type}/${item.media_id}`);
    } else if (item.media_type === 'tv') {
      navigate(`/watch/${item.media_type}/${item.media_id}/${item.season}/${item.episode}`);
    }
  };

  const handleNavigateToDetails = (event: React.MouseEvent, item: WatchHistoryItem) => {
    event.stopPropagation();
    navigate(`/${item.media_type === 'movie' ? 'movie' : 'tv'}/${item.media_id}`);
  };

  // Remove from Firestore on click of X
  const removeFromContinueWatching = async (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'continue_watching', mediaId));
      // Refresh the list after deletion
      loadContinueWatching();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  return (
    <div className="px-4 md:px-8 mt-8 mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-accent" />
        Continue Watching
      </h2>

      <div 
        className="relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Left scroll button */}
        {showLeftArrow && (
          <button
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white transition-all ${
              isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            } hidden md:flex`}
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <motion.div 
          ref={rowRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 pb-4"
          onScroll={handleScroll}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {continuableItems.map((item) => (
            <motion.div
              key={`${item.id}-${item.media_id}-${item.season || 0}-${item.episode || 0}`}
              className="relative flex-none w-[280px] md:w-[300px] aspect-video bg-card rounded-lg overflow-hidden group cursor-pointer hover-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleContinueWatching(item)}
              style={{
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
              }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`}
                alt={item.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-110 group-hover:brightness-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

              {/* DELETE BUTTON */}
              <button
                onClick={(e) => removeFromContinueWatching(e, item.media_id)}
                aria-label="Remove from Continue Watching"
                className="absolute top-2 right-2 z-20 p-1 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-white font-medium line-clamp-1 text-base md:text-lg">{item.title}</h3>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full bg-black/30 hover:bg-accent/80 transition-colors -mt-1"
                          onClick={(e) => handleNavigateToDetails(e, item)}
                        >
                          <Info className="h-3.5 w-3.5 text-white" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>View details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center justify-between text-xs text-white/70 mb-2">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatLastWatched(item.created_at)}
                  </span>
                  
                  {item.media_type === 'tv' && (
                    <span>S{item.season} E{item.episode}</span>
                  )}
                </div>
                
                <div className="mb-3 relative">
                  <Progress 
                    value={(item.watch_position / item.duration) * 100} 
                    className="h-1" 
                  />
                  <div className="text-xs text-white/70 mt-1 text-right">
                    {formatTimeRemaining(item.watch_position, item.duration)}
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-accent hover:bg-accent/80 text-white flex items-center justify-center gap-1"
                  size="sm"
                >
                  <Play className="h-3 w-3" />
                  Continue
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Right scroll button */}
        {showRightArrow && (
          <button
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white transition-all ${
              isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            } hidden md:flex`}
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContinueWatching;
