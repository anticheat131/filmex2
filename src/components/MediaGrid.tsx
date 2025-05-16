import { Media } from '@/utils/types';
import MediaCard from './MediaCard';
import { motion, Variants } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Trash2, SquareCheck, Square, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useRef } from 'react';

interface ExtendedMedia extends Omit<Media, 'id'> {
  id: string | number;
  media_id: number;
  docId?: string;
  created_at?: string;
  watch_position?: number;
  duration?: number;
}

interface MediaGridProps {
  media: ExtendedMedia[];
  title?: string;
  listView?: boolean;
  selectable?: boolean;
  onDelete?: (id: string) => void;
  onDeleteSelected?: (ids: string[]) => void;
}

const VISIBLE_CARDS = 5;

const MediaGrid = ({
  media,
  title,
  listView = false,
  selectable = false,
  onDelete,
  onDeleteSelected
}: MediaGridProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!media || media.length === 0) {
    return (
      <div className="py-8 text-center text-white">
        <p>No results found.</p>
      </div>
    );
  }

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedItems([]);
  };

  const handleSelect = (docId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(docId)) {
        return prev.filter(item => item !== docId);
      }
      return [...prev, docId];
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === media.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(media.map(item => item.docId!).filter(Boolean));
    }
  };

  const renderTimestamp = (media: ExtendedMedia) => {
    if (!media.created_at) return null;

    return (
      <div className="flex items-center text-xs text-white/70 mb-2">
        <Clock className="h-3 w-3 mr-1" />
        {formatDistanceToNow(new Date(media.created_at), { addSuffix: true })}
      </div>
    );
  };

  const renderSelectionButtons = () => {
    if (!selectable) return null;

    return (
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSelectMode}
          className="border-white/20 bg-black/50 text-white hover:bg-black/70"
        >
          {selectMode ? 'Cancel Selection' : 'Select Items'}
        </Button>

        {selectMode && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="border-white/20 bg-black/50 text-white hover:bg-black/70"
            >
              {selectedItems.length === media.length ? (
                <Square className="h-4 w-4 mr-2" />
              ) : (
                <SquareCheck className="h-4 w-4 mr-2" />
              )}
              {selectedItems.length === media.length ? 'Deselect All' : 'Select All'}
            </Button>

            {selectedItems.length > 0 && onDeleteSelected && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteSelected(selectedItems)}
                className="ml-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedItems.length})
              </Button>
            )}
          </>
        )}
      </div>
    );
  };

  // Navigation handlers
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + VISIBLE_CARDS < media.length;

  const goPrev = () => {
    if (!canGoPrev) return;
    setStartIndex(i => Math.max(0, i - VISIBLE_CARDS));
  };

  const goNext = () => {
    if (!canGoNext) return;
    setStartIndex(i => Math.min(media.length - VISIBLE_CARDS, i + VISIBLE_CARDS));
  };

  // Visible slice of media for current "page"
  const visibleMedia = media.slice(startIndex, startIndex + VISIBLE_CARDS);

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        {title && <h2 className="text-2xl font-bold text-white">{title}</h2>}
        {renderSelectionButtons()}
      </div>

      {listView ? (
        // Keep list view as-is
        <motion.div className="flex flex-col gap-4">
          {media.map((mediaItem, idx) => (
            <motion.div
              key={`${mediaItem.media_type}-${mediaItem.id}-${mediaItem.docId ?? idx}`}
              className="glass p-4 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <div className="flex gap-4 items-center">
                {selectMode && mediaItem.docId && (
                  <div className="flex-shrink-0">
                    <Checkbox
                      checked={selectedItems.includes(mediaItem.docId)}
                      onCheckedChange={() => handleSelect(mediaItem.docId!)}
                    />
                  </div>
                )}
                <div className="flex-shrink-0 w-16 h-24 md:w-20 md:h-30 overflow-hidden rounded-md">
                  <MediaCard media={{ ...mediaItem, id: mediaItem.media_id }} className="h-full w-full" minimal />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{mediaItem.title || mediaItem.name}</h3>
                    {!selectMode && onDelete && mediaItem.docId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(mediaItem.docId!)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-white/70 hover:text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-white/70 mb-2">
                    <span>
                      {mediaItem.media_type === 'movie'
                        ? mediaItem.release_date?.substring(0, 4)
                        : mediaItem.first_air_date?.substring(0, 4)}
                    </span>
                    {mediaItem.vote_average > 0 && (
                      <span className="ml-3 flex items-center text-amber-400">
                        ★ {mediaItem.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {renderTimestamp(mediaItem)}
                  <p className="text-white/70 text-sm line-clamp-2">{mediaItem.overview}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        // Carousel style horizontal scroll with buttons
        <div className="relative">
          <button
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed`}
            onClick={goPrev}
            disabled={!canGoPrev}
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed`}
            onClick={goNext}
            disabled={!canGoNext}
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>

          <div
            ref={containerRef}
            className="flex overflow-hidden space-x-6 scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
          >
            {visibleMedia.map((mediaItem, idx) => (
              <div
                key={`${mediaItem.media_type}-${mediaItem.id}-${mediaItem.docId ?? idx}`}
                className="flex-shrink-0"
                style={{ width: 230 }} // Match your MediaCard width
              >
                {selectMode && mediaItem.docId && (
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedItems.includes(mediaItem.docId)}
                      onCheckedChange={() => handleSelect(mediaItem.docId!)}
                    />
                  </div>
                )}
                {!selectMode && onDelete && mediaItem.docId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(mediaItem.docId!)}
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-white/70 hover:text-red-500" />
                  </Button>
                )}
                <MediaCard media={{ ...mediaItem, id: mediaItem.media_id }} />
             
</div> ))} </div> </div> )} </div> ); };
export default MediaGrid;
