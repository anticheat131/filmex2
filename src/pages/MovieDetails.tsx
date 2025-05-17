import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getMovieDetails,
  getMovieRecommendations,
  getMovieTrailer,
  getMovieCast,
} from "../api/tmdb";
import MediaCard from "../components/MediaCard";
import WatchTogetherModal from "../components/WatchTogetherModal";
import { useWatchHistory } from "../hooks/useWatchHistory";

const MovieDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [cast, setCast] = useState<any[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWatchTogetherModal, setShowWatchTogetherModal] = useState(false);

  const { addToWatchHistory } = useWatchHistory();

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) {
        setError("Movie ID is required");
        setIsLoading(false);
        return;
      }

      const idMatch = id.match(/^(\d+)(?:-[\w-]+)?$/);
      const movieId = idMatch ? parseInt(idMatch[1], 10) : NaN;

      if (isNaN(movieId)) {
        setError("Invalid movie ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const [movieData, recommendationsData, castData, trailerData] =
          await Promise.all([
            getMovieDetails(movieId),
            getMovieRecommendations(movieId),
            getMovieCast(movieId),
            getMovieTrailer(movieId),
          ]);

        if (!movieData) {
          setError("Movie not found");
          return;
        }

        setMovie(movieData);
        setRecommendations(recommendationsData);
        setCast(castData);
        setTrailerKey(trailerData?.key ?? null);
        addToWatchHistory(movieData);
      } catch (error) {
        console.error("Error fetching movie data:", error);
        setError("Failed to load movie data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  const getMovieSlug = (movie: any) => {
    const titleSlug = movie.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    const year = movie.release_date?.split("-")[0] || "unknown";
    return `${movie.id}-${titleSlug}-${year}`;
  };

  if (isLoading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
      <p className="text-sm text-gray-400 mb-4">{movie.release_date} • {movie.runtime} min</p>
      <p className="mb-6">{movie.overview}</p>

      {trailerKey && (
        <div className="mb-6">
          <iframe
            title="Trailer"
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${trailerKey}`}
            allowFullScreen
            className="rounded-xl"
          />
        </div>
      )}

      <button
        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg mb-6"
        onClick={() => setShowWatchTogetherModal(true)}
      >
        🎬 Watch Together
      </button>

      <h2 className="text-2xl font-bold mt-10 mb-4">Cast</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cast.slice(0, 12).map((member) => (
          <div key={member.id} className="text-center">
            <img
              src={
                member.profile_path
                  ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
                  : "/placeholder.jpg"
              }
              alt={member.name}
              className="w-full h-48 object-cover rounded"
            />
            <p className="text-sm mt-1 font-medium">{member.name}</p>
            <p className="text-xs text-gray-400">{member.character}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recommendations.map((rec) => (
          <Link key={rec.id} to={`/movie/${getMovieSlug(rec)}`}>
            <MediaCard media={rec} />
          </Link>
        ))}
      </div>

      {showWatchTogetherModal && (
        <WatchTogetherModal
          movieTitle={movie.title}
          onClose={() => setShowWatchTogetherModal(false)}
        />
      )}
    </div>
  );
};

export default MovieDetailsPage;
