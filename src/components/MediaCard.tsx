import { Media } from '@/utils/types';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  media: Media;
  className?: string;
  minimal?: boolean;
}

const MediaCard = ({ media, className, minimal = false }: MediaCardProps) => {
  const href =
    media.media_type === 'movie'
      ? `/movie/${media.id}`
      : `/tv/${media.id}`;
  const title = media.title || media.name;
  const imagePath = media.backdrop_path || media.poster_path;

  return (
    <Link
      href={href}
      className={cn(
        'relative group block overflow-hidden rounded-lg bg-zinc-900',
        minimal ? 'aspect-[2/3]' : 'aspect-video',
        className
      )}
    >
      {imagePath && (
        <Image
          src={`https://image.tmdb.org/t/p/w780${imagePath}`}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      {!minimal && (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/60 to-transparent p-3">
          <h3 className="text-white text-sm font-semibold line-clamp-2">
            {title}
          </h3>
        </div>
      )}
    </Link>
  );
};

export default MediaCard;
