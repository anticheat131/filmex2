import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getMovieRecommendations, getMovieTrailer, getMovieCast } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { MovieDetails, Media, CastMember } from '@/utils/types';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import ContentRow from '@/components/ContentRow';
import ReviewSection from '@/components/ReviewSection';
import { Play } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWatchHistory } from '@/hooks/watch-history';

const MovieDetailsPage = () => {
  const { id: rawId } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  // ✅ Extract ID from slug (e.g., /movie/oppenheimer-872585-2023)
  const extractMovieId = (slug: string): number | null => {
    const match = slug.match(/-(\d+)(?:-\d{4})?$/);
    return match ? parseInt(match[1], 10) : null;
  };

  // ✅ Basic slugify (no library)
  const toSlug = (text: string): string =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-') // replace spaces with dashes
      .replace(/-+/g, '-'); // collapse multiple dashes

  useEffect(() => {
    const fetchData = async () => {
      const movieId = rawId ? extractMovieId(rawId) : null;

      if (!movieId) {
        setError("Invalid movie ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

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

        const releaseYear = movieData.release_date?.split("-")[0] || "";
        const slugifiedTitle = toSlug(movieData.title);
        const expectedSlug = `/movie/${slugifiedTitle}-${movieData.id}-${releaseYear}`;

        if (window.location.pathname !== expectedSlug) {
          navigate(expectedSlug, { replace: true });
        }

        setIsFavorite(isInFavorites(movieId, 'movie'));
        setIsInMyWatchlist(isInWatchlist(movieId, 'movie'));

      } catch (err) {
        console.error("Error fetching movie data", err);
        setError("Failed to load movie data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [rawId]);

  useEffect(() => {
    const fetchTrailer = async () => {
      if (movie?.id) {
        try {
          const trailer = await getMovieTrailer(movie.id);
          setTrailerKey(trailer);
        } catch (err) {
          console.error("Error fetching trailer:", err);
        }
      }
    };

    fetchTrailer();
  }, [movie?.id]);

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

  const handlePlayMovie = () => {
    if (movie) {
      navigate(`/watch/movie/${movie.id}`);
    }
  };

  return (
    <>
      <Navbar />
      {isLoading ? (
        <div className="text-white p-10 text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-500 p-10 text-center">{error}</div>
      ) : movie ? (
        <div className="text-white p-4">
          <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
          <Button onClick={handlePlayMovie}>
            <Play className="w-4 h-4 mr-2" /> Watch Now
          </Button>
        </div>
      ) : null}
    </>
  );
};

export default MovieDetailsPage;
