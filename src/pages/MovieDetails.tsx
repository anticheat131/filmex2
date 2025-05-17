import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getMovieDetails,
  getMovieRecommendations,
  getMovieTrailer,
  getMovieCast,
} from "@/api/tmdb"; // <-- Fixed import path
import MediaCard from "../components/MediaCard";
import WatchTogetherModal from "../components/WatchTogetherModal";
import { useWatchHistory } from "../hooks/useWatchHistory";

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [watchTogetherOpen, setWatchTogetherOpen] = useState(false);
  const { addToWatchHistory } = useWatchHistory();

  useEffect(() => {
    if (!id) return;

    async function fetchMovieData() {
      try {
        const movieData = await getMovieDetails(id);
        setMovie(movieData);

        const recs = await getMovieRecommendations(id);
        setRecommendations(recs);

        const trailer = await getMovieTrailer(id);
        setTrailerKey(trailer);

        const castData = await getMovieCast(id);
        setCast(castData);

        addToWatchHistory(id);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    }

    fetchMovieData();
  }, [id, addToWatchHistory]);

  if (!movie) {
    return <div>Loading...</div>;
  }

  return (
    <div className="movie-details-container p-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="rounded-lg shadow-lg max-w-xs"
        />
        <div className="flex-1">
          <p className="mb-4">{movie.overview}</p>
          <p>
            <strong>Release Date:</strong> {movie.release_date}
          </p>
          <p>
            <strong>Runtime:</strong> {movie.runtime} minutes
          </p>
          <p>
            <strong>Genres:</strong>{" "}
            {movie.genres?.map((g: any) => g.name).join(", ")}
          </p>
          <p>
            <strong>Rating:</strong> {movie.vote_average} / 10
          </p>

          {trailerKey && (
            <div className="my-4">
              <h2 className="text-2xl font-semibold mb-2">Trailer</h2>
              <iframe
                title="Trailer"
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${trailerKey}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          <button
            onClick={() => setWatchTogetherOpen(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Watch Together
          </button>
        </div>
      </div>

      <div className="recommendations mt-10">
        <h2 className="text-3xl font-semibold mb-6">Recommendations</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {recommendations.map((rec) => (
            <Link
              key={rec.id}
              to={`/movie/${rec.id}`}
              className="hover:opacity-80 transition"
            >
              <MediaCard media={rec} />
            </Link>
          ))}
        </div>
      </div>

      <div className="cast mt-10">
        <h2 className="text-3xl font-semibold mb-6">Cast</h2>
        <div className="flex overflow-x-auto gap-4">
          {cast.map((actor) => (
            <div key={actor.id} className="flex-shrink-0 w-24 text-center">
              <img
                src={
                  actor.profile_path
                    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                    : "/no-profile.png"
                }
                alt={actor.name}
                className="rounded-full mx-auto mb-2"
              />
              <p className="text-sm font-medium">{actor.name}</p>
              <p className="text-xs text-gray-500">{actor.character}</p>
            </div>
          ))}
        </div>
      </div>

      {watchTogetherOpen && (
        <WatchTogetherModal
          movieId={id!}
          onClose={() => setWatchTogetherOpen(false)}
          movieTitle={movie.title}
        />
      )}
    </div>
  );
};

export default MovieDetails;
