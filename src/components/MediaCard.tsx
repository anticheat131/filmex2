import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getGenreNames } from '@/lib/tmdbHelpers';

interface MediaCardProps {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
  genre_ids?: number[];
  runtime?: number;
  quality?: 'HD' | 'CAM';
}

const MediaCard: React.FC<MediaCardProps> = ({
  id,
  title,
  poster_path,
  release_date,
  vote_average,
  media_type,
  genre_ids = [],
  runtime,
  quality,
}) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const year = release_date ? new Date(release_date).getFullYear() : '';
  const fullDate = release_date
    ? new Date(release_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      })
    : '';

  const genres = getGenreNames(genre_ids).slice(0, 2); // Max 2 genres
  const detailPath = `/${media_type}/${id}`;

  return (
    <div
      className="relative w-[170px] sm:w-[190px] md:w-[200px] h-[270px] sm:h-[300px] md:h-[330px] cursor-pointer rounded-xl overflow-hidden bg-zinc-900 transition-all duration-300 group"
      onClick={() => navigate(detailPath)}
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
    >
      {/* Poster */}
      <div className="relative w-full h-full">
        <img
          src={`https://image.tmdb.org/t/p/w500${poster_path}`}
          alt={title}
          className="w-full h-full object-cover rounded-xl"
        />

        {/* HD / CAM Badge */}
        {quality && (
          <div
            className={cn(
              'absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm backdrop-blur-md',
              quality === 'HD'
                ? 'bg-gradient-to-r from-green-500 via-green-400 to-green-600 text-white/90'
                : 'bg-gradient-to-r from-red-500 via-red-400 to-red-600 text-white/90'
            )}
          >
            {quality}
          </div>
        )}

        {/* IMDB Score */}
        <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400" />
          {vote_average.toFixed(1)}
        </div>

        {/* Details Button */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <div className="flex justify-center">
            <button
              className="flex items-center gap-2 px-3 py-1 bg-white text-black text-xs font-semibold rounded-full shadow hover:bg-gray-200 transition"
              onClick={(e) => {
                e.stopPropagation();
                navigate(detailPath);
              }}
            >
              Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Hover Border Effect */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300"
        style={{
          boxShadow: showPopup
            ? '0 0 8px 1px rgba(255, 255, 255, 0.3)'
            : 'none',
        }}
      />

      {/* Metadata (Title, Genre, etc) */}
      <div className="absolute bottom-12 px-2 w-full z-10 text-white text-xs space-y-1">
        {/* Title */}
        <div className="text-sm font-semibold text-center leading-snug truncate">
          {title}
        </div>

        {/* Genre */}
        <div className="flex justify-start gap-1 flex-wrap pl-[5%]">
          {genres.map((genre) => (
            <span
              key={genre}
              className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Runtime */}
        {runtime && (
          <div className="absolute right-2 bottom-1 text-[10px] text-gray-300">
            {runtime} min
          </div>
        )}

        {/* Release Date */}
        <div className="text-[10px] text-center text-gray-400 mt-1">
          {fullDate}
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
