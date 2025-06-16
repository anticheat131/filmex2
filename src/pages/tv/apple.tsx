import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { ensureExtendedMediaArray, Media } from '@/utils/types';
import { tmdb } from '@/utils/services/tmdb';

const PAGE_SIZE = 20; // TMDB default
const APPLE_PROVIDER_IDS = '350|2';

export default function TVApple() {
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
      with_watch_providers: APPLE_PROVIDER_IDS,
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
      .catch(() => setError('Failed to load Apple TV+ shows.'))
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
              <span>Next</span>
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
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" role="img" viewBox="0 0 24 24" className="size-28" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M20.57 17.735h-1.815l-3.34-9.203h1.633l2.02 5.987c.075.231.273.9.586 2.012l.297-.997.33-1.006 2.094-6.004H24zm-5.344-.066a5.76 5.76 0 0 1-1.55.207c-1.23 0-1.84-.693-1.84-2.087V9.646h-1.063V8.532h1.121V7.081l1.476-.602v2.062h1.707v1.113H13.38v5.805c0 .446.074.75.214.932.14.182.396.264.75.264.207 0 .495-.041.883-.115zm-7.29-5.343c.017 1.764 1.55 2.358 1.567 2.366-.017.042-.248.842-.808 1.658-.487.71-.99 1.418-1.79 1.435-.783.016-1.03-.462-1.93-.462-.89 0-1.17.445-1.913.478-.758.025-1.344-.775-1.838-1.484-.998-1.451-1.765-4.098-.734-5.88.51-.89 1.426-1.451 2.416-1.46.75-.016 1.468.512 1.93.512.461 0 1.327-.627 2.234-.536.38.016 1.452.157 2.136 1.154-.058.033-1.278.743-1.27 2.219M6.468 7.988c.404-.495.685-1.18.61-1.864-.585.025-1.294.388-1.723.883-.38.437-.71 1.138-.619 1.806.652.05 1.328-.338 1.732-.825Z"></path></svg>
            Apple TV+ Shows
          </h1>
          <p className="max-w-3xl text-muted-foreground text-left">Browse all TV shows available on Apple TV+ and iTunes. Only TV series are shown here.</p>
        </header>
        {loading && <div className="text-center py-8">Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && <MediaGrid media={ensureExtendedMediaArray(shows)} />}
        <div className="mt-8">{renderPagination()}</div>
      </main>
      <Footer />
    </div>
  );
}
