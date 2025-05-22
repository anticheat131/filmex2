import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useWatchHistory } from '@/hooks/use-watch-history';
import { WatchHistoryItem } from '@/contexts/types/watch-history';
import { Play, Clock, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { db } from '@/lib/firebase'; // <- Make sure this is correct
import {
  collection,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

interface ContinueWatchingProps {
  maxItems?: number;
}

const ContinueWatching = ({ maxItems = 20 }: ContinueWatchingProps) => {
  const { user } = useAuth();
  const { watchHistory } = useWatchHistory();
  const [continuableItems, setContinuableItems] = useState<WatchHistoryItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load dismissed IDs from Firestore
  useEffect(() => {
    const fetchDismissed = async () => {
      if (!user?.uid) return;
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'dismissedItems'));
      const ids = snapshot.docs.map(doc => doc.id);
      setDismissedIds(ids);
    };
    fetchDismissed();
  }, [user]);

  const processedHistory = useMemo(() => {
    if (watchHistory.length === 0) return [];

    const validItems = watchHistory.filter(item => {
      if (!item.created_at) return false;
      try {
        const date = new Date(item.created_at);
        return !isNaN(date.getTime());
      } catch {
        return false;
      }
    });

    const uniqueMediaMap = new Map<string, WatchHistoryItem>();

    validItems.forEach(item => {
      const key = `${item.media_type}-${item.media_id}${item.media_type === 'tv' ? `-s${item.season}-e${item.episode}` : ''}`;
      if (!uniqueMediaMap.has(key) || new Date(item.created_at) > new Date(uniqueMediaMap.get(key)!.created_at)) {
        uniqueMediaMap.set(key, item);
      }
    });

    return Array.from(uniqueMediaMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [watchHistory]);

  useEffect(() => {
    const filtered = processedHistory
      .filter(item => !dismissedIds.includes(item.id))
      .slice(0, maxItems);
    setContinuableItems(filtered);
  }, [processedHistory, maxItems, dismissedIds]);

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollLeft = () => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: -rowRef.current.clientWidth * 0.75, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: rowRef.current.clientWidth * 0.75, behavior: 'smooth' });
  };

  const handleRemoveItem = async (id: string) => {
    if (!user?.uid) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'dismissedItems', id), {
        dismissed_at: new Date(),
      });
      setDismissedIds(prev => [...prev, id]);
    } catch (error) {
      console.error('Error dismissing item in Firestore:', error);
    }
  };

  const handleContinueWatching = (item: WatchHistoryItem) => {
    if (item.media_type === 'movie') {
      navigate(`/watch/${item.media_type}/${item.media_id}`);
    } else {
      navigate(`/watch/${item.media_type}/${item.media_id}/${item.season}/${item.episode}`);
    }
  };

  const handleNavigateToDetails = (e: React.MouseEvent, item: WatchHistoryItem) => {
    e.stopPropagation();
    navigate(`/${item.media_type}/${item.media_id}`);
  };

  if (!user || continuableItems.length === 0) return null;

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
        {showLeftArrow && (
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white transition-all hidden md:flex"
            onClick={scrollLeft}
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
          {continuableItems.map(item => (
            <motion.div
              key={item.id}
              className="relative flex-none w-[280px] md:w-[300px] aspect-video bg-card rounded-lg overflow-hidden group cursor-pointer hover-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleContinueWatching(item)}
            >
              <button
                className="absolute top-2 right-2 z-20 bg-black/70 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600"
                onClick={e => {
                  e.stopPropagation();
                  handleRemoveItem(item.id);
                }}
              >
                ×
              </button>

              <img
                src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`}
                alt={item.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-110 group-hover:brightness-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

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
                          onClick={e => handleNavigateToDetails(e, item)}
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
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                  {item.media_type === 'tv' && <span>S{item.season} E{item.episode}</span>}
                </div>

                <div className="mb-3 relative">
                  <Progress value={(item.watch_position / item.duration) * 100} className="h-1" />
                  <div className="text-xs text-white/70 mt-1 text-right">
                    {Math.floor((item.duration - item.watch_position) / 60)} min left
                  </div>
                </div>

                <Button className="w-full bg-accent hover:bg-accent/80 text-white flex items-center justify-center gap-1" size="sm">
                  <Play className="h-3 w-3" />
                  Continue
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {showRightArrow && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white transition-all hidden md:flex"
            onClick={scrollRight}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContinueWatching;
