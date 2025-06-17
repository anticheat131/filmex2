import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { ensureExtendedMediaArray, Media } from '@/utils/types';
import { getTopRatedTVShows } from '@/utils/services/tv';
import { useTranslation } from 'react-i18next';

export default function TVTopRated() {
  const { t } = useTranslation();
  const [shows, setShows] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  // TMDB's /tv/top_rated returns 500 pages max
  const [totalPages, setTotalPages] = useState(500);

  useEffect(() => {
    async function fetchShows() {
      setLoading(true);
      try {
        const response = await getTopRatedTVShows(page);
        setShows(response);
      } catch (e) {
        setShows([]);
      }
      setLoading(false);
    }
    fetchShows();
  }, [page]);

  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-screen pt-20">
        <div className="main-container mx-auto px-4 py-8 w-full flex-1">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-medium text-white text-left">
              {t('Top Rated TV Shows')}
            </h1>
            <p className="max-w-3xl text-muted-foreground text-left">
              {t('Explore the pinnacle of television excellence with our collection of top-rated TV shows. These series have been recognized for their outstanding storytelling, acting, and production values.')}
            </p>
          </div>
          <div>
            {loading ? (
              <div className="text-white text-center py-12">
                {t('Loading TV shows...')}
              </div>
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
            <span className="px-4 py-2 text-white">
              {t('Page {{page}} of {{totalPages}}', { page, totalPages })}
            </span>
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
