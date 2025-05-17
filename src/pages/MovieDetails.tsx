import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMovieDetails,
  getMovieRecommendations,
  getMovieTrailer,
  backdropSizes,
  posterSizes,
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

        // SEO-friendly redirect
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
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* ... existing JSX remains unchanged ... */}
    </div>
  );
};

export default MovieDetailsPage;
