import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getMovieRecommendations, getMovieTrailer, backdropSizes, posterSizes, getMovieCast } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { MovieDetails, Media, CastMember } from '@/utils/types';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import ContentRow from '@/components/ContentRow';
import ReviewSection from '@/components/ReviewSection';
import { Play, Clock, Calendar, Star, ArrowLeft, Shield, Heart, Bookmark } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWatchHistory } from '@/hooks/watch-history';

// Helper to slugify movie title for URL
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

const MovieDetailsPage = () => {
  // Now expecting param "id" which includes id-name-year, e.g. "950387-the-flash-2023"
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'cast'>('about');
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const { 
    addToFavorites, 
    addToWatchlist,
    removeFromFavorites,
    removeFromWatchlist,
    isInFavorites,
    isInWatchlist 
  } = useWatchHistory();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInMyWatchlist, setIsInMyWatchlist] = useState(false);

  // Extract movie ID from param (first part before dash)
  const movieId = id ? parseInt(id.split('-')[0], 10) : NaN;

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id || isNaN(movieId)) {
        setError("Invalid movie ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [movieData, recommendationsData, castData] = await Promise.all([
          getMovieDetails(movieId),
          getMovieRecommendations(movieId),
          getMovieCast(movieId),
        ]);

        if (!movieData) {
          setError("Movie not found");
          setIsLoading(false);
          return;
        }

        // If URL slug or year doesn't match actual movie, redirect to correct URL
        const correctSlug = slugify(movieData.title);
        const correctYear = movieData.release_date ? new Date(movieData.release_date).getFullYear() : '';
        const expectedIdParam = `${movieData.id}-${correctSlug}-${correctYear}`;

        if (id !== expectedIdParam) {
          navigate(`/movie/${expectedIdParam}`, { replace: true });
          return;
        }

        setMovie(movieData);
        setRecommendations(recommendationsData);
        setCast(castData);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setError("Failed to load movie data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [id, movieId, navigate]);

  useEffect(() => {
    const fetchTrailer = async () => {
      if (movie?.id) {
        try {
          const trailerData = await getMovieTrailer(movie.id);
          setTrailerKey(trailerData);
        } catch (error) {
          console.error('Error fetching trailer:', error);
        }
      }
    };

    fetchTrailer();
  }, [movie?.id]);

  useEffect(() => {
    if (movie?.id) {
      setIsFavorite(isInFavorites(movie.id, 'movie'));
      setIsInMyWatchlist(isInWatchlist(movie.id, 'movie'));
    }
  }, [movie?.id, isInFavorites, isInWatchlist]);

  const handlePlayMovie = () => {
    if (movie) {
      navigate(`/watch/movie/${movie.id}`);
    }
  };

  const handleToggleFavorite = () => {
    if (!movie) return;

    if (isFavorite) {
      removeFromFavorites(movie.id, 'movie');
      setIsFavorite(false);
    } else {
      addToFavorites({
        media_id: movie.id,
        media_type: 'movie',
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        rating: movie.vote_average
      });
      setIsFavorite(true);
    }
  };

  const handleToggleWatchlist = () => {
    if (!movie) return;

    if (isInMyWatchlist) {
      removeFromWatchlist(movie.id, 'movie');
      setIsInMyWatchlist(false);
    } else {
      addToWatchlist({
        media_id: movie.id,
        media_type: 'movie',
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        rating: movie.vote_average
      });
      setIsInMyWatchlist(true);
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse-slow text-white font-medium">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl text-white mb-4">{error}</h1>
        <Button onClick={() => navigate('/')} variant="outline">
          Return to Home
        </Button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl text-white mb-4">Movie not found</h1>
        <Button onClick={() => navigate('/')} variant="outline">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Backdrop Image */}
      <div className="relative w-full h-[70vh]">
        {/* Loading skeleton */}
        {!backdropLoaded && (
          <div className="absolute inset-0 bg-background image-skeleton" />
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-6 z-10 text-white p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <img
          src={getImageUrl(movie.backdrop_path, backdropSizes.original)}
          alt={movie.title || 'Movie backdrop'}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            backdropLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setBackdropLoaded(true)}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 details-gradient" />

        {/* Trailer section - only show on desktop */}
        {!isMobile && trailerKey && (
          <div className="absolute inset-0 bg-black/60">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Movie info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
          <div className="flex flex-col md:flex-row items-startmd:items-center gap-6 md:gap-12 max-w-screen-lg mx-auto">
{/* Poster */}
<div className="flex-shrink-0 w-40 md:w-52 rounded-md overflow-hidden shadow-lg bg-gray-900">
{!logoLoaded && (
<div className="bg-gray-700 animate-pulse h-full w-full" />
)}
<img
src={getImageUrl(movie.poster_path, posterSizes.w342)}
alt={movie.title || 'Movie poster'}
className={w-full h-auto object-cover transition-opacity duration-700 ${ logoLoaded ? 'opacity-100' : 'opacity-0' }}
onLoad={() => setLogoLoaded(true)}
/>
</div>
        {/* Text info */}
        <div className="flex-grow max-w-xl text-white">
          <h1 className="text-3xl font-extrabold mb-2">{movie.title}</h1>

          {/* Info line: year · runtime · rating */}
          <div className="flex items-center space-x-4 text-sm opacity-80 mb-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{movie.release_date?.split('-')[0]}</span>
            </div>

            {movie.runtime > 0 && (
              <>
                <span className="text-gray-500">·</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              </>
            )}

            <span className="text-gray-500">·</span>

            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres?.slice(0, 3).map((genre) => (
              <span
                key={genre.id}
                className="text-xs border border-gray-500 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-700 transition"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p className="mb-6 text-gray-300">{movie.overview}</p>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              variant="default"
              onClick={handlePlayMovie}
              className="flex items-center gap-2"
              aria-label="Play movie"
            >
              <Play className="w-5 h-5" />
              Play
            </Button>

            <Button
              variant={isFavorite ? 'destructive' : 'outline'}
              onClick={handleToggleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="flex items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </Button>

            <Button
              variant={isInMyWatchlist ? 'destructive' : 'outline'}
              onClick={handleToggleWatchlist}
              aria-label={isInMyWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              className="flex items-center gap-2"
            >
              <Bookmark className="w-5 h-5" />
              {isInMyWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Tabs for About / Reviews / Cast */}
  <div className="max-w-screen-lg mx-auto px-6 md:px-12 py-12">
    <nav className="flex space-x-8 border-b border-gray-700 mb-8 text-gray-300">
      <button
        onClick={() => setActiveTab('about')}
        className={`pb-2 border-b-2 ${
          activeTab === 'about' ? 'border-white text-white' : 'border-transparent'
        }`}
      >
        About
      </button>
      <button
        onClick={() => setActiveTab('reviews')}
        className={`pb-2 border-b-2 ${
          activeTab === 'reviews' ? 'border-white text-white' : 'border-transparent'
        }`}
      >
        Reviews
      </button>
      <button
        onClick={() => setActiveTab('cast')}
        className={`pb-2 border-b-2 ${
          activeTab === 'cast' ? 'border-white text-white' : 'border-transparent'
        }`}
      >
        Cast
      </button>
    </nav>

    {activeTab === 'about' && (
      <div className="text-gray-300 leading-relaxed whitespace-pre-line">{movie.overview}</div>
    )}

    {activeTab === 'reviews' && (
      <ReviewSection mediaId={movie.id} mediaType="movie" />
    )}

    {activeTab === 'cast' && (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
        {cast.map((member) => (
          <div key={member.id} className="flex flex-col items-center text-center">
            <img
              src={getImageUrl(member.profile_path, posterSizes.w185)}
              alt={member.name}
              className="rounded-md mb-2 w-28 h-40 object-cover"
              loading="lazy"
            />
            <div className="text-sm font-semibold">{member.name}</div>
            <div className="text-xs text-gray-400">{member.character}</div>
          </div>
        ))}
      </div>
    )}

    {/* Recommendations */}
    <ContentRow
      title="You might also like"
      items={recommendations}
      mediaType="movie"
      isLoading={isLoading}
    />
  </div>
</div>
);
};

export default MovieDetailsPage;
