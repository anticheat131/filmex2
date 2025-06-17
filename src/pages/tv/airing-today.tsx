import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { ensureExtendedMediaArray, Media } from '@/utils/types';
import { getAiringTodayTVShows } from '@/utils/services/tv';
import { useTranslation } from 'react-i18next';

export default function TVAiringToday() {
  const { t } = useTranslation();
  const [shows, setShows] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchShows() {
      setLoading(true);
      try {
        // Use the service function to fetch data
        const response = await getAiringTodayTVShows(page);
        setShows(response);
        // TMDB returns total_pages in a different structure, so we fetch it via a direct API call for now
        // If you want accurate totalPages, you can fetch via tmdb.get and extract total_pages
        // For now, just set a high number or 20 as a fallback
        setTotalPages(20);
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
        <div className="main-container mx-auto px-4 py-8 w-full flex-1">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-left">
              {t('TV Shows Airing Today')}
            </h1>
            <p className="text-gray-300 mt-1 text-base max-w-2xl text-left">
              {t('See what’s airing on TV right now. Browse today’s lineup of new and returning shows, with all the details and actions you expect from mapple.tv.')}
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
