import React, { useEffect, useState } from 'react';
import MediaCard from './MediaCard'; // Adjust path if needed
import { Media } from '@/utils/types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const TrendingNow = () => {
  const [trendingMedia, setTrendingMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingNewest = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`);
        const data = await res.json();

        if (!data.results) {
          setTrendingMedia([]);
          setLoading(false);
          return;
        }

        // Filter only items with release dates and sort by newest release date descending
        const filteredAndSorted = data.results
          .filter((item: any) => item.release_date || item.first_air_date)
          .sort((a: any, b: any) => {
            const dateA = new Date(a.release_date || a.first_air_date).getTime();
            const dateB = new Date(b.release_date || b.first_air_date).getTime();
            return dateB - dateA;
          })
          .slice(0, 10); // Limit to top 10

        setTrendingMedia(filteredAndSorted);
      } catch (error) {
        console.error('Failed to fetch trending media:', error);
        setTrendingMedia([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingNewest();
  }, []);

  if (loading) return <p>Loading trending now...</p>;
  if (trendingMedia.length === 0) return <p>No trending media found.</p>;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-white">Trending Now</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {trendingMedia.map(media => (
          <MediaCard key={media.id} media={media} />
        ))}
      </div>
    </section>
  );
};

export default TrendingNow;
