import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getDiscoverMovies } from '@/utils/services/movies';
import { getDiscoverTVShows } from '@/utils/services/tv';
import { getImageUrl } from '@/utils/services/tmdb';
import { ensureExtendedMediaArray, ExtendedMedia } from '@/utils/types';
import { useTranslation } from 'react-i18next';

function getUpcomingDateRange() {
  const now = new Date();
  const start = now.toISOString().slice(0, 10);
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 3);
  const end = endDate.toISOString().slice(0, 10);
  return { start, end };
}

const News = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<ExtendedMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUpcoming() {
      setLoading(true);
      setError('');
      try {
        const { start, end } = getUpcomingDateRange();
        const [movieData, tvData] = await Promise.all([
          getDiscoverMovies({
            page: 1,
            sort_by: 'primary_release_date.asc',
            'primary_release_date.gte': start,
            'primary_release_date.lte': end,
          }),
          getDiscoverTVShows({
            page: 1,
            sort_by: 'first_air_date.asc',
            'first_air_date.gte': start,
            'first_air_date.lte': end,
          })
        ]);
        const movies = ensureExtendedMediaArray(movieData.results).map(m => ({ ...m, media_type: 'movie' as const }));
        const tvshows = ensureExtendedMediaArray(tvData.results).map(t => ({ ...t, media_type: 'tv' as const }));
        // Merge and sort by date (soonest first)
        const all = [...movies, ...tvshows].sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || '').getTime();
          const dateB = new Date(b.release_date || b.first_air_date || '').getTime();
          return dateA - dateB;
        });
        setItems(all);
      } catch (e) {
        setError('Failed to load upcoming news.');
      } finally {
        setLoading(false);
      }
    }
    fetchUpcoming();
  }, []);

  return (
    <>
      <Navbar />
      <div className="page-container main-container mx-auto py-10 px-4 md:px-12 xl:px-24 mt-20">
        <h1 className="text-4xl font-extrabold mb-10 text-center tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {t('Upcoming Movie & TV Show News')}
        </h1>
        {loading ? (
          <div className="text-center py-16 text-xl text-gray-400 font-medium animate-pulse">{t('Loading news...')}</div>
        ) : error ? (
          <div className="text-center py-16 text-xl text-red-400 font-medium">{t(error)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-xl text-gray-400 font-medium">{t('No upcoming news found.')}</div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2">
            {items.map(item => {
              const bgUrl = getImageUrl(item.backdrop_path, 'w780') || getImageUrl(item.poster_path, 'w500') || '/placeholder.svg';
              return (
                <div
                  key={item.id + item.media_type}
                  className="relative rounded-3xl overflow-hidden shadow-2xl group transition-transform hover:scale-[1.012] min-h-[380px]"
                >
                  {/* Blurred background */}
                  <div
                    className="absolute inset-0 z-0"
                    style={{
                      backgroundImage: `url('${bgUrl}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'blur(16px) brightness(0.7)',
                      opacity: 0.7,
                    }}
                  />
                  {/* Overlay for darkening */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/40 z-10" />
                  <div className="relative z-20 flex flex-col md:flex-row gap-8 p-8 items-stretch">
                    <img
                      src={getImageUrl(item.poster_path, 'w500') || '/placeholder.svg'}
                      alt={item.title || item.name}
                      className="w-full md:w-52 h-72 object-cover rounded-2xl shadow-lg border-4 border-white/10 bg-gray-200"
                      loading="lazy"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`text-sm px-4 py-1 rounded-full font-bold shadow ${item.media_type === 'movie' ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gradient-to-r from-pink-400 to-purple-500'} text-white uppercase tracking-wide`}> 
                            {item.media_type === 'movie' ? t('Upcoming Movie') : t('Upcoming TV Show')}
                          </span>
                          <span className="text-sm text-gray-200/80 font-medium">
                            {item.release_date || item.first_air_date}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 truncate" title={item.title || item.name}>
                          {item.title || item.name}
                        </h2>
                        <p className="text-base text-gray-100 mb-5 line-clamp-5 drop-shadow">
                          {item.overview || t('No description available.')}
                        </p>
                      </div>
                      <a
                        href={`/${item.media_type}/${item.id}`}
                        className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-base shadow-lg hover:from-blue-600 hover:to-purple-600 transition-colors duration-200 mt-2 self-start"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('View Details')}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default News;
