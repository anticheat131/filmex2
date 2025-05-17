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

const MovieDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
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
    isInWatchlist,
  } = useWatchHistory();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInMyWatchlist, setIsInMyWatchlist] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) {
        setError("Movie ID is required");
        setIsLoading(false);
        return;
      }

      const movieId = parseInt(id, 10);
      if (isNaN(movieId)) {
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
  }, [id]);

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
          <div className="flex flex-col md:flex-row items-start gap-6 max-w-6xl mx-auto">
            <div className="hidden md:block flex-shrink-0 w-48 xl:w-64 rounded-lg overflow-hidden shadow-lg">
              <img
                src={getImageUrl(movie.poster_path, posterSizes.medium)}
                alt={movie.title || 'Movie poster'}
                className="w-full h-auto"
              />
            </div>

            <div className="flex-1 animate-slide-up">
              {movie.logo_path ? (
                <div
                  className="relative w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px] mx-auto mb-4 
                              transition-all duration-300 ease-in-out hover:scale-105"
                >
                  {/* Loading skeleton */}
                  {!logoLoaded && (
                    <div className="absolute inset-0 bg-background image-skeleton rounded-lg" />
                  )}

                  <img
                    src={getImageUrl(movie.logo_path, backdropSizes.original)}
                    alt={movie.title}
                    className={`w-full h-auto object-contain filter drop-shadow-lg
                              transition-opacity duration-700 ease-in-out
                              ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setLogoLoaded(true)}
                  />
                </div>
              ) : (
                <h1
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 text-balance
                             animate-fade-in"
>
{movie.title}
</h1>
)}
          <div className="flex items-center text-sm md:text-base text-neutral-300 space-x-3 mb-4">
            {movie.release_date && (
              <span className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <time dateTime={movie.release_date}>
                  {new Date(movie.release_date).getFullYear()}
                </time>
              </span>
            )}
            {movie.runtime > 0 && (
              <span className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatRuntime(movie.runtime)}</span>
              </span>
            )}
            {movie.vote_average > 0 && (
              <span className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </span>
            )}
          </div>

          {/* Genres */}
          {movie.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre.id}
                  className="text-xs md:text-sm px-2 py-1 bg-neutral-800 rounded-full text-neutral-300"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          <p className="text-sm md:text-base text-neutral-300 mb-6 whitespace-pre-line">
            {movie.overview || 'No description available.'}
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              size="lg"
              variant="primary"
              className="flex items-center space-x-2"
              onClick={handlePlayMovie}
              aria-label={`Play ${movie.title}`}
            >
              <Play className="h-5 w-5" />
              <span>Play</span>
            </Button>

            <Button
              size="lg"
              variant={isFavorite ? 'destructive' : 'outline'}
              className="flex items-center space-x-2"
              onClick={handleToggleFavorite}
              aria-label={
                isFavorite
                  ? `Remove ${movie.title} from favorites`
                  : `Add ${movie.title} to favorites`
              }
            >
              <Heart className="h-5 w-5" />
              <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
            </Button>

            <Button
              size="lg"
              variant={isInMyWatchlist ? 'destructive' : 'outline'}
              className="flex items-center space-x-2"
              onClick={handleToggleWatchlist}
              aria-label={
                isInMyWatchlist
                  ? `Remove ${movie.title} from watchlist`
                  : `Add ${movie.title} to watchlist`
              }
            >
              <Bookmark className="h-5 w-5" />
              <span>{isInMyWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Tabs Section */}
  <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 text-white">
    <nav className="flex space-x-6 border-b border-neutral-700 mb-8">
      <button
        onClick={() => setActiveTab('about')}
        className={`pb-3 text-sm md:text-base font-semibold ${
          activeTab === 'about' ? 'border-b-2 border-primary' : 'text-neutral-400'
        }`}
      >
        About
      </button>
      <button
        onClick={() => setActiveTab('reviews')}
        className={`pb-3 text-sm md:text-base font-semibold ${
          activeTab === 'reviews' ? 'border-b-2 border-primary' : 'text-neutral-400'
        }`}
      >
        Reviews
      </button>
      <button
        onClick={() => setActiveTab('cast')}
        className={`pb-3 text-sm md:text-base font-semibold ${
          activeTab === 'cast' ? 'border-b-2 border-primary' : 'text-neutral-400'
        }`}
      >
        Cast & Crew
      </button>
    </nav>

    {activeTab === 'about' && (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="text-neutral-300 whitespace-pre-line">{movie.overview}</p>
        {/* Additional movie details like production companies, countries, languages can go here */}
      </section>
    )}

    {activeTab === 'reviews' && (
      <ReviewSection mediaId={movie.id} mediaType="movie" />
    )}

    {activeTab === 'cast' && (
      <section>
        <h2 className="text-2xl font-bold mb-4">Cast & Crew</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {cast.map((member) => (
            <div key={member.id} className="text-center">
              <img
                src={
                  member.profile_path
                    ? getImageUrl(member.profile_path, posterSizes.small)
                    : '/placeholder-profile.png'
                }
                alt={member.name}
                className="w-full rounded-lg mb-2 object-cover aspect-[2/3]"
                loading="lazy"
              />
              <p className="text-sm font-semibold">{member.name}</p>
              <p className="text-xs text-neutral-400">{member.character || member.job}</p>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Recommendations */}
    {recommendations.length > 0 && (
      <ContentRow
        title="More Like This"
        items={recommendations}
        mediaType="movie"
        className="mt-12"
      />
    )}
  </div>
</div>
);
};

export default MovieDetailsPage;
