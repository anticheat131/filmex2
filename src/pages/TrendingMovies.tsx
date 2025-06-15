import Navbar from '../components/Navbar';
import MediaCard from '../components/MediaCard';
import React, { useEffect, useState } from 'react';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const fetchTrendingMovies = async () => {
  const res = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  return data.results || [];
};

const TrendingMovies = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetchTrendingMovies().then(setMovies);
  }, []);

  return (
    <>
      <Navbar />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 p-4 pt-24">
        {movies.map(m => (
          <MediaCard key={m.id} media={{...m, media_type: 'movie'}} />
        ))}
      </div>
    </>
  );
};

export default TrendingMovies;
