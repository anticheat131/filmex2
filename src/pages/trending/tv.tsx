import React, { useEffect, useState } from 'react';
import { getTrendingTVShows } from '@/utils/services/tv';
import MediaGrid from '@/components/MediaGrid';
import { ensureExtendedMediaArray, Media } from '@/utils/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from 'react-i18next';

export default function TrendingTV() {
  const { t } = useTranslation();
  const [shows, setShows] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchShows() {
      setLoading(true);
      try {
        const response = await getTrendingTVShows('week', page);
        setShows(response);
        // TMDB trending endpoint returns 1000 pages max, but let's be defensive
        setTotalPages(response && response.length === 0 ? 1 : 1000);
      } catch (e) {
        setShows([]);
        setTotalPages(1);
      }
      setLoading(false);
    }
    fetchShows();
  }, [page]);

  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-screen pt-20">
        <div className="main-container mx-auto px-4 py-8 w-full flex-1" style={{ maxWidth: '1850px' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white text-left">{t('Trending TV Shows')}</h1>
              <p className="text-gray-300 mt-1 text-base max-w-2xl text-left">
                {t('See what TV shows are trending right now. Updated daily!')}
              </p>
            </div>
          </div>
          <div>
            {loading ? (
              <div className="text-white text-center py-12">{t('Loading TV shows...')}</div>
            ) : (
              <MediaGrid media={ensureExtendedMediaArray(shows)} title="" />
            )}
          </div>
          {/* Pagination controls */}
          <div className="flex justify-center mt-10">
            <button
              className="px-3 py-2 mx-1 rounded bg-gray-800 text-white disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              {t('Previous')}
            </button>
            <span className="px-4 py-2 text-white">{t('Page {{page}} of {{totalPages}}', { page, totalPages })}</span>
            <button
              className="px-3 py-2 mx-1 rounded bg-gray-800 text-white disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              {t('Next')}
            </button>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
