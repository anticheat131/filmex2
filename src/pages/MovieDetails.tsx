'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import MovieDetails from '@/components/MovieDetails';
import {
  getMovieDetails,
  getMovieRecommendations,
  getMovieTrailer,
  getMovieCast,
} from '@/lib/tmdbApi';
import { useWatchHistory } from '@/hooks/useWatchHistory';

const MovieDetailsPage = () => {
  const { slug } = useParams();
  const slugString = Array.isArray(slug) ? slug[0] : slug;
  const movieId = slugString.split('-')[0]; // Get just the numeric ID

  const [movieData, setMovieData] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [cast, setCast] = useState([]);
  const { markAsWatched } = useWatchHistory();

  useEffect(() => {
    if (!movieId) return;

    const fetchData = async () => {
      try {
        const [details, trailerData, recs, castData] = await Promise.all([
          getMovieDetails(movieId),
          getMovieTrailer(movieId),
          getMovieRecommendations(movieId),
          getMovieCast(movieId),
        ]);

        setMovieData(details);
        setTrailer(trailerData);
        setRecommendations(recs);
        setCast(castData);

        if (details?.id) {
          markAsWatched({
            id: details.id,
            title: details.title,
            poster_path: details.poster_path,
            media_type: 'movie',
          });
        }
      } catch (error) {
        console.error('Error fetching movie data:', error);
      }
    };

    fetchData();
  }, [movieId]);

  if (!movieData) {
    return <div className="text-white p-4">Loading...</div>;
  }

  return (
    <MovieDetails
      movie={movieData}
      trailer={trailer}
      recommendations={recommendations}
      cast={cast}
    />
  );
};

export default MovieDetailsPage;
