import { useState, useEffect } from 'react';
import { useParams, useNavigate, NavigateFunction } from 'react-router-dom';
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

// Helper to slugify title for URL
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -

// Extracts ID, title slug, year from param slug like "12345-inception-2010"
function parseSlug(slug: string) {
  // Split by '-' from the end:
  // e.g. "12345-inception-2010"
  // id: 12345
  // titleSlug: inception
  // year: 2010
  const parts = slug.split('-');
  const idPart = parts[0];
  const yearPart = parts[parts.length - 1];
  const titleParts = parts.slice(1, parts.length - 1);
  const titleSlug = titleParts.join('-');

  return { id: idPart, titleSlug, year: yearPart };
}

// Rebuild clean URL
function buildSlugUrl(movie: MovieDetails) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'unknown';
  const titleSlug = slugify(movie.title || 'movie');
  return `/movie/${movie.id}-${titleSlug}-${year}`;
}

const MovieDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
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
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!slug) {
      setError("Movie slug is required");
      setIsLoading(false);
      return;
    }

    const { id, titleSlug, year } = parseSlug(slug);

    const movieId = parseInt(id, 10);
    if (isNaN(movieId)) {
      setError("Invalid movie ID");
      setIsLoading(false);
      return;
    }

    // Fetch movie and redirect if URL is outdated (e.g. title or year doesn't match)
    const fetchMovieData = async () => {
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

        setMovie(movieData);
        setRecommendations(recommendationsData);
        setCast(castData);

        // Check if current URL slug matches movie data, if not redirect
        const correctSlugUrl = buildSlugUrl(movieData);
        if (correctSlugUrl !== `/movie/${slug}`) {
          navigate(correctSlugUrl, { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setError("Failed to load movie data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [slug, navigate]);

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
        {!backdropLoaded && (
          <div className="absolute inset-0 bg-background image-skeleton" />
        )}

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
          className={`w-full h-full object-cover transition-opacity duration-700 ${backdropLoaded ? 'opacity-100' : 'opacity-0'}`}
onLoad={() => setBackdropLoaded(true)}
/>
    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/70 to-transparent" />
  </div>

  {/* Main Content */}
  <main className="max-w-7xl mx-auto px-6 pt-6 pb-16 text-white">
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Poster */}
      <div className="flex-shrink-0 w-full lg:w-[250px] rounded-lg overflow-hidden shadow-lg bg-background/50">
        {!logoLoaded && (
          <div className="w-full h-[375px] bg-gray-700 animate-pulse" />
        )}
        <img
          src={getImageUrl(movie.poster_path, posterSizes.w342)}
          alt={movie.title || 'Movie poster'}
          className={`w-full h-[375px] object-cover transition-opacity duration-700 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLogoLoaded(true)}
        />
      </div>

      {/* Info */}
      <section className="flex flex-col flex-1">
        <h1 className="text-3xl font-extrabold leading-tight">
          {movie.title} <span className="text-gray-400 text-xl">({new Date(movie.release_date).getFullYear()})</span>
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-300 text-sm font-medium">
          {movie.release_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={movie.release_date}>{movie.release_date}</time>
            </div>
          )}

          {movie.runtime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatRuntime(movie.runtime)}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{movie.vote_average?.toFixed(1)} / 10</span>
          </div>
        </div>

        {/* Genres */}
        <div className="mt-4 flex flex-wrap gap-2">
          {movie.genres?.slice(0, 3).map((genre) => (
            <span
              key={genre.id}
              className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold"
            >
              {genre.name}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="mt-6 text-gray-300 max-w-prose leading-relaxed">{movie.overview}</p>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            size="lg"
            variant="primary"
            onClick={handlePlayMovie}
            aria-label={`Play ${movie.title}`}
            className="flex items-center gap-2"
          >
            <Play className="h-5 w-5" />
            Play
          </Button>

          <Button
            size="lg"
            variant={isFavorite ? 'destructive' : 'outline'}
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="flex items-center gap-2"
          >
            <Heart className="h-5 w-5" />
            {isFavorite ? 'Remove Favorite' : 'Add Favorite'}
          </Button>

          <Button
            size="lg"
            variant={isInMyWatchlist ? 'destructive' : 'outline'}
            onClick={handleToggleWatchlist}
            aria-label={isInMyWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            className="flex items-center gap-2"
          >
            <Bookmark className="h-5 w-5" />
            {isInMyWatchlist ? 'Remove Watchlist' : 'Add Watchlist'}
          </Button>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <nav className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-3 px-6 -mb-px font-semibold text-sm border-b-2 ${
                activeTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('cast')}
              className={`py-3 px-6 -mb-px font-semibold text-sm border-b-2 ${
                activeTab === 'cast' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              Cast
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-6 -mb-px font-semibold text-sm border-b-2 ${
                activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              Reviews
            </button>
          </nav>

          <div className="mt-6">
            {activeTab === 'about' && (
              <>
                {/* Trailer */}
                {trailerKey ? (
                  <div className="aspect-video rounded-lg overflow-hidden mb-8 shadow-lg">
                    <iframe
                      title={`${movie.title} Trailer`}
                      src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0&controls=1`}
                      allowFullScreen
                      frameBorder={0}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No trailer available.</p>
                )}
              </>
            )}

            {activeTab === 'cast' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {cast.length === 0 && <p className="text-gray-400 italic">No cast information available.</p>}
                {cast.map((member) => (
                  <div key={member.id} className="flex flex-col items-center text-center">
                    <img
                      src={getImageUrl(member.profile_path, posterSizes.w185)}
                      alt={member.name}
                      className="rounded-lg shadow-md w-full aspect-[2/3] object-cover mb-2"
                    />
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-gray-400">{member.character}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewSection mediaId={movie.id} mediaType="movie" />
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <ContentRow
            title="More Like This"
            mediaList={recommendations}
            mediaType="movie"
            className="mt-12"
          />
        )}
      </section>
    </div>
  </main>
</div>
);
};

export default MovieDetailsPage;
