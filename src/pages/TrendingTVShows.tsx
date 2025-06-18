import Navbar from '../components/Navbar';
import MediaGrid from '../components/MediaGrid';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ensureExtendedMediaArray } from '../utils/types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const fetchTrendingTV = async () => {
  const res = await fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  return data.results || [];
};

const TrendingTVShows = () => {
  const { t } = useTranslation();
  const [shows, setShows] = useState([]);

  useEffect(() => {
    fetchTrendingTV().then(setShows);
  }, []);

  return (
    <>
      <Navbar />
      <h1 className="text-2xl font-bold text-white px-4 pt-24 pb-4">{t('Trending TV Shows')}</h1>
      <MediaGrid media={ensureExtendedMediaArray(shows)} />
    </>
  );
};

export default TrendingTVShows;
