import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMovieDetails,
  getMovieRecommendations,
  getMovieTrailer,
  getMovieCast
} from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { MovieDetails, Media, CastMember } from '@/utils/types';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import ContentRow from '@/components/ContentRow';
import ReviewSection from '@/components/ReviewSection';
import {
  Play,
  Clock,
  Calendar,
  Star,
  ArrowLeft,
  Shield,
  Heart,
  Bookmark
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWatchHistory } from '@/hooks/watch-history';

const MovieDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const getIdOnly = (idParam: string) => {
    const match = idParam.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : NaN;
  };

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) {
        setError("Movie ID is required");
        setIsLoading(false);
        return;
      }

      const movieId = getIdOnly(id);
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
          getMovieCast(movieId)
        ]);

        if (!movieData) {
          setError("Movie not found");
          return;
        }

        setMovie(movieData);
        setRecommendations(recommendationsData);
        setCast(castData);

        const slugTitle = movieData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const releaseYear = new Date(movieData.release_date).getFullYear();
        const expectedPath = `/movie/${movieId}-${slugTitle}-${releaseYear}`;
        if (window.location.pathname !== expectedPath) {
          navigate(expectedPath, { replace: true });
        }

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
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <div
        className="relative w-full h-[60vh] bg-cover bg-center"
        style={{
          backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'original')})`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          <div className="flex gap-4 text-sm mt-2 text-gray-300">
            <span><Calendar className="inline-block w-4 h-4 mr-1" /> {movie.release_date}</span>
            <span><Clock className="inline-block w-4 h-4 mr-1" /> {formatRuntime(movie.runtime)}</span>
            <span><Star className="inline-block w-4 h-4 mr-1" /> {movie.vote_average.toFixed(1)}</span>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={handlePlayMovie}><Play className="mr-2 w-4 h-4" /> Watch Now</Button>
            <Button onClick={handleToggleFavorite} variant="secondary">
              <Heart className="mr-2 w-4 h-4" /> {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
            </Button>
            <Button onClick={handleToggleWatchlist} variant="secondary">
              <Bookmark className="mr-2 w-4 h-4" /> {isInMyWatchlist ? 'Remove Watchlist' : 'Add to Watchlist'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <p className="text-gray-300">{movie.overview}</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Genres</h2>
        <p className="text-gray-300">{movie.genres.map(g => g.name).join(', ')}</p>

        <ReviewSection mediaId={movie.id} mediaType="movie" />
        <ContentRow title="You May Also Like" items={recommendations} />
      </div>
    </div>
  );
};

export default MovieDetailsPage;
