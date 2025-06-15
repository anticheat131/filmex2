import Navbar from '../components/Navbar';
import MediaCard from '../components/MediaCard';
import React, { useEffect, useState } from 'react';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const fetchTrendingTV = async () => {
  const res = await fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  return data.results || [];
};

const TrendingTVShows = () => {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    fetchTrendingTV().then(setShows);
  }, []);

  return (
    <>
      <Navbar />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 p-4 pt-24">
        {shows.map(s => (
          <MediaCard key={s.id} media={{...s, media_type: 'tv'}} />
        ))}
      </div>
    </>
  );
};

export default TrendingTVShows;
