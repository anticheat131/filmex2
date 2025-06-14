import { useEffect, useRef, useState } from 'react';
import { Media } from '@/utils/types';
import MediaCard from './MediaCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContentRowProps {
  title: string;
  media: Media[];
  featured?: boolean;
}

const ContentRow = ({ title, media, featured = false }: ContentRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [enrichedMedia, setEnrichedMedia] = useState<Media[]>([]);
  const navigate = useNavigate();

  // Track scroll position for index display
  const [currentIndex, setCurrentIndex] = useState(1);
  const totalCount = enrichedMedia.length;

  useEffect(() => {
    setEnrichedMedia(media);
  }, [media]);

  // Update currentIndex on scroll
  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth } = rowRef.current;
    const cardWidth = 240 + 4; // card width + gap (px)
    const index = Math.floor(scrollLeft / cardWidth) + 1;
    setCurrentIndex(Math.min(index, totalCount));

    const { scrollWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
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

  if (!media || media.length === 0) return null;

  return (
    <div 
      className="mb-4 animate-fade-in"
      style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
    >
      <div className="flex items-center justify-between mb-1 pl-1 pr-2 gap-2 relative min-h-[48px]">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white text-left leading-tight pt-[2px] pb-[2px]">{title}</h2>
          {title === 'Trending Now' && (
            <button
              className="px-4 py-1 rounded-[7px] bg-black/60 hover:bg-black/80 text-white text-sm font-semibold transition-colors border border-white/20 min-w-[90px] h-9 flex items-center justify-center shadow-md"
              onClick={() => navigate('/trending')}
              style={{ marginTop: '1px' }}
            >
              Explore More
            </button>
          )}
        </div>
        {/* Arrows and index: left side of arrows shows 1 / 16, then left/right arrows as separate buttons */}
        {(showLeftArrow || showRightArrow) && (
          <div className="flex items-center gap-2 absolute right-0 top-1/2 -translate-y-1/2">
            <span className="text-white/70 text-xs font-semibold min-w-[48px] text-right select-none">{currentIndex} / {totalCount}</span>
            <button
              className={`w-9 h-9 flex items-center justify-center rounded-[7px] bg-black/70 border border-white/15 text-white hover:bg-black/90 transition-all ${!showLeftArrow ? 'opacity-40 pointer-events-none' : ''}`}
              onClick={scrollLeft}
              aria-label="Scroll left"
              tabIndex={showLeftArrow ? 0 : -1}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              className={`w-9 h-9 flex items-center justify-center rounded-[7px] bg-black/70 border border-white/15 text-white hover:bg-black/90 transition-all ${!showRightArrow ? 'opacity-40 pointer-events-none' : ''}`}
              onClick={scrollRight}
              aria-label="Scroll right"
              tabIndex={showRightArrow ? 0 : -1}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div 
          ref={rowRef}
          className="flex overflow-x-auto hide-scrollbar gap-1 pb-3 px-1"
          onScroll={handleScroll}
        >
          {enrichedMedia.map((item, index) => (
            <div 
              key={`${item.media_type}-${item.id}`} 
              className="flex-none w-[240px] md:w-[270px]"
              style={{ 
                opacity: 0,
                animation: 'fade-in 0.5s ease-out forwards',
                animationDelay: `${index * 0.05}s` 
              }}
            >
              <MediaCard media={item} large />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentRow;
