import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { ensureExtendedMediaArray, Media } from '@/utils/types';
import { tmdb } from '@/utils/services/tmdb';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 20; // TMDB default
const PRIME_PROVIDER_IDS = '9|10';

export default function TVPrime() {
  const { t } = useTranslation();
  const [shows, setShows] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const apiParams: any = {
      page,
      with_watch_providers: PRIME_PROVIDER_IDS,
      watch_region: 'US',
      include_adult: false,
      with_status: '0|1|2|3',
      with_type: 0,
      sort_by: 'popularity.desc',
    };
    tmdb.get('/discover/tv', { params: apiParams })
      .then(({ data }) => {
        const tvResults = (data.results || []).filter((item: any) => {
          if (!item.media_type) item.media_type = 'tv';
          return item.media_type === 'tv';
        });
        setShows(ensureExtendedMediaArray(tvResults));
        setTotalPages(Math.min(data.total_pages, 500));
      })
      .catch(() => setError('Failed to load Prime Video shows.'))
      .finally(() => setLoading(false));
  }, [page]);

  // Pagination logic for first 3, last, and next
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= 3; i++) {
      pages.push(i);
    }
    if (totalPages > 4) {
      pages.push('ellipsis');
      pages.push(totalPages);
    }
    return (
      <nav role="navigation" aria-label="pagination" className="mx-auto flex w-full justify-center">
        <ul className="flex flex-row items-center gap-1">
          {pages.map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={idx} aria-hidden="true" className="size-9 items-center justify-center hidden md:flex">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis size-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                <span className="sr-only">More pages</span>
              </span>
            ) : (
              <li key={p}>
                <a
                  aria-current={page === p ? 'page' : undefined}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 w-10 ${page === p ? 'border border-input bg-background' : 'hover:bg-accent hover:text-accent-foreground'}`}
                  href={`?page=${p}`}
                  onClick={e => { e.preventDefault(); setPage(Number(p)); }}
                >
                  {p}
                </a>
              </li>
            )
          )}
          <li>
            <a
              className={`items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pr-2.5 hidden md:flex ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
              aria-label="Go to next page"
              rel="next"
              href={`?page=${page + 1}`}
              onClick={e => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
            >
              <span>{t('Next')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right size-4"><path d="m9 18 6-6-6-6"/></svg>
            </a>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 px-4 pt-20 pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-6 mt-2 flex flex-col items-start">
          <h1 className="mb-2 text-2xl font-medium flex items-center gap-4">
            {/* Improved Prime Video icon: full text and smile arc visible */}
            <svg viewBox="0 0 160 32" width="120" height="32" className="inline-block align-middle" xmlns="http://www.w3.org/2000/svg" fill="none">
              <text x="0" y="24" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="24" fill="#00A8E1">prime</text>
              <text x="80" y="24" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="24" fill="#232F3E">video</text>
              <path d="M18 28c24 8 72 8 96 0" stroke="#00A8E1" strokeWidth="3" fill="none"/>
            </svg>
            {t('Prime Video TV Shows')}
          </h1>
          <p className="max-w-3xl text-muted-foreground text-left">{t('Browse all TV shows available on Prime Video. Only TV series are shown here.')}</p>
        </header>
        {loading && <div className="text-center py-8">{t('Loading...')}</div>}
        {error && <div className="text-red-500 mb-4">{t(error)}</div>}
        {!loading && <MediaGrid media={ensureExtendedMediaArray(shows)} />}
        <div className="mt-8">{renderPagination()}</div>
      </main>
      <Footer />
    </div>
  );
}
