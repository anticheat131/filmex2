import { Media } from '@/utils/types'; import MediaCard from './MediaCard'; import { motion, Variants } from 'framer-motion'; import { formatDistanceToNow } from 'date-fns'; import { Clock, Trash2, SquareCheck, Square } from 'lucide-react'; import { Button } from '@/components/ui/button'; import { Checkbox } from '@/components/ui/checkbox'; import { useState } from 'react';

// Extend Media type to include optional string ID and timestamp interface ExtendedMedia extends Omit<Media, 'id'> { id: string | number; media_id: number; docId?: string; created_at?: string; watch_position?: number; duration?: number; }

interface MediaGridProps { media: ExtendedMedia[]; title?: string; listView?: boolean; selectable?: boolean; onDelete?: (id: string) => void; onDeleteSelected?: (ids: string[]) => void; }

const MediaGrid = ({ media, title, listView = false, selectable = false, onDelete, onDeleteSelected, }: MediaGridProps) => { const [selectedItems, setSelectedItems] = useState<string[]>([]); const [selectMode, setSelectMode] = useState(false);

if (!media || media.length === 0) { return ( <div className="py-8 text-center text-white"> <p>No results found.</p> </div> ); }

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } }, };

const item: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 }, };

const toggleSelectMode = () => { setSelectMode(!selectMode); setSelectedItems([]); };

const handleSelect = (docId: string) => { setSelectedItems(prev => prev.includes(docId) ? prev.filter(item => item !== docId) : [...prev, docId] ); };

const handleSelectAll = () => { if (selectedItems.length === media.length) { setSelectedItems([]); } else { setSelectedItems(media.map(item => item.docId!).filter(Boolean)); } };

const renderTimestamp = (item: ExtendedMedia) => { if (!item.created_at) return null; return ( <div className="flex items-center text-xs text-white/70 mb-2"> <Clock className="h-3 w-3 mr-1" /> {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })} </div> ); };

const renderSelectionButtons = () => { if (!selectable) return null; return ( <div className="flex gap-2 mb-4"> <Button
variant="outline"
size="sm"
onClick={toggleSelectMode}
className="border-white/20 bg-black/50 text-white hover:bg-black/70"
> {selectMode ? 'Cancel Selection' : 'Select Items'} </Button> {selectMode && ( <> <Button
variant="outline"
size="sm"
onClick={handleSelectAll}
className="border-white/20 bg-black/50 text-white hover:bg-black/70"
> {selectedItems.length === media.length ? ( <Square className="h-4 w-4 mr-2" /> ) : ( <SquareCheck className="h-4 w-4 mr-2" /> )} {selectedItems.length === media.length ? 'Deselect All' : 'Select All'} </Button> {selectedItems.length > 0 && onDeleteSelected && ( <Button variant="destructive" size="sm" onClick={() => onDeleteSelected(selectedItems)} className="ml-auto" > <Trash2 className="h-4 w-4 mr-2" /> Delete Selected ({selectedItems.length}) </Button> )} </> )} </div> ); };

return ( <div className="px-4 md:px-10 py-6"> <div className="flex flex-col md:flex-row md:items-center justify-between mb-6"> {title && <h2 className="text-2xl font-bold text-white">{title}</h2>} {renderSelectionButtons()} </div>

{listView ? (
    <motion.div
      className="flex flex-col gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {media.map((mediaItem, idx) => (
        <motion.div
          key={`${mediaItem.media_type}-${mediaItem.id}-${mediaItem.docId ?? idx}`}
          variants={item}
          className="glass p-4 rounded-lg hover:bg-white/10 transition-colors group"
        >
          {/* list view details omitted for brevity */}
        </motion.div>
      ))}
    </motion.div>
  ) : (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 justify-items-center"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {media.map((mediaItem, idx) => (
        <motion.div
          key={`${mediaItem.media_type}-${mediaItem.id}-${mediaItem.docId ?? idx}`}
          variants={item}
          className="group"
        >
          {selectMode && mediaItem.docId && (
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedItems.includes(mediaItem.docId!)}
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
        </motion.div>
      ))}
    </motion.div>
  )}
</div>

); };

export default MediaGrid;

