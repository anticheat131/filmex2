// ... (imports stay the same)

const MediaCard = ({ media, className, smaller = false }: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleImageError = () => setImageError(true);
  const mediaId = media.media_id || media.id;
  const detailPath = media.media_type === 'movie' ? `/movie/${mediaId}` : `/tv/${mediaId}`;

  let quality = media.quality?.toUpperCase();
  if (!quality) {
    if (typeof media.hd === 'boolean') quality = media.hd ? 'HD' : 'CAM';
    else if (media.video_source?.toLowerCase().includes('cam')) quality = 'CAM';
    else quality = 'HD';
  }

  const genreNames = media.genre_ids?.map(id => genreMap[id]).filter(Boolean).slice(0, 2);
  const runtimeMinutes = media.media_type === 'movie'
    ? media.runtime
    : Array.isArray(media.episode_run_time) && media.episode_run_time.length > 0
      ? media.episode_run_time[0]
      : undefined;

  const durationText = runtimeMinutes ? `${runtimeMinutes} min` : undefined;
  const releaseYear = (media.release_date || media.first_air_date)?.slice(0, 4);
  const fullReleaseDate = media.media_type === 'movie' ? media.release_date : media.first_air_date;

  const handleClick = async () => {
    await Promise.all([
      trackMediaPreference(media.media_type, 'select'),
      trackMediaView({
        mediaType: media.media_type as 'movie' | 'tv',
        mediaId: media.id.toString(),
        title: media.title || media.name || '',
      }),
    ]);
    navigate(detailPath);
  };

  return (
    <div
      className={cn(
        'relative inline-block rounded-xl border border-white/10 bg-card shadow-md overflow-hidden hover:border-accent transition-all',
        smaller ? 'scale-90 origin-top-left' : '',
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={imageError ? '/placeholder.svg' : getImageUrl(media.poster_path, posterSizes.medium) || '/placeholder.svg'}
          alt={media.title || media.name || 'Media Poster'}
          className="object-cover w-full h-full"
          loading="lazy"
          onError={handleImageError}
        />

        {/* Quality Tag */}
        {quality && (
          <span className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded backdrop-blur-sm bg-green-600/90 text-white">
            {quality}
          </span>
        )}

        {/* IMDb Rating Badge */}
        {media.vote_average > 0 && (
          <span className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold flex items-center gap-1 rounded-md bg-gradient-to-br from-yellow-400 to-yellow-500 text-black shadow-sm">
            <Star className="w-3.5 h-3.5 fill-black" />
            {media.vote_average.toFixed(1)}
          </span>
        )}

        {/* Details Button - centered */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-md bg-white text-black hover:bg-gray-200 transition"
        >
          Details <ArrowRight className="inline w-3 h-3 ml-1" />
        </button>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Info Section */}
      <div className="relative p-3 pt-4 text-white flex flex-col items-center gap-1">
        <h3 className="text-sm font-semibold text-white/90 text-center line-clamp-1">
          {media.title || media.name}
        </h3>

        <div className="flex justify-center items-center gap-3 text-xs text-white/70">
          {releaseYear && <span>{releaseYear}</span>}
        </div>

        {genreNames?.length > 0 && (
          <p
            className="text-xs text-white/50 line-clamp-1 text-center"
            style={{ alignSelf: 'flex-start', paddingLeft: '5%' }} // Shifted left
          >
            {genreNames.join(', ')}
          </p>
        )}
      </div>

      {/* Runtime at bottom right corner */}
      {durationText && (
        <div className="absolute bottom-2 right-3 text-[11px] text-white/60 bg-black/50 px-2 py-0.5 rounded-sm">
          {durationText}
        </div>
      )}

      {/* Hover Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-3 w-[320px] max-w-full rounded-lg bg-black/90 p-4 shadow-lg text-white pointer-events-auto"
            onMouseEnter={() => setShowPopup(true)}
            onMouseLeave={() => setShowPopup(false)}
          >
            <h4 className="font-bold text-lg mb-1">{media.title || media.name}</h4>
            <p className="text-xs mb-2 text-white/70">Release: {fullReleaseDate || 'Unknown'}</p>
            <p className="text-xs mb-2 text-white/70">Genres: {genreNames?.join(', ') || 'Unknown'}</p>
            {media.vote_average > 0 && (
              <p className="flex items-center text-amber-400 mb-2">
                <Star className="h-4 w-4 mr-1 fill-amber-400" /> {media.vote_average.toFixed(1)}
              </p>
            )}
            <p className="text-xs max-h-28 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {media.overview || 'No description available.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaCard;
