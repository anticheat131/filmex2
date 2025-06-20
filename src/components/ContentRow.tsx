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

  useEffect(() => {
    setEnrichedMedia(media);
  }, [media, title]);

  // Arrows: show/hide based on scroll position
  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
  };

  // Calculate current index based on scroll position
  const [currentIndex, setCurrentIndex] = useState(1);
  const totalCount = enrichedMedia.length;
  const [cardsPerView, setCardsPerView] = useState(1);
  const [scrollPage, setScrollPage] = useState(0);

  useEffect(() => {
    // Update cardsPerView on resize
    const updateCardsPerView = () => {
      if (!rowRef.current) return;
      const { clientWidth } = rowRef.current;
      // Estimate card width (matches .basis-1/3, .basis-1/4, etc.)
      let cardWidth = 0;
      if (window.innerWidth >= 1280) cardWidth = rowRef.current.offsetWidth / 5;
      else if (window.innerWidth >= 1024) cardWidth = rowRef.current.offsetWidth / 4;
      else if (window.innerWidth >= 768) cardWidth = rowRef.current.offsetWidth / 3;
      else cardWidth = rowRef.current.offsetWidth / 2;
      setCardsPerView(Math.max(1, Math.round(clientWidth / cardWidth)));
    };
    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Scroll logic: update scrollPage and currentIndex on scroll
  useEffect(() => {
    const updateIndex = () => {
      if (!rowRef.current) return;
      const { scrollLeft, clientWidth } = rowRef.current;
      // Calculate the index of the last visible card
      let cardWidth = 0;
      if (window.innerWidth >= 1280) cardWidth = rowRef.current.offsetWidth / 5;
      else if (window.innerWidth >= 1024) cardWidth = rowRef.current.offsetWidth / 4;
      else if (window.innerWidth >= 768) cardWidth = rowRef.current.offsetWidth / 3;
      else cardWidth = rowRef.current.offsetWidth / 2;
      const page = Math.round(scrollLeft / clientWidth);
      setScrollPage(page);
      setCurrentIndex(page * cardsPerView + 1);
    };
    const node = rowRef.current;
    node?.addEventListener('scroll', updateIndex);
    return () => {
      node?.removeEventListener('scroll', updateIndex);
    };
  }, [rowRef, enrichedMedia.length, cardsPerView, totalCount]);

  // Arrow click: scroll by one full row (show next N cards based on visible count)
  const scrollLeft = () => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth } = rowRef.current;
    let newScrollLeft = scrollLeft - clientWidth;
    if (newScrollLeft < 0) newScrollLeft = 0;
    console.log('scrollLeft', { scrollLeft, clientWidth, newScrollLeft });
    rowRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth, children } = rowRef.current;
    console.log('scrollRight', { scrollLeft, clientWidth, scrollWidth, childrenLength: children.length });
    let newScrollLeft = scrollLeft + clientWidth;
    if (newScrollLeft > scrollWidth - clientWidth) newScrollLeft = scrollWidth - clientWidth;
    rowRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    setTimeout(() => {
      console.log('after scroll', { scrollLeft: rowRef.current?.scrollLeft, clientWidth: rowRef.current?.clientWidth, scrollWidth: rowRef.current?.scrollWidth });
    }, 400);
  };

  if (!media || media.length === 0) return null;

  return (
    <div className="relative px-2 md:px-8 xl:px-16" role="region" aria-roledescription="carousel">
      <div className="mb-4 flex items-center justify-between gap-4 md:justify-start">
        <h2 className="font-medium md:text-lg">{title}</h2>
        <a
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
          href={title === 'Trending Now Movies' ? '/trending/movie' : title === 'Trending Now TV Shows' ? '/trending/tv' : `/trending/${title.toLowerCase().replace(/ /g, '-')}`}
        >
          Explore more
        </a>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <p className="mr-4 text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{Math.min(currentIndex + cardsPerView - 1, totalCount)}</span>
            <span> / </span>
            <span>{totalCount}</span>
          </p>
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
            onClick={scrollLeft}
            aria-label="Previous"
            disabled={!showLeftArrow}
          >
            <ChevronLeft className="size-3" />
            <span className="sr-only">Previous</span>
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
            onClick={scrollRight}
            aria-label="Next"
            disabled={!showRightArrow}
          >
            <ChevronRight className="size-3" />
            <span className="sr-only">Next</span>
          </button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div
          ref={rowRef}
          className={'flex scrollbar-hide overflow-x-auto min-w-0 md:min-w-[1200px] gap-x-0'} // remove gap completely for tightest spacing
          style={{ transform: 'translate3d(0px, 0px, 0px)', flexWrap: 'nowrap' }}
          onScroll={handleScroll}
        >
          {enrichedMedia.map((item, index) => (
            <div
              role="group"
              aria-roledescription="slide"
              key={`${item.media_type}-${item.id}`}
              className={'min-w-0 shrink-0 grow-0 pl-0 basis-[48vw] sm:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5'}
            >
              <MediaCard 
                media={item}
                className={'w-[175px] h-[261px] md:h-[367px] sm:w-full'}
                trendingNow={title === 'Trending Today Movies' || title === 'Trending Today TV Shows'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentRow;
