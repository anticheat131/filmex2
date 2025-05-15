import { useState, useRef } from 'react';
import { Media } from '@/utils/types';
import MediaCard from './MediaCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Robust fallback quality assigner
  const applyQuality = (items: Media[]) =>
    items.map(item => {
      let quality = 'HD';

      if (typeof item.hd === 'boolean') {
        quality = item.hd ? 'HD' : 'CAM';
      } else if (item.video_source && typeof item.video_source === 'string') {
        quality = item.video_source.toLowerCase().includes('cam') ? 'CAM' : 'HD';
      } else if (!item.backdrop_path) {
        quality = 'CAM';
      }

      return {
        ...item,
        quality,
      };
    });

  const mappedMedia = applyQuality(media);

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

  if (!media || media.length === 0) return null;

  return (
    <div 
      className="px-4 md:px-8 mb-8 opacity-0 animate-fade-in"
      style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
    >
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">{title}</h2>
      
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {showLeftArrow && (
          <button
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white transition-all ${
              isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div 
          ref={rowRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 pb-4"
          onScroll={handleScroll}
        >
          {mappedMedia.map((item, index) => (
            <div 
              key={`${item.media_type}-${item.id}`} 
              className={featured ? 'flex-none w-[220px]' : 'flex-none w-[160px] md:w-[180px]'}
              style={{ 
                opacity: 0,
                animation: 'fade-in 0.5s ease-out forwards',
                animationDelay: `${index * 0.05}s` 
              }}
            >
              <MediaCard media={item} featured={featured} />
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white transition-all ${
              isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}
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

export default ContentRow;
