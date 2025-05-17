import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getMovieDetails,
  getMovieRecommendations,
  getMovieTrailer,
  getMovieCast,
} from '../api/tmdb'; // Adjust your API imports accordingly
import { getImageUrl, posterSizes } from '../utils/imageHelpers';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [trailerKey, setTrailerKey] = useState('');
  const [cast, setCast] = useState([]);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const movieData = await getMovieDetails(id);
      setMovie(movieData);

      const recs = await getMovieRecommendations(id);
      setRecommendations(recs);

      const trailer = await getMovieTrailer(id);
      setTrailerKey(trailer);

      const castData = await getMovieCast(id);
      setCast(castData);
    }
    fetchData();
  }, [id]);

  if (!movie) return <div>Loading...</div>;

  return (
    <div className="movie-details-container">
      <h1 className="movie-title">{movie.title}</h1>

      <div className="movie-logo">
        {movie.logo_path && (
          <img
            src={getImageUrl(movie.logo_path, posterSizes.medium)}
            alt={`${movie.title} logo`}
            onLoad={() => setLogoLoaded(true)}
            className={`w-full object-contain transition-opacity duration-500 ${
              logoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      <p className="movie-overview">{movie.overview}</p>

      <div className="movie-details-meta">
        <span>Release Date: {movie.release_date}</span>
        <span>Runtime: {movie.runtime} min</span>
        <span>Rating: {movie.vote_average}</span>
      </div>

      <div className="movie-cast">
        <h2>Cast</h2>
        <ul>
          {cast.map((actor) => (
            <li key={actor.cast_id}>
              {actor.name} as {actor.character}
            </li>
          ))}
        </ul>
      </div>

      <div className="movie-trailer">
        {trailerKey ? (
          <iframe
            title="Movie Trailer"
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${trailerKey}`}
            frameBorder="0"
            allowFullScreen
          />
        ) : (
          <p>No trailer available.</p>
        )}
      </div>

      <div className="movie-recommendations">
        <h2>Recommendations</h2>
        <ul>
          {recommendations.map((rec) => (
            <li key={rec.id}>{rec.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MovieDetails;
